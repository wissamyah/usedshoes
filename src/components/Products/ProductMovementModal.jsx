import { useMemo } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateFormatter';
import Modal from '../UI/Modal';

export default function ProductMovementModal({ product, onClose }) {
  const { containers, sales } = useData();

  // Calculate product movements
  const movements = useMemo(() => {
    if (!product) return [];

    const movementList = [];

    // Add container purchases (IN)
    containers.forEach(container => {
      if (container.products) {
        const containerProduct = container.products.find(p => 
          p.productId == product.id || 
          p.productId === parseInt(product.id) || 
          p.productId === product.id.toString()
        );
        
        if (containerProduct) {
          movementList.push({
            date: container.purchaseDate || container.createdAt,
            type: 'IN',
            description: `Container Purchase - ${container.id}`,
            supplier: container.supplier,
            quantity: containerProduct.bagQuantity,
            costPerKg: containerProduct.costPerKg,
            bagWeight: containerProduct.bagWeight || 25,
            reference: container.id
          });
        }
      }
    });

    // Add sales (OUT) - when sales are implemented
    sales.forEach(sale => {
      if (sale.productId == product.id || 
          sale.productId === parseInt(product.id) || 
          sale.productId === product.id.toString()) {
        movementList.push({
          date: sale.saleDate || sale.createdAt,
          type: 'OUT',
          description: 'Product Sale',
          supplier: sale.customerName || 'Customer',
          quantity: -sale.quantity, // negative for outgoing
          costPerKg: sale.pricePerUnit || sale.pricePerKg,
          bagWeight: product.bagWeight || 25,
          reference: sale.id
        });
      }
    });

    // Sort by date (newest first)
    return movementList.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [product, containers, sales]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };


  const runningBalance = useMemo(() => {
    let balance = 0;
    return movements.map(movement => {
      balance += movement.quantity;
      return { ...movement, balance };
    }).reverse(); // Show oldest first for running balance calculation
  }, [movements]);

  return (
    <Modal isOpen={true} onClose={onClose} size="xlarge">
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        maxHeight: '80vh',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#404040 #2a2a2a'
      }}>
        <style dangerouslySetInnerHTML={{
          __html: `
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar {
              width: 8px;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-track {
              background: #2a2a2a;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-thumb {
              background: #404040;
              border-radius: 4px;
            }
            div[style*="maxHeight: 80vh"]::-webkit-scrollbar-thumb:hover {
              background: #505050;
            }
          `
        }} />
        <div style={{ marginTop: '12px' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#ebebeb'
              }}>
                Product Movement History
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#b3b3b3',
                marginTop: '4px'
              }}>
                {product.name} - Current Stock: {product.currentStock} bags
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: '#b3b3b3',
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#ebebeb';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#b3b3b3';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8" style={{ color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#22c55e' }}>Total Purchased</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>
                    {runningBalance.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0)} bags
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#ef4444' }}>Total Sold</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>
                    {Math.abs(runningBalance.filter(m => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0))} bags
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(96, 165, 250, 0.1)',
              border: '1px solid rgba(96, 165, 250, 0.2)',
              borderRadius: '8px',
              padding: '16px'
            }}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8" style={{ color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#60a5fa' }}>Movements</p>
                  <p style={{ fontSize: '24px', fontWeight: '600', color: '#ebebeb' }}>
                    {movements.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Movements Table */}
          {movements.length > 0 ? (
            <div style={{
              backgroundColor: '#333333',
              border: '1px solid #404040',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead style={{ backgroundColor: '#404040' }}>
                    <tr>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Date
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Type
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Description
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Quantity
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Cost/Kg
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Total Value
                      </th>
                      <th scope="col" style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#b3b3b3',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid #404040'
                      }}>
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: '#333333' }}>
                    {movements.map((movement, index) => (
                      <tr key={index} style={{
                        backgroundColor: movement.type === 'OUT'
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(34, 197, 94, 0.1)',
                        borderBottom: index < movements.length - 1 ? '1px solid #404040' : 'none'
                      }}>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          color: '#ebebeb'
                        }}>
                          {formatDate(movement.date)}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{
                            padding: '4px 8px',
                            display: 'inline-flex',
                            fontSize: '12px',
                            lineHeight: '16px',
                            fontWeight: '600',
                            borderRadius: '9999px',
                            backgroundColor: movement.type === 'IN'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                            color: movement.type === 'IN'
                              ? '#22c55e'
                              : '#ef4444'
                          }}>
                            {movement.type}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ fontSize: '14px', color: '#ebebeb' }}>{movement.description}</div>
                          <div style={{ fontSize: '14px', color: '#b3b3b3' }}>{movement.supplier}</div>
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#ebebeb' }}>
                            {movement.type === 'IN' ? '+' : ''}{movement.quantity} bags
                          </div>
                          <div style={{ fontSize: '12px', color: '#b3b3b3' }}>
                            ({Math.abs(movement.quantity) * movement.bagWeight}kg)
                          </div>
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          color: '#ebebeb'
                        }}>
                          {formatCurrency(movement.costPerKg)}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ebebeb'
                        }}>
                          {formatCurrency(Math.abs(movement.quantity) * movement.bagWeight * movement.costPerKg)}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          color: '#60a5fa'
                        }}>
                          {movement.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              backgroundColor: '#333333',
              border: '1px solid #404040',
              borderRadius: '8px'
            }}>
              <div className="mx-auto h-12 w-12" style={{ color: '#808080' }}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 20h6" />
                </svg>
              </div>
              <h3 style={{
                marginTop: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ebebeb'
              }}>No movements found</h3>
              <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#b3b3b3'
              }}>
                This product has no purchase or sales history yet.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end" style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #404040'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#b3b3b3',
                backgroundColor: 'transparent',
                border: '1px solid #404040',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = '#60a5fa';
                e.target.style.color = '#ebebeb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#404040';
                e.target.style.color = '#b3b3b3';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}