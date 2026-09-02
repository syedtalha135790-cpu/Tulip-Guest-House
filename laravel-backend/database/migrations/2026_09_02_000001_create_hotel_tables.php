<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add role to users table if not exists
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['customer', 'admin'])->default('customer')->after('email');
                $table->string('phone')->nullable()->after('role');
            });
        }

        // Rooms Table
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->string('room_name');
            $table->enum('room_type', ['Standard', 'Deluxe', 'Family', 'Executive', 'Premium', 'Penthouse'])->default('Deluxe');
            $table->decimal('price', 10, 2);
            $table->integer('capacity')->default(2);
            $table->string('bed_type')->nullable();
            $table->string('view_type')->nullable();
            $table->enum('status', ['AVAILABLE', 'BOOKED', 'MAINTENANCE'])->default('AVAILABLE');
            $table->string('image_path')->default('assets/images/hotel-2.jpg');
            $table->text('description')->nullable();
            $table->json('facilities')->nullable();
            $table->timestamps();
        });

        // Bookings Table
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_reference')->unique(); // e.g. MM-2026-000123
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('customer_cnic')->nullable();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('guests_count');
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['Pending', 'Confirmed', 'Completed', 'Cancelled'])->default('Confirmed');
            $table->text('special_requests')->nullable();
            $table->timestamps();
        });

        // Settings Table
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('settings');
    }
};
