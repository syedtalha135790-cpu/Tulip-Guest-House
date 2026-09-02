<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    /**
     * Get all rooms with optional availability date filter
     */
    public function index(Request $request)
    {
        $query = Room::query();

        if ($request->filled('room_type') && $request->room_type !== 'all') {
            $query->where('room_type', $request->room_type);
        }

        if ($request->filled('guests') && $request->guests !== 'all') {
            $query->where('capacity', '>=', (int)$request->guests);
        }

        $rooms = $query->get();

        if ($request->filled('check_in') && $request->filled('check_out')) {
            $checkIn = $request->check_in;
            $checkOut = $request->check_out;

            $rooms->transform(function ($room) use ($checkIn, $checkOut) {
                $available = $room->isAvailableForDates($checkIn, $checkOut);
                $room->is_available = $available;
                $room->availability_reason = $available ? 'Available' : 'Booked for selected dates';
                return $room;
            });
        }

        return response()->json([
            'success' => true,
            'data' => $rooms
        ]);
    }

    /**
     * Show single room details
     */
    public function show($id)
    {
        $room = Room::with(['bookings' => function ($q) {
            $q->where('status', '!=', 'Cancelled');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $room
        ]);
    }

    /**
     * Admin: Add new room with image file upload support
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|unique:rooms,room_number',
            'room_name' => 'required|string|max:255',
            'room_type' => 'required|in:Standard,Deluxe,Family,Executive,Premium,Penthouse',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'bed_type' => 'nullable|string',
            'view_type' => 'nullable|string',
            'status' => 'required|in:AVAILABLE,BOOKED,MAINTENANCE',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
        ]);

        // Handle uploaded file
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rooms', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $room = Room::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room created successfully!',
            'data' => $room
        ], 201);
    }

    /**
     * Admin: Edit room (Dynamic pricing, name, status, image upload/replacement)
     */
    public function update(Request $request, $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => 'required|unique:rooms,room_number,' . $room->id,
            'room_name' => 'required|string|max:255',
            'room_type' => 'required|in:Standard,Deluxe,Family,Executive,Premium,Penthouse',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'bed_type' => 'nullable|string',
            'view_type' => 'nullable|string',
            'status' => 'required|in:AVAILABLE,BOOKED,MAINTENANCE',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_path' => 'nullable|string',
            'description' => 'nullable|string',
            'facilities' => 'nullable|array',
        ]);

        // Handle image upload & replacement
        if ($request->hasFile('image')) {
            // Delete old file if stored locally
            if ($room->image_path && str_starts_with($room->image_path, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $room->image_path);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('rooms', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $room->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Room updated successfully with new image!',
            'data' => $room
        ]);
    }

    /**
     * Admin: Delete room and its image file
     */
    public function destroy($id)
    {
        $room = Room::findOrFail($id);
        
        if ($room->image_path && str_starts_with($room->image_path, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $room->image_path);
            Storage::disk('public')->delete($oldPath);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully.'
        ]);
    }
}
