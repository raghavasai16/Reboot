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
  }
}; 