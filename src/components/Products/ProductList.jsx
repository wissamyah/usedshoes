import { Package, BarChart3, Pencil, Trash2, PackageX, AlertTriangle, TrendingUp } from 'lucide-react';

export default function ProductList({ products, containers, onEdit, onDelete, onViewMovement, onDestroy }) {
  const getStockStatusColor = (stock) => {
    if (stock === 0) return { color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' };
    if (stock <= 5) return { color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' };
    return { color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' };
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };


  return (
    <div style={{ backgroundColor: '#2a2a2a', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #404040', overflow: 'hidden' }}>
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead style={{ backgroundColor: '#333333' }}>
              <tr>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product
                </th>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </th>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stock (bags)
                </th>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cost/kg
                </th>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Avg. Selling Price
                </th>
                <th scope="col" style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: '500', color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Value
                </th>
                <th scope="col" style={{ position: 'relative', padding: '12px 24px' }}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: '#2a2a2a' }}>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: '1px solid #404040',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div style={{ height: '40px', width: '40px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package style={{ height: '24px', width: '24px', color: '#ebebeb', opacity: 0.7 }} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                          {product.name}
                        </div>
                        {product.description && (
                          <div style={{ fontSize: '14px', color: '#b3b3b3' }}>
                            {product.description.length > 50
                              ? `${product.description.substring(0, 50)}...`
                              : product.description
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{ padding: '4px 8px', display: 'inline-flex', fontSize: '12px', lineHeight: '20px', fontWeight: '600', borderRadius: '9999px', backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center">
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb', marginRight: '8px' }}>
                        {product.currentStock} bags
                      </span>
                      <span style={{ padding: '4px 8px', display: 'inline-flex', fontSize: '12px', lineHeight: '20px', fontWeight: '600', borderRadius: '9999px', ...getStockStatusColor(product.currentStock) }}>
                        {getStockStatusText(product.currentStock)}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', color: '#ebebeb' }}>
                    {formatCurrency(product.costPerKg || product.costPerUnit)}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    {product.avgSellingPrice ? (
                      <div className="flex items-center">
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                          {formatCurrency(product.avgSellingPrice)}
                        </span>
                        {product.avgSellingPrice > (product.costPerKg || product.costPerUnit || 0) ? (
                          <TrendingUp style={{ height: '16px', width: '16px', color: '#22c55e', marginLeft: '4px' }} />
                        ) : (
                          <TrendingUp style={{ height: '16px', width: '16px', color: '#ef4444', marginLeft: '4px', transform: 'rotate(180deg)' }} />
                        )}
                        {product.totalSold > 0 && (
                          <span style={{ fontSize: '12px', color: '#808080', marginLeft: '8px' }}>
                            ({product.totalSold} sold)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '14px', color: '#808080', fontStyle: 'italic' }}>No sales yet</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                    {formatCurrency(product.currentStock * (product.bagWeight || 25) * (product.costPerKg || product.costPerUnit || 0))}
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', textAlign: 'right', fontSize: '14px', fontWeight: '500' }}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewMovement(product)}
                        style={{
                          color: '#22c55e',
                          padding: '4px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                          e.target.style.color = '#16a34a';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#22c55e';
                        }}
                        title="View product movement"
                      >
                        <BarChart3 style={{ height: '16px', width: '16px' }} />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        style={{
                          color: '#3b82f6',
                          padding: '4px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                          e.target.style.color = '#2563eb';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#3b82f6';
                        }}
                        title="Edit product"
                      >
                        <Pencil style={{ height: '16px', width: '16px' }} />
                      </button>
                      {product.currentStock > 0 && (
                        <button
                          onClick={() => onDestroy(product)}
                          style={{
                            color: '#f59e0b',
                            padding: '4px',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
                            e.target.style.color = '#d97706';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#f59e0b';
                          }}
                          title="Destroy/damage product"
                        >
                          <AlertTriangle style={{ height: '16px', width: '16px' }} />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(product.id)}
                        style={{
                          color: '#ef4444',
                          padding: '4px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                          e.target.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#ef4444';
                        }}
                        title="Delete product"
                      >
                        <Trash2 style={{ height: '16px', width: '16px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <PackageX style={{ margin: '0 auto', height: '48px', width: '48px', color: '#808080' }} />
            <h3 style={{ marginTop: '8px', fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>No products</h3>
            <p style={{ marginTop: '4px', fontSize: '14px', color: '#b3b3b3' }}>
              No products match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}