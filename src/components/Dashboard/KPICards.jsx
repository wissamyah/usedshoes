import { DollarSign, BarChart3, Package, TrendingUp } from 'lucide-react';

export default function KPICards({ todaysRevenue, monthlyRevenue, inventoryValue, netProfit }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const kpiData = [
    {
      title: "Today's Sales",
      value: formatCurrency(todaysRevenue),
      description: "Revenue today",
      icon: DollarSign,
      color: "green",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      iconColor: "text-green-600"
    },
    {
      title: "This Month",
      value: formatCurrency(monthlyRevenue),
      description: "Monthly revenue",
      icon: BarChart3,
      color: "blue", 
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconColor: "text-blue-600"
    },
    {
      title: "Inventory Value",
      value: formatCurrency(inventoryValue),
      description: "Total stock value",
      icon: Package,
      color: "purple",
      bgColor: "bg-purple-50", 
      textColor: "text-purple-600",
      iconColor: "text-purple-600"
    },
    {
      title: "Net Profit",
      value: formatCurrency(netProfit),
      description: "This month",
      icon: TrendingUp,
      color: netProfit >= 0 ? "emerald" : "red",
      bgColor: netProfit >= 0 ? "bg-emerald-50" : "bg-red-50",
      textColor: netProfit >= 0 ? "text-emerald-600" : "text-red-600",
      iconColor: netProfit >= 0 ? "text-emerald-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-6 w-6 ${kpi.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {kpi.description}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900 break-words">{kpi.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}