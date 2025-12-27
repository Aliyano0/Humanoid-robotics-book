import React from 'react';
import { AuthProvider } from '../hooks/useAuth';

export default function Root({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}