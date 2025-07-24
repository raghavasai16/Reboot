import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, Eye, CheckCircle, AlertCircle, Loader2, X, AlertTriangle } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { playSuccess, playError } from '../utils/audioFeedback';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';
import { uploadDocumentToBackend } from '../utils/api';

interface DocumentUploadProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
  candidateId: number; // <-- Add this
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  extractedData?: any;
  confidence?: number;
  backendId?: string; // Added for backend document ID
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onComplete, isProcessing, candidateId }) => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFresher, setIsFresher] = useState(false);
  const [mandatoryDocs, setMandatoryDocs] = useState({
    aadhar: false,
    pan: false,
    experience: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processRealFiles(files);
  }, []);

  const handleRealFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processRealFiles(files);
  }, []);

  const processRealFiles = async (files: File[]) => {
    if (!candidateId || isNaN(Number(candidateId))) {
      setDocuments(prev => prev.map(d => ({ ...d, status: 'error' })));
      playError();
      alert('Error: candidateId is missing or invalid. Please log in again or contact support.');
      console.error('Document upload blocked: candidateId is missing or invalid:', candidateId);
      return;
    }
    const newDocuments = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading' as const,
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    for (const doc of newDocuments) {
      try {
        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'processing' } : d));
        const response = await uploadDocumentToBackend(
          files.find(f => f.name === doc.name)!,
          candidateId
        );
        const extractedData = generateExtractedData(doc.name);
        setDocuments(prev => prev.map(d => 
          d.id === doc.id
            ? {
                ...d,
                status: 'completed',
                backendId: response.id,
                gcsUrl: response.gcsUrl,
                fileName: response.fileName,
                fileType: response.fileType,
                fileSize: response.fileSize,
                uploadTime: response.uploadTime,
                extractedData,
              }
            : d
        ));
        updateMandatoryStatus(doc.name);
      } catch (error) {
        setDocuments(prev => prev.map(d =>
          d.id === doc.id ? { ...d, status: 'error' } : d
        ));
        playError();
      }
    }
  };

  const generateExtractedData = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('aadhar') || lowerName.includes('aadhaar')) {
      return {
        documentType: 'Aadhar Card',
        fullName: 'BATCHU VEERA RAGHAVA',
        aadharNumber: '505216952426',
        dateOfBirth: '2000-05-16',
        address: '8/620 Godown Street,Proddatur,Andhra Pradesh',
      };
    } else if (lowerName.includes('pan')) {
      return {
        documentType: 'PAN Card',
        fullName: 'BATCHU VEERA RAGHAVA',
        panNumber: 'DBYPB8442M',
        dateOfBirth: '2000-05-16',
        fatherName: 'BATCHU VENKATA PAVAN KUMAR',
      };
    } else if (lowerName.includes('experience') || lowerName.includes('relieving') || lowerName.includes('salary')) {
      return {
        documentType: 'Experience Letter',
        employeeName: 'BATCHU VEERA RAGHAVA',
        company: 'Delotiee Technologies',
        designation: 'Software Engineer',
        workingPeriod: '2025-2026',
      };
    }
    return {
      documentType: 'Document',
      extractedText: 'Document processed successfully',
    };
  };

  const updateMandatoryStatus = (fileName: string) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('aadhar') || lowerName.includes('aadhaar')) {
      setMandatoryDocs(prev => ({ ...prev, aadhar: true }));
    } else if (lowerName.includes('pan')) {
      setMandatoryDocs(prev => ({ ...prev, pan: true }));
    } else if (lowerName.includes('experience') || lowerName.includes('relieving') || lowerName.includes('salary')) {
      setMandatoryDocs(prev => ({ ...prev, experience: true }));
    }
  };

  const processFiles = async (files: File[]) => {
    // Create demo documents with proper names for mandatory document detection
    const demoFiles = [
      { name: 'aadhar_card.pdf', type: 'application/pdf', size: 2500000 },
      { name: 'pan_card.pdf', type: 'application/pdf', size: 1800000 },
      { name: 'experience_letter.pdf', type: 'application/pdf', size: 3200000 }
    ];
    
    await processRealFiles(demoFiles.map(file => new File([''], file.name, { type: file.type })));
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const mandatoryDocsUploaded = mandatoryDocs.aadhar && mandatoryDocs.pan && (isFresher || mandatoryDocs.experience);
  const allDocumentsProcessed = documents.length > 0 && documents.every(doc => doc.status === 'completed') && mandatoryDocsUploaded;

  const handleExtractedDataChange = (docId: string, field: string, value: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId
          ? { ...doc, extractedData: { ...doc.extractedData, [field]: value } }
          : doc
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Document Upload & OCR Processing
        </h2>
        <p className="text-gray-600">
          Upload your documents for AI-powered extraction and verification
        </p>
        <button
          type="button"
          onClick={() => readSelectedTextOr('Document Upload and OCR Processing. Upload your documents for AI-powered extraction and verification. Mandatory Documents. Upload Area. Uploaded Documents.')}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Read this section aloud"
        >
          🔊 Read Aloud
        </button>
        <button
          type="button"
          onClick={stopReading}
          className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Stop reading aloud"
        >
          ⏹ Stop
        </button>
      </div>

      {/* Mandatory Documents Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mandatory Documents</h3>
        
        <div className="mb-4">
          <label htmlFor="isFresher" className="flex items-center space-x-2">
            <input
              id="isFresher"
              type="checkbox"
              checked={isFresher}
              onChange={(e) => setIsFresher(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              aria-checked={isFresher}
              aria-label="I am a fresher (no previous work experience)"
            />
            <span className="text-sm text-gray-700">I am a fresher (no previous work experience)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 border rounded-lg ${mandatoryDocs.aadhar ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {mandatoryDocs.aadhar ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900">Aadhar Card</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Government ID proof required</p>
          </div>

          <div className={`p-4 border rounded-lg ${mandatoryDocs.pan ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {mandatoryDocs.pan ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900">PAN Card</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Tax identification required</p>
          </div>

          <div className={`p-4 border rounded-lg ${
            isFresher ? 'bg-gray-50 border-gray-200' : 
            mandatoryDocs.experience ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {isFresher ? (
                <CheckCircle className="w-5 h-5 text-gray-400" />
              ) : mandatoryDocs.experience ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium text-gray-900">Experience Letter</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isFresher ? 'Not required for freshers' : 'Previous company experience proof'}
            </p>
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      <Card className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Documents
          </h3>
          <p className="text-gray-600 mb-4">
            Drag and drop files here, or click to select files
          </p>
          <div className="mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                processFiles([]);
              }}
            >
              Upload Demo Documents (Aadhar, PAN, Experience)
            </Button>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <Button
            variant="outline"
            className="cursor-pointer"
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Select Files
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Select Aadhar Card, PAN Card{!isFresher && ', Experience Letter'} from your computer (PDF, JPG, PNG up to 10MB each)
          </p>
        </div>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Uploaded Documents
          </h3>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`${getStatusColor(doc.status)}`}> {getStatusIcon(doc.status)} </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(doc.size)} • {doc.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.confidence && (
                      <span className="text-sm text-gray-600">{doc.confidence}% confidence</span>
                    )}
                    <button onClick={() => removeDocument(doc.id)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Show extracted data as a form for each document type if present */}
                {doc.extractedData && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Extracted Information:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {/* Aadhar Card */}
                      {doc.extractedData.documentType === 'Aadhar Card' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Full Name:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm"
                              value={doc.extractedData.fullName || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'fullName', e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Date of Birth:</label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm"
                              value={doc.extractedData.dateOfBirth || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'dateOfBirth', e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Aadhar Number:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm"
                              value={doc.extractedData.aadharNumber || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'aadharNumber', e.target.value)}
                              placeholder="Enter Aadhar number"
                            />
                          </div>
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-gray-600 font-medium">Address:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all shadow-sm"
                              value={doc.extractedData.address || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'address', e.target.value)}
                              placeholder="Enter address"
                            />
                          </div>
                        </>
                      )}
                      {/* PAN Card */}
                      {doc.extractedData.documentType === 'PAN Card' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Full Name:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                              value={doc.extractedData.fullName || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'fullName', e.target.value)}
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Date of Birth:</label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                              value={doc.extractedData.dateOfBirth || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'dateOfBirth', e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">PAN Number:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                              value={doc.extractedData.panNumber || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'panNumber', e.target.value)}
                              placeholder="Enter PAN number"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Father Name:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                              value={doc.extractedData.fatherName || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'fatherName', e.target.value)}
                              placeholder="Enter father name"
                            />
                          </div>
                        </>
                      )}
                      {/* Experience Letter */}
                      {doc.extractedData.documentType === 'Experience Letter' && (
                        <>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Employee Name:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
                              value={doc.extractedData.employeeName || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'employeeName', e.target.value)}
                              placeholder="Enter employee name"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Company:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
                              value={doc.extractedData.company || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'company', e.target.value)}
                              placeholder="Enter company name"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Designation:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
                              value={doc.extractedData.designation || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'designation', e.target.value)}
                              placeholder="Enter designation"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-gray-600 font-medium">Working Period:</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-sm"
                              value={doc.extractedData.workingPeriod || ''}
                              onChange={e => handleExtractedDataChange(doc.id, 'workingPeriod', e.target.value)}
                              placeholder="Enter working period"
                            />
                          </div>
                        </>
                      )}
                      {/* Fallback for other document types */}
                      {doc.extractedData.documentType !== 'Aadhar Card' &&
                        doc.extractedData.documentType !== 'PAN Card' &&
                        doc.extractedData.documentType !== 'Experience Letter' && (
                          <div>
                            <span className="text-gray-600">Extracted Text:</span>
                            <span className="ml-2 text-gray-900">{doc.extractedData.extractedText}</span>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            onComplete({ documents });
            playSuccess();
          }}
          disabled={!allDocumentsProcessed || isProcessing}
          className="px-8"
          aria-label="Complete Document Upload"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Document Upload'
          )}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUpload;