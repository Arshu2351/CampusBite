// Checkout Modal Component
// Full Stack Concept: React Hook Form validation & TanStack Query useMutation

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle, AlertCircle, Loader2, Clock, User, IdCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cartItems, estimatedTotal, clearCart } = useCart();
  const [serverError, setServerError] = useState(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      studentName: '',
      studentId: '',
      pickupTime: 'In 15-20 Minutes'
    }
  });

  const orderMutation = useMutation({
    mutationFn: (payload) => orderService.create(payload),
    onSuccess: (response) => {
      clearCart();
      reset();
      setServerError(null);
      // Invalidate queries so that staff dashboard and stats update
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orderStats'] });
      onOrderPlaced(response);
    },
    onError: (error) => {
      setServerError(error.message || 'Failed to place order. Please try again.');
    }
  });

  if (!isOpen) return null;

  const onSubmit = (formData) => {
    setServerError(null);

    const payload = {
      studentName: formData.studentName,
      studentId: formData.studentId,
      pickupTime: formData.pickupTime,
      items: cartItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity
      }))
    };

    orderMutation.mutate(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.25rem' }}>Student Pre-Order Details</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ border: 'none', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            {serverError && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Order Error: </strong>
                  <span>{serverError}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="studentName">
                Student Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="studentName"
                  className="form-input"
                  placeholder="e.g. Aarav Sharma"
                  {...register('studentName', {
                    required: 'Student name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must have at least 2 characters'
                    }
                  })}
                />
              </div>
              {errors.studentName && (
                <p className="form-error">{errors.studentName.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="studentId">
                Student ID / Roll Number *
              </label>
              <input
                id="studentId"
                className="form-input"
                placeholder="e.g. CS2026-042 or 21BCS104"
                {...register('studentId', {
                  required: 'Student ID or Roll Number is required',
                  minLength: {
                    value: 2,
                    message: 'Student ID must have at least 2 characters'
                  }
                })}
              />
              {errors.studentId && (
                <p className="form-error">{errors.studentId.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pickupTime">
                Estimated Pickup Time Slot *
              </label>
              <select
                id="pickupTime"
                className="form-select"
                {...register('pickupTime', { required: 'Please select a pickup time' })}
              >
                <option value="In 10-15 Minutes">In 10-15 Minutes (Express)</option>
                <option value="In 20-30 Minutes">In 20-30 Minutes</option>
                <option value="In 45 Minutes">In 45 Minutes</option>
                <option value="Lunch Break (1:00 PM)">Lunch Break (1:00 PM)</option>
                <option value="Lunch Break (1:30 PM)">Lunch Break (1:30 PM)</option>
                <option value="Evening Snacks (4:30 PM)">Evening Snacks (4:30 PM)</option>
              </select>
              {errors.pickupTime && (
                <p className="form-error">{errors.pickupTime.message}</p>
              )}
            </div>

            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              marginTop: '16px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '0.9rem' }}>
                Order Summary ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items):
              </div>
              <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {cartItems.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.quantity}× {item.name}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: '700',
                fontSize: '0.95rem',
                color: 'var(--text-main)',
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border)'
              }}>
                <span>Total Amount to Pay:</span>
                <span style={{ color: 'var(--primary)' }}>₹{estimatedTotal.toFixed(2)}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                * No online payment needed. Hand over cash or UPI at the canteen counter when collecting food.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={orderMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Confirm Pre-Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
