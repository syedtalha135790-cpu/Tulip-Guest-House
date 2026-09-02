<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'user_id',
        'room_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_cnic',
        'check_in',
        'check_out',
        'guests_count',
        'total_amount',
        'status',
        'special_requests',
    ];

    protected $casts = [
        'check_in' => 'date:Y-m-d',
        'check_out' => 'date:Y-m-d',
        'guests_count' => 'integer',
        'total_amount' => 'float',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
