import React, { useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  Brain, 
  FileText,
  User,
  Award,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import Button from './Button';
import Card from './Card';
import ProgressBar from './ProgressBar';
import AdaptiveForm from './AdaptiveForm';
import DocumentUpload from './DocumentUpload';
import AIValidation from './AIValidation';
import HRReview from './HRReview';
import OfferGeneration from './OfferGeneration';
import BGVVerification from './BGVVerification';
import SmartForms from './SmartForms';
import GamifiedInduction from './GamifiedInduction';

declare global {
  interface Window {
    selectedCandidateEmail?: string;
    selectedCandidate?: any; // Added for HR actions
  }
}

const OnboardingFlow: React.FC = () => {
  const { currentStep, steps, nextStep, previousStep, updateStepStatus, simulateStepCompletion } = useOnboarding();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentStepData = steps[currentStep];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const handleStepComplete = async (stepId: string, data?: any) => {
    setIsProcessing(true);
    // Only 'verification' and 'hr-review' are HR-only
    const hrOnlySteps = ['verification', 'hr-review'];
    const isCandidate = user?.role === 'candidate';
    const isHrOnlyStep = hrOnlySteps.includes(stepId);
    // For HR, use selectedCandidate.email if available
    let candidateEmail = user?.email;
    if (user?.role === 'hr' && window.selectedCandidateEmail) {
      candidateEmail = window.selectedCandidateEmail;
    }
    if (isCandidate && isHrOnlyStep) {
      setIsProcessing(false);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    updateStepStatus(stepId, 'completed', data, candidateEmail);
    addNotification({
      type: 'success',
      title: 'Step Completed!',
      message: `${currentStepData.title} has been completed successfully.`,
    });
    nextStep();
    setIsProcessing(false);
  };

  const renderStepContent = () => {
    // Only 'verification' and 'hr-review' are HR-only
    const hrOnlySteps = ['verification', 'hr-review'];
    const isCandidate = user?.role === 'candidate';
    const isHrOnlyStep = hrOnlySteps.includes(currentStepData.id);
    switch (currentStepData.id) {
      case 'forms':
        return (
          <AdaptiveForm
            onComplete={(data) => handleStepComplete('forms', data)}
            isProcessing={isProcessing}
          />
        );
      case 'documents':
        return (
          <DocumentUpload
            onComplete={(data) => handleStepComplete('documents', data)}
            isProcessing={isProcessing}
          />
        );
      case 'verification':
        return (
          <AIValidation
            onComplete={(data) => handleStepComplete('verification', data)}
            isProcessing={isProcessing}
          />
        );
      case 'hr-review':
        return (
          <HRReview
            onComplete={(data) => handleStepComplete('hr-review', data)}
            isProcessing={isProcessing}
          />
        );
      case 'offer':
        const hrReviewData = steps.find(s => s.id === 'hr-review')?.data;
        // Use window.selectedCandidate for demo; replace with real context/prop in production
        const candidate = (window as any).selectedCandidate || undefined;
        console.log('OnboardingFlow - HR Review Data:', hrReviewData);
        console.log('OnboardingFlow - Selected Candidate:', candidate);
        return (
          <OfferGeneration
            onComplete={(data) => handleStepComplete('offer', data)}
            isProcessing={isProcessing}
            hrReviewData={hrReviewData}
            candidate={candidate}
          />
        );
      case 'bgv':
        return (
          <BGVVerification
            onComplete={(data) => handleStepComplete('bgv', data)}
            isProcessing={isProcessing}
          />
        );
      case 'pre-onboarding':
        return (
          <SmartForms
            onComplete={(data) => handleStepComplete('pre-onboarding', data)}
            isProcessing={isProcessing}
          />
        );
      case 'gamification':
        return (
          <GamifiedInduction
            onComplete={(data) => handleStepComplete('gamification', data)}
            isProcessing={isProcessing}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {currentStepData.description}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => handleStepComplete(currentStepData.id)}
                disabled={isProcessing || (isCandidate && isHrOnlyStep)}
                title={isCandidate && isHrOnlyStep ? 'Only HR can complete this step' : ''}
              >
                {isProcessing ? 'Processing...' : 'Complete Step'}
              </Button>
              <div className="text-sm text-gray-500">
                <p>This step includes:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Automated processing</li>
                  <li>• AI validation</li>
                  <li>• Real-time feedback</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  const getStepIcon = (step: any, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (step.status === 'in-progress') {
      return <Clock className="w-6 h-6 text-blue-600" />;
    } else if (step.status === 'failed') {
      return <AlertCircle className="w-6 h-6 text-red-600" />;
    }
    return (
      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Onboarding Journey
          </h1>
          <p className="text-gray-600">
            Complete your onboarding process with AI-powered assistance
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-sm text-gray-500">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <ProgressBar progress={progressPercentage} className="mb-4" />
          <p className="text-sm text-gray-600">
            {Math.round(progressPercentage)}% complete
          </p>
        </Card>

        {/* Step Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {getStepIcon(step, index)}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        index === currentStep ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              {renderStepContent()}
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1 || currentStepData.status !== 'completed'}
                >
                  Skip
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1 || currentStepData.status !== 'completed'}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;