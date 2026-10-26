// Main Application Root
// Full Stack Concept: Router, Query Client Provider, Cart Context, and Layout Hierarchy

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import MenuPage from './pages/MenuPage';
import TrackOrderPage from './pages/TrackOrderPage';
import StaffDashboardPage from './pages/StaffDashboardPage';
import MenuManagementPage from './pages/MenuManagementPage';

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 15,
      retry: 1
    }
  }
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />

            <main className="main-content">
              <div className="container">
                <Routes>
                  {/* Student Routes */}
                  <Route path="/" element={<MenuPage />} />
                  <Route path="/track" element={<TrackOrderPage />} />

                  {/* Staff Demonstration Routes */}
                  <Route path="/staff" element={<StaffDashboardPage />} />
                  <Route path="/staff/menu" element={<MenuManagementPage />} />

                  {/* Fallback route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>

            <footer style={{
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--border)',
              padding: '24px 0',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <div className="container">
                <p>
                  <strong>CampusBite: Canteen Pre-Order System</strong> — College Academic Micro-Project (Modules 1–3)
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  Demonstrating Full Stack Development (React + Express), Backend REST Architecture, & Advanced Database (PostgreSQL + Prisma)
                </p>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}
