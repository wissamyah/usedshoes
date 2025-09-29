import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { formatDate } from '../../../utils/dateFormatter';
import { Plus, Trash2, Search } from 'lucide-react';
import WithdrawalForm from './WithdrawalForm';

export default function WithdrawalHistory({ availableCash }) {
  const { partners, withdrawals, deleteWithdrawal } = useData();
  const { showConfirmDialog, showSuccessMessage, showErrorMessage } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = !searchTerm || 
      withdrawal.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPartner = !filterPartner || withdrawal.partnerId === filterPartner;
    const matchesType = !filterType || withdrawal.type === filterType;
    
    return matchesSearch && matchesPartner && matchesType;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const handleDeleteWithdrawal = async (withdrawal) => {
    const confirmed = await showConfirmDialog(
      'Delete Withdrawal',
      `Are you sure you want to delete this $${withdrawal.amount} withdrawal? This will update the partner's capital account.`,
      'danger'
    );
    
    if (confirmed) {
      try {
        await deleteWithdrawal(withdrawal.id);
        showSuccessMessage('Withdrawal Deleted', 'The withdrawal has been removed and capital account updated');
      } catch (error) {
        showErrorMessage('Delete Failed', error.message);
      }
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  
  const totalWithdrawals = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#ebebeb'
          }}>Withdrawal History</h3>
          <p style={{
            fontSize: '14px',
            color: '#b3b3b3',
            marginTop: '4px'
          }}>
            {filteredWithdrawals.length} withdrawals • {formatCurrency(totalWithdrawals)} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={partners.length === 0 || availableCash <= 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Withdrawal
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search withdrawals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md"
              style={{
                backgroundColor: '#3a3a3a',
                border: '1px solid #525252',
                color: '#ebebeb'
              }}
            />
          </div>
        </div>
        
        <select
          value={filterPartner}
          onChange={(e) => setFilterPartner(e.target.value)}
          className="px-3 py-2 rounded-md"
          style={{
            backgroundColor: '#3a3a3a',
            border: '1px solid #525252',
            color: '#ebebeb'
          }}
        >
          <option value="">All Partners</option>
          {partners.map(partner => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-md"
          style={{
            backgroundColor: '#3a3a3a',
            border: '1px solid #525252',
            color: '#ebebeb'
          }}
        >
          <option value="">All Types</option>
          <option value="personal">Personal Draw</option>
          <option value="business_expense">Business Expense</option>
          <option value="profit_distribution">Profit Distribution</option>
          <option value="loan">Loan</option>
        </select>
      </div>
      
      {/* Withdrawals Table */}
      {filteredWithdrawals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          backgroundColor: '#3a3a3a',
          border: '1px solid #525252',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#9ca3af' }}>No withdrawals found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ backgroundColor: '#3a3a3a', borderRadius: '8px', overflow: 'hidden' }}>
            <thead style={{ backgroundColor: '#2a2a2a' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Purpose</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: '#9ca3af' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map(withdrawal => (
                <tr key={withdrawal.id} style={{ borderBottom: '1px solid #404040' }} onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4a4a4a';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#ebebeb' }}>
                    {formatDate(withdrawal.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#ebebeb' }}>
                    {withdrawal.partnerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: '#ebebeb' }}>
                    {formatCurrency(withdrawal.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {withdrawal.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: '#ebebeb' }}>
                    {withdrawal.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteWithdrawal(withdrawal)}
                      className="hover:text-red-400"
                      style={{ color: '#9ca3af' }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Withdrawal Form Modal */}
      {showForm && (
        <WithdrawalForm
          availableCash={availableCash}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}