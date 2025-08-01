<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use App\Models\Candidate;
use App\Models\Position;

class SendCandidateInfoToHr extends Mailable
{
    use Queueable, SerializesModels;

    public $candidate;
    public $position;
    public $hrEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(Candidate $candidate, Position $position, $hrEmail)
    {
        $this->candidate = $candidate;
        $this->position = $position;
        $this->hrEmail = $hrEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Candidate Information for Position: ' . $this->position->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.candidate-info-to-hr',
            with: [
                'candidate' => $this->candidate,
                'position' => $this->position,
                'hrEmail' => $this->hrEmail,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];

        // Add resume if exists
        if ($this->candidate->resume && file_exists(storage_path('app/public/' . $this->candidate->resume))) {
            $attachments[] = Attachment::fromStorageDisk('public', $this->candidate->resume)
                ->as('Resume_' . $this->candidate->name . '.pdf')
                ->withMime('application/pdf');
        }

        // Add documents if exist
        if ($this->candidate->documents && is_array($this->candidate->documents)) {
            foreach ($this->candidate->documents as $document) {
                if (isset($document['path']) && file_exists(storage_path('app/public/' . $document['path']))) {
                    $attachments[] = Attachment::fromStorageDisk('public', $document['path'])
                        ->as($document['name'] ?? 'Document_' . $this->candidate->name . '.pdf')
                        ->withMime($document['type'] ?? 'application/pdf');
                }
            }
        }

        return $attachments;
    }
}
