import React, { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, Eye, Loader2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { playSuccess, playError, playNotification } from '../utils/audioFeedback';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

interface AIValidationProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

interface ValidationResult {
  field: string;
  formValue: string;
  documentValue: string;
  confidence: number;
  status: 'match' | 'mismatch' | 'low-confidence';
  suggestion?: string;
}

const AIValidation: React.FC<AIValidationProps> = ({ onComplete, isProcessing }) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [overallScore, setOverallScore] = useState(0);

  useEffect(() => {
    // Simulate AI validation process
    const runValidation = async () => {
      setIsAnalyzing(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock validation results
      const mockResults: ValidationResult[] = [
        {
          field: 'Full Name',
          formValue: 'Veera Raghava',
          documentValue: 'Veera Raghava',
          confidence: 98,
          status: 'match',
        },
        {
          field: 'Date of Birth',
          formValue: '16-05-2000',
          documentValue: '16-05-2000',
          confidence: 95,
          status: 'match',
        },
        {
          field: 'Address',
          formValue: '8/620 Godown Street,Proddatur,Andhra Pradesh',
          documentValue: '8-620 Godown Street,Proddatur,Andhra Pradesh',
          confidence: 87,
          status: 'low-confidence',
          suggestion: 'Minor formatting difference detected. Please verify address format.',
        },
        {
          field: 'Phone Number',
          formValue: '+91-9182111000',
          documentValue: '+91-918211100',
          confidence: 92,
          status: 'mismatch',
          suggestion: 'Phone numbers do not match. Please verify the correct number.',
        },
      ];
      
      setValidationResults(mockResults);
      setOverallScore(92);
      setIsAnalyzing(false);
    };

    runValidation();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'match':
        return 'text-green-600';
      case 'mismatch':
        return 'text-red-600';
      case 'low-confidence':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'match':
        return 'bg-green-50 border-green-200';
      case 'mismatch':
        return 'bg-red-50 border-red-200';
      case 'low-confidence':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'mismatch':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'low-confidence':
        return <Eye className="w-5 h-5 text-yellow-600" />;
      default:
        return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const hasIssues = validationResults.some(result => result.status !== 'match');

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Cross-Validation
        </h2>
        <p className="text-gray-600">
          Our AI compares form data with document information to detect discrepancies
        </p>
        <button
          type="button"
          onClick={() => readSelectedTextOr('AI Cross-Validation. Our AI compares form data with document information to detect discrepancies. Validation Score. Field-by-Field Validation.')}
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Read this section aloud"
        >
          🔊 Read Aloud
        </button>
        <button
          type="button"
          onClick={stopReading}
          className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Stop reading aloud"
        >
          ⏹ Stop
        </button>
      </div>

      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Validation Score</h3>
          {isAnalyzing && (
            <div className="flex items-center text-sm text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI analyzing...
            </div>
          )}
        </div>
        
        {!isAnalyzing && (
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getOverallScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <p className="text-gray-600">Overall confidence score</p>
          </div>
        )}
      </Card>

      {/* Validation Results */}
      {!isAnalyzing && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Field-by-Field Validation
          </h3>
          
          <div className="space-y-4">
            {validationResults.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusBg(result.status)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h4 className="font-medium text-gray-900">{result.field}</h4>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.status.replace('-', ' ')} • {result.confidence}% confidence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Form Value:</p>
                    <p className="text-sm font-medium text-gray-900 bg-white p-2 rounded border">
                      {result.formValue}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Document Value:</p>
                    <p className="text-sm font-medium text-gray-900 bg-white p-2 rounded border">
                      {result.documentValue}
                    </p>
                  </div>
                </div>

                {result.suggestion && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>AI Suggestion:</strong> {result.suggestion}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {!isAnalyzing && (
        <div className="flex justify-between">
          {hasIssues && (
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" aria-label="Report Discrepancy">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report Discrepancy
            </Button>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <Button
              variant="outline"
              onClick={() => {
                onComplete({ validationResults, overallScore, requiresReview: hasIssues });
                playNotification();
              }}
              disabled={isProcessing}
              aria-label="Review Later"
            >
              Review Later
            </Button>
            <Button
              onClick={() => {
                onComplete({ validationResults, overallScore, requiresReview: hasIssues });
                if (hasIssues) {
                  playError();
                } else {
                  playSuccess();
                }
              }}
              disabled={isProcessing}
              aria-label="Complete Validation"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Validation'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIValidation;