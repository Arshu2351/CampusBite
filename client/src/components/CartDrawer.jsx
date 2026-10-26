// Cart Drawer Component
// Full Stack Concept: Dynamic Cart interactions, quantity adjustments, and checkout trigger

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    estimatedTotal
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Your Canteen Cart</h3>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCartOpen(false)}
            style={{ border: 'none', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state" style={{ border: 'none', padding: '40px 10px' }}>
              <ShoppingBag size={48} className="empty-icon" />
              <h4 className="empty-title">Your cart is empty</h4>
              <p className="empty-desc">
                Browse our delicious canteen menu and add items to your pre-order cart!
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {cartItems.length} item(s) selected
                </span>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                  Clear Cart
                </button>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <div className="cart-item-title">{item.name}</div>
                    <div className="cart-item-price">
                      ₹{item.price.toFixed(2)} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>

                  <div className="qty-controls">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      title="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      title="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="qty-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                      style={{ color: '#ef4444', marginLeft: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div className="cart-summary">
              <div className="summary-row">
                <span>Estimated Subtotal</span>
                <span>₹{estimatedTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Payment method</span>
                <span>Pay at Canteen Counter</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total Amount</span>
                <span>₹{estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
            >
              <span>Proceed to Pre-Order</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
