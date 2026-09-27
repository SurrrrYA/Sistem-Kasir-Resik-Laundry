<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\ResetPasswordController;

Route::post('/login', [
    AuthController::class,
    'login',
]);

// Lupa Password
Route::post('/forgot-password', [
    ForgotPasswordController::class,
    'sendResetLink',
]);

// Reset Password
Route::post('/reset-password', [
    ResetPasswordController::class,
    'reset',
]);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    });

    // Pelanggan
    Route::apiResource(
        'customers',
        CustomerController::class
    );

    // Manajemen User
    // Hanya Owner
    Route::middleware('role:owner')->group(function () {
        Route::apiResource(
            'users',
            UserController::class
        );
    });

    // Layanan
    // Owner + Kasir boleh melihat layanan
    Route::middleware('role:owner,kasir')->group(function () {
        Route::apiResource(
            'services',
            ServiceController::class
        )->only([
            'index',
            'show',
        ]);
    });

    // Owner boleh menambah, mengedit dan menghapus layanan
    Route::middleware('role:owner')->group(function () {
        Route::apiResource(
            'services',
            ServiceController::class
        )->only([
            'store',
            'update',
            'destroy',
        ]);
    });

    // Pesanan dan pembayaran
    // Owner + Kasir
    Route::middleware('role:owner,kasir')->group(function () {
        Route::apiResource(
            'orders',
            OrderController::class
        );

        Route::apiResource(
            'payments',
            PaymentController::class
        )->only([
            'index',
            'store',
            'show',
            'destroy',
        ]);
    });

});