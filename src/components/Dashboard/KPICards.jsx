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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon;
        
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`h-8 w-8 ${kpi.iconColor}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-sm text-gray-600">{kpi.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}