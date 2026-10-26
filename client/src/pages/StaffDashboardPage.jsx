// Staff Dashboard Page
// Backend & Full Stack Concept: Staff Order Management, State Machine Transitions, TanStack Query mutations

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  Clock,
  ChefHat,
  CheckCircle2,
  PackageCheck,
  XCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ArrowRight
} from 'lucide-react';
import { orderService } from '../services/orderService';
import StatusBadge from '../components/StatusBadge';

export default function StaffDashboardPage() {
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [actionError, setActionError] = useState(null);
  const queryClient = useQueryClient();

  // 1. Fetch Orders with status filter
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    error: ordersErr,
    refetch: refetchOrders,
    isFetching: ordersFetching
  } = useQuery({
    queryKey: ['orders', selectedStatusTab],
    queryFn: () => orderService.getAll(selectedStatusTab),
    refetchInterval: 10000 // auto refresh every 10s for real canteen kitchen operations!
  });

  // 2. Fetch Aggregated Statistics
  const {
    data: stats = { total: 0, pending: 0, ready: 0, collected: 0, cancelled: 0 },
    refetch: refetchStats
  } = useQuery({
    queryKey: ['orderStats'],
    queryFn: () => orderService.getStats(),
    refetchInterval: 10000
  });

  // 3. Mutation for Updating Order Status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
    },
    onError: (error) => {
      setActionError(error.message || 'Failed to update order status.');
    }
  });

  const handleUpdateStatus = (orderId, newStatus) => {
    setActionError(null);
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const refreshAll = () => {
    refetchOrders();
    refetchStats();
  };

  return (
    <div>
      {/* Demonstration-Only Staff Interface Banner */}
      <div className="demo-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', backgroundColor: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
            DEMO ONLY
          </span>
          <span>
            This is an academic demonstration interface for canteen staff. In a commercial deployment, this section would require staff authentication.
          </span>
        </div>
        <Link to="/staff/menu" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
          <SlidersHorizontal size={14} />
          <span>Manage Food Menu</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Canteen Kitchen & Counter Dashboard</h1>
          <p className="page-subtitle">
            Manage student incoming food orders, update kitchen preparation status, and track counter collections.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={refreshAll}
          disabled={ordersFetching}
        >
          <RefreshCw size={14} className={ordersFetching ? 'animate-spin' : ''} />
          <span>{ordersFetching ? 'Refreshing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.total || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#b45309' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.pending || 0}</div>
            <div className="stat-label">Pending (Placed + Prep)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#047857' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.ready || 0}</div>
            <div className="stat-label">Ready for Pickup</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.collected || 0}</div>
            <div className="stat-label">Collected</div>
          </div>
        </div>
      </div>

      {/* Action Error Box */}
      {actionError && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Status Transition Rejected: </strong>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'ALL', label: 'All Orders' },
          { key: 'PLACED', label: 'Placed' },
          { key: 'PREPARING', label: 'Preparing' },
          { key: 'READY', label: 'Ready for Pickup' },
          { key: 'COLLECTED', label: 'Collected' },
          { key: 'CANCELLED', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${selectedStatusTab === tab.key ? 'active' : ''}`}
            onClick={() => setSelectedStatusTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Loading */}
      {ordersLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading kitchen orders...</p>
        </div>
      )}

      {/* Orders Error */}
      {ordersError && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} />
          <div>
            <strong>Failed to load orders: </strong>
            <span>{ordersErr?.message || 'Database error'}</span>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!ordersLoading && !ordersError && (
        <div className="table-card">
          {orders.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <ClipboardList size={40} className="empty-icon" />
              <h3 className="empty-title">No orders found</h3>
              <p className="empty-desc">
                {selectedStatusTab === 'ALL'
                  ? 'No students have placed any orders yet today.'
                  : `There are currently no orders in "${selectedStatusTab}" status.`}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order Token</th>
                    <th>Student Details</th>
                    <th>Items & Qty</th>
                    <th>Pickup Window</th>
                    <th>Total</th>
                    <th>Current Status</th>
                    <th>Kitchen Workflow Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
                          #{order.id}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: '600' }}>{order.studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          ID: {order.studentId}
                        </div>
                      </td>

                      <td>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                          {order.orderItems?.map(item => (
                            <li key={item.id} style={{ whiteSpace: 'nowrap' }}>
                              <strong>{item.quantity}×</strong> {item.menuItem?.name || `Item #${item.menuItemId}`}
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '4px' }}>
                                (₹{Number(item.unitPrice).toFixed(2)})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                          {order.pickupTime}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                          ₹{Number(order.totalAmount).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={order.status} />
                      </td>

                      <td>
                        {/* Status Transition Action Buttons adhering to state machine */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {order.status === 'PLACED' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                                disabled={updateStatusMutation.isPending}
                                title="Move to kitchen cooking"
                              >
                                <ChefHat size={14} />
                                <span>Start Prep</span>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                disabled={updateStatusMutation.isPending}
                                style={{ color: '#dc2626' }}
                                title="Cancel order"
                              >
                                <XCircle size={14} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {order.status === 'PREPARING' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'READY')}
                                disabled={updateStatusMutation.isPending}
                                title="Food ready for student pickup"
                                style={{ backgroundColor: '#059669' }}
                              >
                                <CheckCircle2 size={14} />
                                <span>Mark Ready</span>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                disabled={updateStatusMutation.isPending}
                                style={{ color: '#dc2626' }}
                              >
                                <XCircle size={14} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {order.status === 'READY' && (
                            <>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'COLLECTED')}
                                disabled={updateStatusMutation.isPending}
                                title="Student paid and picked up order"
                              >
                                <PackageCheck size={14} />
                                <span>Mark Collected</span>
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                disabled={updateStatusMutation.isPending}
                                style={{ color: '#dc2626' }}
                              >
                                <XCircle size={14} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {order.status === 'COLLECTED' && (
                            <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '500' }}>
                              ✔ Completed
                            </span>
                          )}

                          {order.status === 'CANCELLED' && (
                            <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: '500' }}>
                              ✖ Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
