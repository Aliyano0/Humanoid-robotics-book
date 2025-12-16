# ChatKit Widget Integration for Docusaurus

## Overview
This document provides instructions for integrating the ChatKit widget with Docusaurus to enable the chatbot functionality on all pages of the Physical AI & Humanoid Robotics textbook site.

## Prerequisites
- A running instance of the RAG Chatbot API
- ChatKit account or widget configuration
- Access to Docusaurus site configuration files

## Backend API Endpoint
The ChatKit widget will communicate with the following endpoint:
- **URL**: `POST /api/v1/chat`
- **Base URL**: Should be configured to point to your deployed backend service

## Docusaurus Integration Steps

### 1. Add ChatKit Script to Docusaurus
Add the ChatKit widget script to your Docusaurus site. This can be done by:

1. Adding the script to your `static/` directory, or
2. Including it via the Docusaurus `docusaurus.config.js` file in the `head` section

### 2. Configure Docusaurus Site Configuration
Update your `docusaurus.config.js` to include the ChatKit script:

```js
module.exports = {
  // ... other config
  scripts: [
    {
      src: '/path/to/chatkit-widget.js', // Adjust path as needed
      async: true,
    },
  ],
  // ... rest of config
};
```

### 3. Initialize ChatKit Widget
The ChatKit widget should be initialized with the following configuration:

```js
// Initialize ChatKit with your backend API
ChatKit.init({
  // Backend API URL
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api/v1',

  // Widget configuration
  widgetConfig: {
    position: 'bottom-right',  // Position of the floating icon
    title: 'Humanoid Robotics Assistant',
    subtitle: 'Ask me anything about the textbook!',
    placeholder: 'Ask a question about humanoid robotics...',
  },

  // Optional: Custom styling
  theme: {
    primaryColor: '#3b82f6',  // Tailwind blue-500
    secondaryColor: '#f3f4f6' // Tailwind gray-100
  }
});
```

### 4. Text Selection Handler
The ChatKit widget should include functionality to capture selected text from the page:

```js
// Function to get selected text
function getSelectedText() {
  const selection = window.getSelection();
  if (selection && selection.toString().trim() !== '') {
    return selection.toString().trim();
  }
  return null;
}

// When user clicks the chat icon or sends a message, check for selected text
ChatKit.on('message:send', (message) => {
  const selectedText = getSelectedText();
  if (selectedText) {
    // Send selected text along with the query
    message.selectedText = selectedText;
  }
});
```

### 5. Session Management
The widget should handle session persistence:

```js
// Generate or retrieve session ID
let sessionId = localStorage.getItem('chatbot-session-id');
if (!sessionId) {
  sessionId = generateUUID(); // Generate a new UUID
  localStorage.setItem('chatbot-session-id', sessionId);
}

// Include session ID in all requests
ChatKit.setSessionId(sessionId);
```

## Environment Configuration
For development and production, ensure the following environment variables are configured:

- `BACKEND_API_URL`: The URL of your deployed RAG chatbot backend
- `CHATKIT_API_KEY`: If required by ChatKit service (if using their hosted solution)

## Testing
1. Verify the chat widget appears on all Docusaurus pages
2. Test that the widget can communicate with the backend API
3. Verify that selected text functionality works correctly
4. Test session persistence across page navigations
5. Ensure the widget works on both desktop and mobile views

## Deployment Considerations
- Ensure your backend API is deployed and accessible from your Docusaurus site
- If using HTTPS for your Docusaurus site, ensure your backend API is also accessible via HTTPS
- Consider CORS configuration if the frontend and backend are hosted on different domains

## Troubleshooting
- If the widget doesn't appear, check that the script is properly loaded in the page
- If API calls fail, verify the backend URL is correctly configured
- If selected text isn't being sent, ensure the text selection handler is properly implemented