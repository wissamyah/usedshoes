import { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';
import { Download, Upload, Database, Shield, AlertTriangle, CheckCircle, FileJson, Wrench } from 'lucide-react';

export default function SettingsPage() {
  const {
    products,
    sales,
    expenses,
    containers,
    partners,
    withdrawals,
    cashInjections,
    metadata,
    loadData,
    fixMalformedIds,
    dispatch
  } = useData();
  const { showSuccessMessage, showErrorMessage, showConfirmDialog } = useUI();
  const [isImporting, setIsImporting] = useState(false);
  const [isFixingIds, setIsFixingIds] = useState(false);
  const fileInputRef = useRef(null);

  // Backup functionality
  const handleBackup = () => {
    try {
      // Prepare the data for backup
      const backupData = {
        metadata: {
          ...metadata,
          backupDate: new Date().toISOString(),
          version: '1.0.0'
        },
        containers,
        products,
        sales,
        expenses,
        partners: partners || [],
        withdrawals: withdrawals || [],
        cashInjections: cashInjections || []
      };

      // Create a blob with the JSON data
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      link.href = url;
      link.download = `backup_${date}.json`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccessMessage('Backup Successful', `Your data has been downloaded as backup_${date}.json`);
    } catch (error) {
      console.error('Backup failed:', error);
      showErrorMessage('Backup Failed', 'Failed to create backup. Please try again.');
    }
  };

  // Fix malformed IDs functionality
  const handleFixIds = async () => {
    // Check if there are any malformed IDs
    const malformedPartners = partners?.filter(p =>
      p.id && (p.id.includes('undefined') || p.id.includes('NaN') || p.id.includes('null'))
    ) || [];

    const malformedWithdrawals = withdrawals?.filter(w =>
      w.id && (w.id.includes('undefined') || w.id.includes('NaN') || w.id.includes('null'))
    ) || [];

    const malformedInjections = cashInjections?.filter(ci =>
      ci.id && (ci.id.includes('undefined') || ci.id.includes('NaN') || ci.id.includes('null'))
    ) || [];

    const totalMalformed = malformedPartners.length + malformedWithdrawals.length + malformedInjections.length;

    if (totalMalformed === 0) {
      showSuccessMessage('No Issues Found', 'All IDs are properly formatted. No fixes needed.');
      return;
    }

    const confirmed = await showConfirmDialog(
      'Fix Malformed IDs',
      `Found ${totalMalformed} malformed IDs:\n• ${malformedPartners.length} partners\n• ${malformedWithdrawals.length} withdrawals\n• ${malformedInjections.length} cash injections\n\nDo you want to fix them?`,
      'warning'
    );

    if (!confirmed) return;

    setIsFixingIds(true);

    try {
      fixMalformedIds();
      showSuccessMessage(
        'IDs Fixed Successfully',
        `Fixed ${totalMalformed} malformed IDs. Please save your data to persist the changes.`
      );
    } catch (error) {
      console.error('Failed to fix IDs:', error);
      showErrorMessage('Fix Failed', 'Failed to fix malformed IDs. Please try again.');
    } finally {
      setIsFixingIds(false);
    }
  };

  // Import functionality
  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = await showConfirmDialog(
      'Import Data',
      'Are you sure you want to import this data? This will merge with your existing data and cannot be undone.',
      'warning'
    );

    if (!confirmed) {
      event.target.value = ''; // Reset file input
      return;
    }

    setIsImporting(true);

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      // Validate the imported data structure
      if (!importedData.products || !importedData.sales || !importedData.containers) {
        throw new Error('Invalid backup file format');
      }

      // Merge the data - we'll need to update IDs to avoid conflicts
      const currentMaxIds = {
        product: Math.max(0, ...products.map(p => typeof p.id === 'number' ? p.id : 0), metadata?.nextIds?.product || 1),
        container: Math.max(0, ...containers.map(c => {
          const numId = parseInt(c.id?.replace('C', '') || '0');
          return isNaN(numId) ? 0 : numId;
        }), metadata?.nextIds?.container || 1),
        sale: Math.max(0, ...sales.map(s => typeof s.id === 'number' ? s.id : 0), metadata?.nextIds?.sale || 1),
        expense: Math.max(0, ...expenses.map(e => typeof e.id === 'number' ? e.id : 0), metadata?.nextIds?.expense || 1),
        partner: Math.max(0, ...(partners || []).map(p => typeof p.id === 'number' ? p.id : 0), metadata?.nextIds?.partner || 1),
        withdrawal: Math.max(0, ...(withdrawals || []).map(w => typeof w.id === 'number' ? w.id : 0), metadata?.nextIds?.withdrawal || 1),
        cashInjection: Math.max(0, ...(cashInjections || []).map(ci => typeof ci.id === 'number' ? ci.id : 0), metadata?.nextIds?.cashInjection || 1)
      };

      // Create ID mappings for relational data
      const productIdMap = {};
      const containerIdMap = {};

      // Merge products with new IDs
      const mergedProducts = [...products];
      importedData.products?.forEach(product => {
        const newId = currentMaxIds.product + 1;
        productIdMap[product.id] = newId;
        currentMaxIds.product = newId;
        mergedProducts.push({ ...product, id: newId });
      });

      // Merge containers with new IDs
      const mergedContainers = [...containers];
      importedData.containers?.forEach(container => {
        const newId = `C${currentMaxIds.container + 1}`;
        containerIdMap[container.id] = newId;
        currentMaxIds.container++;

        // Update product references in container
        const updatedContainer = {
          ...container,
          id: newId,
          products: container.products?.map(p => ({
            ...p,
            productId: productIdMap[p.productId] || p.productId
          }))
        };
        mergedContainers.push(updatedContainer);
      });

      // Merge sales with new IDs and updated product references
      const mergedSales = [...sales];
      importedData.sales?.forEach(sale => {
        const newId = currentMaxIds.sale + 1;
        currentMaxIds.sale = newId;
        mergedSales.push({
          ...sale,
          id: newId,
          productId: productIdMap[sale.productId] || sale.productId
        });
      });

      // Merge expenses with new IDs
      const mergedExpenses = [...expenses];
      importedData.expenses?.forEach(expense => {
        const newId = currentMaxIds.expense + 1;
        currentMaxIds.expense = newId;
        mergedExpenses.push({ ...expense, id: newId });
      });

      // Merge other entities
      const mergedPartners = [...(partners || [])];
      importedData.partners?.forEach(partner => {
        const newId = currentMaxIds.partner + 1;
        currentMaxIds.partner = newId;
        mergedPartners.push({ ...partner, id: newId });
      });

      const mergedWithdrawals = [...(withdrawals || [])];
      importedData.withdrawals?.forEach(withdrawal => {
        const newId = currentMaxIds.withdrawal + 1;
        currentMaxIds.withdrawal = newId;
        mergedWithdrawals.push({ ...withdrawal, id: newId });
      });

      const mergedCashInjections = [...(cashInjections || [])];
      importedData.cashInjections?.forEach(injection => {
        const newId = currentMaxIds.cashInjection + 1;
        currentMaxIds.cashInjection = newId;
        mergedCashInjections.push({ ...injection, id: newId });
      });

      // Load the merged data
      const mergedData = {
        metadata: {
          ...metadata,
          nextIds: {
            product: currentMaxIds.product + 1,
            container: currentMaxIds.container + 1,
            sale: currentMaxIds.sale + 1,
            expense: currentMaxIds.expense + 1,
            partner: currentMaxIds.partner + 1,
            withdrawal: currentMaxIds.withdrawal + 1,
            cashInjection: currentMaxIds.cashInjection + 1,
            cashFlow: metadata?.nextIds?.cashFlow || 1
          },
          lastUpdated: new Date().toISOString()
        },
        containers: mergedContainers,
        products: mergedProducts,
        sales: mergedSales,
        expenses: mergedExpenses,
        partners: mergedPartners,
        withdrawals: mergedWithdrawals,
        cashInjections: mergedCashInjections,
        cashFlows: [] // Preserve any existing cash flows
      };

      loadData(mergedData);

      const importedCounts = {
        products: importedData.products?.length || 0,
        sales: importedData.sales?.length || 0,
        expenses: importedData.expenses?.length || 0,
        containers: importedData.containers?.length || 0
      };

      showSuccessMessage(
        'Import Successful',
        `Imported ${importedCounts.products} products, ${importedCounts.sales} sales, ${importedCounts.expenses} expenses, and ${importedCounts.containers} containers`
      );
    } catch (error) {
      console.error('Import failed:', error);
      showErrorMessage('Import Failed', error.message || 'Failed to import data. Please ensure the file is a valid backup.');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };
  
  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="sm:max-w-7xl sm:mx-auto sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ebebeb' }}>Settings</h2>
                <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
                  Configure your application settings and integrations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Data Management Section */}
            <div style={{ backgroundColor: '#2a2a2a', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderRadius: '8px', border: '1px solid #404040' }}>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #404040' }}>
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2" style={{ color: '#b3b3b3' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>Data Management</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#b3b3b3', marginTop: '4px' }}>
                  Backup your data or import from a previous backup
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Backup Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-6" style={{ borderBottom: '1px solid #404040' }}>
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <Shield className="h-5 w-5 text-green-500 mr-2" />
                      <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Backup Data</h4>
                    </div>
                    <p style={{ fontSize: '14px', color: '#b3b3b3' }}>
                      Download all your data as a JSON file for safekeeping
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#808080' }}>
                      <p>• Products: {products.length} items</p>
                      <p>• Sales: {sales.length} records</p>
                      <p>• Expenses: {expenses.length} records</p>
                      <p>• Containers: {containers.length} records</p>
                    </div>
                  </div>
                  <button
                    onClick={handleBackup}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Backup Now
                  </button>
                </div>

                {/* Fix IDs Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-6" style={{ borderBottom: '1px solid #404040' }}>
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <Wrench className="h-5 w-5 text-orange-500 mr-2" />
                      <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Fix Malformed IDs</h4>
                    </div>
                    <p style={{ fontSize: '14px', color: '#b3b3b3' }}>
                      Repair partner, withdrawal, and cash injection IDs that contain undefined or NaN
                    </p>
                    <div style={{ marginTop: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle style={{ height: '20px', width: '20px', color: '#3b82f6', marginRight: '12px' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#3b82f6' }}>Auto-Fix Available</p>
                        <p style={{ fontSize: '14px', color: '#2563eb' }}>
                          This will automatically fix IDs like "Pundefined", "WNaN", etc.
                        </p>
                        <p style={{ fontSize: '14px', color: '#2563eb' }}>
                          All relationships between entities will be preserved.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleFixIds}
                    disabled={isFixingIds}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFixingIds ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Wrench className="h-4 w-4 mr-2" />
                        Fix IDs
                      </>
                    )}
                  </button>
                </div>

                {/* Import Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <Upload className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Import Data</h4>
                    </div>
                    <p style={{ fontSize: '14px', color: '#b3b3b3' }}>
                      Import and merge data from a backup file
                    </p>
                    <div style={{ marginTop: '8px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center' }}>
                      <AlertTriangle style={{ height: '20px', width: '20px', color: '#f59e0b', marginRight: '12px' }} />
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#f59e0b' }}>Important:</p>
                        <p style={{ fontSize: '14px', color: '#d97706', marginTop: '4px' }}>
                          • Import will merge data with existing records
                        </p>
                        <p style={{ fontSize: '14px', color: '#d97706' }}>
                          • Duplicate IDs will be automatically reassigned
                        </p>
                        <p style={{ fontSize: '14px', color: '#d97706' }}>
                          • This action cannot be undone
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <FileJson className="h-4 w-4 mr-2" />
                          Choose File
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}