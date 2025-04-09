// This file intentionally left empty.
// Navigation is now centralized in the root layout (_layout.tsx).
// This file is kept to prevent import errors in case there are remaining references.

import React from 'react';

/**
 * Placeholder component - All route protection is now handled in the root layout
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}