'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Search', path: '/directory', icon: '🔍' },
  { label: 'Discover', path: '/discover', icon: '✨' },
  { label: 'Profile', path: '/profile', icon: '👤' },
  { label: 'About', path: '/about', icon: 'ℹ️' },
  { label: 'Contact', path: '/contact', icon: '📧' },
];

export function TaskBar() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(26, 26, 26, 0.8)',
      backdropFilter: 'blur(12px)',
      padding: '0.75rem 1.5rem',
      borderRadius: '50px',
      border: '1px solid #333',
      display: 'flex',
      gap: '2rem',
      zIndex: 1000,
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link 
            key={item.path} 
            href={item.path}
            style={{
              textDecoration: 'none',
              color: isActive ? '#A855F7' : '#888',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'color 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
