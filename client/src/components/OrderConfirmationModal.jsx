// Order Confirmation Modal Component
// Shows generated Order ID, total amount, pickup details, and link to track

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Search, ArrowRight, X } from 'lucide-react';

export default function OrderConfirmationModal({ order, isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen || !order) return null;

  const handleTrackOrder = () => {
    onClose();
    navigate(`/track?id=${order.id}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', padding: '32px 24px 20px 24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Pre-Order Placed Successfully!</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Your order has been transmitted directly to the kitchen counter.
          </p>
        </div>

        <div className="modal-body" style={{ paddingTop: '0' }}>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '12px',
              marginBottom: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  YOUR ORDER TOKEN
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                  #{order.id}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                  TOTAL TO PAY
                </span>
                <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  ₹{Number(order.totalAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Name:</span>
                <span style={{ fontWeight: '500' }}>{order.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Student Roll ID:</span>
                <span style={{ fontWeight: '500' }}>{order.studentId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pickup Time:</span>
                <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{order.pickupTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Items Count:</span>
                <span>{order.orderItems?.length || 0} items</span>
              </div>
            </div>
          </div>

          <div className="alert-box alert-success" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
            <span>
              💡 <strong>Next Step:</strong> Save your Order ID <strong>#{order.id}</strong>. Head over to the canteen counter at your scheduled pickup time and pay <strong>₹{Number(order.totalAmount).toFixed(2)}</strong> to collect your food.
            </span>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close & Order More
          </button>
          <button className="btn btn-primary" onClick={handleTrackOrder}>
            <Search size={16} />
            <span>Track Live Status</span>
          </button>
        </div>
      </div>
    </div>
  );
}
