import React, { useRef, useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Spinner } from 'reactstrap';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import AnalysisSteps from './components/AnalysisSteps';
import AnalysisResults from './components/AnalysisResults';
import SkeletonLoader from './components/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import { useAnalysis } from '../../api/context/AnalysisContext';
import './Chat.css';

export default function Chat() {
  const {
    messages,
    isAnalyzing,
    currentStep,
    analysisSteps,
    analyzeMultiPlatform,
    clearChat,
    history,
    fetchHistory
  } = useAnalysis();

  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const suggestions = [
    'Analyze sentiment for Tesla',
    'What do people think about AI?',
    'Climate change public opinion',
    'Remote work sentiment analysis'
  ];

  const isInitialState = messages.length === 0 && !isAnalyzing;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing, currentStep]);

  useEffect(() => {
    fetchHistory(1, 4);
  }, [fetchHistory]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setSearchQuery('');
    await analyzeMultiPlatform(query);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion);
  };

  const handleNewChat = () => {
    clearChat();
    setSearchQuery('');
  };

  // Initial State - Welcome Screen
  if (isInitialState) {
    return (
      <div className="chat-wrapper">
        {/* Header */}
        <ChatHeader onNewChat={handleNewChat} isInitial />

        {/* Main Content - Centered */}
        <div className="chat-main-area">
          <Container>
            <Row className="justify-content-center">
              <Col xs={12} lg={10} xl={8}>
                <div className="welcome-content">
                  {/* Logo & Title */}
                  <div className="welcome-header">
                    <div className="welcome-logo gradient-primary">
                      <Sparkles size={32} color="white" />
                    </div>
                    <h1 className="welcome-title">How can I help you today?</h1>
                  </div>

                  {/* Suggestions */}
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

        {/* Input - Fixed at bottom */}
        <ChatInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSend={handleSearch}
          disabled={isAnalyzing}
        />
      </div>
    );
  }

  // Chat State - Messages
  return (
    <div className="chat-wrapper">
      {/* Header */}
      <ChatHeader onNewChat={handleNewChat} />

      {/* Messages Area */}
      <div className="chat-messages-area">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message}>
            {message.type === 'ai' && (
              <AnalysisResults results={message.content} query={message.query} />
            )}
          </MessageBubble>
        ))}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="message-row ai">
            <Container>
              <Row className="justify-content-center">
                <Col xs={12} lg={10} xl={8}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="message-avatar gradient-primary">
                      <Sparkles size={16} color="white" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="message-name">SentimentAI</span>
                        <Badge color="light" pill className="analyzing-badge">
                          <Spinner size="sm" className="me-1" />
                          Analyzing
                        </Badge>
                      </div>
                      <AnalysisSteps steps={analysisSteps} currentStep={currentStep} />
                      <SkeletonLoader />
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <ChatInput onSend={handleSearch} disabled={isAnalyzing} />
    </div>
  );
}