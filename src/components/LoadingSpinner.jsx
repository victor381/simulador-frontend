import React from 'react';

function LoadingSpinner({ message = 'Carregando...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      gap: '1rem'
    }}>
      <div className="loading" style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(0, 102, 204, 0.1)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
}

export default LoadingSpinner;

