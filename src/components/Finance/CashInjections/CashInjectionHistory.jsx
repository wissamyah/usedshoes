import { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useUI } from '../../../context/UIContext';
import { formatDate } from '../../../utils/dateFormatter';
import { Plus, DollarSign, TrendingUp, Trash2, Edit2, Building2, FileText, Wallet, Settings } from 'lucide-react';
import CashInjectionForm from './CashInjectionForm';

export default function CashInjectionHistory() {
  const { cashInjections = [], partners, deleteCashInjection } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  const [showForm, setShowForm] = useState(false);
  const [selectedInjection, setSelectedInjection] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  // Filter injections by type
  const filteredInjections = filterType === 'all' 
    ? cashInjections 
    : cashInjections.filter(inj => inj.type === filterType);
  
  // Sort by date (most recent first)
  const sortedInjections = [...filteredInjections].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  // Calculate totals by type
  const totalsByType = cashInjections.reduce((acc, inj) => {
    acc[inj.type] = (acc[inj.type] || 0) + inj.amount;
    return acc;
  }, {});
  
  const grandTotal = Object.values(totalsByType).reduce((sum, amount) => sum + amount, 0);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  const handleEdit = (injection) => {
    setSelectedInjection(injection);
    setShowForm(true);
  };
  
  const handleDelete = async (injection) => {
    const confirmed = await showConfirmDialog(
      'Delete Cash Injection',
      `Are you sure you want to delete this ${formatCurrency(injection.amount)} ${injection.type.toLowerCase()}? ${
        injection.type === 'Capital Contribution' 
          ? 'This will also update the partner\'s equity account.' 
          : 'This action cannot be undone.'
      }`
    );
    
    if (confirmed) {
      try {
        await deleteCashInjection(injection.id);
        showSuccessMessage('Injection Deleted', 'Cash injection has been removed successfully');
      } catch (error) {
        showErrorMessage('Delete Failed', error.message || 'Failed to delete cash injection');
      }
    }
  };
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Capital Contribution':
        return <Wallet className="h-5 w-5 text-purple-600" />;
      case 'Loan':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'Other Income':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'Opening Balance':
        return <Settings className="h-5 w-5 text-blue-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };
  
  const getTypeColor = (type) => {
    switch (type) {
      case 'Capital Contribution':
        return 'bg-purple-100 text-purple-800';
      case 'Loan':
        return 'bg-orange-100 text-orange-800';
      case 'Other Income':
        return 'bg-green-100 text-green-800';
      case 'Opening Balance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Cash Injections</h3>
          <p className="text-sm text-gray-600 mt-1">
            Track capital contributions, loans, and other cash additions
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedInjection(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cash Injection
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Injections</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(grandTotal)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Capital Contributions</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatCurrency(totalsByType['Capital Contribution'] || 0)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Loans</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(totalsByType['Loan'] || 0)}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Other Income</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(totalsByType['Other Income'] || 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opening Balance</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(totalsByType['Opening Balance'] || 0)}
              </p>
            </div>
            <Settings className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilterType('all')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              filterType === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({cashInjections.length})
          </button>
          {['Capital Contribution', 'Loan', 'Other Income', 'Opening Balance'].map(type => {
            const count = cashInjections.filter(inj => inj.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  filterType === type
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {type} ({count})
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Injections List */}
      {sortedInjections.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cash Injections</h3>
          <p className="text-gray-600 mb-4">
            {filterType === 'all' 
              ? 'Start by adding your first cash injection'
              : `No ${filterType.toLowerCase()} records found`}
          </p>
          {filterType === 'all' && (
            <button
              onClick={() => {
                setSelectedInjection(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Cash Injection
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sortedInjections.map((injection) => {
              const partner = injection.partnerId 
                ? partners.find(p => p.id === injection.partnerId)
                : null;
              
              return (
                <li key={injection.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getTypeIcon(injection.type)}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {injection.description}
                            </p>
                            <span className={`ml-3 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(injection.type)}`}>
                              {injection.type}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <span>{formatDate(injection.date)}</span>
                            <span className="mx-2">•</span>
                            <span>{injection.source}</span>
                            {partner && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-purple-600">{partner.name}</span>
                              </>
                            )}
                            {injection.reference && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="flex items-center">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {injection.reference}
                                </span>
                              </>
                            )}
                          </div>
                          {injection.notes && (
                            <p className="mt-1 text-xs text-gray-500 italic">
                              {injection.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-right mr-4">
                          <p className="text-lg font-semibold text-green-600">
                            +{formatCurrency(injection.amount)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(injection)}
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit injection"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(injection)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete injection"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      {/* Cash Injection Form Modal */}
      {showForm && (
        <CashInjectionForm
          injection={selectedInjection}
          onClose={() => {
            setShowForm(false);
            setSelectedInjection(null);
          }}
        />
      )}
    </div>
  );
}