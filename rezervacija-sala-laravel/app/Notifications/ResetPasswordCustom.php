<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordCustom extends Notification
{
    public string $url;

    public function __construct(string $url)
    {
        $this->url = $url;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset lozinke')
            ->line('Zatražili ste reset lozinke.')
            ->action('Promeni lozinku', $this->url)
            ->line('Ako niste vi zatražili, ignorišite ovaj email.');
    }
}
