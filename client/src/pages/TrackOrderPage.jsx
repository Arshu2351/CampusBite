// Order Tracking Page
// Full Stack Concept: URL search params, TanStack Query dynamic fetching, and visual state rendering

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Clock, ChefHat, CheckCircle2, PackageCheck, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { orderService } from '../services/orderService';
import StatusBadge from '../components/StatusBadge';

const steps = [
  { key: 'PLACED', title: '1. Order Placed', desc: 'Received at canteen', icon: Clock },
  { key: 'PREPARING', title: '2. Preparing', desc: 'Cooking in kitchen', icon: ChefHat },
  { key: 'READY', title: '3. Ready for Pickup', desc: 'Waiting at counter', icon: CheckCircle2 },
  { key: 'COLLECTED', title: '4. Collected', desc: 'Delivered to student', icon: PackageCheck }
];

export default function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [activeOrderId, setActiveOrderId] = useState(initialId ? parseInt(initialId, 10) : null);

  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      setOrderIdInput(idParam);
      setActiveOrderId(parseInt(idParam, 10));
    }
  }, [searchParams]);

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['order', activeOrderId],
    queryFn: () => orderService.getById(activeOrderId),
    enabled: Boolean(activeOrderId && !isNaN(activeOrderId)),
    retry: 1
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const parsed = parseInt(orderIdInput.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setActiveOrderId(parsed);
      setSearchParams({ id: parsed.toString() });
    }
  };

  const getStepProgressIndex = (status) => {
    switch (status) {
      case 'PLACED': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 2;
      case 'COLLECTED': return 3;
      default: return -1;
    }
  };

  const currentStepIdx = order ? getStepProgressIndex(order.status) : -1;
  const isCancelled = order?.status === 'CANCELLED';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 className="page-title">Live Order Status Tracker</h1>
        <p className="page-subtitle">
          Enter your order token number below to track kitchen preparation and pickup readiness in real-time.
        </p>
      </div>

      {/* Order ID Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', maxWidth: '500px', margin: '0 auto 32px auto' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} className="search-icon" />
          <input
            type="number"
            className="form-input search-input"
            placeholder="Enter Order ID (e.g. 1)"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            required
            min="1"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Track Order
        </button>
      </form>

      {/* Loading indicator */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Loader2 size={32} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
          <p>Looking up order details in the database...</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Lookup Failed: </strong>
            <span>{error?.message || `Order #${activeOrderId} does not exist.`}</span>
          </div>
        </div>
      )}

      {/* Tracking Card */}
      {order && !isLoading && (
        <div className="tracker-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                  Order #{order.id}
                </h2>
                <StatusBadge status={order.status} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Ordered on: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Pickup Window: <strong>{order.pickupTime}</strong>
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh status from server"
            >
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              <span>{isFetching ? 'Checking...' : 'Refresh Status'}</span>
            </button>
          </div>

          {/* Cancelled Banner */}
          {isCancelled ? (
            <div className="alert-box alert-danger" style={{ margin: '24px 0' }}>
              <AlertCircle size={20} />
              <div>
                <strong>Order Cancelled:</strong> This order was cancelled by the canteen staff. Please visit the counter if you have questions.
              </div>
            </div>
          ) : (
            /* Visual Progress Stepper */
            <div style={{ margin: '32px 0' }}>
              <div className="stepper">
                {/* Horizontal connection line */}
                <div className="stepper-line"></div>
                <div
                  className="stepper-line-active"
                  style={{
                    width: currentStepIdx >= 0 ? `${(currentStepIdx / (steps.length - 1)) * 100}%` : '0%'
                  }}
                ></div>

                {steps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="step-item">
                      <div className={`step-circle ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div className={`step-title ${isCurrent ? 'active' : ''}`}>
                          {step.title}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student & Item Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                Student Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Name: </span><strong>{order.studentName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>ID / Roll No: </span><strong>{order.studentId}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Pickup Slot: </span><strong>{order.pickupTime}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Payment Mode: </span><span>Pay at Counter</span></div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                Items Ordered
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {order.orderItems?.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.quantity}× {item.menuItem?.name}</span>
                    <span style={{ fontWeight: '500' }}>₹{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px', fontWeight: '700', fontSize: '1rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>₹{Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
