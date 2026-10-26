// Menu Management Page (Staff Only)
// Backend & Advanced Database Concept: CRUD operations, Foreign Key Referential Integrity handling

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { menuService } from '../services/menuService';

export default function MenuManagementPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const queryClient = useQueryClient();

  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => menuService.getAll(false)
  });

  // Create Item Mutation
  const createMutation = useMutation({
    mutationFn: (data) => menuService.create(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsAddModalOpen(false);
      setActionSuccess(`Successfully added "${newItem.name}" to menu!`);
      setTimeout(() => setActionSuccess(null), 3500);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to add item.');
    }
  });

  // Update Item Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => menuService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setEditingItem(null);
      setActionSuccess(`Updated "${updated.name}" successfully!`);
      setTimeout(() => setActionSuccess(null), 3500);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to update item.');
    }
  });

  // Delete Item Mutation (handles foreign key error gracefully)
  const deleteMutation = useMutation({
    mutationFn: (id) => menuService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setActionSuccess('Menu item deleted successfully.');
      setTimeout(() => setActionSuccess(null), 3500);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to delete menu item.');
    }
  });

  const handleToggleAvailability = (item) => {
    setActionError(null);
    updateMutation.mutate({
      id: item.id,
      data: { isAvailable: !item.isAvailable }
    });
  };

  const handleDelete = (item) => {
    setActionError(null);
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  return (
    <div>
      {/* Demonstration Banner */}
      <div className="demo-banner">
        <span>
          <strong>Staff Mode:</strong> Real-time menu management backed directly by PostgreSQL database.
        </span>
        <Link to="/staff" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Live Orders</span>
        </Link>
      </div>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Canteen Menu Catalog</h1>
          <p className="page-subtitle">
            Add new food items, update prices, toggle availability during peak rush, and manage recipes.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => { setActionError(null); setIsAddModalOpen(true); }}>
          <Plus size={16} />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="alert-box alert-success">
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Error Notification */}
      {actionError && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Action Failed: </strong>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading menu items from database...</p>
        </div>
      )}

      {/* Menu Table */}
      {!isLoading && !isError && (
        <div className="table-card">
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Food Item Name</th>
                  <th>Description</th>
                  <th>Price (INR)</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>
                        #{item.id}
                      </span>
                    </td>

                    <td>
                      <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                    </td>

                    <td style={{ maxWidth: '300px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.description || '—'}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: item.isAvailable ? '#ecfdf5' : '#fef2f2',
                          color: item.isAvailable ? '#065f46' : '#991b1b',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                        title="Click to toggle availability"
                      >
                        {item.isAvailable ? (
                          <>
                            <ToggleRight size={18} color="#059669" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} color="#ef4444" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setActionError(null); setEditingItem(item); }}
                          title="Edit item details"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDelete(item)}
                          disabled={deleteMutation.isPending}
                          style={{ color: '#ef4444' }}
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <ItemModal
          title="Add New Food Item"
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <ItemModal
          title={`Edit Food Item #${editingItem.id}`}
          initialData={editingItem}
          isOpen={Boolean(editingItem)}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => updateMutation.mutate({ id: editingItem.id, data })}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}

// Modal Form Component for Create and Update
function ItemModal({ title, initialData = null, isOpen, onClose, onSubmit, isPending }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ? Number(initialData.price) : '',
      isAvailable: initialData?.isAvailable !== undefined ? initialData.isAvailable : true
    }
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ border: 'none', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="itemName">Item Name *</label>
              <input
                id="itemName"
                className="form-input"
                placeholder="e.g. Masala Dosa"
                {...register('name', {
                  required: 'Item name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' }
                })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="itemPrice">Price in INR (₹) *</label>
              <input
                id="itemPrice"
                type="number"
                step="0.5"
                className="form-input"
                placeholder="e.g. 60.00"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 1, message: 'Price must be greater than zero' }
                })}
              />
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="itemDesc">Description</label>
              <textarea
                id="itemDesc"
                rows="3"
                className="form-textarea"
                placeholder="Ingredients, preparation details, accompaniment chutney/sauce..."
                {...register('description')}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="isAvailable"
                type="checkbox"
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                {...register('isAvailable')}
              />
              <label htmlFor="isAvailable" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: '500' }}>
                Item is currently available for students to order
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Menu Item</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
