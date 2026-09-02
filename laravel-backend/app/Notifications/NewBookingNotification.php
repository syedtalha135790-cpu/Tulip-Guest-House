<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewBookingNotification extends Notification
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject("New Room Reservation: {$this->booking->booking_reference}")
                    ->greeting("Hello Admin,")
                    ->line("A new room reservation has been placed at Murree Motels!")
                    ->line("Booking Reference: {$this->booking->booking_reference}")
                    ->line("Guest Name: {$this->booking->customer_name}")
                    ->line("Room: {$this->booking->room->room_name}")
                    ->line("Check-in: {$this->booking->check_in} | Check-out: {$this->booking->check_out}")
                    ->line("Total Amount: PKR " . number_format($this->booking->total_amount))
                    ->action('View Admin Bookings', url('/admin-bookings.html'))
                    ->line('Thank you for managing Murree Motels!');
    }

    public function toArray($notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'customer_name' => $this->booking->customer_name,
            'room_name' => $this->booking->room->room_name,
            'total_amount' => $this->booking->total_amount,
            'check_in' => $this->booking->check_in,
            'check_out' => $this->booking->check_out,
            'message' => "New booking {$this->booking->booking_reference} placed by {$this->booking->customer_name}.",
        ];
    }
}
