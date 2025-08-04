<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    /**
     * Display a listing of all documents.
     */
    public function index()
    {
        return response()->json(Document::all());
    }

    /**
     * Store a newly created document in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'file' => 'required|file|max:10240', // Max 10MB
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:general,personal',
            'document_type' => 'nullable|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');
        $document = Document::create([
            'candidate_id' => $validated['candidate_id'],
            'path' => $path,
            'name' => $validated['name'] ?? $file->getClientOriginalName(),
            'type' => $validated['type'] ?? 'general',
            'document_type' => $validated['document_type'] ?? null,
        ]);

        return response()->json($document, 201);
    }

    /**
     * Display the specified document.
     */
    public function show(Document $document)
    {
        return response()->json($document);
    }

    /**
     * Update the specified document in storage.
     */
    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'file' => 'nullable|file|max:10240', // Max 10MB
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:general,personal',
            'document_type' => 'nullable|string|max:255',
        ]);

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($document->path);
            $file = $request->file('file');
            $path = $file->store('documents', 'public');
            $document->path = $path;
        }

        if ($validated['name'] ?? false) {
            $document->name = $validated['name'];
        } elseif ($request->hasFile('file')) {
            $document->name = $request->file('file')->getClientOriginalName();
        }

        if ($validated['type'] ?? false) {
            $document->type = $validated['type'];
        }

        if ($validated['document_type'] ?? false) {
            $document->document_type = $validated['document_type'];
        }

        $document->save();

        return response()->json($document);
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->path);
        $document->delete();
        return response()->json(null, 204);
    }
}