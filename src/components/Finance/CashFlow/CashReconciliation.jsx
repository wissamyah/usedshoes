import { useState } from 'react';
import { X } from 'lucide-react';
import Modal from '../../UI/Modal';

export default function CashReconciliation({ expectedBalance, onReconcile, onClose }) {
  const [actualCount, setActualCount] = useState(expectedBalance.toString());
  const [notes, setNotes] = useState('');
  const minReserve = 2000;
  
  const discrepancy = parseFloat(actualCount || 0) - expectedBalance;
  const availableForDistribution = Math.max(0, parseFloat(actualCount || 0) - minReserve);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onReconcile({
      actualCount: parseFloat(actualCount),
      availableForDistribution,
      reservedAmount: minReserve,
      notes: notes.trim()
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} size="medium">
      <div style={{
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #404040'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#ebebeb'
          }}>Daily Cash Reconciliation</h3>
          <button
            onClick={onClose}
            style={{
              color: '#b3b3b3',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
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
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Expected Balance
            </label>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#10b981'
            }}>{formatCurrency(expectedBalance)}</p>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Actual Count *
            </label>
            <input
              type="number"
              value={actualCount}
              onChange={(e) => setActualCount(e.target.value)}
              step="0.01"
              required
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                border: '1px solid #404040',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {discrepancy !== 0 && (
            <div style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: discrepancy > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${discrepancy > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: discrepancy > 0 ? '#22c55e' : '#ef4444'
              }}>
                Discrepancy: {formatCurrency(discrepancy)}
              </p>
            </div>
          )}

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ebebeb',
              marginBottom: '8px'
            }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                backgroundColor: '#1c1c1c',
                color: '#ebebeb',
                border: '1px solid #404040',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#60a5fa';
                e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#404040';
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Add any notes about the reconciliation..."
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid #404040',
            marginTop: '8px'
          }}>
            <button
              type="button"
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
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.target.style.color = '#ebebeb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#b3b3b3';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
            >
              Reconcile
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}