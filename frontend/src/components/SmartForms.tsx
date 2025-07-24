import React, { useState } from 'react';
import { FileText, PenTool, CheckCircle, Loader2, Download, Upload, User, Heart, Banknote } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import jsPDF from 'jspdf';
import { playSuccess } from '../utils/audioFeedback';
import { readSelectedTextOr, stopReading } from '../utils/immersiveReader';

interface SmartFormsProps {
  onComplete: (data: any) => void;
  isProcessing: boolean;
}

const SmartForms: React.FC<SmartFormsProps> = ({ onComplete, isProcessing }) => {
  const [currentForm, setCurrentForm] = useState<'acceptance' | 'pf' | 'gratuity' | 'account'>('acceptance');
  const [formData, setFormData] = useState({
    acceptance: {
      signed: false,
      signedAt: '',
      ipAddress: '192.168.1.100'
    },
    pf: {
      pfNumber: '',
      previousPfNumber: '',
      nomineeDetails: [
        { name: '', relationship: '', dateOfBirth: '', address: '', percentage: '' }
      ],
      completed: false
    },
    gratuity: {
      nomineeDetails: [
        { name: '', relationship: '', dateOfBirth: '', address: '', percentage: '' }
      ],
      completed: false
    },
    account: {
      accountNumber: '',
      accountName: '',
      ifscCode: '',
      bankName: '',
      completed: false
    }
  });

  // Helper to update a nominee in PF or Gratuity
  const updateNominee = (formType: 'pf' | 'gratuity', idx: number, field: string, value: string | number) => {
    setFormData(prev => {
      const updatedNominees = prev[formType].nomineeDetails.map((nom: any, i: number) =>
        i === idx ? { ...nom, [field]: field === 'percentage' ? Number(value) : value } : nom
      );
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          nomineeDetails: updatedNominees
        }
      };
    });
  };

  // Add nominee (prevent adding if last is incomplete)
  const addNominee = (formType: 'pf' | 'gratuity') => {
    const lastNominee = formData[formType].nomineeDetails[formData[formType].nomineeDetails.length - 1];
    if (!lastNominee.name || !lastNominee.relationship || !lastNominee.dateOfBirth || !lastNominee.address || !lastNominee.percentage || isNaN(Number(lastNominee.percentage)) || Number(lastNominee.percentage) <= 0) {
      return; // Don't add if last nominee is incomplete
    }
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        nomineeDetails: [
          ...prev[formType].nomineeDetails,
          { name: '', relationship: '', dateOfBirth: '', address: '', percentage: '' }
        ]
      }
    }));
  };

  // Remove nominee
  const removeNominee = (formType: 'pf' | 'gratuity', idx: number) => {
    setFormData(prev => {
      const updatedNominees = prev[formType].nomineeDetails.filter((_: any, i: number) => i !== idx);
      return {
        ...prev,
        [formType]: {
          ...prev[formType],
          nomineeDetails: updatedNominees
        }
      };
    });
  };

  // Calculate total allocation for a form
  const getTotalPercentage = (formType: 'pf' | 'gratuity') =>
    formData[formType].nomineeDetails.reduce((sum: number, n: any) => sum + (Number(n.percentage) || 0), 0);

  const handleESign = () => {
    setFormData(prev => ({
      ...prev,
      acceptance: {
        ...prev.acceptance,
        signed: true,
        signedAt: new Date().toISOString()
      }
    }));
  };

  const handleFormSubmit = (formType: 'pf' | 'gratuity' | 'account') => {
    setFormData(prev => ({
      ...prev,
      [formType]: {
        ...prev[formType],
        completed: true
      }
    }));
  };

  const handleDownloadAcceptanceLetter = () => {
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSize(18);
    pdf.setTextColor(37, 99, 235);
    pdf.text('Lloyds Technology Center', 20, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Offer Acceptance Letter', 20, y);
    y += 10;
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 10;
    pdf.text('To: HR Department', 20, y);
    y += 7;
    pdf.text('Lloyds Technology Center', 20, y);
    y += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Subject: Acceptance of Employment Offer', 20, y);
    pdf.setFont('helvetica', 'normal');
    y += 10;
    pdf.text('Dear HR Team,', 20, y);
    y += 10;
    pdf.text('I am pleased to accept your offer for the position of Senior Software Engineer in the Engineering department at Lloyds Technology Center.', 20, y, { maxWidth: 170 });
    y += 15;
    pdf.text('I confirm my acceptance of the following terms:', 20, y);
    y += 8;
    pdf.text('- Position: Senior Software Engineer', 25, y);
    y += 7;
    pdf.text('- Department: Engineering', 25, y);
    y += 7;
    pdf.text('- Annual CTC: ₹12,00,000', 25, y);
    y += 7;
    pdf.text('- Joining Date: March 1, 2024', 25, y);
    y += 7;
    pdf.text('- Work Location: Bangalore, India', 25, y);
    y += 7;
    pdf.text('- Probation Period: 6 months', 25, y);
    y += 10;
    pdf.text('I understand that this employment is contingent upon successful completion of background verification and submission of all required documents.', 20, y, { maxWidth: 170 });
    y += 15;
    pdf.text('I look forward to contributing to the success of Lloyds Technology Center and starting my journey with the team.', 20, y, { maxWidth: 170 });
    y += 15;
    pdf.text('Sincerely,', 20, y);
    y += 7;
    pdf.text('Veera Raghava', 20, y);
    pdf.save(`Offer_Acceptance_Letter_${Date.now()}.pdf`);
  };

  const allFormsCompleted = formData.acceptance.signed && formData.pf.completed && formData.gratuity.completed && formData.account.completed;

  const renderAcceptanceLetter = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Offer Acceptance Letter</h3>
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <div className="space-y-4 text-sm">
          <div className="text-center border-b pb-4">
            <h4 className="text-lg font-bold text-blue-600">Lloyds Technology Center</h4>
            <p className="text-gray-600">Offer Acceptance Letter</p>
          </div>
          
          <div>
            <p>Date: {new Date().toLocaleDateString()}</p>
            <p className="mt-2">To: HR Department<br />Lloyds Technology Center</p>
          </div>
          
          <div>
            <p><strong>Subject: Acceptance of Employment Offer</strong></p>
            <p className="mt-2">Dear HR Team,</p>
            <p className="mt-2">
              I am pleased to accept your offer for the position of Senior Software Engineer 
              in the Engineering department at Lloyds Technology Center
            </p>
          </div>
          
          <div>
            <p>I confirm my acceptance of the following terms:</p>
            <ul className="mt-2 space-y-1 ml-4 list-disc">
              <li>Position: Senior Software Engineer</li>
              <li>Department: Engineering</li>
              <li>Annual CTC: ₹12,00,000</li>
              <li>Joining Date: March 1, 2024</li>
              <li>Work Location: Bangalore, India</li>
              <li>Probation Period: 6 months</li>
            </ul>
          </div>
          
          <div>
            <p>
              I understand that this employment is contingent upon successful completion 
              of background verification and submission of all required documents.
            </p>
            <p className="mt-2">
              I look forward to contributing to the success of Lloyds Technology Center and 
              starting my journey with the team.
            </p>
          </div>
          
          <div className="mt-6">
            <p>Sincerely,</p>
            <p className="mt-2">Veera Raghava</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {formData.acceptance.signed ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600">
                Signed on {new Date(formData.acceptance.signedAt).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-600">Please review and sign the acceptance letter</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleDownloadAcceptanceLetter}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            onClick={handleESign}
            disabled={formData.acceptance.signed}
            className={formData.acceptance.signed ? 'bg-green-600' : ''}
          >
            <PenTool className="w-4 h-4 mr-2" />
            {formData.acceptance.signed ? 'Signed' : 'E-Sign'}
          </Button>
        </div>
      </div>
    </Card>
  );

  // PF Nominee Section
  const renderPFForm = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">PF Nomination Form</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="previousPfNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Previous PF Number (if any)
            </label>
            <input
              id="previousPfNumber"
              type="text"
              value={formData.pf.previousPfNumber}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                pf: { ...prev.pf, previousPfNumber: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter previous PF number"
              aria-label="Previous PF Number"
            />
          </div>
        </div>
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Nominee Details</h4>
          {formData.pf.nomineeDetails.map((nominee, idx) => (
            <div key={idx} className="flex flex-col md:gap-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Name & Relationship */}
              <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                <div className="flex-1">
                  <label htmlFor={`pf-nominee-name-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Nominee Name *</label>
                  <input
                    id={`pf-nominee-name-${idx}`}
                    type="text"
                    value={nominee.name}
                    onChange={e => updateNominee('pf', idx, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter nominee name"
                    required
                    aria-required="true"
                    aria-label="Nominee Name"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`pf-nominee-relationship-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <select
                    id={`pf-nominee-relationship-${idx}`}
                    value={nominee.relationship}
                    onChange={e => updateNominee('pf', idx, 'relationship', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-required="true"
                    aria-label="Relationship"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                  </select>
                </div>
              </div>
              {/* Date of Birth & Address */}
              <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                <div className="flex-1">
                  <label htmlFor={`pf-nominee-dob-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    id={`pf-nominee-dob-${idx}`}
                    type="date"
                    value={nominee.dateOfBirth}
                    onChange={e => updateNominee('pf', idx, 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-required="true"
                    aria-label="Date of Birth"
                  />
                </div>
                <div className="flex-[2]">
                  <label htmlFor={`pf-nominee-address-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Nominee Address *</label>
                  <textarea
                    id={`pf-nominee-address-${idx}`}
                    value={nominee.address}
                    onChange={e => updateNominee('pf', idx, 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Enter complete address"
                    required
                    aria-required="true"
                    aria-label="Nominee Address"
                  />
                </div>
              </div>
              {/* Allocation & Buttons */}
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-1 max-w-xs">
                  <label htmlFor={`pf-nominee-percentage-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">% Allocation *</label>
                  <input
                    id={`pf-nominee-percentage-${idx}`}
                    type="number"
                    min={1}
                    max={100}
                    value={nominee.percentage || ''}
                    onChange={e => updateNominee('pf', idx, 'percentage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="%"
                    required
                    aria-required="true"
                    aria-label="Percentage Allocation"
                  />
                </div>
                <div className="flex gap-2 mb-1">
                  {formData.pf.nomineeDetails.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => removeNominee('pf', idx)}>-</Button>
                  )}
                  {idx === formData.pf.nomineeDetails.length - 1 && (
                    <Button type="button" variant="outline" onClick={() => addNominee('pf')}>+</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 text-sm">
            <strong>Total Allocation: {getTotalPercentage('pf')}%</strong>
            {getTotalPercentage('pf') !== 100 && (
              <span className="text-red-600 ml-2">(Total should be 100%)</span>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              handleFormSubmit('pf');
              playSuccess();
            }}
            disabled={
              formData.pf.nomineeDetails.some(
                n => !n.name || !n.relationship || !n.dateOfBirth || !n.address || !n.percentage || isNaN(Number(n.percentage)) || Number(n.percentage) <= 0
              ) ||
              getTotalPercentage('pf') !== 100 ||
              formData.pf.completed
            }
            className={formData.pf.completed ? 'bg-green-600' : ''}
            aria-label="Submit PF Form"
          >
            {formData.pf.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              'Submit PF Form'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );

  // Gratuity Nominee Section
  const renderGratuityForm = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Gratuity Nomination Form</h3>
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Gratuity is payable after 5 years of continuous service. 
            This nomination will be used for gratuity payment in case of unfortunate events.
          </p>
        </div>
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">Nominee Details</h4>
          {formData.gratuity.nomineeDetails.map((nominee, idx) => (
            <div key={idx} className="flex flex-col md:gap-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {/* Name & Relationship */}
              <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                <div className="flex-1">
                  <label htmlFor={`gratuity-nominee-name-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Nominee Name *</label>
                  <input
                    id={`gratuity-nominee-name-${idx}`}
                    type="text"
                    value={nominee.name}
                    onChange={e => updateNominee('gratuity', idx, 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter nominee name"
                    required
                    aria-required="true"
                    aria-label="Nominee Name"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`gratuity-nominee-relationship-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <select
                    id={`gratuity-nominee-relationship-${idx}`}
                    value={nominee.relationship}
                    onChange={e => updateNominee('gratuity', idx, 'relationship', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-required="true"
                    aria-label="Relationship"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="son">Son</option>
                    <option value="daughter">Daughter</option>
                    <option value="brother">Brother</option>
                    <option value="sister">Sister</option>
                  </select>
                </div>
              </div>
              {/* Date of Birth & Address */}
              <div className="flex flex-col md:flex-row md:gap-4 gap-2">
                <div className="flex-1">
                  <label htmlFor={`gratuity-nominee-dob-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    id={`gratuity-nominee-dob-${idx}`}
                    type="date"
                    value={nominee.dateOfBirth}
                    onChange={e => updateNominee('gratuity', idx, 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-required="true"
                    aria-label="Date of Birth"
                  />
                </div>
                <div className="flex-[2]">
                  <label htmlFor={`gratuity-nominee-address-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">Nominee Address *</label>
                  <textarea
                    id={`gratuity-nominee-address-${idx}`}
                    value={nominee.address}
                    onChange={e => updateNominee('gratuity', idx, 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Enter complete address"
                    required
                    aria-required="true"
                    aria-label="Nominee Address"
                  />
                </div>
              </div>
              {/* Allocation & Buttons */}
              <div className="flex items-end gap-2 mt-2">
                <div className="flex-1 max-w-xs">
                  <label htmlFor={`gratuity-nominee-percentage-${idx}`} className="block text-sm font-medium text-gray-700 mb-1">% Allocation *</label>
                  <input
                    id={`gratuity-nominee-percentage-${idx}`}
                    type="number"
                    min={1}
                    max={100}
                    value={nominee.percentage || ''}
                    onChange={e => updateNominee('gratuity', idx, 'percentage', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="%"
                    required
                    aria-required="true"
                    aria-label="Percentage Allocation"
                  />
                </div>
                <div className="flex gap-2 mb-1">
                  {formData.gratuity.nomineeDetails.length > 1 && (
                    <Button type="button" variant="outline" onClick={() => removeNominee('gratuity', idx)}>-</Button>
                  )}
                  {idx === formData.gratuity.nomineeDetails.length - 1 && (
                    <Button type="button" variant="outline" onClick={() => addNominee('gratuity')}>+</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 text-sm">
            <strong>Total Allocation: {getTotalPercentage('gratuity')}%</strong>
            {getTotalPercentage('gratuity') !== 100 && (
              <span className="text-red-600 ml-2">(Total should be 100%)</span>
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              handleFormSubmit('gratuity');
              playSuccess();
            }}
            disabled={
              formData.gratuity.nomineeDetails.some(
                n => !n.name || !n.relationship || !n.dateOfBirth || !n.address || !n.percentage || isNaN(Number(n.percentage)) || Number(n.percentage) <= 0
              ) ||
              getTotalPercentage('gratuity') !== 100 ||
              formData.gratuity.completed
            }
            className={formData.gratuity.completed ? 'bg-green-600' : ''}
            aria-label="Submit Gratuity Form"
          >
            {formData.gratuity.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              'Submit Gratuity Form'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );

  // Account Details Form
  const renderAccountForm = () => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Account Details</h3>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              id="accountNumber"
              type="text"
              value={formData.account.accountNumber}
              onChange={e => setFormData(prev => ({
                ...prev,
                account: { ...prev.account, accountNumber: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter account number"
              required
              aria-required="true"
              aria-label="Account Number"
            />
          </div>
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              id="accountName"
              type="text"
              value={formData.account.accountName}
              onChange={e => setFormData(prev => ({
                ...prev,
                account: { ...prev.account, accountName: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter account holder name"
              required
              aria-required="true"
              aria-label="Account Name"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code *
            </label>
            <input
              id="ifscCode"
              type="text"
              value={formData.account.ifscCode}
              onChange={e => setFormData(prev => ({
                ...prev,
                account: { ...prev.account, ifscCode: e.target.value.toUpperCase() }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter IFSC code"
              required
              aria-required="true"
              aria-label="IFSC Code"
              maxLength={11}
            />
          </div>
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              id="bankName"
              type="text"
              value={formData.account.bankName}
              onChange={e => setFormData(prev => ({
                ...prev,
                account: { ...prev.account, bankName: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter bank name"
              required
              aria-required="true"
              aria-label="Bank Name"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => {
              handleFormSubmit('account');
              playSuccess();
            }}
            disabled={
              !formData.account.accountNumber ||
              !formData.account.accountName ||
              !formData.account.ifscCode ||
              !formData.account.bankName ||
              formData.account.completed
            }
            className={formData.account.completed ? 'bg-green-600' : ''}
            aria-label="Submit Account Details"
          >
            {formData.account.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              'Submit Account Details'
            )}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Smart Forms & E-Signature
        </h2>
        <p className="text-gray-600">
          Complete your acceptance letter and nomination forms
        </p>
        <button
          type="button"
          onClick={() => readSelectedTextOr('Smart Forms and E-Signature. Complete your acceptance letter and nomination forms. Acceptance Letter. PF Nomination. Gratuity Nomination.')}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Read this section aloud"
        >
          🔊 Read Aloud
        </button>
        <button
          type="button"
          onClick={stopReading}
          className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Stop reading aloud"
        >
          ⏹ Stop
        </button>
      </div>

      {/* Form Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <button
            onClick={() => setCurrentForm('acceptance')}
            className={`min-w-32 text-center flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentForm === 'acceptance'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Acceptance Letter</span>
            {formData.acceptance.signed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </button>
          
          <button
            onClick={() => setCurrentForm('pf')}
            className={`min-w-32 text-center flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentForm === 'pf'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>PF Nomination</span>
            {formData.pf.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </button>
          
          <button
            onClick={() => setCurrentForm('gratuity')}
            className={`min-w-32 text-center flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentForm === 'gratuity'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Gratuity Nomination</span>
            {formData.gratuity.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </button>
          <button
            onClick={() => setCurrentForm('account')}
            className={`min-w-32 text-center flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentForm === 'account'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Details</span>
            {formData.account.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </button>
        </div>
      </Card>

      {/* Form Content */}
      {currentForm === 'acceptance' && renderAcceptanceLetter()}
      {currentForm === 'pf' && renderPFForm()}
      {currentForm === 'gratuity' && renderGratuityForm()}
      {currentForm === 'account' && renderAccountForm()}

      {/* Complete Step */}
      {allFormsCompleted && (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              onComplete(formData);
              playSuccess();
            }}
            disabled={isProcessing}
            className="px-8"
            aria-label="Complete Smart Forms"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Smart Forms
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SmartForms;