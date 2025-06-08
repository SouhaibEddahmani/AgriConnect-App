<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EquipmentController;
use App\Http\Controllers\AdminEquipmentController;
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware(['auth:sanctum', 'isAdmin'])->group(function () {
    Route::get('/admin/users', [App\Http\Controllers\AdminController::class, 'listUsers']);
    Route::post('/admin/promote/{userId}', [App\Http\Controllers\AdminController::class, 'promoteToAdmin']);
    Route::post('/admin/demote/{userId}', [App\Http\Controllers\AdminController::class, 'demoteAdmin']);
    Route::delete('/admin/user/{userId}', [App\Http\Controllers\AdminController::class, 'deleteUser']);
    Route::post('/admin/create', [AuthController::class, 'createAdmin']);
    // Example admin dashboard route
    Route::get('/admin/dashboard', function () {
        return response()->json([
            'stats' => [
                'totalUsers' => \App\Models\User::count(),
                'totalEquipment' => 0, // Equipment feature removed
                'activeRentals' => 0,  // Equipment feature removed
                'totalRevenue' => 0,   // Equipment feature removed
                'totalBookings' => 0,  // Equipment feature removed
            ]
        ]);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/update', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
});





