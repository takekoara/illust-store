<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly CartService $cartService,
        private readonly StripeService $stripeService
    ) {}

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

        // カートの検証
        $validation = $this->cartService->validateForCheckout();
        if (!$validation['valid']) {
            Log::warning('Cart validation failed', [
                'user_id' => Auth::id(),
                'message' => $validation['message'],
            ]);
            return redirect()->route('cart.index')->with('error', $validation['message']);
        }

        $cartItems = $validation['items'];
        $total = $validation['total'];

        Log::info('Cart total calculated', ['user_id' => Auth::id(), 'total' => $total]);

        // 一時注文を作成
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
            ]);
            return redirect()->route('cart.index')
                ->with('error', '注文の作成に失敗しました。しばらくしてから再度お試しください。');
        }

        // Payment Intent を作成
        $result = $this->stripeService->createPaymentIntent(
            $this->stripeService->toStripeAmount($total),
            [
                'order_id' => $tempOrder->id,
                'user_id' => Auth::id(),
                'temp' => true,
            ]
        );

        if (!$result['success']) {
            $tempOrder->delete();
            return redirect()->route('cart.index')->with('error', $result['error']);
        }

        Log::info('Stripe Payment Intent created successfully', [
            'order_id' => $tempOrder->id,
            'payment_intent_id' => $result['paymentIntent']->id,
        ]);

        $tempOrder->update(['stripe_payment_intent_id' => $result['paymentIntent']->id]);

        return Inertia::render('Orders/Create', [
            'cartItems' => $cartItems,
            'total' => $total,
            'clientSecret' => $result['clientSecret'],
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
            ]);

            return back()->with('error', '注文の作成に失敗しました。しばらくしてから再度お試しください。');
        }
    }

    /**
     * Cancel a temporary order
     */
    public function cancelTempOrder(Request $request)
    {
        $request->validate([
            'temp_order_id' => 'required|integer|exists:orders,id',
        ]);

        $order = Order::find($request->temp_order_id);

        if (!$order || $order->user_id !== Auth::id() || $order->status !== 'pending') {
            return response()->json([
                'message' => '注文が見つからないか、キャンセルできません。',
            ], 404);
        }

        $order->delete();

        Log::info('Temporary order cancelled', [
            'order_id' => $order->id,
            'user_id' => Auth::id(),
        ]);

        return response()->json(['message' => '一時注文がキャンセルされました。']);
    }

    /**
     * Display the specified order
     */
    public function show(Order $order): Response|RedirectResponse
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $paymentIntentId = request()->query('payment_intent') ?? $order->stripe_payment_intent_id;
        $paymentVerified = false;
        $stripePaymentStatus = null;

        if ($paymentIntentId) {
            $verification = $this->stripeService->verifyPayment($order, $paymentIntentId);
            $stripePaymentStatus = $verification['status'];

            if ($verification['verified']) {
                $paymentVerified = true;

                // 支払いが成功しているが注文がpendingの場合、更新
                if ($order->status === 'pending') {
                    Log::info('Updating order status from pending to completed', [
                        'order_id' => $order->id,
                        'payment_intent_id' => $paymentIntentId,
                    ]);

                    $order->update([
                        'status' => 'completed',
                        'stripe_payment_intent_id' => $paymentIntentId,
                    ]);
                    $order->refresh();

                    // 商品の売上数を更新
                    $order->load('items.product');
                    foreach ($order->items as $item) {
                        if ($item->product) {
                            $item->product->increment('sales_count');
                        }
                    }
                }
            }
        }

        $order->load([
            'items' => function ($query) {
                $query->with(['product' => function ($q) {
                    $q->withTrashed()->with('images');
                }]);
            },
            'user'
        ]);

        Log::info('Order items loaded', [
            'order_id' => $order->id,
            'items_count' => $order->items->count(),
        ]);

        return Inertia::render('Orders/Show', [
            'order' => $order,
            'paymentSuccess' => $paymentVerified,
            'stripePaymentStatus' => $stripePaymentStatus,
        ]);
    }
}
