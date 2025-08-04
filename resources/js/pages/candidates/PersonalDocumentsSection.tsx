import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Upload, FileText, CreditCard, User, Building, Download } from 'lucide-react';
import axios from 'axios';
import { Candidate, Document } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface PersonalDocumentsSectionProps {
    candidate: Candidate;
    setCandidate: React.Dispatch<React.SetStateAction<Candidate>>;
}

const PERSONAL_DOCUMENT_TYPES = [
    { value: 'pan_card', label: 'PAN Card', icon: CreditCard },
    { value: 'aadhar_card', label: 'Aadhar Card', icon: CreditCard },
    { value: 'experience_certificate', label: 'Experience Certificate', icon: Building },
    { value: 'salary_slip', label: 'Salary Slip', icon: FileText },
    { value: 'other_documents', label: 'Other Documents', icon: FileText },
];

const PersonalDocumentsSection: React.FC<PersonalDocumentsSectionProps> = ({ candidate, setCandidate }) => {
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
    const [selectedDocumentType, setSelectedDocumentType] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [personalDocuments, setPersonalDocuments] = useState<Document[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Filter personal documents from candidate documents
    useEffect(() => {
        const personalDocs = (candidate.documents || []).filter(doc => doc.type === 'personal');
        setPersonalDocuments(personalDocs);
    }, [candidate.documents]);

    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedDocument(file);
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleSaveDocument = async () => {
        if (!selectedDocument || !candidate.id || !selectedDocumentType) {
            toast({
                title: "Error",
                description: "Please select a document and document type first"
            });
            return;
        }
        
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedDocument);
            formData.append('candidate_id', candidate.id.toString());
            formData.append('name', selectedDocument.name);
            formData.append('type', 'personal');
            formData.append('document_type', selectedDocumentType);

            const response = await axios.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // Add new document to state
            const newDocument = response.data;
            setPersonalDocuments(prev => [...prev, newDocument]);
            
            // Update parent component
            setCandidate(prevCandidate => ({
                ...prevCandidate,
                documents: [...(prevCandidate.documents || []), newDocument]
            }));
            
            // Reset the form
            setSelectedDocument(null);
            setSelectedDocumentType('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            toast({
                title: "Success",
                description: "Personal document uploaded successfully"
            });
        } catch (error) {
            console.error('Error uploading personal document:', error);
            toast({
                title: "Error",
                description: "Failed to upload personal document"
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
            const updatedDocuments = personalDocuments.filter(doc => doc.id !== documentId);
            setPersonalDocuments(updatedDocuments);
            
            // Update parent component
            setCandidate(prevCandidate => ({
                ...prevCandidate,
                documents: (prevCandidate.documents || []).filter(doc => doc.id !== documentId)
            }));
            
            toast({
                title: "Success",
                description: "Personal document deleted successfully"
            });
        } catch (error) {
            console.error('Error deleting personal document:', error);
            toast({
                title: "Error",
                description: "Failed to delete personal document"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getDocumentTypeLabel = (documentType: string) => {
        const docType = PERSONAL_DOCUMENT_TYPES.find(type => type.value === documentType);
        return docType ? docType.label : 'Other Documents';
    };

    const getDocumentIcon = (documentType: string) => {
        const docType = PERSONAL_DOCUMENT_TYPES.find(type => type.value === documentType);
        return docType ? docType.icon : FileText;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Personal Documents</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Resume Section */}
                    {candidate.resume && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Resume</h4>
                            <div className="flex justify-between items-center p-3 border rounded-lg bg-blue-50 border-blue-200 hover:bg-blue-100 transition">
                                <div className="flex items-center space-x-3">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <a 
                                            href={`/candidates/${candidate.id}/resume/download`} 
                                            target="_blank" 
                                            className="text-sm font-medium text-blue-600 hover:underline"
                                        >
                                            Resume.pdf
                                        </a>
                                        <p className="text-xs text-gray-500">
                                            Resume uploaded during candidate creation
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/candidates/${candidate.id}/resume/download`, '_blank')}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    View
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Other Personal Documents */}
                    {personalDocuments.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Personal Documents</h4>
                            {personalDocuments.map((doc) => {
                                const IconComponent = getDocumentIcon(doc.document_type || '');
                                return (
                                    <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition">
                                        <div className="flex items-center space-x-3">
                                            <IconComponent className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <a 
                                                    href={`/documents/${doc.id}/download`} 
                                                    target="_blank" 
                                                    className="text-sm font-medium text-blue-600 hover:underline"
                                                >
                                                    {doc.name}
                                                </a>
                                                <p className="text-xs text-gray-500">
                                                    {getDocumentTypeLabel(doc.document_type || '')}
                                                </p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            onClick={() => handleDeleteDocument(doc.id)}
                                            disabled={isLoading || isSaving}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {personalDocuments.length === 0 && !candidate.resume && (
                        <p className="text-sm text-gray-500 text-center py-4">No personal documents available</p>
                    )}
                    
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900">Upload Personal Document</h4>
                        
                        <Input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelection}
                            className="bg-white hidden"
                            disabled={isLoading || isSaving}
                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                        
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                onClick={handleUploadClick}
                                className="flex-1"
                                disabled={isLoading || isSaving}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                Choose File
                            </Button>
                        </div>
                        
                        {selectedDocument && (
                            <div className="bg-white p-3 rounded border text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="truncate font-medium">{selectedDocument.name}</span>
                                    <span className="text-gray-500 text-xs">
                                        {formatFileSize(selectedDocument.size)}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-blue-900">Document Type</label>
                            <Select
                                value={selectedDocumentType} 
                                onValueChange={setSelectedDocumentType}
                                disabled={isLoading || isSaving}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PERSONAL_DOCUMENT_TYPES.map((type) => {
                                        const IconComponent = type.icon;
                                        return (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center space-x-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button 
                            onClick={handleSaveDocument} 
                            className="w-full"
                            disabled={!selectedDocument || !selectedDocumentType || isLoading || isSaving}
                            variant="default"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Uploading...' : 'Upload Personal Document'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PersonalDocumentsSection; 