import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import { useNotifications } from '../contexts/NotificationContext';
import { generateMockDocument, mockDocumentNames } from '../utils/mockData';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';
import { 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  FileText,
  Award,
  ArrowRight
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { steps, currentStep, simulateStepCompletion, simulateDocumentUpload } = useOnboarding();
  const { notifications, addNotification } = useNotifications();

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`http://localhost:8080/api/onboarding/${encodeURIComponent(user.email)}/activities`);
        if (res.ok) {
          const data = await res.json();
          setRecentActivities(data);
        }
      } catch (e) {
        // fallback: do nothing
      }
    };
    fetchActivities();
  }, [user]);

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const stats = [
    {
      label: 'Progress',
      value: `${Math.round(progressPercentage)}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: `${completedSteps}/${steps.length}`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: steps.filter(s => s.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Notifications',
      value: notifications.filter(n => !n.read).length,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Complete adaptive forms', dueDate: 'Today', priority: 'high' },
    { id: 2, task: 'Upload identity documents', dueDate: 'Tomorrow', priority: 'medium' },
    { id: 3, task: 'Schedule HR discussion', dueDate: 'This week', priority: 'low' },
  ];

  // Action handlers
  const handleUploadDocuments = () => {
    const randomDoc = mockDocumentNames[Math.floor(Math.random() * mockDocumentNames.length)];
    simulateDocumentUpload();
    
    // Simulate multiple document uploads
    setTimeout(() => {
      const anotherDoc = mockDocumentNames[Math.floor(Math.random() * mockDocumentNames.length)];
      addNotification({
        type: 'success',
        title: 'Document Processed',
        message: `${anotherDoc} has been processed with 94% confidence.`,
      });
    }, 2000);
  };

  const handleScheduleMeeting = () => {
    const meetingDate = new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    addNotification({
      type: 'success',
      title: 'Meeting Scheduled',
      message: `HR meeting scheduled for ${meetingDate.toLocaleDateString()} at ${meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
    });
  };

  const handleViewGamification = () => {
    addNotification({
      type: 'info',
      title: 'Gamification Dashboard',
      message: 'You have earned 150 points and are ranked #3 in this month\'s onboarding leaderboard!',
    });
  };

  const handleQuickStepCompletion = (stepId: string) => {
    simulateStepCompletion(stepId);
  };
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600">
                Track your onboarding progress and complete pending tasks
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/onboarding">
                <Button>
                  Continue Onboarding
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button
              type="button"
              onClick={() => readSelectedTextOr('Dashboard. Welcome to your dashboard. Here you can view your onboarding progress, notifications, and important updates.')}
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Read this page aloud"
            >
              🔊 Read Aloud
            </button>
            <button
              type="button"
              onClick={stopReading}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Stop reading aloud"
            >
              ⏹ Stop
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Onboarding Progress</h2>
                <span className="text-sm text-gray-500">{completedSteps} of {steps.length} completed</span>
              </div>
              <ProgressBar progress={progressPercentage} className="mb-6" />
              
              <div className="space-y-3">
                {steps.slice(0, 5).map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : step.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      step.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : step.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {step.status.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activities */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'completed' ? 'bg-green-500' :
                      activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.stepId} - {activity.status}</p>
                      <p className="text-xs text-gray-500">{new Date(activity.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due: {task.dueDate}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleUploadDocuments}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleScheduleMeeting}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleViewGamification}
                >
                  <Award className="w-4 h-4 mr-2" />
                  View Gamification
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;