const API_BASE_URL = 'http://localhost:8080/api';

export interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  startDate: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  candidateName?: string;
  email?: string;
  position?: string;
  department?: string;
}

export interface DocumentUploadResponse {
  id: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  documentType: string;
  status: string;
  errorMessage?: string;
  downloadUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  extractedFields?: any[];
}

// Helper function to create fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const apiService = {
  async addCandidate(candidateData: CandidateRequest): Promise<ApiResponse> {
    try {
      console.log('Sending candidate data to backend:', candidateData);
      
      const response = await fetchWithTimeout(`${API_BASE_URL}/candidates/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidateData),
      }, 15000); // 15 second timeout

      console.log('Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Backend error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Backend success response:', result);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Backend server may not be running.');
      }
      throw error;
    }
  },

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      console.log('Checking backend health...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/candidates/health`, {
        method: 'GET',
      }, 5000); // 5 second timeout for health check
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Health check result:', result);
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  async sendOnboardingEmail(email: string, name: string): Promise<any> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/onboarding/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error sending onboarding email response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Onboarding email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending onboarding email:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out for onboarding email.');
      }
      throw error;
    }
  },

  async sendStepCompletionEmail(email: string, step: string): Promise<any> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/onboarding/step-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, step }),
      }, 10000); // 10 second timeout

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error sending step completion email response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Step completion email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending step completion email:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out for step completion email.');
      }
      throw error;
    }
  },

  async updateOnboardingStep(email: string, stepId: string, status: string, data?: any): Promise<any> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/onboarding/${email}/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stepId, status, data }),
      }, 10000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating onboarding step:', error);
      throw error;
    }
  },

  async updateCandidateProgress(id: number, data: { progress?: number; status?: string }) {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/candidates/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }, 10000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating candidate progress:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out for candidate progress update.');
      }
      throw error;
    }
  }
};

export const fetchCandidates = async () => {
  const response = await fetch('http://localhost:8080/api/candidates');
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
};

export const updateCandidateProgress = async (id: number, data: { progress?: number; status?: string }) => {
  const response = await fetch(`${API_BASE_URL}/candidates/${id}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update candidate progress');
  return response.json();
}; 

export const fetchOnboardingStepsById = async (candidateId: number) => {
  const response = await fetch(`${API_BASE_URL}/onboarding/by-id/${candidateId}`);
  if (!response.ok) throw new Error('Failed to fetch onboarding steps');
  return response.json();
};

export const updateOnboardingStepById = async (candidateId: number, stepId: string, status: string, data?: any) => {
  const response = await fetch(`${API_BASE_URL}/onboarding/${candidateId}/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stepId, status, data }),
  });
  if (!response.ok) throw new Error('Failed to update onboarding step');
  return response.json();
}; 

// Notification API integration
export const fetchNotifications = async (userEmail: string) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${encodeURIComponent(userEmail)}`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

export const createNotification = async (notification: {
  userEmail: string;
  type: string;
  title: string;
  message: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notification),
  });
  if (!response.ok) throw new Error('Failed to create notification');
  return response.json();
};

export const markNotificationAsRead = async (id: string | number) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
}; 

export async function uploadDocumentToOCR(file: File, documentType?: string): Promise<DocumentUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType) formData.append('documentType', documentType);

  const response = await fetch('http://localhost:5000/api/documents/upload', {
    method: 'POST',
    body: formData,
    // Add credentials or auth headers if needed
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
} 

export async function uploadDocumentToBackend(file: File, candidateId: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('candidateId', candidateId.toString());

  const response = await fetch('http://localhost:8080/api/documents/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload document');
  }
  return response.json();
} 