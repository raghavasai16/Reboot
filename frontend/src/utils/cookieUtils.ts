// Cookie utility functions for managing candidate data

export const setCandidateCookie = (candidate: any) => {
  try {
    const candidateData = JSON.stringify(candidate);
    document.cookie = `selectedCandidate=${encodeURIComponent(candidateData)}; path=/; max-age=3600`; // 1 hour expiry
    console.log('Candidate data stored in cookie:', candidate);
  } catch (error) {
    console.error('Error setting candidate cookie:', error);
  }
};

export const getCandidateCookie = (): any => {
  try {
    const cookies = document.cookie.split(';');
    const candidateCookie = cookies.find(cookie => cookie.trim().startsWith('selectedCandidate='));
    
    if (candidateCookie) {
      const candidateData = decodeURIComponent(candidateCookie.split('=')[1]);
      const candidate = JSON.parse(candidateData);
      console.log('Candidate data retrieved from cookie:', candidate);
      return candidate;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting candidate cookie:', error);
    return null;
  }
};

export const clearCandidateCookie = () => {
  try {
    document.cookie = 'selectedCandidate=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('Candidate cookie cleared');
  } catch (error) {
    console.error('Error clearing candidate cookie:', error);
  }
};

export const setCandidateEmailCookie = (email: string) => {
  try {
    document.cookie = `selectedCandidateEmail=${encodeURIComponent(email)}; path=/; max-age=3600`; // 1 hour expiry
    console.log('Candidate email stored in cookie:', email);
  } catch (error) {
    console.error('Error setting candidate email cookie:', error);
  }
};

export const getCandidateEmailCookie = (): string | null => {
  try {
    const cookies = document.cookie.split(';');
    const emailCookie = cookies.find(cookie => cookie.trim().startsWith('selectedCandidateEmail='));
    
    if (emailCookie) {
      const email = decodeURIComponent(emailCookie.split('=')[1]);
      console.log('Candidate email retrieved from cookie:', email);
      return email;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting candidate email cookie:', error);
    return null;
  }
};

export const clearCandidateEmailCookie = () => {
  try {
    document.cookie = 'selectedCandidateEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('Candidate email cookie cleared');
  } catch (error) {
    console.error('Error clearing candidate email cookie:', error);
  }
}; 