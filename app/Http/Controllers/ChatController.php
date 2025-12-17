<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Http\Requests\MessageStoreRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Product;
use App\Models\User;
use App\Services\ChatService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Display a listing of conversations
     */
    public function index(): Response
    {
        $userId = Auth::id();
        
        // 未読数を一括で取得（N+1問題を解決）
        $conversationIds = Conversation::forUser($userId)->pluck('id');
        $unreadCounts = collect();
        
        if ($conversationIds->isNotEmpty()) {
            $unreadCounts = Message::whereIn('conversation_id', $conversationIds)
                ->where('user_id', '!=', $userId)
                ->where('is_read', false)
                ->selectRaw('conversation_id, COUNT(*) as count')
                ->groupBy('conversation_id')
                ->pluck('count', 'conversation_id');
        }
        
        // スコープを使用して一貫した検索
        $conversations = Conversation::forUser($userId)
            ->with([
                'userOne:id,name,username,avatar,avatar_type',
                'userTwo:id,name,username,avatar,avatar_type',
                'product:id,title,price',
                'messages' => function ($query) {
                    $query->latest()->limit(1)->with('user:id,name,username');
                }
            ])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conversation) use ($userId, $unreadCounts) {
                $otherUser = $userId === $conversation->user_one_id 
                    ? $conversation->userTwo 
                    : $conversation->userOne;
                return [
                    'id' => $conversation->id,
                    'type' => $conversation->type,
                    'title' => $conversation->title,
                    'other_user' => $otherUser,
                    'product' => $conversation->product,
                    'last_message' => $conversation->messages->first(),
                    'unread_count' => $unreadCounts->get($conversation->id, 0),
                ];
            });

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Show a specific conversation
     */
    public function show(Conversation $conversation): Response
    {
        if ($conversation->user_one_id !== Auth::id() && $conversation->user_two_id !== Auth::id()) {
            abort(403);
        }

        $otherUser = $conversation->getOtherUser(Auth::id());
        
        $conversation->load(['product.images']);
        
        // 最新50件のみ取得（パフォーマンス向上）
        $messages = Message::where('conversation_id', $conversation->id)
            ->with('user:id,name,username,avatar,avatar_type')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse() // 古い順に並び替え
            ->values() // インデックスを再構築
            ->all(); // 配列に変換

        // Mark messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'otherUser' => $otherUser,
            'messages' => $messages,
            'hasMoreMessages' => Message::where('conversation_id', $conversation->id)->count() > 50,
        ]);
    }

    /**
     * Start a conversation with a user
     */
    public function create(User $user)
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', '自分自身とチャットすることはできません。');
        }

        // 既存のdirectチャットを検索（product_idがnullでtypeがdirect）
        // スコープを使用して一貫した検索
        $conversation = Conversation::where('type', 'direct')
            ->whereNull('product_id')
            ->betweenUsers(Auth::id(), $user->id)
            ->first();

        if (!$conversation) {
            // boot()メソッドで自動的に順序が調整される
            $conversation = Conversation::create([
                'user_one_id' => Auth::id(),
                'user_two_id' => $user->id,
                'type' => 'direct',
                'product_id' => null,
            ]);
        }

        return redirect()->route('chat.show', $conversation);
    }

    /**
     * Start a conversation from a product page
     */
    public function createFromProduct(Product $product)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'チャットを開始するにはログインが必要です。');
        }

        // 商品の販売者（管理者）とチャットを開始
        $seller = $product->user;
        
        if ($seller->id === Auth::id()) {
            return back()->with('error', '自分の商品について質問することはできません。');
        }

        // 既存の商品関連チャットを検索
        // スコープを使用して一貫した検索
        $conversation = Conversation::where('product_id', $product->id)
            ->where('type', 'product')
            ->betweenUsers(Auth::id(), $seller->id)
            ->first();

        if (!$conversation) {
            // boot()メソッドで自動的に順序が調整される
            $conversation = Conversation::create([
                'user_one_id' => Auth::id(),
                'user_two_id' => $seller->id,
                'product_id' => $product->id,
                'type' => 'product',
                'title' => $product->title,
            ]);
        }

        return redirect()->route('chat.show', $conversation);
    }

    /**
     * Store a new message
     */
    public function storeMessage(MessageStoreRequest $request, Conversation $conversation)
    {
        $validated = $request->validated();

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
        ]);

        // メッセージをリレーション込みで取得（必要なカラムのみ）
        $message->load('user:id,name,username,avatar,avatar_type');

        // リアルタイム更新のためにイベントをブロードキャスト（非同期で実行してレスポンスを早くする）
        // afterResponse()でレスポンス後に実行されるため、ユーザーへの応答が早くなる
        $event = new MessageSent($message);
        dispatch(function () use ($event, $conversation) {
            try {
                // 会話の最終メッセージ時刻を更新（ブロードキャストと同時に実行）
                $conversation->update(['last_message_at' => now()]);
                broadcast($event);
            } catch (\Exception $e) {
                // ブロードキャストエラーをログに記録（デバッグモード時のみ詳細ログ）
                if (config('app.debug')) {
                    Log::error('Broadcast error: ' . $e->getMessage(), [
                        'conversation_id' => $event->message->conversation_id,
                        'message_id' => $event->message->id,
                    ]);
                }
            }
        })->afterResponse();

        // 楽観的更新を使用しているため、back()を返すがpreserveState: trueでリロードされない
        // セッションフラッシュメッセージは不要（楽観的更新で即座に表示されるため）
        return back();
    }
}
