import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as chatService from '../services/chatService';
import * as analysisService from '../services/analysisService';
import { useApp } from './AppContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { showError, showSuccess } = useApp();

  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentChatRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Platform selection for analysis
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Analysis configuration options
  const [analysisOptions, setAnalysisOptions] = useState({
    timeframe: 'last7days',
    language: 'en',
    platforms: { twitter: true, reddit: true, bluesky: true }
  });

  const analysisSteps = [
    'Parsing query and extracting filters',
    'Fetching data from social media sources',
    'Running sentiment analysis model',
    'Generating insights and visualizations'
  ];

  const simulateSteps = useCallback(() => {
    setIsAnalyzing(true);
    setCurrentStep(0);

    return new Promise((resolve) => {
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        setCurrentStep(step);

        if (step >= analysisSteps.length) {
          clearInterval(interval);
          setTimeout(resolve, 600);
        }
      }, 700);
    });
  }, [analysisSteps.length]);

  const persistMessage = useCallback(async (chatId, message) => {
    const fn = chatService.addMessage || chatService.sendMessage;
    if (!fn) throw new Error('chatService.addMessage/sendMessage is missing');
    return fn(chatId, message);
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      setChatsLoading(true);
      const response = await chatService.getChats();
      if (response.success) setChats(response.data.chats);
    } catch (error) {
      showError(error.message || 'Failed to fetch chats');
    } finally {
      setChatsLoading(false);
    }
  }, [showError]);

  const startNewChat = useCallback(() => {
    setCurrentChat(null);
    currentChatRef.current = null;
    setMessages([]);
    setIsAnalyzing(false);
    setCurrentStep(0);
  }, []);

  const loadChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.getChatById(chatId);
      if (response.success) {
        setCurrentChat(response.data);
        currentChatRef.current = response.data._id;
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      showError(error.message || 'Failed to load chat');
    }
  }, [showError]);

  const sendMessage = useCallback(async (query) => {
    const trimmed = query?.trim?.() ?? '';
    if (!trimmed) return null;

    let chatId = currentChatRef.current;

    // Create chat if it doesn't exist
    if (!chatId) {
      try {
        const createResponse = await chatService.createChat({
          platform: selectedPlatform,
          options: {
            timeframe: analysisOptions.timeframe,
            language: analysisOptions.language
          }
        });

        if (!createResponse.success) {
          showError(createResponse.message || 'Failed to create chat');
          return null;
        }

        chatId = createResponse.data._id;
        setCurrentChat(createResponse.data);
        currentChatRef.current = createResponse.data._id;
      } catch (error) {
        showError(error.message || 'Failed to create chat');
        return null;
      }
    }

    // Optimistic user message
    const tempUser = {
      _id: `temp-user-${Date.now()}`,
      type: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUser]);

    // Persist user message
    try {
      await persistMessage(chatId, { type: 'user', content: trimmed });
    } catch (error) {
      showError(error.message || 'Failed to save message');
    }

    // Run analysis + steps animation
    try {
      const [_, analysisResponse] = await Promise.all([
        simulateSteps(),
        selectedPlatform === 'all'
          ? analysisService.analyzeMultiPlatform(trimmed, analysisOptions, 100)
          : analysisService.analyzePlatform(selectedPlatform, trimmed, analysisOptions, 100)
      ]);

      if (!analysisResponse?.success) {
        showError(analysisResponse?.message || 'Analysis failed');
        return { chatId };
      }

      const aiMsg = {
        _id: `temp-ai-${Date.now()}`,
        type: 'ai',
        content: analysisResponse.data,
        query: trimmed,
        analysisId: analysisResponse.data?._id,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Persist AI message
      try {
        await persistMessage(chatId, {
          type: 'ai',
          content: analysisResponse.data,
          analysisId: analysisResponse.data?._id
        });
      } catch (error) {
        showError(error.message || 'Failed to save AI message');
      }

      return { chatId };
    } catch (error) {
      showError(error.message || 'Failed to analyze');
      return { chatId };
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(0);
    }
  }, [analysisOptions.language, analysisOptions.platforms, analysisOptions.timeframe, persistMessage, selectedPlatform, showError, simulateSteps]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.deleteChat(chatId);
      if (response.success) {
        showSuccess('Chat deleted');
        await fetchChats();
        if (currentChatRef.current === chatId) startNewChat();
      }
    } catch (error) {
      showError(error.message || 'Failed to delete chat');
    }
  }, [fetchChats, showError, showSuccess, startNewChat]);

  const archiveChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.archiveChat(chatId);
      if (response.success) {
        showSuccess('Chat archived');
        await fetchChats();
      }
    } catch (error) {
      showError(error.message || 'Failed to archive chat');
    }
  }, [fetchChats, showError, showSuccess]);

  const clearMessages = useCallback(async (chatId) => {
    try {
      const response = await chatService.clearMessages(chatId);
      if (response.success) {
        showSuccess('Messages cleared');
        if (currentChatRef.current === chatId) setMessages([]);
        await fetchChats();
      }
    } catch (error) {
      showError(error.message || 'Failed to clear messages');
    }
  }, [fetchChats, showError, showSuccess]);

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        messages,

        chats,
        chatsLoading,

        isAnalyzing,
        currentStep,
        analysisSteps,

        // Platform selection state
        selectedPlatform,
        setSelectedPlatform,

        analysisOptions,
        setAnalysisOptions,

        fetchChats,
        startNewChat,
        loadChat,
        sendMessage,

        deleteChat,
        archiveChat,
        clearMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within a ChatProvider');
  return ctx;
};
