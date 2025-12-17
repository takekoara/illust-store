<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', [App\Http\Controllers\WelcomeController::class, 'index'])->name('welcome');

// About page (public)
Route::get('/about', [App\Http\Controllers\AboutController::class, 'index'])->name('about');

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Products - Public routes
Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])->name('products.index');

// Authenticated routes (all users)
Route::middleware('auth')->group(function () {
    // Cart
    Route::get('/cart', [App\Http\Controllers\CartController::class, 'index'])->name('cart.index');
    Route::post('/cart', [App\Http\Controllers\CartController::class, 'store'])->name('cart.store');
    Route::delete('/cart/{cartItem}', [App\Http\Controllers\CartController::class, 'destroy'])->name('cart.destroy');
    Route::delete('/cart', [App\Http\Controllers\CartController::class, 'clear'])->name('cart.clear');

    // Follow
    Route::post('/follow', [App\Http\Controllers\FollowController::class, 'store'])->name('follow.store');
    Route::delete('/follow/{user}', [App\Http\Controllers\FollowController::class, 'destroy'])->name('follow.destroy');
    Route::get('/users/{user}/followers', [App\Http\Controllers\FollowController::class, 'followers'])->name('followers');
    Route::get('/users/{user}/following', [App\Http\Controllers\FollowController::class, 'following'])->name('following');

    // Orders
    Route::get('/orders', [App\Http\Controllers\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/create', [App\Http\Controllers\OrderController::class, 'create'])->name('orders.create');
    Route::post('/orders', [App\Http\Controllers\OrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [App\Http\Controllers\OrderController::class, 'show'])->name('orders.show');

    // Payment
    Route::post('/orders/{order}/payment-intent', [App\Http\Controllers\PaymentController::class, 'createPaymentIntent'])->name('payment.intent');

    // Chat
    Route::get('/chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{conversation}', [App\Http\Controllers\ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{user}', [App\Http\Controllers\ChatController::class, 'create'])->name('chat.create');
    Route::post('/products/{product}/chat', [App\Http\Controllers\ChatController::class, 'createFromProduct'])->name('chat.createFromProduct');
    Route::post('/chat/{conversation}/message', [App\Http\Controllers\ChatController::class, 'storeMessage'])->name('chat.message');

    // Likes
    Route::post('/products/{product}/like', [App\Http\Controllers\LikeController::class, 'toggle'])->name('likes.toggle');
    Route::get('/products/{product}/like', [App\Http\Controllers\LikeController::class, 'status'])->name('likes.status');

    // Bookmarks
    Route::get('/bookmarks', [App\Http\Controllers\BookmarkController::class, 'index'])->name('bookmarks.index');
    Route::post('/products/{product}/bookmark', [App\Http\Controllers\BookmarkController::class, 'toggle'])->name('bookmarks.toggle');
    Route::get('/products/{product}/bookmark', [App\Http\Controllers\BookmarkController::class, 'status'])->name('bookmarks.status');

    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::get('/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
});

// Admin only routes - Must be before /products/{product} to avoid route conflicts
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/products/create', [App\Http\Controllers\ProductController::class, 'create'])->name('products.create');
    Route::post('/products', [App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
    Route::get('/products/my-products', [App\Http\Controllers\ProductController::class, 'myProducts'])->name('products.my-products');
    Route::get('/products/{product}/edit', [App\Http\Controllers\ProductController::class, 'edit'])->name('products.edit');
    // POSTメソッドも許可（FormData送信時に_method=PATCHを使用するため）
    Route::match(['patch', 'post'], '/products/{product}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');
    Route::post('/products/sort', [App\Http\Controllers\ProductController::class, 'updateSortOrder'])->name('products.sort');
});

// Products - Show route (must be after specific routes)
Route::get('/products/{product}', [App\Http\Controllers\ProductController::class, 'show'])->name('products.show');

// Search
Route::get('/search', [App\Http\Controllers\SearchController::class, 'index'])->name('search.index');

// Users
Route::get('/users/{user}', [App\Http\Controllers\UserController::class, 'show'])->name('users.show');

// Webhook (no CSRF protection)
Route::post('/webhook/stripe', [App\Http\Controllers\PaymentController::class, 'handleWebhook'])->name('webhook.stripe');

require __DIR__.'/auth.php';
