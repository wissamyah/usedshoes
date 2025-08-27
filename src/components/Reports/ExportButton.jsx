import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useUI } from '../../context/UIContext';

export default function ExportButton({ dateRange, activeReport }) {
  const { sales, expenses, products, containers } = useData();
  const { showSuccessMessage, showErrorMessage } = useUI();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // For now, we'll create a simple CSV export
      // In a real implementation, we'd use a library like xlsx for Excel export
      let csvContent = '';
      let filename = '';

      switch (activeReport) {
        case 'profitLoss':
          csvContent = generateProfitLossCSV();
          filename = `profit-loss-${formatDateForFilename()}.csv`;
          break;
        case 'sales':
          csvContent = generateSalesCSV();
          filename = `sales-report-${formatDateForFilename()}.csv`;
          break;
        case 'expenses':
          csvContent = generateExpensesCSV();
          filename = `expenses-report-${formatDateForFilename()}.csv`;
          break;
        default:
          csvContent = generateProfitLossCSV();
          filename = `business-report-${formatDateForFilename()}.csv`;
      }

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      showSuccessMessage('Export Successful', `${filename} has been downloaded`);
    } catch (error) {
      console.error('Export error:', error);
      showErrorMessage('Export Failed', 'Failed to export report data');
    } finally {
      setIsExporting(false);
    }
  };

  const formatDateForFilename = () => {
    if (dateRange.startDate && dateRange.endDate) {
      if (dateRange.startDate === dateRange.endDate) {
        return dateRange.startDate;
      }
      return `${dateRange.startDate}_to_${dateRange.endDate}`;
    }
    if (dateRange.startDate) return `from_${dateRange.startDate}`;
    if (dateRange.endDate) return `until_${dateRange.endDate}`;
    return new Date().toISOString().split('T')[0];
  };

  const filterDataByDateRange = (data) => {
    if (!dateRange.startDate && !dateRange.endDate) return data;
    
    return data.filter(item => {
      const itemDate = item.date;
      if (!itemDate) return false;
      
      const matchesStart = !dateRange.startDate || itemDate >= dateRange.startDate;
      const matchesEnd = !dateRange.endDate || itemDate <= dateRange.endDate;
      
      return matchesStart && matchesEnd;
    });
  };

  const generateProfitLossCSV = () => {
    const filteredSales = filterDataByDateRange(sales);
    const filteredExpenses = filterDataByDateRange(expenses);

    // Calculate totals
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const totalCOGS = filteredSales.reduce((sum, sale) => sum + ((sale.costPerUnit || 0) * (sale.quantity || 0)), 0);
    const grossProfit = totalRevenue - totalCOGS;
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const netProfit = grossProfit - totalExpenses;

    const csv = [
      'Profit & Loss Statement',
      `Period: ${dateRange.startDate || 'Beginning'} to ${dateRange.endDate || 'Present'}`,
      '',
      'Category,Amount',
      `Revenue,$${totalRevenue.toFixed(2)}`,
      `Cost of Goods Sold,-$${totalCOGS.toFixed(2)}`,
      `Gross Profit,$${grossProfit.toFixed(2)}`,
      `Operating Expenses,-$${totalExpenses.toFixed(2)}`,
      `Net Profit,$${netProfit.toFixed(2)}`,
      '',
      'Sales Summary',
      'Date,Product,Quantity,Price per Unit,Total,Profit',
      ...filteredSales.map(sale => 
        `${sale.date},${sale.productName},${sale.quantity},$${(sale.pricePerUnit || 0).toFixed(2)},$${(sale.totalAmount || 0).toFixed(2)},$${(sale.profit || 0).toFixed(2)}`
      ),
      '',
      'Expenses Summary',
      'Date,Category,Description,Amount',
      ...filteredExpenses.map(expense =>
        `${expense.date},${expense.category},${expense.description},$${(expense.amount || 0).toFixed(2)}`
      )
    ].join('\n');

    return csv;
  };

  const generateSalesCSV = () => {
    const filteredSales = filterDataByDateRange(sales);
    
    const csv = [
      'Sales Report',
      `Period: ${dateRange.startDate || 'Beginning'} to ${dateRange.endDate || 'Present'}`,
      '',
      'Date,Time,Product,Category,Quantity,Price per Unit,Total Amount,Cost per Unit,Profit,Notes',
      ...filteredSales.map(sale =>
        `${sale.date},${sale.time || ''},${sale.productName},,${sale.quantity},$${(sale.pricePerUnit || 0).toFixed(2)},$${(sale.totalAmount || 0).toFixed(2)},$${(sale.costPerUnit || 0).toFixed(2)},$${(sale.profit || 0).toFixed(2)},"${sale.notes || ''}"`
      )
    ].join('\n');

    return csv;
  };

  const generateExpensesCSV = () => {
    const filteredExpenses = filterDataByDateRange(expenses);
    
    const csv = [
      'Expenses Report',
      `Period: ${dateRange.startDate || 'Beginning'} to ${dateRange.endDate || 'Present'}`,
      '',
      'Date,Category,Description,Amount,Container ID,Notes',
      ...filteredExpenses.map(expense =>
        `${expense.date},${expense.category},${expense.description},$${(expense.amount || 0).toFixed(2)},${expense.containerId || ''},"${expense.notes || ''}"`
      )
    ].join('\n');

    return csv;
  };

  const reportNames = {
    profitLoss: 'P&L Report',
    sales: 'Sales Report',
    expenses: 'Expenses Report'
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export {reportNames[activeReport] || 'Report'}
        </>
      )}
    </button>
  );
}