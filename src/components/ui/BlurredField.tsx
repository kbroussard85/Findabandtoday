import React from 'react';

interface BlurredFieldProps {
  isPremium: boolean;
  children: React.ReactNode;
}

export function BlurredField({ isPremium, children }: BlurredFieldProps) {
  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.5 }}>
        {children}
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '0.8rem',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        Upgrade to View
      </div>
    </div>
  );
}
