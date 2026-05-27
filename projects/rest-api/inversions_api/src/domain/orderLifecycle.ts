export type OrderStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "FAILED";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_APPROVAL: ["APPROVED", "REJECTED"],
  APPROVED: ["SUBMITTED"],
  REJECTED: [],
  SUBMITTED: ["PARTIALLY_FILLED", "FILLED", "CANCELLED", "FAILED"],
  PARTIALLY_FILLED: ["FILLED", "CANCELLED", "FAILED"],
  FILLED: [],
  CANCELLED: [],
  FAILED: ["PENDING_APPROVAL"]
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function enforceTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`ORDER_TRANSITION_INVALID: ${from} -> ${to}`);
  }
}
