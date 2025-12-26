import React from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedChatbotProps {
  children: React.ReactNode;
}

const ProtectedChatbot: React.FC<ProtectedChatbotProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-container">
        <p>Loading chatbot...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <h3 className="auth-title">Authentication Required</h3>
        <p>You must be logged in to use the chatbot feature.</p>
        <div className="flex gap-2 mt-4">
          <a href="/login" className="auth-button flex-1 text-center">Log In</a>
          <a href="/signup" className="auth-button button--secondary flex-1 text-center">Sign Up</a>
        </div>
      </div>
    );
  }

  // User is authenticated, render the chatbot
  return <>{children}</>;
};

export default ProtectedChatbot;