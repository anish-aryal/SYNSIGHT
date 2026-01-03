import React, { createContext, useContext, useState, useCallback } from 'react';
import * as analysisService from '../services/analysisService';
import { useApp } from './AppContext';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
  const { showError } = useApp();

  const [messages, setMessages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [analysisOptions, setAnalysisOptions] = useState({
  timeframe: 'last7days',
  analysisDepth: 'standard',
  platforms: {
    twitter: true,
    reddit: false,
    linkedin: false,
    instagram: false,
    facebook: false
  },
  location: 'all',
  language: 'en',
  filters: {
    excludeRetweets: false,
    excludeReplies: false,
    minEngagement: 0
  },
  contentSettings: {
    includeMedia: true,
    includeLinks: true
  }
});

  const analysisSteps = [
    'Parsing query and extracting filters',
    'Fetching data from social media sources',
    'Running sentiment analysis model',
    'Generating insights and visualizations'
  ];

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

  const analyzeMultiPlatform = useCallback(async (query) => {
    if (!query.trim()) return null;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAnalyzing(true);
    setCurrentStep(0);

    try {
      const stepsPromise = simulateSteps();
      const response = await analysisService.analyzeMultiPlatform(query);
      await stepsPromise;

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data,
          query: query,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        return response.data;
      } else {
        showError(response.message || 'Analysis failed');
        return null;
      }
    } catch (error) {
      showError(error.message || 'Failed to analyze sentiment');
      return null;
    } finally {
      setIsAnalyzing(false);
      setCurrentStep(0);
    }
  }, [simulateSteps, showError]);

  const analyzePlatform = useCallback(async (platform, query) => {
    try {
      setIsAnalyzing(true);
      
      let response;
      switch (platform) {
        case 'twitter':
          response = await analysisService.analyzeTwitter(query);
          break;
        case 'reddit':
          response = await analysisService.analyzeReddit(query);
          break;
        case 'bluesky':
          response = await analysisService.analyzeBluesky(query);
          break;
        default:
          response = await analysisService.analyzeMultiPlatform(query);
      }

      if (response.success) {
        return response.data;
      } else {
        showError(response.message || 'Analysis failed');
        return null;
      }
    } catch (error) {
      showError(error.message || 'Failed to analyze');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [showError]);

  const analyzeText = useCallback(async (text) => {
    try {
      const response = await analysisService.analyzeText(text);
      if (response.success) {
        return response.data;
      }
      showError(response.message || 'Analysis failed');
      return null;
    } catch (error) {
      showError(error.message || 'Failed to analyze text');
      return null;
    }
  }, [showError]);

  const fetchHistory = useCallback(async (page = 1, limit = 10, source = null) => {
    try {
      setHistoryLoading(true);
      const response = await analysisService.getHistory(page, limit, source);
      
      if (response.success) {
        setHistory(response.data.analyses);
        return response.data;
      }
      return null;
    } catch (error) {
      showError('Failed to fetch history');
      return null;
    } finally {
      setHistoryLoading(false);
    }
  }, [showError]);

  const fetchAnalysisById = useCallback(async (id) => {
    try {
      const response = await analysisService.getAnalysisById(id);
      if (response.success) {
        return response.data;
      }
      showError('Analysis not found');
      return null;
    } catch (error) {
      showError('Failed to fetch analysis');
      return null;
    }
  }, [showError]);

  const deleteAnalysis = useCallback(async (id) => {
    try {
      const response = await analysisService.deleteAnalysis(id);
      if (response.success) {
        setHistory(prev => prev.filter(item => item._id !== id));
        return true;
      }
      showError('Failed to delete analysis');
      return false;
    } catch (error) {
      showError('Failed to delete analysis');
      return false;
    }
  }, [showError]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await analysisService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      showError('Failed to fetch statistics');
      return null;
    }
  }, [showError]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setIsAnalyzing(false);
    setCurrentStep(0);
  }, []);

  const getLatestAnalysis = useCallback(() => {
    const aiMessages = messages.filter(m => m.type === 'ai');
    return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : null;
  }, [messages]);

  const value = {
    messages,
    isAnalyzing,
    currentStep,
    analysisSteps,
    history,
    historyLoading,
    statistics,
    analysisOptions,
    setAnalysisOptions,
    analyzeMultiPlatform,
    analyzePlatform,
    analyzeText,
    fetchHistory,
    fetchAnalysisById,
    deleteAnalysis,
    fetchStatistics,
    clearChat,
    getLatestAnalysis
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within AnalysisProvider');
  }
  return context;
};

export default AnalysisContext;