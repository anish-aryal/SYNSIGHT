import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as chatService from '../services/chatService';
import * as analysisService from '../services/analysisService';
import { useApp } from './AppContext';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { showError } = useApp();

  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentChatRef = useRef(null);

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Platform selection for analysis (used by ChatHeader)
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
      const res = await chatService.getChats();
      if (res?.success) setChats(res.data.chats);
    } catch (e) {
      showError(e.message || 'Failed to fetch chats');
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
      const res = await chatService.getChatById(chatId);
      if (res?.success) {
        setCurrentChat(res.data);
        currentChatRef.current = res.data._id;
        setMessages(res.data.messages || []);
      }
    } catch (e) {
      showError(e.message || 'Failed to load chat');
    }
  }, [showError]);

  const deleteChat = useCallback(async (chatId) => {
    try {
      const res = await chatService.deleteChat(chatId);
      if (res?.success) {
        // Remove from chats list
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));

        // If this is the current chat, start a new one
        if (currentChatRef.current === chatId) {
          startNewChat();
        }

        return true;
      }
      return false;
    } catch (e) {
      showError(e.message || 'Failed to delete chat');
      return false;
    }
  }, [showError, startNewChat]);

  const sendMessage = useCallback(async (query, overrides = {}) => {
    const trimmed = (query || '').trim();
    if (!trimmed) return null;

    const effectivePlatform = overrides.platform ?? selectedPlatform;
    const effectiveTimeframe = overrides.timeframe ?? analysisOptions.timeframe;
    const effectiveLanguage = overrides.language ?? analysisOptions.language;
    const effectivePlatforms = overrides.platforms ?? analysisOptions.platforms;
    const effectiveOptions = {
      timeframe: effectiveTimeframe,
      language: effectiveLanguage,
      platforms: effectivePlatforms
    };

    let chatId = currentChatRef.current;

    // Create chat if needed
    if (!chatId) {
      try {
        const createRes = await chatService.createChat({
          platform: effectivePlatform,
          options: {
            timeframe: effectiveTimeframe,
            language: effectiveLanguage
          }
        });

        if (!createRes?.success) {
          showError(createRes?.message || 'Failed to create chat');
          return null;
        }

        chatId = createRes.data._id;
        setCurrentChat(createRes.data);
        currentChatRef.current = chatId;
      } catch (e) {
        showError(e.message || 'Failed to create chat');
        return null;
      }
    }

    // Optimistic user message
    setMessages((prev) => [
      ...prev,
      { _id: `temp-user-${Date.now()}`, type: 'user', content: trimmed, createdAt: new Date().toISOString() }
    ]);

    // Persist user
    try {
      await persistMessage(chatId, { type: 'user', content: trimmed });
    } catch (e) {
      showError(e.message || 'Failed to save message');
    }

    try {
      const [_, analysisRes] = await Promise.all([
        simulateSteps(),
        effectivePlatform === 'all'
          ? analysisService.analyzeMultiPlatform(trimmed, effectiveOptions, 100)
          : analysisService.analyzePlatform(effectivePlatform, trimmed, effectiveOptions, 100)
      ]);

      if (!analysisRes?.success) {
        showError(analysisRes?.message || 'Analysis failed');
        return { chatId };
      }

      const aiMessage = {
        _id: `temp-ai-${Date.now()}`,
        type: 'ai',
        content: analysisRes.data,
        query: trimmed,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Persist AI
      try {
        await persistMessage(chatId, { type: 'ai', content: analysisRes.data });
      } catch (e) {
        showError(e.message || 'Failed to save AI message');
      }

      return { chatId };
    } catch (e) {
      showError(e.message || 'Failed to analyze');
      return { chatId };
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(0);
    }
  }, [analysisOptions.language, analysisOptions.platforms, analysisOptions.timeframe, persistMessage, selectedPlatform, showError, simulateSteps]);

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

        selectedPlatform,
        setSelectedPlatform,

        analysisOptions,
        setAnalysisOptions,

        fetchChats,
        startNewChat,
        loadChat,
        sendMessage,
        deleteChat
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
