import { useState } from 'react';
import { X, Pencil, Package, Weight, DollarSign, Calculator, Truck, Calendar, FileText, BarChart3, TrendingUp, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import Modal from '../UI/Modal';
import StatCard from '../UI/StatCard';

export default function ContainerDetails({ container, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate container totals
  const totalBags = container.products?.reduce((sum, p) => sum + (p.bagQuantity || 0), 0) || 0;
  const totalKg = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.bagWeight || 25)), 0) || 0;
  const productsCost = container.products?.reduce((sum, p) => sum + ((p.bagQuantity || 0) * (p.costPerKg || 0) * (p.bagWeight || 25)), 0) || 0;
  const shippingCost = parseFloat(container.shippingCost) || 0;
  const customsCost = parseFloat(container.customsCost) || 0;
  const totalCost = productsCost + shippingCost + customsCost;
  const uniqueProducts = container.products?.length || 0;

  // Calculate container status
  const getContainerStatus = () => {
    if (totalCost === 0) return { status: 'Draft', color: 'gray', bg: 'bg-gray-100' };
    if (container.arrivalDate) return { status: 'Arrived', color: 'green', bg: 'bg-green-100' };
    if (container.shippingDate) return { status: 'In Transit', color: 'blue', bg: 'bg-blue-100' };
    return { status: 'Ordered', color: 'yellow', bg: 'bg-yellow-100' };
  };

  const containerStatus = getContainerStatus();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <tab.icon className="h-4 w-4" />
      <span className="hidden sm:block">{tab.label}</span>
      <span className="sm:hidden">{tab.label.charAt(0)}</span>
    </button>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Status and Key Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">Container {container.id}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${containerStatus.bg} text-${containerStatus.color}-800`}>
                {containerStatus.status}
              </span>
            </div>
            <p className="text-gray-600 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {container.supplier}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Investment</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Products"
          value={`${uniqueProducts}`}
          subtitle="Different items"
          icon={Package}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Bags"
          value={`${totalBags}`}
          subtitle="Quantity imported"
          icon={Weight}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Total Weight"
          value={`${(totalKg / 1000).toFixed(1)}t`}
          subtitle={`${totalKg.toLocaleString()} kg`}
          icon={Truck}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Cost per Kg"
          value={totalKg > 0 ? formatCurrency(totalCost / totalKg) : '$0'}
          subtitle="Landed cost"
          icon={TrendingUp}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Container Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Container Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Supplier</label>
              <p className="text-gray-900 font-semibold">{container.supplier}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Purchase Date</label>
              <p className="text-gray-900">{formatDate(container.purchaseDate)}</p>
            </div>
          </div>
          <div className="space-y-4">
            {container.invoiceNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Invoice Number</label>
                <p className="text-gray-900 font-mono">{container.invoiceNumber}</p>
              </div>
            )}
            {container.arrivalDate && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Arrival Date</label>
                <p className="text-gray-900">{formatDate(container.arrivalDate)}</p>
              </div>
            )}
          </div>
        </div>

        {container.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
            <p className="text-gray-700 leading-relaxed">{container.description}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Products in Container</h4>
        <span className="text-sm text-gray-500">{uniqueProducts} products • {totalBags} bags</span>
      </div>

      {container.products && container.products.length > 0 ? (
        <div className="space-y-4">
          {container.products.map((product, index) => {
            const productTotalKg = (product.bagQuantity || 0) * (product.bagWeight || 25);
            const productTotalCost = (product.bagQuantity || 0) * (product.costPerKg || 0) * (product.bagWeight || 25);
            const landedCostPerBag = ((product.costPerKg || 0) * (product.bagWeight || 25)) + (totalBags > 0 ? (shippingCost + customsCost) / totalBags : 0);

            return (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h5 className="text-xl font-semibold text-gray-900 mb-2 sm:mb-0">{product.productName}</h5>
                      <span className="text-2xl font-bold text-green-600">{formatCurrency(productTotalCost)}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Quantity</p>
                        <p className="text-lg font-bold text-blue-900">{product.bagQuantity}</p>
                        <p className="text-xs text-blue-600">bags</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Weight</p>
                        <p className="text-lg font-bold text-green-900">{productTotalKg} kg</p>
                        <p className="text-xs text-green-600">{product.bagWeight}kg/bag</p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Cost/Kg</p>
                        <p className="text-lg font-bold text-purple-900">{formatCurrency(product.costPerKg)}</p>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-600 font-medium uppercase tracking-wide">Cost/Bag</p>
                        <p className="text-lg font-bold text-orange-900">{formatCurrency((product.costPerKg || 0) * (product.bagWeight || 25))}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 col-span-2 lg:col-span-1">
                        <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">Landed/Bag</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(landedCostPerBag)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500">This container doesn't have any products assigned yet.</p>
        </div>
      )}
    </div>
  );

  const renderCostsTab = () => (
    <div className="space-y-6">
      {/* Cost Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Cost Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Products Cost</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(productsCost)}</p>
            <p className="text-xs text-gray-500">{((productsCost/totalCost)*100).toFixed(1)}% of total</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Shipping & Customs</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(shippingCost + customsCost)}</p>
            <p className="text-xs text-gray-500">{(((shippingCost + customsCost)/totalCost)*100).toFixed(1)}% of total</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Investment</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCost)}</p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Detailed Cost Breakdown</h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">Products Total</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{formatCurrency(productsCost)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-gray-700">Shipping Cost</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{formatCurrency(shippingCost)}</span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-gray-700">Customs/Clearing Cost</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{formatCurrency(customsCost)}</span>
          </div>

          <div className="flex justify-between items-center py-4 bg-gray-50 -mx-6 px-6 rounded-lg">
            <span className="text-lg font-bold text-gray-900">Total Container Cost</span>
            <span className="text-2xl font-bold text-green-600">{formatCurrency(totalCost)}</span>
          </div>
        </div>

        {totalKg > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h5 className="text-md font-semibold text-gray-900 mb-4">Unit Cost Analysis</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Average Landed Cost per Kg</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCost / totalKg)}</p>
              </div>
              {totalBags > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Average Landed Cost per Bag</p>
                  <p className="text-xl font-bold text-green-900">{formatCurrency(totalCost / totalBags)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Container Timeline</h4>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-8">
          {/* Purchase Date */}
          <div className="relative flex items-start">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full ring-4 ring-white z-10">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-6 min-w-0 flex-1">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="font-semibold text-gray-900">Container Ordered</h5>
                <p className="text-sm text-gray-600 mt-1">{formatDate(container.purchaseDate)}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Container ordered from {container.supplier}
                  {container.invoiceNumber && ` with invoice #${container.invoiceNumber}`}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Date */}
          {container.shippingDate && (
            <div className="relative flex items-start">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full ring-4 ring-white z-10">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-6 min-w-0 flex-1">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-900">Shipping Started</h5>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(container.shippingDate)}</p>
                  <p className="text-sm text-gray-500 mt-2">Container departed and is in transit</p>
                </div>
              </div>
            </div>
          )}

          {/* Arrival Date */}
          {container.arrivalDate && (
            <div className="relative flex items-start">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full ring-4 ring-white z-10">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-6 min-w-0 flex-1">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-gray-900">Container Arrived</h5>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(container.arrivalDate)}</p>
                  <p className="text-sm text-gray-500 mt-2">Container successfully arrived at destination</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="relative flex items-start">
            <div className={`flex items-center justify-center w-16 h-16 ${containerStatus.bg} rounded-full ring-4 ring-white z-10`}>
              <FileText className={`w-6 h-6 text-${containerStatus.color}-600`} />
            </div>
            <div className="ml-6 min-w-0 flex-1">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="font-semibold text-gray-900">Current Status</h5>
                <p className={`text-sm text-${containerStatus.color}-600 font-medium mt-1`}>{containerStatus.status}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Total investment: {formatCurrency(totalCost)} • {totalBags} bags • {uniqueProducts} products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'products':
        return renderProductsTab();
      case 'costs':
        return renderCostsTab();
      case 'timeline':
        return renderTimelineTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="large">
      <div className="bg-gray-50 min-h-[80vh] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Container Details</h2>
            <p className="text-sm text-gray-500 mt-1">{container.supplier} • {formatDate(container.purchaseDate)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              title="Edit container"
            >
              <Pencil className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Container
          </button>
        </div>
      </div>
    </Modal>
  );
}