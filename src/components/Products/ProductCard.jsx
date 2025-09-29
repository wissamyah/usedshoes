import { formatDate } from '../../utils/dateFormatter';

export default function ProductCard({ product, onEdit, onDelete, onViewMovement, onDestroy }) {
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

  const totalValue = product.currentStock * (product.bagWeight || 25) * (product.costPerKg || product.costPerUnit || 0);

  return (
    <div style={{
      backgroundColor: '#2a2a2a',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #404040',
      overflow: 'hidden',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-12 w-12">
              <div style={{ height: '48px', width: '48px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ height: '28px', width: '28px', color: '#ebebeb', opacity: 0.7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ebebeb', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#b3b3b3' }}>
                ID: {product.id}
              </p>
            </div>
          </div>
          
          {/* Actions */}
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
              <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
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
              <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {product.currentStock > 0 && onDestroy && (
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
                <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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
              <svg style={{ height: '16px', width: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2 mb-4">
          <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', backgroundColor: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
            {product.category}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p style={{ fontSize: '14px', color: '#b3b3b3', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        )}

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>Stock Level</p>
            <div className="flex items-center space-x-2 mt-1">
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#ebebeb' }}>
                {product.currentStock} bags
              </span>
              <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: '600', borderRadius: '9999px', ...getStockStatusColor(product.currentStock) }}>
                {getStockStatusText(product.currentStock)}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Cost/kg</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>
              {formatCurrency(product.costPerUnit)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Total Value</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>
        
        {/* Average Selling Price */}
        {product.avgSellingPrice !== undefined && (
          <div style={{ borderTop: '1px solid #404040', paddingTop: '12px', marginBottom: '12px' }}>
            <div className="flex items-center justify-between">
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#b3b3b3' }}>Avg. Selling Price</p>
              {product.avgSellingPrice ? (
                <div className="flex items-center space-x-2">
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#ebebeb' }}>
                    {formatCurrency(product.avgSellingPrice)}
                  </p>
                  <span style={{ fontSize: '12px', color: '#808080' }}>
                    ({product.totalSold} sold)
                  </span>
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#808080', fontStyle: 'italic' }}>No sales yet</p>
              )}
            </div>
          </div>
        )}

        {/* Creation Date */}
        {product.createdAt && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #404040' }}>
            <p style={{ fontSize: '12px', color: '#808080' }}>
              Added {formatDate(product.createdAt)}
            </p>
          </div>
        )}
      </div>

      {/* Stock Alert Footer */}
      {product.currentStock <= 5 && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: product.currentStock === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          borderTop: '1px solid #404040'
        }}>
          <div className="flex items-center">
            <svg
              style={{
                height: '16px',
                width: '16px',
                marginRight: '8px',
                color: product.currentStock === 0 ? '#ef4444' : '#f59e0b'
              }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: product.currentStock === 0 ? '#ef4444' : '#f59e0b'
            }}>
              {product.currentStock === 0 ? 'Out of stock - reorder needed' : 'Low stock - consider reordering'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}