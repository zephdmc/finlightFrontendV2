import React from 'react';

class SecurityErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log security errors silently
    if (error.message?.includes('security') || error.message?.includes('CSP')) {
      console.warn('Security error caught:', error.message);
    } else {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error?.message?.includes('security')) {
      // Redirect to login on security errors
      window.location.href = '/login';
      return null;
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;