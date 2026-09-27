<?php

use Illuminate\Support\Facades\Route;

Route::get('/reset-password/{token}', function (string $token) {
    $email = request()->query('email');

    return redirect(
        'http://localhost:5173/reset-password'
        . '?token=' . urlencode($token)
        . '&email=' . urlencode($email ?? '')
    );
})->name('password.reset');