import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Badge } from 'reactstrap';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import AnalysisSteps from './components/AnalysisSteps';
import AnalysisResults from './components/AnalysisResults';
import SkeletonLoader from './components/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import { useChat } from '../../api/context/ChatContext';

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    currentChat,
    messages,
    isAnalyzing,
    currentStep,
    analysisSteps,
    sendMessage,
    loadChat,
    startNewChat,
    fetchChats,
    selectedPlatform,
    analysisOptions,
    setSelectedPlatform,
    setAnalysisOptions
  } = useChat();
  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasLoadedChat = useRef(false);
  const hasAutoAnalyzed = useRef(false);

  const suggestions = [
    'Analyze sentiment for Tesla',
    'What do people think about AI?',
    'Climate change public opinion',
    'Remote work sentiment analysis'
  ];

  const isInitialState = messages.length === 0 && !isAnalyzing;

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing, currentStep]);

  // Load chat if chatId in URL
  useEffect(() => {
    if (chatId && !hasLoadedChat.current) {
      hasLoadedChat.current = true;
      loadChat(chatId);
    } else if (!chatId) {
      // If no chatId in URL, start fresh (but don't call startNewChat if we have messages)
      hasLoadedChat.current = false;
    }
  }, [chatId, loadChat]);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Handle auto-analyze from Explore page
  useEffect(() => {
    if (location.state?.autoAnalyze && location.state?.query && !hasAutoAnalyzed.current) {
      hasAutoAnalyzed.current = true;
      const query = location.state.query;
      const isExplore = location.state?.source === 'explore';
      const platform = location.state?.platform || (isExplore ? 'bluesky' : selectedPlatform);
      const timeframe = location.state?.timeframe || (isExplore ? 'last24hours' : analysisOptions.timeframe);

      if (isExplore || location.state?.platform) {
        setSelectedPlatform(platform);
      }
      if (isExplore || location.state?.timeframe) {
        setAnalysisOptions((prev) => ({ ...prev, timeframe }));
      }

      // Ensure auto-analyze from Explore always starts a fresh chat
      startNewChat();
      hasLoadedChat.current = false;

      // Clear the state from navigation
      navigate(location.pathname, { replace: true, state: {} });

      // Trigger analysis
      handleSend(query, { platform, timeframe });
    }
  }, [location.state]);

  // Handle sending message
  const handleSend = async (query, overrides) => {
    if (!query.trim()) return;
    setSearchQuery('');
    
    const result = await sendMessage(query, overrides);
    
    // If this created a new chat, update URL
    if (result && result.chatId && !chatId) {
      navigate(`/chat/${result.chatId}`, { replace: true });
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  // Handle new chat
  const handleNewChat = () => {
    startNewChat();
    setSearchQuery('');
    hasLoadedChat.current = false;
    navigate('/chat');
  };

  // Initial State - Welcome Screen
  if (isInitialState) {
    return (
      <div className="chat-wrapper">
        <ChatHeader onNewChat={handleNewChat} isInitial />

        <div className="chat-main-area">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} lg={10} xl={8}>
                <div className="welcome-content">
                  <div className="welcome-header">
                    <div className="welcome-logo gradient-primary">
                      <Sparkles size={32} color="white" />
                    </div>
                    <h1 className="welcome-title">How can I help you today?</h1>
                  </div>

                  <div className="suggestions-grid">
                    <Row className="g-3">
                      {suggestions.map((suggestion, index) => (
                        <Col xs={12} sm={6} key={index}>
                          <button
                            className="suggestion-card"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <span>{suggestion}</span>
                            <span className="suggestion-arrow">→</span>
                          </button>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div className="chat-input-area">
          <Container fluid className="chat-shell">
            <Row className="justify-content-center g-0">
              <Col xs={12} lg={11} xl={10} xxl={9} className="chat-thread">
                <ChatInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSend={handleSend}
                  disabled={isAnalyzing}
                />
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }

  // Chat State - Messages
  return (
    <div className="chat-wrapper">
      <ChatHeader onNewChat={handleNewChat} />

      <div className="chat-messages-area">
        <Container fluid className="chat-shell">
          <Row className="justify-content-center">
            <Col xs={12} lg={11} xl={10} xxl={9} className="chat-thread">
              {messages.map((message) => (
                <MessageBubble key={message._id || message.id} message={message}>
                  {message.type === 'ai' && (
                    <AnalysisResults results={message.content} query={message.query} />
                  )}
                </MessageBubble>
              ))}

              {isAnalyzing && (
                <div className="message-row ai">
                  <div className="message-row-inner ai">
                    <div className="message-col ai">
                      <div className="d-flex align-items-start gap-3">
                        <div className="flex-grow-1">
                          <div className="message-bubble message-bubble-ai">
                            <div className="message-bubble-header">
                              <span className="message-avatar gradient-primary message-avatar-inline">
                                <Sparkles size={14} color="white" />
                              </span>
                              <span className="message-name">SentimentAI</span>
                              <Badge color="light" pill className="analyzing-badge message-bubble-meta">
                                <span className="skeleton-line skeleton-inline me-1" style={{ width: '12px', height: '12px' }} />
                                Analyzing
                              </Badge>
                            </div>
                            <AnalysisSteps steps={analysisSteps} currentStep={currentStep} />
                            <SkeletonLoader />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </Col>
          </Row>
        </Container>
      </div>

      <div className="chat-input-area">
        <Container fluid className="chat-shell">
          <Row className="justify-content-center g-0">
            <Col xs={12} lg={11} xl={10} xxl={9} className="chat-thread">
              <ChatInput onSend={handleSend} disabled={isAnalyzing} />
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
