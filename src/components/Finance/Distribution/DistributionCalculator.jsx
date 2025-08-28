import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Calculator, DollarSign, Users } from 'lucide-react';

export default function DistributionCalculator({ availableCash, currentCashPosition }) {
  const { partners, withdrawals } = useData();
  const [distributionAmount, setDistributionAmount] = useState(availableCash.toString());
  
  const calculateDistributions = () => {
    const amount = parseFloat(distributionAmount || 0);
    
    return partners.map(partner => {
      const share = (amount * partner.ownershipPercent) / 100;
      const partnerWithdrawals = withdrawals.filter(w => w.partnerId === partner.id);
      const totalWithdrawn = partnerWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      const capitalAccount = partner.capitalAccount || {};
      const currentEquity = (capitalAccount.initialInvestment || 0) + 
                           (capitalAccount.profitShare || 0) - 
                           totalWithdrawn;
      
      return {
        partner,
        share,
        totalWithdrawn,
        currentEquity,
        afterDistribution: currentEquity - share
      };
    });
  };
  
  const distributions = calculateDistributions();
  const minReserve = 2000;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Distribution Calculator</h3>
        <p className="text-sm text-gray-600 mt-1">
          Calculate partner distributions based on ownership percentages
        </p>
      </div>
      
      {/* Cash Position Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Current Cash</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(currentCashPosition)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Available for Distribution</p>
              <p className="text-lg font-semibold text-blue-600">{formatCurrency(availableCash)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-400 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Partners</p>
              <p className="text-lg font-semibold text-gray-900">{partners.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Distribution Amount Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Distribute
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={distributionAmount}
            onChange={(e) => setDistributionAmount(e.target.value)}
            max={availableCash}
            min="0"
            step="0.01"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => setDistributionAmount(availableCash.toString())}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            Max Available
          </button>
        </div>
        {parseFloat(distributionAmount) > availableCash && (
          <p className="mt-2 text-sm text-red-600">
            Amount exceeds available cash. Reserve of {formatCurrency(minReserve)} must be maintained.
          </p>
        )}
      </div>
      
      {/* Distribution Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Distribution Breakdown</h4>
        </div>
        <div className="p-6">
          {partners.length === 0 ? (
            <p className="text-sm text-gray-500">No partners to distribute to. Add partners first.</p>
          ) : (
            <div className="space-y-4">
              {distributions.map(({ partner, share, currentEquity, afterDistribution }) => (
                <div key={partner.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{partner.name}</p>
                    <p className="text-sm text-gray-500">{partner.ownershipPercent}% ownership</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Current equity: {formatCurrency(currentEquity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(share)}
                    </p>
                    <p className="text-xs text-gray-500">
                      After: {formatCurrency(afterDistribution)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total Distribution</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(parseFloat(distributionAmount || 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Remaining Cash</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(currentCashPosition - parseFloat(distributionAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}