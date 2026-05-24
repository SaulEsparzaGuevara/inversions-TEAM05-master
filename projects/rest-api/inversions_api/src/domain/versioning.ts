export const ORDER_VERSION_STALE = "ORDER_VERSION_STALE";

export class OrderVersionConflictError extends Error {
  code = ORDER_VERSION_STALE;

  constructor(public readonly expectedVersion: number, public readonly providedVersion: number) {
    super(`Version conflict: expected=${expectedVersion}, provided=${providedVersion}`);
  }
}

export function assertCurrentOrderVersion(expectedVersion: number, providedVersion: number): void {
  if (expectedVersion !== providedVersion) {
    throw new OrderVersionConflictError(expectedVersion, providedVersion);
  }
}
