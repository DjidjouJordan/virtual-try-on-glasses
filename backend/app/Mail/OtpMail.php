<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $code,
        public readonly string $purpose
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Code de vérification DPGlasses',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp',
            with: [
                'code' => $this->code,
                'purpose' => $this->purpose,
                'expiresIn' => 10
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}