<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_number',
        'room_name',
        'room_type',
        'price',
        'capacity',
        'bed_type',
        'view_type',
        'status',
        'image_path',
        'description',
        'facilities',
    ];

    protected $casts = [
        'price' => 'float',
        'capacity' => 'integer',
        'facilities' => 'array',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Check if room is available for specified check-in and check-out dates
     */
    public function isAvailableForDates($checkIn, $checkOut)
    {
        if ($this->status === 'MAINTENANCE') {
            return false;
        }

        return !$this->bookings()
            ->where('status', '!=', 'Cancelled')
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->where('check_in', '<', $checkOut)
                      ->where('check_out', '>', $checkIn);
            })->exists();
    }
}
