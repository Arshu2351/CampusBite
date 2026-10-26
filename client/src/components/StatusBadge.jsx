// Status Badge Component
// Renders visual order status with appropriate color palette and icons

import React from 'react';
import { Clock, ChefHat, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';

const statusConfig = {
  PLACED: {
    label: 'Order Placed',
    className: 'status-placed',
    icon: Clock
  },
  PREPARING: {
    label: 'Preparing',
    className: 'status-preparing',
    icon: ChefHat
  },
  READY: {
    label: 'Ready for Pickup',
    className: 'status-ready',
    icon: CheckCircle2
  },
  COLLECTED: {
    label: 'Collected',
    className: 'status-collected',
    icon: PackageCheck
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'status-cancelled',
    icon: XCircle
  }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'status-collected',
    icon: Clock
  };

  const IconComponent = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      <IconComponent size={14} />
      <span>{config.label}</span>
    </span>
  );
}
