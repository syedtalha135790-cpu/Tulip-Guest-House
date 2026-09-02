<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    /**
     * Check Date Range Availability across all rooms
     */
    public function check(Request $request)
    {
        $request->validate([
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
        ]);

        $checkIn = $request->check_in;
        $checkOut = $request->check_out;

        $rooms = Room::all()->map(function ($room) use ($checkIn, $checkOut) {
            $isAvailable = $room->isAvailableForDates($checkIn, $checkOut);
            return [
                'id' => $room->id,
                'room_number' => $room->room_number,
                'room_name' => $room->room_name,
                'price' => $room->price,
                'status' => $isAvailable ? 'AVAILABLE' : 'BOOKED',
                'is_available' => $isAvailable,
            ];
        });

        return response()->json([
            'success' => true,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'data' => $rooms
        ]);
    }

    /**
     * Admin Availability Matrix Calendar data
     */
    public function adminCalendar(Request $request)
    {
        $startDate = Carbon::parse($request->query('start_date', now()->format('Y-m-d')));
        $days = 10;
        
        $dates = [];
        for ($i = 0; $i < $days; $i++) {
            $dates[] = $startDate->copy()->addDays($i)->format('Y-m-d');
        }

        $rooms = Room::with(['bookings' => function ($q) {
            $q->where('status', '!=', 'Cancelled');
        }])->get();

        $matrix = $rooms->map(function ($room) use ($dates) {
            $dayStates = [];
            foreach ($dates as $date) {
                if ($room->status === 'MAINTENANCE') {
                    $dayStates[$date] = 'MAINTENANCE';
                } else {
                    $isBooked = $room->bookings->contains(function ($b) use ($date) {
                        return $date >= $b->check_in && $date < $b->check_out;
                    });
                    $dayStates[$date] = $isBooked ? 'BOOKED' : 'FREE';
                }
            }

            return [
                'room_id' => $room->id,
                'room_number' => $room->room_number,
                'room_name' => $room->room_name,
                'dates' => $dayStates,
            ];
        });

        return response()->json([
            'success' => true,
            'dates' => $dates,
            'matrix' => $matrix
        ]);
    }
}
