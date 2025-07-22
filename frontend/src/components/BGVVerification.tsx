import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink, User } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface BGVVerificationProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

const BGVVerification: React.FC<BGVVerificationProps> = ({ onComplete, isProcessing }) => {
  const { user } = useAuth();
  const [bgvStatus, setBgvStatus] = useState<'not-started' | 'initiated' | 'in-progress' | 'completed'>('not-started');
  const [bgvData, setBgvData] = useState({
    vendor: 'HireRight',
    referenceId: '',
    initiatedBy: '',
    initiatedAt: '',
    completedAt: '',
    status: 'Pending',
    checks: [
      { name: 'Identity Verification', status: 'pending', completedAt: '' },
      { name: 'Employment History', status: 'pending', completedAt: '' },
      { name: 'Education Verification', status: 'pending', completedAt: '' },
      { name: 'Criminal Background Check', status: 'pending', completedAt: '' },
      { name: 'Reference Check', status: 'pending', completedAt: '' }
    ]
  });
  const [allChecksCompleted, setAllChecksCompleted] = useState(false);
  const isHR = user?.role === 'hr';

  const triggerBGVAPI = async () => {
    if (!isHR) return;
    setBgvStatus('initiated');
    const referenceId = `HR-${Date.now()}`;
    setBgvData(prev => ({
      ...prev,
      referenceId,
      initiatedBy: user?.name || 'HR Manager',
      initiatedAt: new Date().toISOString(),
      status: 'In Progress'
    }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBgvStatus('in-progress');
    // Simulate progressive completion of checks
    const checks = [...bgvData.checks];
    for (let i = 0; i < checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      checks[i] = {
        ...checks[i],
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      setBgvData(prev => ({
        ...prev,
        checks: [...checks]
      }));
    }
    setBgvStatus('completed');
    setBgvData(prev => ({
      ...prev,
      status: 'Completed',
      completedAt: new Date().toISOString()
    }));
  };

  // New: Fetch all checks as completed (demo)
  const fetchAllChecksCompleted = async () => {
    const res = await fetch('http://localhost:8080/api/bgv/checks');
    if (res.ok) {
      const checks = await res.json();
      setBgvData(prev => ({
        ...prev,
        checks: checks.map((c: any) => ({
          name: c.checkName,
          status: c.status,
          completedAt: c.completedAt
        })),
        status: 'Completed',
        completedAt: new Date().toISOString()
      }));
      setAllChecksCompleted(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-red-600 bg-red-100';
    }
  };

  if (!isHR && bgvStatus === 'not-started') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Background Verification Pending
          </h2>
          <p className="text-gray-600">
            HR will initiate your background verification process shortly
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waiting for HR to Initiate BGV</h3>
            <p className="text-gray-600 mb-4">
              Our HR team will start the background verification process with our trusted partner HireRight.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>What will be verified:</strong><br />
                • Identity and address verification<br />
                • Employment history<br />
                • Education credentials<br />
                • Criminal background check<br />
                • Professional references
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
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Background Verification
        </h2>
        <p className="text-gray-600">
          {isHR ? 'Initiate and monitor background verification process' : 'Track your background verification status'}
        </p>
      </div>

      {/* BGV Status Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">BGV Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bgvData.status.toLowerCase().replace(' ', '-'))}`}>
            {bgvData.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Vendor</p>
            <div className="flex items-center space-x-2 mt-1">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-900">{bgvData.vendor}</span>
            </div>
          </div>
          
          {bgvData.referenceId && (
            <div>
              <p className="text-sm text-gray-600">Reference ID</p>
              <p className="font-medium text-gray-900 mt-1">{bgvData.referenceId}</p>
            </div>
          )}
          
          {bgvData.initiatedBy && (
            <div>
              <p className="text-sm text-gray-600">Initiated By</p>
              <p className="font-medium text-gray-900 mt-1">{bgvData.initiatedBy}</p>
            </div>
          )}
        </div>

        {bgvData.initiatedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Initiated:</span>
                <span className="ml-2 text-gray-900">{new Date(bgvData.initiatedAt).toLocaleString()}</span>
              </div>
              {bgvData.completedAt && (
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 text-gray-900">{new Date(bgvData.completedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* BGV Checks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Checks</h3>
        
        <div className="space-y-4">
          {bgvData.checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="font-medium text-gray-900">{check.name}</p>
                  {check.completedAt && (
                    <p className="text-sm text-gray-500">
                      Completed: {new Date(check.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {isHR && bgvStatus === 'not-started' && (
          <Button
            onClick={triggerBGVAPI}
            disabled={isProcessing}
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initiating BGV...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Trigger BGV with HireRight
              </>
            )}
          </Button>
        )}

        {bgvStatus === 'completed' && (
          <Button
            onClick={() => onComplete({ bgvData, completedAt: new Date().toISOString() })}
            disabled={isProcessing}
            className="px-8"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete BGV Step
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BGVVerification;