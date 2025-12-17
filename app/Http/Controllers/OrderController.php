<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    /**
     * Display a listing of orders
     */
    public function index(): Response
    {
        $orders = Order::with([
            'items' => function ($query) {
                $query->with(['product' => function ($q) {
                    $q->withTrashed()->with('images');
                }]);
            }
        ])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show the form for creating a new order
     */
    public function create(): Response|RedirectResponse
    {
        Log::info('Order create method called', ['user_id' => Auth::id()]);

        $cartItems = CartItem::with(['product.images', 'product.user'])
            ->where('user_id', Auth::id())
            ->get();

        if ($cartItems->isEmpty()) {
            Log::warning('Cart is empty', ['user_id' => Auth::id()]);
            return redirect()->route('cart.index')
                ->with('error', 'カートが空です。');
        }

        // 商品の有効性を決済前に検証
        $invalidItems = $cartItems->filter(function ($item) {
            return !$item->product || !$item->product->is_active || $item->product->price <= 0;
        });

        if ($invalidItems->isNotEmpty()) {
            Log::warning('Invalid items in cart', [
                'user_id' => Auth::id(),
                'invalid_items' => $invalidItems->pluck('id')->toArray(),
            ]);
            return redirect()->route('cart.index')
                ->with('error', 'カートに無効な商品が含まれています。カートを確認してください。');
        }

        $total = $cartItems->sum(function ($item) {
            return $item->product->price;
        });

        Log::info('Cart total calculated', ['user_id' => Auth::id(), 'total' => $total]);

        if ($total <= 0) {
            Log::warning('Invalid total amount', ['user_id' => Auth::id(), 'total' => $total]);
            return redirect()->route('cart.index')
                ->with('error', '注文金額が無効です。商品を確認してください。');
        }

        // Create a temporary order to generate payment intent
        try {
            $tempOrder = Order::create([
                'user_id' => Auth::id(),
                'total_amount' => $total,
                'status' => 'pending',
                'billing_address' => [],
            ]);
            Log::info('Temporary order created', ['order_id' => $tempOrder->id, 'user_id' => Auth::id()]);
        } catch (\Exception $e) {
            Log::error('Failed to create temporary order', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return redirect()->route('cart.index')
                ->with('error', '注文の作成に失敗しました。しばらくしてから再度お試しください。');
        }

        // Check if Stripe is configured
        $stripeSecret = config('services.stripe.secret');
        Log::info('Stripe configuration check', [
            'order_id' => $tempOrder->id,
            'stripe_secret_set' => !empty($stripeSecret),
            'stripe_secret_length' => $stripeSecret ? strlen($stripeSecret) : 0,
        ]);

        if (empty($stripeSecret)) {
            Log::error('Stripe secret key is not configured', [
                'order_id' => $tempOrder->id,
                'user_id' => Auth::id(),
                'config_services_stripe' => config('services.stripe'),
            ]);
            $tempOrder->delete();
            $errorMessage = config('app.debug')
                ? 'StripeのAPIキーが設定されていません。.envファイルにSTRIPE_SECRETを設定してください。'
                : '決済処理の初期化に失敗しました。管理者にお問い合わせください。';
            return redirect()->route('cart.index')
                ->with('error', $errorMessage);
        }

        // Create payment intent
        $clientSecret = null;
        try {
            Log::info('Attempting to create Stripe Payment Intent', [
                'order_id' => $tempOrder->id,
                'amount' => (int)($total * 100),
                'currency' => 'jpy',
            ]);

            Stripe::setApiKey($stripeSecret);
            $paymentIntent = PaymentIntent::create([
                'amount' => (int)($total * 100), // Convert to cents
                'currency' => 'jpy',
                'metadata' => [
                    'order_id' => $tempOrder->id,
                    'user_id' => Auth::id(),
                    'temp' => true, // Mark as temporary
                ],
            ]);

            Log::info('Stripe Payment Intent created successfully', [
                'order_id' => $tempOrder->id,
                'payment_intent_id' => $paymentIntent->id,
            ]);

            $tempOrder->update([
                'stripe_payment_intent_id' => $paymentIntent->id,
            ]);

            $clientSecret = $paymentIntent->client_secret;
        } catch (\Stripe\Exception\ApiErrorException $e) {
            Log::error('Stripe Payment Intent API Error in create', [
                'order_id' => $tempOrder->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'stripe_error_code' => $e->getStripeCode(),
                'stripe_error_type' => $e->getStripeCode(),
            ]);
            // Delete temp order if payment intent creation failed
            $tempOrder->delete();
            $errorMessage = config('app.debug')
                ? 'Stripe APIエラー: ' . $e->getMessage() . ' (コード: ' . $e->getStripeCode() . ')'
                : '決済処理の初期化に失敗しました。しばらくしてから再度お試しください。';
            return redirect()->route('cart.index')
                ->with('error', $errorMessage);
        } catch (\Exception $e) {
            Log::error('Stripe Payment Intent Error in create', [
                'order_id' => $tempOrder->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ]);
            // Delete temp order if payment intent creation failed
            $tempOrder->delete();
            $errorMessage = config('app.debug')
                ? '決済処理エラー: ' . $e->getMessage()
                : '注文の作成に失敗しました。しばらくしてから再度お試しください。';
            return redirect()->route('cart.index')
                ->with('error', $errorMessage);
        }

        return Inertia::render('Orders/Create', [
            'cartItems' => $cartItems,
            'total' => $total,
            'clientSecret' => $clientSecret,
            'tempOrderId' => $tempOrder->id,
        ]);
    }

    /**
     * Store a newly created order
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'billing_address' => 'required|array',
                'billing_address.name' => 'required|string|max:255',
                'billing_address.email' => 'required|email|max:255',
                'billing_address.address' => 'required|string|max:500',
                'billing_address.city' => 'required|string|max:100',
                'billing_address.postal_code' => 'required|string|max:20',
                'billing_address.country' => 'required|string|max:100',
                'temp_order_id' => 'nullable|integer|exists:orders,id',
            ]);

            $order = $this->orderService->createOrderFromCart(
                $validated['billing_address'],
                $validated['temp_order_id'] ?? null
            );

        // Return JSON response for frontend
        return response()->json([
            'order' => $order,
            'message' => '注文が作成されました。',
        ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Order store error', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null,
            ]);
            
            return back()->with('error', '注文の作成に失敗しました。しばらくしてから再度お試しください。');
        }
    }

    /**
     * Display the specified order
     */
    public function show(Order $order): Response|RedirectResponse
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Check payment status from Stripe using the payment_intent in the query string.
        // Statusの変更はWebhookに限定し、ここでは表示用の真偽のみ判定する。
        $paymentIntentId = request()->query('payment_intent');
        $redirectStatus = request()->query('redirect_status');
        $paymentVerified = false;

        if ($paymentIntentId && $redirectStatus === 'succeeded') {
            try {
                Stripe::setApiKey(config('services.stripe.secret'));
                $paymentIntent = PaymentIntent::retrieve($paymentIntentId);

                $orderIdInMeta = $paymentIntent->metadata->order_id ?? null;
                $amountMatches = $paymentIntent->amount_received === (int)($order->total_amount * 100);
                $intentMatchesOrder = $orderIdInMeta && (int)$orderIdInMeta === $order->id;
                $intentMatchesStored = !$order->stripe_payment_intent_id || $order->stripe_payment_intent_id === $paymentIntentId;

                if ($paymentIntent->status === 'succeeded' && $amountMatches && $intentMatchesOrder && $intentMatchesStored) {
                    $paymentVerified = true;
                }
            } catch (\Exception $e) {
                Log::warning('Payment intent verification failed', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntentId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Load relationships after refresh to ensure fresh data
        $order->load([
            'items' => function ($query) {
                $query->with(['product' => function ($q) {
                    $q->withTrashed()->with('images');
                }]);
            },
            'user'
        ]);

        // Debug: Log order items
        Log::info('Order items loaded', [
            'order_id' => $order->id,
            'items_count' => $order->items->count(),
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'title' => $item->product->title,
                        'deleted_at' => $item->product->deleted_at,
                    ] : null,
                ];
            })->toArray(),
        ]);

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'paymentSuccess' => $paymentVerified,
        ]);
    }
}
