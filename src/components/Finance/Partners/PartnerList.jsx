import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { formatDate } from '../../../utils/dateFormatter';
import { Plus, Edit2, Trash2, User, TrendingUp, TrendingDown } from 'lucide-react';
import PartnerForm from './PartnerForm';
import PartnerDetails from './PartnerDetails';

export default function PartnerList() {
  const { partners, withdrawals, deletePartner } = useData();
  const { showConfirmDialog, showSuccessMessage, showErrorMessage } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [viewingPartner, setViewingPartner] = useState(null);
  
  const handleAddPartner = () => {
    setEditingPartner(null);
    setShowForm(true);
  };
  
  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };
  
  const handleViewPartner = (partner) => {
    setViewingPartner(partner);
  };
  
  const handleDeletePartner = async (partner) => {
    const partnerWithdrawals = withdrawals.filter(w => w.partnerId === partner.id);
    
    if (partnerWithdrawals.length > 0) {
      showErrorMessage(
        'Cannot Delete Partner',
        `${partner.name} has ${partnerWithdrawals.length} withdrawal records. Archive partner instead.`
      );
      return;
    }
    
    const confirmed = await showConfirmDialog(
      'Delete Partner',
      `Are you sure you want to delete ${partner.name}? This action cannot be undone.`,
      'danger'
    );
    
    if (confirmed) {
      try {
        await deletePartner(partner.id);
        showSuccessMessage('Partner Deleted', `${partner.name} has been removed`);
      } catch (error) {
        showErrorMessage('Delete Failed', error.message);
      }
    }
  };
  
  const calculatePartnerMetrics = (partner) => {
    console.log(`📊 Calculating metrics for partner: ${partner.name} (ID: ${partner.id}, type: ${typeof partner.id})`);
    console.log(`📊 Total withdrawals in system: ${withdrawals?.length || 0}`);

    // Log each withdrawal with details
    withdrawals.forEach(w => {
      console.log(`   - Withdrawal ${w.id}: partnerId="${w.partnerId}" (type: ${typeof w.partnerId}), amount=$${w.amount}`);
    });

    const partnerWithdrawals = withdrawals.filter(w => {
      const match = w.partnerId === partner.id;
      console.log(`   - Comparing withdrawal partnerId "${w.partnerId}" === partner.id "${partner.id}": ${match}`);
      return match;
    });
    console.log(`📊 Partner ${partner.id} withdrawals found: ${partnerWithdrawals.length}`);

    const totalWithdrawn = partnerWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const lastWithdrawal = partnerWithdrawals.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const capitalAccount = partner.capitalAccount || {};
    const currentEquity = (capitalAccount.initialInvestment || 0) +
                         (capitalAccount.profitShare || 0) -
                         totalWithdrawn;

    console.log(`📊 Partner ${partner.id} metrics: totalWithdrawn=${totalWithdrawn}, equity=${currentEquity}`);

    return {
      totalWithdrawn,
      lastWithdrawal,
      currentEquity,
      withdrawalCount: partnerWithdrawals.length
    };
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const formatDateOrNever = (dateString) => {
    if (!dateString) return 'Never';
    return formatDate(dateString);
  };
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#ebebeb'
          }}>Partners</h3>
          <p style={{
            fontSize: '14px',
            color: '#b3b3b3',
            marginTop: '4px'
          }}>
            Manage partner profiles and equity accounts
          </p>
        </div>
        <button
          onClick={handleAddPartner}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </button>
      </div>
      
      {/* Partners Grid */}
      {partners.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 0',
          backgroundColor: '#3a3a3a',
          border: '2px dashed #525252',
          borderRadius: '8px'
        }}>
          <User className="mx-auto h-12 w-12" style={{ color: '#6b7280' }} />
          <h3 className="mt-2 text-sm font-medium" style={{ color: '#ebebeb' }}>No Partners</h3>
          <p className="mt-1 text-sm" style={{ color: '#9ca3af' }}>
            No partners added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map(partner => {
            const metrics = calculatePartnerMetrics(partner);
            const isPositive = metrics.currentEquity >= 0;
            
            return (
              <div key={partner.id} style={{
                backgroundColor: '#3a3a3a',
                border: '1px solid #525252',
                borderRadius: '8px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
                transition: 'box-shadow 0.3s'
              }} onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.4)';
              }} onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.2)';
              }}>
                <div className="p-6">
                  {/* Partner Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium" style={{ color: '#ebebeb' }}>{partner.name}</h4>
                        <p className="text-sm" style={{ color: '#9ca3af' }}>{partner.ownershipPercent}% ownership</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleViewPartner(partner)}
                        className="hover:text-blue-400 p-1"
                        style={{ color: '#2563eb' }}
                        title="View details"
                      >
                        <TrendingUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditPartner(partner)}
                        className="hover:text-gray-400 p-1"
                        style={{ color: '#9ca3af' }}
                        title="Edit partner"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner)}
                        className="hover:text-red-400 p-1"
                        style={{ color: '#dc2626' }}
                        title="Delete partner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-3">
                    {/* Current Equity */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#b3b3b3' }}>Current Equity</span>
                      <div className="flex items-center">
                        <span className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(metrics.currentEquity)}
                        </span>
                        {isPositive ? (
                          <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Initial Investment */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#b3b3b3' }}>Initial Investment</span>
                      <span className="text-sm font-medium" style={{ color: '#ebebeb' }}>
                        {formatCurrency(partner.capitalAccount?.initialInvestment || 0)}
                      </span>
                    </div>

                    {/* Total Withdrawn */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#b3b3b3' }}>Total Withdrawn</span>
                      <span className="text-sm font-medium" style={{ color: '#ebebeb' }}>
                        {formatCurrency(metrics.totalWithdrawn)}
                      </span>
                    </div>

                    {/* Last Withdrawal */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm" style={{ color: '#b3b3b3' }}>Last Withdrawal</span>
                      <span className="text-sm" style={{ color: '#9ca3af' }}>
                        {formatDateOrNever(metrics.lastWithdrawal?.date)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  {(partner.email || partner.phoneNumber) && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid #404040' }}>
                      {partner.email && (
                        <p className="text-sm truncate" style={{ color: '#b3b3b3' }}>
                          📧 {partner.email}
                        </p>
                      )}
                      {partner.phoneNumber && (
                        <p className="text-sm mt-1" style={{ color: '#b3b3b3' }}>
                          📱 {partner.phoneNumber}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onClose={() => {
            setShowForm(false);
            setEditingPartner(null);
          }}
        />
      )}
      
      {/* Partner Details Modal */}
      {viewingPartner && (
        <PartnerDetails
          partner={viewingPartner}
          onClose={() => setViewingPartner(null)}
        />
      )}
    </div>
  );
}