import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as chatService from '../services/chatService';
import * as analysisService from '../services/analysisService';
import { useApp } from './AppContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { showError, showSuccess } = useApp();

  // Current chat state
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Use ref to track current chat ID (avoids stale closure issues)
  const currentChatRef = useRef(null);

  // Chat list (for sidebar/history)
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  // Analysis loading state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Options
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [analysisOptions, setAnalysisOptions] = useState({
    timeframe: 'last7days',
    analysisDepth: 'standard',
    platforms: { twitter: true, reddit: true, bluesky: true },
    location: 'all',
    language: 'en',
    filters: { excludeRetweets: false, excludeReplies: false },
    contentSettings: { includeMedia: true, includeLinks: true }
  });

  const analysisSteps = [
    'Parsing query and extracting filters',
    'Fetching data from social media sources',
    'Running sentiment analysis model',
    'Generating insights and visualizations'
  ];

  // Simulate step progression for UX
  const simulateSteps = useCallback(() => {
    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCurrentStep(step);
        if (step >= analysisSteps.length) {
          clearInterval(interval);
          resolve();
        }
      }, 800);
    });
  }, [analysisSteps.length]);

  // Fetch all chats for sidebar
  const fetchChats = useCallback(async () => {
    try {
      setChatsLoading(true);
      const response = await chatService.getChats();
      if (response.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  // Load existing chat by ID
  const loadChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.getChatById(chatId);
      if (response.success) {
        setCurrentChat(response.data);
        currentChatRef.current = response.data._id;
        setMessages(response.data.messages || []);
        return response.data;
      }
    } catch (error) {
      showError('Failed to load chat');
    }
    return null;
  }, [showError]);

  // Main function: Send message and get analysis
  const sendMessage = useCallback(async (query) => {
    if (!query.trim()) return null;

    // Use ref to get the current chat ID (more reliable than state)
    let chatId = currentChatRef.current;

    // Step 1: Create chat if this is a new conversation
    if (!chatId) {
      try {
        const createResponse = await chatService.createChat({
          platform: selectedPlatform,
          options: analysisOptions
        });
        if (createResponse.success) {
          chatId = createResponse.data._id;
          setCurrentChat(createResponse.data);
          currentChatRef.current = chatId; // Update ref immediately
          
          // Add to sidebar
          setChats(prev => [{
            _id: chatId,
            title: 'New Chat',
            messageCount: 0,
            analysisCount: 0,
            updatedAt: new Date()
          }, ...prev]);
        } else {
          showError('Failed to create chat');
          return null;
        }
      } catch (error) {
        showError('Failed to create chat');
        return null;
      }
    }

    // Step 2: Add user message to UI immediately
    const userMessage = {
      _id: `temp-${Date.now()}`,
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsAnalyzing(true);
    setCurrentStep(0);

    try {
      // Step 3: Save user message to backend
      await chatService.addMessage(chatId, {
        type: 'user',
        content: query
      });

      // Step 4: Run analysis
      const [_, analysisResponse] = await Promise.all([
        simulateSteps(),
        analysisService.analyzeMultiPlatform(query)
      ]);

      if (analysisResponse.success) {
        // Step 5: Create AI message with analysis result
        const aiMessage = {
          _id: `temp-ai-${Date.now()}`,
          type: 'ai',
          content: analysisResponse.data,
          query: query,
          analysisId: analysisResponse.data._id,
          timestamp: new Date()
        };

        // Step 6: Save AI message to backend
        await chatService.addMessage(chatId, {
          type: 'ai',
          content: analysisResponse.data,
          query: query,
          analysisId: analysisResponse.data._id
        });

        // Step 7: Update UI
        setMessages(prev => [...prev, aiMessage]);

        // Step 8: Update chat title in sidebar (only if it was "New Chat")
        const newTitle = query.substring(0, 50) + (query.length > 50 ? '...' : '');
        
        setChats(prev => prev.map(chat =>
          chat._id === chatId
            ? {
                ...chat,
                title: chat.title === 'New Chat' ? newTitle : chat.title,
                messageCount: (chat.messageCount || 0) + 2,
                analysisCount: (chat.analysisCount || 0) + 1,
                updatedAt: new Date()
              }
            : chat
        ));

        // Update current chat title
        setCurrentChat(prev => prev ? {
          ...prev,
          title: prev.title === 'New Chat' ? newTitle : prev.title
        } : prev);

        // Return chatId along with data so Chat.jsx can update URL
        return { 
          ...analysisResponse.data, 
          chatId 
        };
      } else {
        showError(analysisResponse.message || 'Analysis failed');
        return null;
      }
    } catch (error) {
      showError(error.message || 'Failed to analyze');
      return null;
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(0);
    }
  }, [selectedPlatform, analysisOptions, simulateSteps, showError]);

  // Start new chat (clear current)
  const startNewChat = useCallback(() => {
    setCurrentChat(null);
    currentChatRef.current = null; // Clear the ref too
    setMessages([]);
    setIsAnalyzing(false);
    setCurrentStep(0);
  }, []);

  // Delete chat
  const removeChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.deleteChat(chatId);
      if (response.success) {
        setChats(prev => prev.filter(c => c._id !== chatId));
        if (currentChatRef.current === chatId) {
          startNewChat();
        }
        showSuccess('Chat deleted');
        return true;
      }
    } catch (error) {
      showError('Failed to delete chat');
    }
    return false;
  }, [startNewChat, showError, showSuccess]);

  // Rename chat
  const renameChat = useCallback(async (chatId, title) => {
    try {
      const response = await chatService.updateChat(chatId, { title });
      if (response.success) {
        setChats(prev => prev.map(c =>
          c._id === chatId ? { ...c, title } : c
        ));
        if (currentChatRef.current === chatId) {
          setCurrentChat(prev => ({ ...prev, title }));
        }
        return true;
      }
    } catch (error) {
      showError('Failed to rename chat');
    }
    return false;
  }, [showError]);

  const value = {
    // Current chat
    currentChat,
    messages,
    isAnalyzing,
    currentStep,
    analysisSteps,

    // Chat list
    chats,
    chatsLoading,

    // Options
    selectedPlatform,
    analysisOptions,

    // Setters
    setSelectedPlatform,
    setAnalysisOptions,

    // Actions
    fetchChats,
    loadChat,
    sendMessage,
    startNewChat,
    removeChat,
    renameChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export default ChatContext;