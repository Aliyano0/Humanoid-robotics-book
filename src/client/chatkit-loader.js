// Client module to load the ChatKit widget
// This ensures the widget is loaded in the browser environment

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default function ChatkitLoader() {
  if (ExecutionEnvironment.canUseDOM) {
    // Check if widget is already loaded to prevent duplicates
    if (typeof window.ChatKit !== 'undefined') {
      return;
    }

    // Dynamically load the chatkit widget script
    const script = document.createElement('script');
    script.src = '/chatkit-widget.js';
    script.async = true;
    script.defer = true;

    // Add error handling
    script.onerror = () => {
      console.error('Failed to load ChatKit widget script');
    };

    script.onload = () => {
      console.log('ChatKit widget script loaded successfully');
    };

    document.head.appendChild(script);
  }
}