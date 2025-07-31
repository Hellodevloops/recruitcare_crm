import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { Candidate } from '@/types';

interface NotesSectionProps {
    candidate: Candidate;
    setCandidate: React.Dispatch<React.SetStateAction<Candidate>>;
}

const NotesSection: React.FC<NotesSectionProps> = ({ candidate, setCandidate }) => {
    const [newNote, setNewNote] = useState('');

    const handleAddNote = async () => {
        if (!candidate.id) return console.error('Candidate ID missing');
        const response = await axios.post('/notes', {
            candidate_id: candidate.id,
            content: newNote,
        });
        setCandidate({ ...candidate, notes: [...candidate.notes, response.data] });
        setNewNote('');
    };

    const handleDeleteNote = async (noteId: number) => {
        await axios.delete(`/notes/${noteId}`);
        setCandidate({ ...candidate, notes: candidate.notes.filter(note => note.id !== noteId) });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {candidate.notes.map((note) => (
                        <div key={note.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 transition">
                            <p className="text-sm text-gray-900">{note.content}</p>
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteNote(note.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <Textarea
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            className="bg-white"
                        />
                        <Button onClick={handleAddNote} className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Add Note
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default NotesSection;