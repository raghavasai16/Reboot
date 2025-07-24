import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, DollarSign, User, CheckCircle, Loader2, Mail } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { playSuccess, playError } from '../utils/audioFeedback';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

interface HRReviewProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

const HRReview: React.FC<HRReviewProps> = ({ onComplete, isProcessing }) => {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState({
    fixedCTC: '',
    joiningDate: '',
    hrNotes: '',
    approved: false
  });
  const [emailSent, setEmailSent] = useState(false);

  const isHR = user?.role === 'hr';

  const handleInputChange = (field: string, value: string | boolean) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompleteStep = async () => {
    if (!isHR) return;
    
    if (!reviewData.fixedCTC || !reviewData.joiningDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Simulate sending email
    setEmailSent(true);
    
    // Simulate email delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get candidate information from window or use default
    const selectedCandidate = (window as any).selectedCandidate;
    const candidateName = selectedCandidate?.name || 'Candidate Name';
    const candidatePosition = selectedCandidate?.position || 'Software Engineer';
    const candidateDepartment = selectedCandidate?.department || 'Engineering';
    
    onComplete({
      fixedCTC: reviewData.fixedCTC,
      joiningDate: reviewData.joiningDate,
      hrNotes: reviewData.hrNotes,
      approved: reviewData.approved,
      candidateName,
      candidatePosition,
      candidateDepartment,
      reviewedBy: user?.name,
      reviewedAt: new Date().toISOString(),
      emailSent: true
    });
  };

  if (!isHR) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            HR Review in Progress
          </h2>
          <p className="text-gray-600">
            Your application is currently being reviewed by our HR team. You will be notified once the review is complete.
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for HR Review</h3>
            <p className="text-gray-600 mb-4">
              Our HR team is reviewing your documents and will contact you soon with the next steps.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next:</strong><br />
                • HR will review your documents and profile<br />
                • Salary and joining date will be finalized<br />
                • You'll receive an email with the details
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          HR Review & Approval
        </h2>
        <p className="text-gray-600">
          Review candidate details and finalize compensation and joining date
        </p>
        <button
          type="button"
          onClick={() => readSelectedTextOr('HR Review and Approval. Review candidate details and finalize compensation and joining date. Candidate Review. Fixed CTC. Joining Date. HR Notes. Approval.')}
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Review</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fixed CTC */}
          <div>
            <label htmlFor="fixedCTC" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Fixed CTC (Annual) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <input
                id="fixedCTC"
                type="number"
                value={reviewData.fixedCTC}
                onChange={(e) => handleInputChange('fixedCTC', e.target.value)}
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="1200000"
                required
                aria-required="true"
                aria-label="Fixed CTC (Annual)"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Enter annual CTC in rupees</p>
          </div>

          {/* Joining Date */}
          <div>
            <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Joining Date *
            </label>
            <input
              id="joiningDate"
              type="date"
              value={reviewData.joiningDate}
              onChange={(e) => handleInputChange('joiningDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              min={new Date().toISOString().split('T')[0]}
              required
              aria-required="true"
              aria-label="Joining Date"
            />
            <p className="text-xs text-gray-500 mt-1">Select the candidate's joining date</p>
          </div>
        </div>

        {/* HR Notes */}
        <div className="mt-6">
          <label htmlFor="hrNotes" className="block text-sm font-medium text-gray-700 mb-2">
            HR Notes (Optional)
          </label>
          <textarea
            id="hrNotes"
            value={reviewData.hrNotes}
            onChange={(e) => handleInputChange('hrNotes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            rows={4}
            placeholder="Add any additional notes about the candidate or review process..."
            aria-label="HR Notes"
          />
        </div>

        {/* Approval Checkbox */}
        <div className="mt-6">
          <label htmlFor="approved" className="flex items-center space-x-3">
            <input
              id="approved"
              type="checkbox"
              checked={reviewData.approved}
              onChange={(e) => handleInputChange('approved', e.target.checked)}
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              aria-checked={reviewData.approved}
              aria-label="Approve candidate for next step"
            />
            <span className="text-sm font-medium text-gray-900">
              I approve this candidate for the next step in the onboarding process
            </span>
          </label>
        </div>

        {/* Email Status */}
        {emailSent && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Approval email sent to candidate successfully!
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="outline">
            Save Draft
          </Button>
          <Button
            onClick={() => {
              handleCompleteStep();
              if (reviewData.approved && reviewData.fixedCTC && reviewData.joiningDate) {
                playSuccess();
              } else {
                playError();
              }
            }}
            disabled={!reviewData.approved || !reviewData.fixedCTC || !reviewData.joiningDate || isProcessing}
            className="px-8"
            aria-label="Complete Review and Send Email"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Review & Send Email
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HRReview;