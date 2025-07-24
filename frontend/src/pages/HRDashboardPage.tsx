import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { generatePDFReport } from '../utils/pdfGenerator';
import { generateMockCandidate, generateMockActivity, generateReportData, MockCandidate } from '../utils/mockData';
import { apiService, CandidateRequest, fetchCandidates } from '../utils/api';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  FileText,
  Award,
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  ChevronRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

const HRDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const { setSelectedCandidateId } = useOnboarding();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<MockCandidate | null>(null);
  const [candidates, setCandidates] = useState<MockCandidate[]>([]);
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, candidate: 'Veera Raghava', action: 'Uploaded identity documents', time: '2 hours ago', type: 'upload' },
    { id: 2, candidate: 'Sai Gopal', action: 'Completed adaptive forms', time: '4 hours ago', type: 'form' },
    { id: 3, candidate: 'Priyanka Sahu', action: 'Document validation failed', time: '5 hours ago', type: 'error' },
    { id: 4, candidate: 'Teja Bemberi', action: 'Signed offer letter', time: '1 day ago', type: 'signature' },
  ]);
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [isAddingCandidate, setIsAddingCandidate] = useState(false);
  const [newCandidateForm, setNewCandidateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    startDate: ''
  });

  // Check backend status on component mount
  React.useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await apiService.healthCheck();
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackendStatus();
  }, []);

  // Fetch candidates from backend on mount
  const loadCandidates = async () => {
    try {
      const backendCandidates = await fetchCandidates();
      // Sort by lastActivity (or createdAt if available) descending
      backendCandidates.sort((a: any, b: any) => {
        const aDate = a.lastActivity ? new Date(a.lastActivity) : new Date(0);
        const bDate = b.lastActivity ? new Date(b.lastActivity) : new Date(0);
        return bDate.getTime() - aDate.getTime();
      });
      setCandidates(
        backendCandidates.map((c: any) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
          email: c.email,
          position: c.position,
          department: c.department,
          startDate: c.startDate,
          status: c.status,
          lastActivity: c.lastActivity ? new Date(c.lastActivity).toLocaleString() : 'N/A',
          progress: c.progress || 0, // Ensure progress is present
          currentStep: c.currentStep || 'N/A',
          validationScore: c.validationScore || 0,
          documentsUploaded: c.documentsUploaded || 0,
          totalDocuments: c.totalDocuments || 0,
          hrNotes: c.hrNotes || '',
          phone: c.phone || '',
          // You can map other fields as needed
        }))
      );
    } catch (e) {
      // Optionally show a notification or fallback
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  // Action handlers
  const handleAddCandidate = async () => {
    if (newCandidateForm.firstName && newCandidateForm.email) {
      setIsAddingCandidate(true);
      
      try {
        console.log('Starting to add candidate...');
        
        // Prepare candidate data for API
        const candidateData: CandidateRequest = {
          firstName: newCandidateForm.firstName,
          lastName: newCandidateForm.lastName,
          email: newCandidateForm.email,
          position: newCandidateForm.position || 'Software Engineer',
          department: newCandidateForm.department || 'Engineering',
          startDate: newCandidateForm.startDate || new Date().toISOString().split('T')[0]
        };

        console.log('Calling backend API...');
        
        // Call backend API to add candidate and send email
        const response = await apiService.addCandidate(candidateData);

        console.log('Backend response received:', response);

        if (response.success) {
          // Create new candidate for local state
          const newCandidate = generateMockCandidate();
          const firstName = newCandidateForm.firstName || newCandidate.name.split(' ')[0];
          const lastName = newCandidateForm.lastName || newCandidate.name.split(' ')[1] || '';
          newCandidate.name = `${firstName} ${lastName}`.trim();
          newCandidate.email = newCandidateForm.email;
          newCandidate.position = newCandidateForm.position || 'Software Engineer';
          newCandidate.department = newCandidateForm.department || 'Engineering';
          newCandidate.startDate = newCandidateForm.startDate || new Date().toISOString().split('T')[0];
          newCandidate.phone = `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
          newCandidate.status = 'active'; // Ensure new candidate is counted as active
          setCandidates(prev => [newCandidate, ...prev]);
          
          const activity = generateMockActivity(newCandidate.name, 'Added to onboarding pipeline');
          setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
          
          addNotification({
            type: 'success',
            title: 'Candidate Added Successfully!',
            message: `${response.message} Email sent to ${newCandidateForm.email}`,
          });
          
          setShowAddCandidateForm(false);
          setNewCandidateForm({
            firstName: '',
            lastName: '',
            email: '',
            position: '',
            department: '',
            startDate: ''
          });
        } else {
          addNotification({
            type: 'error',
            title: 'Failed to Add Candidate',
            message: response.message || 'An error occurred while adding the candidate.',
          });
        }
      } catch (error) {
        console.error('Error adding candidate:', error);
        
        // Fallback: Add candidate locally without backend
        const newCandidate = generateMockCandidate();
        const firstName = newCandidateForm.firstName || newCandidate.name.split(' ')[0];
        const lastName = newCandidateForm.lastName || newCandidate.name.split(' ')[1] || '';
        newCandidate.name = `${firstName} ${lastName}`.trim();
        newCandidate.email = newCandidateForm.email;
        newCandidate.position = newCandidateForm.position || 'Software Engineer';
        newCandidate.department = newCandidateForm.department || 'Engineering';
        newCandidate.startDate = newCandidateForm.startDate || new Date().toISOString().split('T')[0];
        newCandidate.phone = `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        newCandidate.status = 'active'; // Ensure new candidate is counted as active
        
        setCandidates(prev => [newCandidate, ...prev]);
        
        const activity = generateMockActivity(newCandidate.name, 'Added to onboarding pipeline (offline mode)');
        setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
        
        let errorMessage = 'Failed to connect to backend server. Please ensure the backend is running on port 8080.';
        
        if (error instanceof Error) {
          if (error.message.includes('timed out')) {
            errorMessage = 'Request timed out. Backend server may not be running. Please start the backend server.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to backend server. Please check if the backend is running on http://localhost:8080';
          } else {
            errorMessage = error.message;
          }
        }
        
        addNotification({
          type: 'warning',
          title: 'Backend Unavailable - Offline Mode',
          message: `Candidate added locally. ${errorMessage} Email functionality disabled.`,
        });
        
        setShowAddCandidateForm(false);
        setNewCandidateForm({
          firstName: '',
          lastName: '',
          email: '',
          position: '',
          department: '',
          startDate: ''
        });
      } finally {
        setIsAddingCandidate(false);
      }
    } else {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields (First Name and Email).',
      });
    }
  };

  const handleSendBulkReminders = () => {
    const pendingCandidates = candidates.filter(c => c.status === 'pending' || c.status === 'active');
    
    addNotification({
      type: 'success',
      title: 'Bulk Reminders Sent',
      message: `Reminder emails sent to ${pendingCandidates.length} candidates.`,
    });
    
    const activity = generateMockActivity('System', `Sent bulk reminders to ${pendingCandidates.length} candidates`);
    setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
  };

  // Compute department completion rates from backend data
  const departmentStats = React.useMemo(() => {
    const stats: Record<string, { total: number; completed: number }> = {};
    candidates.forEach(c => {
      const dept = c.department || 'Other';
      if (!stats[dept]) stats[dept] = { total: 0, completed: 0 };
      stats[dept].total += 1;
      if (c.status?.toLowerCase() === 'completed') stats[dept].completed += 1;
    });
    return Object.entries(stats).map(([department, { total, completed }]) => ({
      department,
      total,
      completed
    }));
  }, [candidates]);

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Email', 'Position', 'Department', 'Progress', 'Status', 'Last Activity'].join(','),
      ...candidates.map(c => [
        c.name,
        c.email,
        c.position,
        c.department,
        `${c.progress}%`,
        c.status,
        c.lastActivity
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Data Exported',
      message: 'Candidate data has been exported to CSV file.',
    });
  };

  const handleScheduleReviews = () => {
    const pendingReviews = candidates.filter(c => c.currentStep === 'HR Review');
    
    addNotification({
      type: 'success',
      title: 'Reviews Scheduled',
      message: `Scheduled reviews for ${pendingReviews.length} candidates.`,
    });
    
    const activity = generateMockActivity('HR System', `Scheduled ${pendingReviews.length} candidate reviews`);
    setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
  };

  const handleGenerateReport = async (reportType: string) => {
    if (reportType === 'onboarding-summary') {
      // Onboarding Summary: All candidates
      const csvContent = [
        ['Name', 'Email', 'Position', 'Department', 'Status', 'Progress', 'Last Activity'].join(','),
        ...candidates.map(c => [
          c.name,
          c.email,
          c.position,
          c.department,
          c.status,
          `${c.progress}%`,
          c.lastActivity
        ].join(','))
      ].join('\n');
      downloadCSV(csvContent, 'onboarding_summary');
    } else if (reportType === 'department-analytics') {
      // Department Analytics: Grouped stats
      const stats: Record<string, { total: number; completed: number; inProgress: number; pending: number; issues: number }> = {};
      candidates.forEach(c => {
        const dept = c.department || 'Other';
        if (!stats[dept]) stats[dept] = { total: 0, completed: 0, inProgress: 0, pending: 0, issues: 0 };
        stats[dept].total += 1;
        switch ((c.status || '').toLowerCase()) {
          case 'completed': stats[dept].completed += 1; break;
          case 'in progress': stats[dept].inProgress += 1; break;
          case 'pending': stats[dept].pending += 1; break;
          case 'issues': stats[dept].issues += 1; break;
        }
      });
      const csvContent = [
        ['Department', 'Total', 'Completed', 'In Progress', 'Pending', 'Issues', 'Completion Rate (%)'].join(','),
        ...Object.entries(stats).map(([dept, s]) => [
          dept,
          s.total,
          s.completed,
          s.inProgress,
          s.pending,
          s.issues,
          s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
        ].join(','))
      ].join('\n');
      downloadCSV(csvContent, 'department_analytics');
    }
  };

  const handleSendMessage = (candidate: MockCandidate) => {
    addNotification({
      type: 'success',
      title: 'Message Sent',
      message: `Message sent to ${candidate.name}.`,
    });
    
    const activity = generateMockActivity(candidate.name, 'Received message from HR');
    setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
  };

  const handleApproveStep = async (candidate: MockCandidate) => {
    const newProgress = Math.min(100, candidate.progress + 15);
    const newStatus = 'active'; // Assuming approval means active

    try {
      await apiService.updateCandidateProgress(Number(candidate.id), { progress: newProgress, status: newStatus });
      await loadCandidates(); // Reload candidates to reflect changes
      addNotification({
        type: 'success',
        title: 'Step Approved',
        message: `${candidate.name}'s current step has been approved.`,
      });
      
      const activity = generateMockActivity(candidate.name, 'Step approved by HR');
      setRecentActivities(prev => [{ ...activity, id: Date.now() }, ...prev.slice(0, 9)]);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to Approve Step',
        message: 'There was an error a  pproving the step. Please try again.',
      });
      console.error('Error approving step:', error);
    }
  };

  // Compute stats from backend candidates
  const activeCount = candidates.filter(c => c.status?.toLowerCase() === 'in progress').length;
  const completedCount = candidates.filter(c => c.status?.toLowerCase() === 'completed').length;
  const pendingCount = candidates.filter(c => c.status?.toLowerCase() === 'pending').length;
  const issuesCount = candidates.filter(c => c.status?.toLowerCase() === 'issues').length;

  const stats = [
    {
      label: 'Active Candidates',
      value: activeCount,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+12%',
      changeType: 'positive'
    },
    {
      label: 'Completed This Week',
      value: completedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: '+8%',
      changeType: 'positive'
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      change: '-5%',
      changeType: 'negative'
    },
    {
      label: 'Issues Requiring Attention',
      value: issuesCount,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      change: '+2%',
      changeType: 'positive'
    },
  ];

  // Update getStatusColor for new color scheme
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-red-100 text-red-800';
      case 'issues':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 90) return 'bg-yellow-500';
    if (progress < 40) return 'bg-red-500';
    return 'bg-blue-500';
  };

  // In filter logic, make status comparison case-insensitive
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || candidate.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'error' ? 'bg-red-500' :
                    activity.type === 'signature' ? 'bg-green-500' :
                    activity.type === 'upload' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.candidate}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowAddCandidateForm(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Add New Candidate
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleSendBulkReminders}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Bulk Reminders
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExportData}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleScheduleReviews}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Reviews
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="issues">Issues</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Candidates List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.position}</div>
                    <div className="text-sm text-gray-500">{candidate.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 mr-2">
                        <ProgressBar progress={candidate.progress} className={getProgressColor(candidate.progress)} />
                      </div>
                      <span className="text-sm text-gray-600">{candidate.progress}%</span>
                    </div>
                    {/* Remove N/A or render only if you have a value to show */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidate.lastActivity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          // Set the selected candidate in window object for onboarding flow
                          (window as any).selectedCandidate = candidate;
                          (window as any).selectedCandidateEmail = candidate.email;
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => handleSendMessage(candidate)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => {
                          setSelectedCandidateId(Number(candidate.id));
                          localStorage.setItem('selectedCandidateId', candidate.id.toString());
                          navigate('/onboarding');
                        }}
                        title="Start Onboarding"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Onboarding Completion Rate</h3>
          <div className="space-y-4">
            {departmentStats.map(({ department, completed, total }) => {
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={department}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{department}</span>
                    <span className="font-semibold text-blue-700">{completed}/{total} Completed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Time by Step</h3>
          <div className="space-y-4">
            {[
              { step: 'Document Upload', time: '2.3 days', color: 'bg-blue-500' },
              { step: 'AI Validation', time: '0.5 days', color: 'bg-green-500' },
              { step: 'HR Review', time: '1.8 days', color: 'bg-yellow-500' },
              { step: 'BGV Process', time: '5.2 days', color: 'bg-red-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm text-gray-900">{item.step}</span>
                </div>
                <span className="text-sm text-gray-600">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Onboarding Summary', description: 'Complete overview of all candidates', icon: FileText },
            { title: 'Department Analytics', description: 'Performance by department', icon: BarChart3 },
            { title: 'Time Analysis', description: 'Time spent in each step', icon: Clock },
            { title: 'Document Compliance', description: 'Document validation reports', icon: CheckCircle },
            { title: 'BGV Status Report', description: 'Background verification tracking', icon: UserCheck },
            { title: 'Gamification Metrics', description: 'Engagement and completion rates', icon: Award },
          ].map((report, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <report.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{report.description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleGenerateReport(getReportType(report.title))}
              >
                <Download className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );

  const getReportType = (title: string): string => {
    const typeMap: Record<string, string> = {
      'Onboarding Summary': 'onboarding-summary',
      'Department Analytics': 'department-analytics',
      'Time Analysis': 'time-analysis',
      'Document Compliance': 'document-compliance',
      'BGV Status Report': 'bgv-status',
      'Gamification Metrics': 'gamification-metrics'
    };
    return typeMap[title] || 'onboarding-summary';
  };

  function downloadCSV(csvContent: string, baseName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    addNotification({
      type: 'success',
      title: 'Report Generated',
      message: `The ${baseName.replace('_', ' ')} report has been downloaded.`,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                HR Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and monitor candidate onboarding progress
              </p>
              <div className="flex items-center mt-2 mb-4">
                <button
                  type="button"
                  onClick={() => readSelectedTextOr('HR Dashboard. Manage and monitor candidate onboarding progress. Use the tabs below to view overview, candidates, analytics, and reports.')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  aria-label="Read this page aloud"
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
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  backendStatus === 'connected' ? 'bg-green-500' : 
                  backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className={`text-sm ${
                  backendStatus === 'connected' ? 'text-green-600' : 
                  backendStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  Backend: {backendStatus === 'connected' ? 'Connected' : 
                           backendStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={() => setShowAddCandidateForm(true)}>
                <Users className="w-4 h-4 mr-2" />
                Add Candidate
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'candidates' && renderCandidates()}
        {selectedTab === 'analytics' && renderAnalytics()}
        {selectedTab === 'reports' && renderReports()}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedCandidate.name} - Onboarding Details
                  </h2>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Candidate Info */}
                  <div className="lg:col-span-1">
                    <Card className="p-4">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-xl font-medium text-gray-600">
                            {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{selectedCandidate.name}</h3>
                        <p className="text-sm text-gray-600">{selectedCandidate.position}</p>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCandidate.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{selectedCandidate.department}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Start: {selectedCandidate.startDate}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Progress Details */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Progress Overview</h4>
                        <div className="flex items-center mb-2">
                          <div className="flex-1 mr-4">
                            <ProgressBar progress={selectedCandidate.progress} />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedCandidate.progress}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Current Step: {selectedCandidate.currentStep}
                        </p>
                      </Card>

                      <Card className="p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Document Status</h4>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Documents Uploaded</span>
                          <span className="text-sm font-medium text-gray-900">
                            {selectedCandidate.documentsUploaded}/{selectedCandidate.totalDocuments}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Validation Score</span>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {selectedCandidate.validationScore}%
                            </span>
                          </div>
                        </div>
                      </Card>

                      {selectedCandidate.hrNotes && (
                        <Card className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">HR Notes</h4>
                          <p className="text-sm text-gray-600">{selectedCandidate.hrNotes}</p>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => handleSendMessage(selectedCandidate)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedCandidateId(Number(selectedCandidate.id));
                      localStorage.setItem('selectedCandidateId', selectedCandidate.id.toString());
                      navigate('/onboarding');
                    }}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Start Onboarding
                  </Button>
                  <Button onClick={() => handleApproveStep(selectedCandidate)}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve Step
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Candidate Modal */}
        {showAddCandidateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Candidate</h2>
                  <button
                    onClick={() => setShowAddCandidateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={newCandidateForm.firstName}
                        onChange={(e) => setNewCandidateForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={newCandidateForm.lastName}
                        onChange={(e) => setNewCandidateForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newCandidateForm.email}
                      onChange={(e) => setNewCandidateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="abcd@gmail.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      value={newCandidateForm.position}
                      onChange={(e) => setNewCandidateForm(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Position</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="UX Designer">UX Designer</option>
                      <option value="Data Scientist">Data Scientist</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                      <option value="Marketing Manager">Marketing Manager</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={newCandidateForm.department}
                      onChange={(e) => setNewCandidateForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Operations">Operations</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newCandidateForm.startDate}
                      onChange={(e) => setNewCandidateForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAddCandidateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddCandidate}
                    disabled={!newCandidateForm.firstName || !newCandidateForm.email || isAddingCandidate}
                  >
                    {isAddingCandidate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Candidate...
                      </>
                    ) : (
                      'Add Candidate'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboardPage;