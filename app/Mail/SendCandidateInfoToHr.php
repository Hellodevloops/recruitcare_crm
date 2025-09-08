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
use Illuminate\Database\Eloquent\Collection;

class SendCandidateInfoToHr extends Mailable
{
    use Queueable, SerializesModels;

    public $candidates;
    public $position;
    public $hrEmail;
    public $isMultiple;

    /**
     * Create a new message instance.
     */
    public function __construct($candidates, Position $position, $hrEmail)
    {
        // Handle both single candidate and multiple candidates
        if ($candidates instanceof Candidate) {
            $this->candidates = collect([$candidates->load('documents')]);
            $this->isMultiple = false;
        } else {
            $this->candidates = $candidates->load('documents');
            $this->isMultiple = true;
        }
        
        $this->position = $position;
        $this->hrEmail = $hrEmail;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->isMultiple 
            ? 'Multiple Candidates Information for Position: ' . $this->position->designation
            : 'Candidate Information for Position: ' . $this->position->designation;
            
        return new Envelope(
            subject: $subject,
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
                'candidates' => $this->candidates,
                'position' => $this->position,
                'hrEmail' => $this->hrEmail,
                'isMultiple' => $this->isMultiple,
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

        foreach ($this->candidates as $candidate) {
            // Add resume if exists
            if ($candidate->resume && file_exists(storage_path('app/public/' . $candidate->resume))) {
                $attachments[] = Attachment::fromStorageDisk('public', $candidate->resume)
                    ->as('Resume_' . $candidate->name . '.pdf')
                    ->withMime('application/pdf');
            }

            // Add documents if exist - handle both array and relationship
            if ($candidate->documents) {
                // Check if documents is a collection (relationship) or array
                if ($candidate->documents instanceof \Illuminate\Database\Eloquent\Collection) {
                    // Documents from relationship
                    foreach ($candidate->documents as $document) {
                        if ($document->path && file_exists(storage_path('app/public/' . $document->path))) {
                            $documentName = $document->name ?? 'Document_' . $candidate->name;
                            $documentType = $document->document_type ?? 'document';
                            
                            // Add candidate name to filename for better identification when multiple candidates
                            $filename = $this->isMultiple 
                                ? $candidate->name . '_' . $documentType . '_' . $documentName . '.pdf'
                                : $documentType . '_' . $documentName . '.pdf';
                            
                            $attachments[] = Attachment::fromStorageDisk('public', $document->path)
                                ->as($filename)
                                ->withMime('application/pdf');
                        }
                    }
                } elseif (is_array($candidate->documents)) {
                    // Documents from array field
                    foreach ($candidate->documents as $document) {
                        if (isset($document['path']) && file_exists(storage_path('app/public/' . $document['path']))) {
                            $documentName = $document['name'] ?? 'Document_' . $candidate->name;
                            $documentType = $document['document_type'] ?? 'document';
                            
                            // Add candidate name to filename for better identification when multiple candidates
                            $filename = $this->isMultiple 
                                ? $candidate->name . '_' . $documentType . '_' . $documentName . '.pdf'
                                : $documentType . '_' . $documentName . '.pdf';
                            
                            $attachments[] = Attachment::fromStorageDisk('public', $document['path'])
                                ->as($filename)
                                ->withMime('application/pdf');
                        }
                    }
                }
            }
        }

        return $attachments;
    }
}
