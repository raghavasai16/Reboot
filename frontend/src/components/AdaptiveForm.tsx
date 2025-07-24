import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { playSuccess, playError } from '../utils/audioFeedback';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

interface AdaptiveFormProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

const AdaptiveForm: React.FC<AdaptiveFormProps> = ({ onComplete, isProcessing }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    skills: '',
    experience: '',
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [validationScores, setValidationScores] = useState<Record<string, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Simulate AI analysis of form fields
    const analyzeFields = async () => {
      setIsAnalyzing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock AI suggestions
      setAiSuggestions({
        skills: 'Based on your role, consider adding: React, TypeScript, Node.js',
        experience: 'Include specific metrics and achievements from your previous roles',
        address: 'Ensure address format matches official documents',
      });
      
      // Mock validation scores
      setValidationScores({
        firstName: formData.firstName ? 95 : 0,
        lastName: formData.lastName ? 95 : 0,
        email: formData.email.includes('@') ? 98 : 0,
        phone: formData.phone.length >= 10 ? 92 : 0,
      });
      
      setIsAnalyzing(false);
    };

    if (Object.values(formData).some(value => value.length > 0)) {
      analyzeFields();
    }
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getValidationColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getValidationBg = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const isFormValid = Object.values(formData).every(value => value.length > 0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Adaptive Forms with AI Validation
        </h2>
        <p className="text-gray-600">
          Our AI assists you in completing forms with real-time validation and suggestions
        </p>
        <button
          type="button"
          onClick={() => readSelectedTextOr('Adaptive Forms with AI Validation. Our AI assists you in completing forms with real-time validation and suggestions. Personal Information. First Name. Last Name. Email Address. Phone Number. Address. Skills and Expertise. Work Experience. Emergency Contact.')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Read this form aloud"
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

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {isAnalyzing && (
            <div className="flex items-center text-sm text-blue-600">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI analyzing...
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                aria-required="true"
                aria-label="First Name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationScores.firstName
                    ? getValidationBg(validationScores.firstName)
                    : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {validationScores.firstName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className={`flex items-center space-x-1 ${getValidationColor(validationScores.firstName)}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">{validationScores.firstName}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                aria-required="true"
                aria-label="Last Name"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationScores.lastName
                    ? getValidationBg(validationScores.lastName)
                    : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {validationScores.lastName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className={`flex items-center space-x-1 ${getValidationColor(validationScores.lastName)}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">{validationScores.lastName}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                aria-required="true"
                aria-label="Email Address"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationScores.email
                    ? getValidationBg(validationScores.email)
                    : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {validationScores.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className={`flex items-center space-x-1 ${getValidationColor(validationScores.email)}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">{validationScores.email}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                aria-required="true"
                aria-label="Phone Number"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  validationScores.phone
                    ? getValidationBg(validationScores.phone)
                    : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {validationScores.phone && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className={`flex items-center space-x-1 ${getValidationColor(validationScores.phone)}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">{validationScores.phone}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mt-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            aria-label="Address"
            aria-required="true"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={3}
            placeholder="Enter your complete address"
          />
          {aiSuggestions.address && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Suggestion</span>
              </div>
              <p className="text-sm text-blue-800">{aiSuggestions.address}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="mt-6">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
            Skills & Expertise
          </label>
          <textarea
            id="skills"
            value={formData.skills}
            onChange={(e) => handleInputChange('skills', e.target.value)}
            aria-label="Skills and Expertise"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={3}
            placeholder="List your key skills and areas of expertise"
          />
          {aiSuggestions.skills && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Suggestion</span>
              </div>
              <p className="text-sm text-blue-800">{aiSuggestions.skills}</p>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="mt-6">
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
            Work Experience
          </label>
          <textarea
            id="experience"
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            aria-label="Work Experience"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={4}
            placeholder="Describe your relevant work experience"
          />
          {aiSuggestions.experience && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Suggestion</span>
              </div>
              <p className="text-sm text-blue-800">{aiSuggestions.experience}</p>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="mt-6">
          <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact
          </label>
          <input
            id="emergencyContact"
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
            aria-label="Emergency Contact"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Name and phone number of emergency contact"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={() => {
              onComplete(formData);
              playSuccess();
            }}
            disabled={!isFormValid || isProcessing}
            className="px-8"
            aria-label="Complete Form"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Complete Form'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdaptiveForm;