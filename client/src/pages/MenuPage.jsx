// Student Menu Page
// Full Stack Concept: TanStack Query useQuery fetching, search/filter state, and cart interactions

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertCircle, Loader2, Utensils, CheckCircle } from 'lucide-react';
import { menuService } from '../services/menuService';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { addToCart, cartItems } = useCart();

  // TanStack Query: Fetch menu items from PostgreSQL via REST API
  const {
    data: menuItems = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['menuItems'],
    queryFn: () => menuService.getAll(false),
    staleTime: 1000 * 30 // cache for 30s
  });

  const handleAddToCart = (item) => {
    addToCart(item);
    setToastMessage(`Added "${item.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOrderPlaced = (createdOrder) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(createdOrder);
  };

  // Filter items based on search term and availability
  const filteredItems = menuItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAvailability = showAvailableOnly ? item.isAvailable : true;
    return matchesSearch && matchesAvailability;
  });

  return (
    <div>
      {/* Toast notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#065f46',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Canteen Daily Menu</h1>
          <p className="page-subtitle">
            Skip the long lunchtime queue! Choose your favorite items, pre-order in advance, and pick up fresh at the counter.
          </p>
        </div>
        <div style={{
          backgroundColor: 'var(--primary-light)',
          border: '1px solid var(--primary-border)',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          color: 'var(--primary-text)',
          fontWeight: '500'
        }}>
          ⏱ Counter Pickup: Open 8:30 AM – 5:30 PM
        </div>
      </div>

      {/* Controls: Search & Availability Filter */}
      <div className="menu-controls">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input search-input"
            placeholder="Search dosas, sandwiches, rolls, beverages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={showAvailableOnly}
              onChange={(e) => setShowAvailableOnly(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
            />
            <span>Show available items only</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
          <p>Fetching fresh menu items from canteen database...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="alert-box alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Unable to load canteen menu: </strong>
            <span>{error?.message || 'Database connection error. Please ensure the backend is running.'}</span>
            <div style={{ marginTop: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => refetch()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      {!isLoading && !isError && (
        <>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <Utensils size={48} className="empty-icon" />
              <h3 className="empty-title">No menu items found</h3>
              <p className="empty-desc">
                {searchTerm
                  ? `No food items match "${searchTerm}". Try a different keyword.`
                  : 'The canteen menu is currently empty.'}
              </p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item) => {
                const cartEntry = cartItems.find(c => c.id === item.id);
                return (
                  <div key={item.id} className="food-card">
                    <div>
                      <div className="food-header">
                        <h3 className="food-name">{item.name}</h3>
                        <span className={`badge ${item.isAvailable ? 'badge-available' : 'badge-soldout'}`}>
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </div>

                      <p className="food-description">
                        {item.description || 'Deliciously prepared freshly in our college kitchen.'}
                      </p>
                    </div>

                    <div className="food-footer">
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Price</span>
                        <span className="food-price">₹{Number(item.price).toFixed(2)}</span>
                      </div>

                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!item.isAvailable}
                        onClick={() => handleAddToCart(item)}
                        style={{ padding: '8px 14px' }}
                      >
                        <Plus size={16} />
                        <span>{cartEntry ? `Add More (${cartEntry.quantity})` : 'Add to Order'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={Boolean(confirmedOrder)}
        onClose={() => setConfirmedOrder(null)}
      />
    </div>
  );
}
