/**
 * Checks if an error is a 401 authentication error.
 * Returns true if it was a 401 error (caller should handle gracefully).
 */
export function isAuthError(error: unknown): boolean {
  const anyErr = error as Record<string, unknown>;
  const status: number | undefined =
    (typeof anyErr?.status === 'number' ? anyErr.status : undefined) ||
    (typeof (anyErr?.context as Record<string, unknown>)?.status === 'number'
      ? (anyErr.context as Record<string, unknown>).status as number
      : undefined);

  const message = error instanceof Error ? error.message : String(error);

  return (
    status === 401 ||
    message.includes('401') ||
    message.includes('Invalid token') ||
    message.includes('Invalid JWT') ||
    message.includes('Unauthorized')
  );
}

// Callback to trigger the auth banner (set by AuthBannerContext)
let triggerAuthBannerFn: (() => void) | null = null;

export function setAuthBannerTrigger(fn: (() => void) | null) {
  triggerAuthBannerFn = fn;
}

/**
 * Checks if an error is a 401 authentication error and triggers the auth banner.
 * Returns true if it was a 401 error (caller should handle gracefully).
 */
export function handleAuthError(error: unknown): boolean {
  if (!isAuthError(error)) return false;

  if (triggerAuthBannerFn) {
    triggerAuthBannerFn();
  }

  return true;
}
