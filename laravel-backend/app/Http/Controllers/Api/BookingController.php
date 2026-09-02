<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use App\Notifications\NewBookingNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class BookingController extends Controller
{
    /**
     * Customer: Create a new room reservation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_cnic' => 'nullable|string|max:30',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests_count' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);

        $room = Room::findOrFail($validated['room_id']);

        // Check room capacity
        if ($validated['guests_count'] > $room->capacity) {
            return response()->json([
                'success' => false,
                'message' => "Guest count exceeds room capacity of {$room->capacity} guests."
            ], 422);
        }

        // Check Date Overlap Availability
        if (!$room->isAvailableForDates($validated['check_in'], $validated['check_out'])) {
            return response()->json([
                'success' => false,
                'message' => 'Room is already booked for the selected dates.'
            ], 422);
        }

        // Calculate Nights & Total Amount
        $checkInDate = Carbon::parse($validated['check_in']);
        $checkOutDate = Carbon::parse($validated['check_out']);
        $nights = max(1, $checkInDate->diffInDays($checkOutDate));
        
        $subtotal = $nights * $room->price;
        $tax = round($subtotal * 0.05); // 5% tax
        $totalAmount = $subtotal + $tax;

        // Generate Booking Reference
        $reference = 'MM-' . date('Y') . '-' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);

        $booking = Booking::create([
            'booking_reference' => $reference,
            'user_id' => auth('sanctum')->id(),
            'room_id' => $room->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'],
            'customer_cnic' => $validated['customer_cnic'] ?? null,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'guests_count' => $validated['guests_count'],
            'total_amount' => $totalAmount,
            'status' => 'Confirmed',
            'special_requests' => $validated['special_requests'] ?? null,
        ]);

        // Dynamically update room status if check-in is today
        if ($checkInDate->isToday()) {
            $room->update(['status' => 'BOOKED']);
        }

        // Send Admin Notification
        $adminUsers = User::where('role', 'admin')->get();
        if ($adminUsers->isNotEmpty()) {
            Notification::send($adminUsers, new NewBookingNotification($booking));
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking submitted successfully!',
            'data' => $booking->load('room')
        ], 201);
    }

    /**
     * Customer: My Bookings List
     */
    public function myBookings(Request $request)
    {
        $user = auth()->user();
        $email = $request->query('email', $user?->email);

        $bookings = Booking::with('room')
            ->where(function ($q) use ($user, $email) {
                if ($user) $q->where('user_id', $user->id);
                if ($email) $q->orWhere('customer_email', $email);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Admin: All Bookings Management
     */
    public function adminBookings(Request $request)
    {
        $query = Booking::with('room')->latest();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Admin: Update Booking Status
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Confirmed,Completed,Cancelled'
        ]);

        $booking = Booking::findOrFail($id);
        $booking->update(['status' => $validated['status']]);

        // If cancelled, check if room should be marked AVAILABLE
        if ($validated['status'] === 'Cancelled') {
            $room = $booking->room;
            if ($room && !$room->bookings()->where('status', 'Confirmed')->where('check_in', '<=', now())->where('check_out', '>', now())->exists()) {
                $room->update(['status' => 'AVAILABLE']);
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Booking status updated to {$validated['status']}.",
            'data' => $booking
        ]);
    }
}
