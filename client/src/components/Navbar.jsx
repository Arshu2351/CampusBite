// Navigation Bar Component
// Full Stack Concept: React Router NavLink navigation & global cart badge

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Utensils, ShoppingBag, Search, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand-link">
          <div className="brand-icon">
            <Utensils size={20} />
          </div>
          <span>CampusBite</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Utensils size={16} />
            <span>Menu & Order</span>
          </NavLink>

          <NavLink
            to="/track"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Search size={16} />
            <span>Track Order</span>
          </NavLink>

          <NavLink
            to="/staff"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <ShieldCheck size={16} />
            <span>Staff Portal (Demo)</span>
          </NavLink>
        </nav>

        <div className="nav-actions">
          <button
            className="cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {totalItemsCount > 0 && (
              <span className="cart-badge">{totalItemsCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
