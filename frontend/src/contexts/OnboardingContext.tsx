import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';
import { generateMockActivity, generateMockDocument, mockDocumentNames } from '../utils/mockData';
import { 
    apiService,
    fetchOnboardingStepsById,
    updateOnboardingStepById,
    createNotification,
    fetchCandidates
} from '../utils/api';
import { Notification } from './NotificationContext';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  data?: any;
}

interface OnboardingContextType {
  currentStep: number;
  steps: OnboardingStep[];
  updateStepStatus: (stepId: string, newStatus: OnboardingStep['status'], stepData?: any, candidateEmailOverride?: string) => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  resetOnboarding: () => void;
  simulateStepCompletion: (stepId: string) => void;
  simulateDocumentUpload: () => void;
  selectedCandidateId: number | null;
  setSelectedCandidateId: (id: number | null) => void;
  fetchSteps: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

const initialSteps: OnboardingStep[] = [
  {
    id: 'login',
    title: 'Login & Password Reset',
    description: 'Secure login with tokenized email authentication',
    status: 'completed',
  },
  {
    id: 'forms',
    title: 'Adaptive Forms',
    description: 'AI-powered form completion with real-time validation',
    status: 'in-progress',
  },
  {
    id: 'documents',
    title: 'Document Upload',
    description: 'OCR extraction and AI validation of documents',
    status: 'pending',
  },
  {
    id: 'verification',
    title: 'Cross Validation',
    description: 'AI-powered document verification and mismatch detection',
    status: 'pending',
  },
  {
    id: 'hr-review',
    title: 'HR Review',
    description: 'HR discussion and salary/joining date confirmation',
    status: 'pending',
  },
  {
    id: 'offer',
    title: 'Offer Generation',
    description: 'Automated offer letter generation and e-signature',
    status: 'pending',
  },
  {
    id: 'bgv',
    title: 'Background Verification',
    description: 'Third-party BGV integration and dashboard tracking',
    status: 'pending',
  },
  {
    id: 'pre-onboarding',
    title: 'Pre-Onboarding',
    description: 'Smart forms with LLM suggestions and payroll integration',
    status: 'pending',
  },
  {
    id: 'gamification',
    title: 'Gamified Induction',
    description: 'Interactive onboarding with mentorship and feedback',
    status: 'pending',
  },
];

// Helper function to parse backend data
const parseBackendData = (data: any): any => {
  if (typeof data !== 'string') {
    return data;
  }

  try {
    // First try to parse as JSON
    if (data.trim().startsWith('{')) {
      return JSON.parse(data);
    }
    
    // Handle object-like strings like "{key=value, key2=value2}"
    // Convert "{firstName=james, lastName=wames}" to proper JSON
    let cleanData = data;
    
    // Step 1: Replace = with :
    cleanData = cleanData.replace(/=/g, ':');
    
    // Step 2: Add quotes around keys
    cleanData = cleanData.replace(/(\w+):/g, '"$1":');
    
    // Step 3: Add quotes around all values (simpler approach)
    cleanData = cleanData.replace(/:\s*([^,}]+)\s*([,}])/g, ':"$1"$2');
    cleanData = cleanData.replace(/:\s*([^,}]+)\s*$/g, ':"$1"');
    
    // Step 4: Remove quotes from numbers and booleans
    cleanData = cleanData.replace(/:\s*"(\d+)"\s*([,}])/g, ':$1$2');
    cleanData = cleanData.replace(/:\s*"(\d+)"\s*$/g, ':$1');
    cleanData = cleanData.replace(/:\s*"(true|false)"\s*([,}])/g, ':$1$2');
    cleanData = cleanData.replace(/:\s*"(true|false)"\s*$/g, ':$1');
    
    // Step 5: Remove trailing commas
    cleanData = cleanData.replace(/,\s*}/g, '}');
    
    console.log('Original data:', data);
    console.log('Parsed data:', cleanData);
    
    // Test the parsing with the specific format from the user
    if (data.includes('firstName=james')) {
      console.log('Testing specific format parsing...');
      const testResult = JSON.parse(cleanData);
      console.log('Test result:', testResult);
    }
    
    return JSON.parse(cleanData);
  } catch (e) {
    console.warn('Failed to parse backend data:', data);
    console.warn('Parse error:', e);
    return data;
  }
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps);
  const { addNotification } = useNotifications();
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);

  // On mount, load selectedCandidateId from localStorage if present and keep in sync
  useEffect(() => {
    const storedId = localStorage.getItem('selectedCandidateId');
    if (storedId && !isNaN(Number(storedId))) {
      setSelectedCandidateId(Number(storedId));
      console.log('Loaded selectedCandidateId from localStorage:', storedId);
    } else {
      setSelectedCandidateId(null);
      console.log('No valid selectedCandidateId in localStorage');
    }
  }, []);

  // Helper to get the correct candidate ID for all API calls
  const getCandidateId = () => {
    if (user?.role === 'hr') {
      console.log('selectedCandidateId (state):', selectedCandidateId, typeof selectedCandidateId);
      if (selectedCandidateId && !isNaN(Number(selectedCandidateId))) {
        return Number(selectedCandidateId);
      }
      console.error('HR must select a candidate. selectedCandidateId:', selectedCandidateId);
      return undefined;
    }
    if (user?.role === 'candidate') {
      if (user.id && !isNaN(Number(user.id))) {
        return Number(user.id);
      }
      console.error('Candidate user.id is invalid:', user?.id);
      return undefined;
    }
    console.error('Invalid user role or missing candidate ID:', user?.role, user?.id, selectedCandidateId);
    return undefined;
  };

  // Fetch onboarding steps from backend
  const fetchSteps = useCallback(async () => {
    const id = getCandidateId();
    if (!id) {
      // Do not fetch if no valid candidate ID
      return;
    }
    try {
      const backendSteps = await fetchOnboardingStepsById(id);
      setSteps(prev => prev.map(step => {
        const backendStep = backendSteps.find((s: any) => s.stepId === step.id);
        if (backendStep) {
          const parsedData = parseBackendData(backendStep.data);
          return { ...step, status: backendStep.status, data: parsedData };
        }
        return step;
      }));
      // Find the first incomplete step
      const mappedStatuses = initialSteps.map(step => {
        const backendStep = backendSteps.find((s: any) => s.stepId === step.id);
        return backendStep ? backendStep.status : step.status;
      });
      const firstIncomplete = mappedStatuses.findIndex(status => status !== 'completed');
      setCurrentStep(firstIncomplete === -1 ? steps.length - 1 : firstIncomplete);
    } catch (e) {
      // fallback to initialSteps
    }
  }, [selectedCandidateId, user]);

  // Fetch onboarding steps on mount or when user changes
  useEffect(() => {
    const id = getCandidateId();
    if (!id) return;
    fetchSteps();
  }, [user, selectedCandidateId, fetchSteps]);

  // Listen for login/logout or user role changes in other tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'authToken' || event.key === 'userRole') {
        fetchSteps();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, fetchSteps]);

  const updateStepStatus = useCallback(async (stepId: string, newStatus: OnboardingStep['status'], stepData?: any, candidateEmailOverride?: string) => {
    const id = getCandidateId();
    if (!id) {
      console.error("No email found for updating step status.");
      return;
    }

    try {
      await updateOnboardingStepById(id, stepId, newStatus, stepData);
      // Re-fetch steps from backend to get the latest status
      await fetchSteps();
      // Fetch updated candidate progress and update UI if needed
      try {
        const candidates = await fetchCandidates();
        const updated = candidates.find((c: any) => c.id === id);
        if (updated && typeof updated.progress === 'number') {
          // Optionally, update local state or context with new progress
          // (If you have a candidate context or state, update it here)
          // For now, just log for verification
          console.log('Updated candidate progress:', updated.progress);
        }
      } catch (e) {
        // Ignore errors, fallback to existing UI
      }
      if (newStatus === 'completed') {
        try {
          await apiService.sendStepCompletionEmail(String(id), stepId);
        } catch (emailError) {
          console.error('Failed to send step completion email:', emailError);
        }
      }
    } catch (error) {
      console.error('Failed to update step status:', error);
    }
  }, [selectedCandidateId, user, fetchSteps]);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const resetOnboarding = useCallback(() => {
    setCurrentStep(1);
    setSteps(initialSteps);
  }, []);

  const simulateStepCompletion = useCallback(async (stepId: string) => {
    updateStepStatus(stepId, 'completed');
    // Add realistic activity
    const stepTitle = steps.find(s => s.id === stepId)?.title || 'Step';
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'success',
      title: 'Step Completed',
      message: `${stepTitle} has been completed successfully.`,
    };
    await addNotification(notification);
  }, [steps, updateStepStatus, addNotification]);

  const simulateDocumentUpload = useCallback(async () => {
    const randomDoc = mockDocumentNames[Math.floor(Math.random() * mockDocumentNames.length)];
    const mockDoc = generateMockDocument(randomDoc);
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      type: 'success',
      title: 'Document Uploaded',
      message: `${mockDoc.name} has been uploaded and processed successfully.`,
    };
    await addNotification(notification);
  }, [addNotification]);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      steps,
      updateStepStatus,
      nextStep,
      previousStep,
      resetOnboarding,
      simulateStepCompletion,
      simulateDocumentUpload,
      selectedCandidateId,
      setSelectedCandidateId,
      fetchSteps,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};