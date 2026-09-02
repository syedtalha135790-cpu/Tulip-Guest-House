<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AvailabilityController;

/*
|--------------------------------------------------------------------------
| Murree Motels - REST API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Room & Availability APIs
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);
Route::get('/availability/check', [AvailabilityController::class, 'check']);

// Public / Customer Booking API
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/my-bookings', [BookingController::class, 'myBookings']);

// Protected User Routes (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Admin Management APIs
Route::prefix('admin')->group(function () {
    // Rooms CRUD
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

    // Bookings & Availability
    Route::get('/bookings', [BookingController::class, 'adminBookings']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    Route::get('/availability-calendar', [AvailabilityController::class, 'adminCalendar']);
});
