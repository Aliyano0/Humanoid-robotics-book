/**
 * ChatKit Widget for Docusaurus Integration
 *
 * A floating chat widget that integrates with the RAG Chatbot backend
 * for the Humanoid Robotics textbook.
 */

(function() {
    'use strict';

    // Avoid conflicts with other instances
    if (typeof window.ChatKit !== 'undefined' || document.querySelector('#chatkit-button')) {
        console.log('ChatKit widget already initialized, skipping duplicate initialization');
        return;
    }

    // Configuration
    const CONFIG = {
        backendUrl: window.BACKEND_URL || "https://aliyan-a-book-hackathon.hf.space" || 'http://localhost:8000',
        signupPage: '/Humanoid-robotics-book/signup',
        loginPage: '/Humanoid-robotics-book/login',
        profilePage: '/Humanoid-robotics-book/profile',
        position: 'bottom-right',
        title: 'Humanoid Robotics Assistant',
        subtitle: 'Ask me anything about the textbook!',
        placeholder: 'Ask a question...',
        primaryColor: '#3b82f6',
        secondaryColor: '#f3f4f6'
    };


    // State management
    let sessionId = localStorage.getItem('chatbot-session-id') || generateUUID();
    localStorage.setItem('chatbot-session-id', sessionId);

    // DOM elements
    let widgetContainer = null;
    let chatButton = null;
    let chatWindow = null;
    let messagesContainer = null;
    let inputContainer = null;
    let messageInput = null;
    let sendButton = null;

    // Initialize the widget
    function init() {
        // Check if widget is already initialized
        if (document.querySelector('#chatkit-widget')) {
            return;
        }

        createWidget();
        setupEventListeners();

        console.log('ChatKit widget initialized');
    }

    // Create the widget DOM elements
    function createWidget() {
        // Create main container
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'chatkit-widget';
        widgetContainer.className = 'chatkit-widget';
        widgetContainer.style.cssText = `
            position: fixed;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;

        // Create chat button (floating icon)
        chatButton = document.createElement('div');
        chatButton.id = 'chatkit-button';
        chatButton.className = 'chatkit-button';
        chatButton.title = 'Open Chat';
        chatButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H17.12L18.86 19.64C19.02 19.89 19.02 20.22 18.86 20.47L17.67 22.27C17.5 22.55 17.18 22.7 16.86 22.67C16.54 22.65 16.27 22.46 16.14 22.16L14.13 18.16H11L9.86 22.16C9.73 22.46 9.46 22.65 9.14 22.67C8.82 22.7 8.5 22.55 8.33 22.27L7.14 20.47C6.98 20.22 6.98 19.89 7.14 19.64L8.87 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 10H9.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 10H15.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 10H12.01" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        chatButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: ${CONFIG.primaryColor};
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            transition: all 0.3s ease;
            border: none;
            outline: none;
        `;

        // Create chat window (initially hidden)
        chatWindow = document.createElement('div');
        chatWindow.id = 'chatkit-window';
        chatWindow.className = 'chatkit-window';
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 9998;
            font-family: inherit;
        `;

        // Create header
        const header = document.createElement('div');
        header.className = 'chatkit-header';
        header.style.cssText = `
            background-color: ${CONFIG.primaryColor};
            color: white;
            padding: 16px;
            display: flex;
            flex-direction: column;
        `;
        header.innerHTML = `
            <div style="font-weight: 600; font-size: 16px;">${CONFIG.title}</div>
            <div style="font-size: 12px; opacity: 0.9;">${CONFIG.subtitle}</div>
        `;

        // Create messages container
        messagesContainer = document.createElement('div');
        messagesContainer.className = 'chatkit-messages';
        messagesContainer.style.cssText = `
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background-color: #f9fafb;
        `;

        // Create input container
        inputContainer = document.createElement('div');
        inputContainer.className = 'chatkit-input-container';
        inputContainer.style.cssText = `
            padding: 12px 16px;
            background: white;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
        `;

        // Create message input
        messageInput = document.createElement('input');
        messageInput.type = 'text';
        messageInput.placeholder = CONFIG.placeholder;
        messageInput.className = 'chatkit-input';
        messageInput.style.cssText = `
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
        `;

        // Create send button
        sendButton = document.createElement('button');
        sendButton.innerHTML = 'Send';
        sendButton.className = 'chatkit-send-button';
        sendButton.style.cssText = `
            padding: 10px 16px;
            background-color: ${CONFIG.primaryColor};
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        `;

        // Assemble the chat window
        inputContainer.appendChild(messageInput);
        inputContainer.appendChild(sendButton);
        chatWindow.appendChild(header);
        chatWindow.appendChild(messagesContainer);
        chatWindow.appendChild(inputContainer);

        // Add to document
        document.body.appendChild(chatButton);
        document.body.appendChild(chatWindow);

        // Add initial welcome message
        addMessage('assistant', 'Hello! I\'m your Humanoid Robotics Assistant. Ask me anything about the textbook, or select text on the page and ask me to explain it.');
    }

    // Set up event listeners
    function setupEventListeners() {
        // Toggle chat window when button is clicked
        chatButton.addEventListener('click', toggleChatWindow);

        // Send message when send button is clicked
        sendButton.addEventListener('click', sendMessage);

        // Send message when Enter is pressed (but allow Shift+Enter for new lines)
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Close chat window when clicking outside
        document.addEventListener('click', function(e) {
            if (chatWindow.style.display === 'flex' &&
                !chatWindow.contains(e.target) &&
                e.target !== chatButton) {
                // Don't close if clicking on another part of the page while chat is open
                // Only close if clicking on the main page content, not navigation
                if (!e.target.closest('.chatkit-widget')) {
                    // Add a small delay to allow other interactions
                    setTimeout(() => {
                        if (!chatWindow.contains(document.activeElement)) {
                            closeChatWindow();
                        }
                    }, 100);
                }
            }
        });
    }

    // Check if user is authenticated by looking for auth token in localStorage
    function isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        console.log('isAuthenticated check - token:', token ? 'exists' : 'null');
        return !!token;
    }

    // Toggle chat window visibility
    function toggleChatWindow() {
        console.log('toggleChatWindow called');
        // Check authentication before opening chat
        if (!isAuthenticated()) {
            console.log('User not authenticated, showing auth prompt');
            // Show authentication prompt instead of chat window
            showAuthPrompt();
            return;
        }

        if (chatWindow.style.display === 'flex') {
            closeChatWindow();
        } else {
            openChatWindow();
        }
    }

    // Open chat window
    function openChatWindow() {
        chatWindow.style.display = 'flex';
        messageInput.focus();
    }

    // Close chat window
    function closeChatWindow() {
        chatWindow.style.display = 'none';
    }

    // Send message to backend
    async function sendMessage() {
        // Check authentication before sending message
        if (!isAuthenticated()) {
            showAuthPrompt();
            return;
        }

        const message = messageInput.value.trim();
        if (!message) return;

        // Get selected text if any
        const selectedText = getSelectedText();

        // Add user message to UI immediately
        addMessage('user', message);
        messageInput.value = '';

        try {
            // Show typing indicator
            const typingIndicator = addMessage('assistant', 'Thinking...');

            // Send to backend with authentication token if available
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${CONFIG.backendUrl}/api/v1/chat`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    query: message,
                    selected_text: selectedText || null,
                    session_id: sessionId
                })
            });

            if (!response.ok) {
                // Check if it's an authentication error
                if (response.status === 401 || response.status === 403) {
                    showAuthPrompt();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Remove typing indicator
            messagesContainer.removeChild(typingIndicator);

            // Add assistant response
            addMessage('assistant', data.response);

            // Store session ID if it was returned/updated
            if (data.session_id) {
                sessionId = data.session_id;
                localStorage.setItem('chatbot-session-id', sessionId);
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // Remove typing indicator
            const typingElements = messagesContainer.querySelectorAll('.chatkit-message.typing');
            typingElements.forEach(el => messagesContainer.removeChild(el));

            // Add error message
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        }
    }

    // Add message to chat
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatkit-message ${sender}`;
        messageDiv.style.cssText = `
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
            word-wrap: break-word;
        `;

        if (sender === 'user') {
            messageDiv.style.cssText += `
                align-self: flex-end;
                background-color: ${CONFIG.primaryColor};
                color: white;
                border-bottom-right-radius: 4px;
            `;
        } else {
            messageDiv.style.cssText += `
                align-self: flex-start;
                background-color: white;
                color: #374151;
                border: 1px solid #e5e7eb;
                border-bottom-left-radius: 4px;
            `;
        }

        // Process text for citations if it's from the assistant
        if (sender === 'assistant') {
            messageDiv.innerHTML = processCitations(text);
        } else {
            messageDiv.textContent = text;
        }

        messagesContainer.appendChild(messageDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return messageDiv;
    }

    // Process citations in assistant responses
    function processCitations(text) {
        // Simple processing - in a real implementation, you'd parse the full response format
        return text.replace(/\n\n/g, '<br><br>');
    }

    // Get selected text from the page
    function getSelectedText() {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== '') {
            return selection.toString().trim();
        }
        return null;
    }

    // Generate UUID for session
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Initialize when DOM is loaded - with extra checks for Docusaurus compatibility
    function initializeWidget() {
        // Small delay to ensure Docusaurus has fully loaded
        setTimeout(() => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                // Check if DOM is already ready
                if (document.body) {
                    init();
                } else {
                    // Fallback: wait for body to be available
                    const observer = new MutationObserver(() => {
                        if (document.body) {
                            observer.disconnect();
                            init();
                        }
                    });
                    observer.observe(document, { childList: true, subtree: true });
                }
            }
        }, 500); // Small delay to ensure page is fully rendered
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initializeWidget();
    } else {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    }

    // Also initialize when page is fully loaded (for SPAs)
    window.addEventListener('load', initializeWidget);

    // Show authentication prompt when user tries to access chat without being authenticated
    function showAuthPrompt() {
        console.log('showAuthPrompt called - user not authenticated');

        // Remove any existing auth overlay
        const existingOverlay = document.getElementById('chatkit-auth-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'chatkit-auth-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Create auth prompt container
        const authContainer = document.createElement('div');
        authContainer.className = 'chatkit-auth-prompt';
        authContainer.style.cssText = `
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
            text-align: center;
        `;

        // Create auth prompt content
        authContainer.innerHTML = `
            <h3 style="margin: 0 0 16px; color: #1f2937;">Authentication Required</h3>
            <p style="margin: 0 0 20px; color: #4b5563;">You need to be logged in to use the chatbot feature.</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <a href="${CONFIG.loginPage}" style="
                    display: block;
                    padding: 12px;
                    background-color: ${CONFIG.primaryColor};
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                ">Log In</a>
                <a href="${CONFIG.signupPage}" style="
                    display: block;
                    padding: 12px;
                    background-color: #f3f4f6;
                    color: #374151;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                ">Sign Up</a>
            </div>
            <button id="close-auth-prompt" style="
                margin-top: 16px;
                padding: 8px 16px;
                background: none;
                border: none;
                color: #6b7280;
                cursor: pointer;
                font-size: 14px;
            ">Cancel</button>
        `;

        authContainer.querySelector('#close-auth-prompt').addEventListener('click', function() {
            document.body.removeChild(overlay);
        });

        overlay.appendChild(authContainer);
        document.body.appendChild(overlay);
    }

    // Make available globally
    window.ChatKit = {
        init: init,
        toggle: toggleChatWindow,
        open: openChatWindow,
        close: closeChatWindow,
        sendMessage: sendMessage,
        getConfig: () => CONFIG,
        setConfig: (newConfig) => {
            Object.assign(CONFIG, newConfig);
        },
        // Debug function to help troubleshoot
        debug: () => {
            console.log('ChatKit widget status:', {
                initialized: document.querySelector('#chatkit-button') !== null,
                backendUrl: CONFIG.backendUrl,
                sessionId: sessionId
            });
        }
    };

    // Export for Docusaurus compatibility
    if (typeof window !== 'undefined') {
        window.ChatKitWidget = window.ChatKit;
    }
})();