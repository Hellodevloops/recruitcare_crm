import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Save, Upload } from 'lucide-react';
import axios from 'axios';
import { Candidate, Document } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface DocumentsSectionProps {
    candidate: Candidate;
    setCandidate: React.Dispatch<React.SetStateAction<Candidate>>;
}



const DocumentsSection: React.FC<DocumentsSectionProps> = ({ candidate, setCandidate }) => {
    const [newDocument, setNewDocument] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Filter general documents from candidate documents
    useEffect(() => {
        const generalDocs = (candidate.documents || []).filter(doc => doc.type === 'general');
        setDocuments(generalDocs);
    }, [candidate.documents]);

    // Refresh documents from server
    const refreshDocuments = async () => {
        if (!candidate.id) return;
        try {
            const response = await axios.get(`/candidates/${candidate.id}`);
            if (response.data && response.data.documents) {
                setDocuments(response.data.documents);
                // Update the parent component's state
                setCandidate(prevCandidate => ({
                    ...prevCandidate,
                    documents: response.data.documents
                }));
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast({
                title: "Error",
                description: "Failed to fetch documents"
            });
        }
    };

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedDocument(file);
        setNewDocument(file);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSaveDocument = async () => {
        if (!selectedDocument || !candidate.id) {
            toast({
                title: "Error",
                description: "Please select a document first"
            });
            return;
        }
        
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedDocument);
            formData.append('candidate_id', candidate.id.toString());
            formData.append('name', selectedDocument.name);
            formData.append('type', 'general');

            const response = await axios.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // Add new document to state
            const updatedDocuments = [...documents, response.data];
            setDocuments(updatedDocuments);
            
            // Update parent component
            setCandidate(prevCandidate => ({
                ...prevCandidate,
                documents: [...(prevCandidate.documents || []).filter(doc => doc.type !== 'general'), ...updatedDocuments]
            }));
            
            // Reset the file input and selected document
            setSelectedDocument(null);
            setNewDocument(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            toast({
                title: "Success",
                description: "Document saved successfully"
            });
        } catch (error) {
            console.error('Error saving document:', error);
            toast({
                title: "Error",
                description: "Failed to save document"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteDocument = async (documentId: number) => {
        setIsLoading(true);
        try {
            await axios.delete(`/documents/${documentId}`);
            
            // Remove document from state
            const updatedDocuments = documents.filter(doc => doc.id !== documentId);
            setDocuments(updatedDocuments);
            
            // Update parent component
            setCandidate(prevCandidate => ({
                ...prevCandidate,
                documents: [...(prevCandidate.documents || []).filter(doc => doc.id !== documentId)]
            }));
            
            toast({
                title: "Success",
                description: "Document deleted successfully"
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            toast({
                title: "Error",
                description: "Failed to delete document"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>General Documents</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {documents.length > 0 ? (
                        documents.map((doc) => (
                            <div key={doc.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50 transition">
                                <a href={`/documents/${doc.id}/download`} target="_blank" className="text-sm text-blue-600 hover:underline">{doc.name}</a>
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    disabled={isLoading || isSaving}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-2">No documents available</p>
                    )}
                    
                    <div className="space-y-2 p-4 bg-gray-100 rounded-lg">
                        <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelection}
                            className="bg-white hidden"
                            disabled={isLoading || isSaving}
                        />
                        <div className="flex gap-2 mb-2">
                            <Button 
                                variant="outline"
                                onClick={handleUploadClick}
                                className="flex-1"
                                disabled={isLoading || isSaving}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </div>
                        {selectedDocument && (
                            <div className="bg-white p-2 rounded mb-2 text-sm flex justify-between items-center">
                                <span className="truncate">{selectedDocument.name}</span>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleSaveDocument} 
                                className="flex-1"
                                disabled={!selectedDocument || isLoading || isSaving}
                                variant="default"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Document'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DocumentsSection;