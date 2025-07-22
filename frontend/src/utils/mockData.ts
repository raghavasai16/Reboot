import { v4 as uuidv4 } from 'uuid';

export interface MockCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  currentStep: string;
  progress: number;
  status: 'active' | 'pending' | 'completed' | 'issues';
  avatar?: string;
  lastActivity: string;
  documentsUploaded: number;
  totalDocuments: number;
  validationScore: number;
  hrNotes?: string;
}

export const generateMockCandidate = (): MockCandidate => {
  const firstNames = ['Veera', 'Sai', 'Priyanka', 'Teja', 'Madhu'];
  const lastNames = ['Raghava', 'Gopal', 'Sahu', 'Bemberi', 'Shree'];
  const positions = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'DevOps Engineer', 'Marketing Manager', 'Sales Representative', 'HR Specialist'];
  const departments = ['Engineering', 'Product', 'Design', 'Analytics', 'Operations', 'Marketing', 'Sales', 'HR'];
  const steps = ['Login & Password Reset', 'Adaptive Forms', 'Document Upload', 'Cross Validation', 'HR Review', 'Offer Generation', 'Background Verification', 'Pre-Onboarding', 'Gamified Induction'];
  const statuses: ('active' | 'pending' | 'completed' | 'issues')[] = ['active', 'pending', 'completed', 'issues'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const progress = Math.floor(Math.random() * 100);
  const currentStep = steps[Math.floor(progress / 11)];

  return {
    id: uuidv4(),
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
    phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
    position,
    department,
    startDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentStep,
    progress,
    status,
    lastActivity: `${Math.floor(Math.random() * 24)} hours ago`,
    documentsUploaded: Math.floor(Math.random() * 6) + 1,
    totalDocuments: 6,
    validationScore: Math.floor(Math.random() * 30) + 70,
    hrNotes: status === 'issues' ? 'Requires follow-up on document validation' : 'Progressing well through onboarding'
  };
};

export const generateMockActivity = (candidateName: string, action: string) => ({
  id: uuidv4(),
  candidate: candidateName,
  action,
  time: 'Just now',
  type: 'info' as const
});

export const generateMockDocument = (name: string) => ({
  id: uuidv4(),
  name,
  type: 'application/pdf',
  size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
  status: 'completed' as const,
  extractedData: {
    fullName: 'Veera Raghava',
    dateOfBirth: '1990-01-15',
    address: '123 Main St, City, State 12345',
    idNumber: `ID${Math.floor(Math.random() * 1000000000)}`,
    expiryDate: '2025-01-15',
  },
  confidence: Math.floor(Math.random() * 20) + 80
});

export const mockDocumentNames = [
  'passport.pdf',
  'drivers_license.pdf',
  'social_security_card.pdf',
  'birth_certificate.pdf',
  'degree_certificate.pdf',
  'experience_letter.pdf',
  'address_proof.pdf',
  'bank_statement.pdf'
];

export const generateReportData = (type: string, generatedBy: string) => {
  const baseData = {
    title: getReportTitle(type),
    generatedBy,
    generatedAt: new Date(),
    type: type as any
  };

  switch (type) {
    case 'onboarding-summary':
      return {
        ...baseData,
        data: {
          totalCandidates: 45,
          completed: 32,
          inProgress: 8,
          pending: 5,
          recentActivities: [
            { candidate: 'Veera Raghava', action: 'Completed document upload', time: '2 hours ago' },
            { candidate: 'Sai Gopal', action: 'Started BGV process', time: '4 hours ago' },
            { candidate: 'Teja Bemberi', action: 'Signed offer letter', time: '1 day ago' },
            { candidate: 'Priyanka Sahu', action: 'Completed adaptive forms', time: '1 day ago' }
          ]
        }
      };
    case 'department-analytics':
      return {
        ...baseData,
        data: {
          departments: [
            { name: 'Engineering', completed: 28, total: 35, percentage: 80 },
            { name: 'Product', completed: 15, total: 18, percentage: 83 },
            { name: 'Design', completed: 12, total: 15, percentage: 80 },
            { name: 'Sales', completed: 22, total: 25, percentage: 88 }
          ]
        }
      };
    case 'time-analysis':
      return {
        ...baseData,
        data: {
          steps: [
            { name: 'Document Upload', averageTime: 2.3 },
            { name: 'AI Validation', averageTime: 0.5 },
            { name: 'HR Review', averageTime: 1.8 },
            { name: 'BGV Process', averageTime: 5.2 },
            { name: 'Offer Generation', averageTime: 1.2 }
          ]
        }
      };
    case 'document-compliance':
      return {
        ...baseData,
        data: {
          totalDocuments: 1250,
          successRate: 94,
          averageConfidence: 87
        }
      };
    case 'bgv-status':
      return {
        ...baseData,
        data: {
          bgvStatus: [
            { status: 'Completed', count: 32 },
            { status: 'In Progress', count: 8 },
            { status: 'Pending', count: 5 },
            { status: 'Issues', count: 2 }
          ]
        }
      };
    case 'gamification-metrics':
      return {
        ...baseData,
        data: {
          averageEngagement: 85,
          completionRate: 92,
          topPerformers: ['Veera Raghava', 'Sai Gopal', 'Teja Bemberi']
        }
      };
    default:
      return {
        ...baseData,
        data: {
          message: 'No specific data available for this report type'
        }
      };
  }
};

const getReportTitle = (type: string): string => {
  const titles: Record<string, string> = {
    'onboarding-summary': 'Onboarding Summary Report',
    'department-analytics': 'Department Analytics Report',
    'time-analysis': 'Time Analysis Report',
    'document-compliance': 'Document Compliance Report',
    'bgv-status': 'BGV Status Report',
    'gamification-metrics': 'Gamification Metrics Report'
  };
  return titles[type] || 'Report';
};