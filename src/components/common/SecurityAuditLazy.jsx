import { lazy, Suspense } from 'react';

// Lazy load the security audit to prevent render blocking
const SecurityAuditComponent = lazy(() => import('./SecurityAudit'));

const SecurityAudit = () => {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }
  
  return (
    <Suspense fallback={null}>
      <SecurityAuditComponent />
    </Suspense>
  );
};

export default SecurityAudit;