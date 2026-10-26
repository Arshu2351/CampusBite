// Order Status Transition State Machine
// Backend Concept: Business Logic & Workflow Rules Validation

export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  COLLECTED: 'COLLECTED',
  CANCELLED: 'CANCELLED'
};

// Map of allowed next transitions from each state
export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUSES.PLACED]: [ORDER_STATUSES.PREPARING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.READY, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.READY]: [ORDER_STATUSES.COLLECTED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.COLLECTED]: [], // Terminal state
  [ORDER_STATUSES.CANCELLED]: []  // Terminal state
};

/**
 * Validates whether an order status transition is allowed
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateStatusTransition(currentStatus, nextStatus) {
  if (!ORDER_STATUSES[nextStatus]) {
    return {
      valid: false,
      message: `Invalid status "${nextStatus}". Allowed statuses are: ${Object.values(ORDER_STATUSES).join(', ')}.`
    };
  }

  if (currentStatus === nextStatus) {
    return {
      valid: false,
      message: `Order is already in "${currentStatus}" status.`
    };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      message: `Invalid transition from "${currentStatus}" to "${nextStatus}". Allowed next statuses from "${currentStatus}" are: [${allowedNext.join(', ') || 'None (Terminal state)'}].`
    };
  }

  return { valid: true };
}
