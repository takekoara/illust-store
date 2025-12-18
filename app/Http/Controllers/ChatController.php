<?php

namespace App\Http\Controllers;

use App\Http\Requests\MessageStoreRequest;
use App\Models\Conversation;
use App\Models\Product;
use App\Models\User;
use App\Services\ChatService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatService $chatService
    ) {}

    /**
     * Display a listing of conversations
     */
    public function index(): Response
    {
        $conversations = $this->chatService->getUserConversations(Auth::id());

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
        ]);
    }

    /**
     * Show a specific conversation
     */
    public function show(Conversation $conversation): Response
    {
        if (!$this->chatService->canAccessConversation($conversation, Auth::id())) {
            abort(403);
        }

        $otherUser = $conversation->getOtherUser(Auth::id());
        $conversation->load(['product.images']);

        $messages = $this->chatService->getConversationMessages($conversation);
        $hasMoreMessages = $this->chatService->hasMoreMessages($conversation);

        // Mark messages as read
        $this->chatService->markMessagesAsRead($conversation, Auth::id());

        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'otherUser' => $otherUser,
            'messages' => $messages,
            'hasMoreMessages' => $hasMoreMessages,
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

        $conversation = $this->chatService->getOrCreateDirectConversation(Auth::user(), $user);

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

        $seller = $product->user;

        if ($seller->id === Auth::id()) {
            return back()->with('error', '自分の商品について質問することはできません。');
        }

        $conversation = $this->chatService->getOrCreateProductConversation($product, Auth::user());

        return redirect()->route('chat.show', $conversation);
    }

    /**
     * Store a new message
     */
    public function storeMessage(MessageStoreRequest $request, Conversation $conversation)
    {
        if (!$this->chatService->canAccessConversation($conversation, Auth::id())) {
            abort(403);
        }

        $validated = $request->validated();

        $this->chatService->sendMessage($conversation, $validated['message'], Auth::id());

        return back();
    }
}
