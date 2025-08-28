import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../../UI/Modal';

export default function CashReconciliation({ expectedBalance, onReconcile, onClose }) {
  const [actualCount, setActualCount] = useState(expectedBalance.toString());
  const [notes, setNotes] = useState('');
  const minReserve = 2000;
  
  const discrepancy = parseFloat(actualCount || 0) - expectedBalance;
  const availableForDistribution = Math.max(0, parseFloat(actualCount || 0) - minReserve);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onReconcile({
      actualCount: parseFloat(actualCount),
      availableForDistribution,
      reservedAmount: minReserve,
      notes: notes.trim()
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div className="bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Daily Cash Reconciliation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Balance
            </label>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(expectedBalance)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Count *
            </label>
            <input
              type="number"
              value={actualCount}
              onChange={(e) => setActualCount(e.target.value)}
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {discrepancy !== 0 && (
            <div className={`p-3 rounded ${discrepancy > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm font-medium">
                Discrepancy: {formatCurrency(discrepancy)}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Add any notes about the reconciliation..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Reconcile
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}