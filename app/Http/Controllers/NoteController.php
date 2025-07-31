<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * Display a listing of all notes.
     */
    public function index()
    {
        return response()->json(Note::all());
    }

    /**
     * Store a newly created note in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'content' => 'required|string',
        ]);

        $note = Note::create($validated);

        return response()->json($note, 201);
    }

    /**
     * Display the specified note.
     */
    public function show(Note $note)
    {
        return response()->json($note);
    }

    /**
     * Update the specified note in storage.
     */
    public function update(Request $request, Note $note)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $note->update($validated);

        return response()->json($note);
    }

    /**
     * Remove the specified note from storage.
     */
    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(null, 204);
    }
}