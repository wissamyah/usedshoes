import { X } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { formatDate } from '../../../utils/dateFormatter';
import Modal from '../../UI/Modal';

export default function PartnerDetails({ partner, onClose }) {
  const { withdrawals } = useData();
  
  // Get partner's withdrawal history
  const partnerWithdrawals = withdrawals
    .filter(w => w.partnerId === partner.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const capitalAccount = partner.capitalAccount || {};
  const totalWithdrawn = partnerWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const currentEquity = (capitalAccount.initialInvestment || 0) + 
                       (capitalAccount.profitShare || 0) - 
                       totalWithdrawn;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  
  return (
    <Modal isOpen={true} onClose={onClose} size="large">
      <div className="bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
            <p className="text-sm text-gray-500">{partner.ownershipPercent}% Partner</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Capital Account Summary */}
          <div className="mb-8">
            <h4 className="text-base font-medium text-gray-900 mb-4">Capital Account</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Initial Investment</span>
                <span className="text-sm font-medium">{formatCurrency(capitalAccount.initialInvestment || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profit Share</span>
                <span className="text-sm font-medium">{formatCurrency(capitalAccount.profitShare || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Withdrawn</span>
                <span className="text-sm font-medium text-red-600">-{formatCurrency(totalWithdrawn)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Current Equity</span>
                <span className={`text-base font-semibold ${currentEquity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(currentEquity)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Withdrawals */}
          <div>
            <h4 className="text-base font-medium text-gray-900 mb-4">Recent Withdrawals</h4>
            {partnerWithdrawals.length === 0 ? (
              <p className="text-sm text-gray-500">No withdrawals recorded</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {partnerWithdrawals.slice(0, 10).map(withdrawal => (
                  <div key={withdrawal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-xs text-gray-500">{withdrawal.type} - {withdrawal.purpose}</p>
                    </div>
                    <span className="text-sm text-gray-600">{formatDate(withdrawal.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}