import { DollarSign, BarChart3, Package, TrendingUp } from 'lucide-react';
import StatCard from '../UI/StatCard';

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
      <StatCard
        title="Today's Sales"
        value={formatCurrency(todaysRevenue)}
        subtitle="Revenue today"
        icon={DollarSign}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
        trend={todaysRevenue > 0 ? 'up' : null}
      />

      <StatCard
        title="This Month"
        value={formatCurrency(monthlyRevenue)}
        subtitle="Monthly revenue"
        icon={BarChart3}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatCard
        title="Inventory Value"
        value={formatCurrency(inventoryValue)}
        subtitle="Total stock value"
        icon={Package}
        iconBgColor="bg-purple-100"
        iconColor="text-purple-600"
      />

      <StatCard
        title="Net Profit"
        value={formatCurrency(netProfit)}
        subtitle="This month"
        icon={TrendingUp}
        iconBgColor={netProfit >= 0 ? "bg-green-100" : "bg-red-100"}
        iconColor={netProfit >= 0 ? "text-green-600" : "text-red-600"}
        trend={netProfit > 0 ? 'up' : netProfit < 0 ? 'down' : null}
      />
    </div>
  );
}