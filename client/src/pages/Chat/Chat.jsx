import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner } from 'reactstrap';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import AnalysisSteps from './components/AnalysisSteps';
import AnalysisResults from './components/AnalysisResults';
import SkeletonLoader from './components/SkeletonLoader';
import { Sparkles } from 'lucide-react';
import { useChat } from '../../api/context/ChatContext';
import './Chat.css';

export default function Chat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  
  const {
    currentChat,
    messages,
    isAnalyzing,
    currentStep,
    analysisSteps,
    sendMessage,
    loadChat,
    startNewChat,
    fetchChats
  } = useChat();

  const messagesEndRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hasLoadedChat = useRef(false);

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

  // Handle sending message
  const handleSend = async (query) => {
    if (!query.trim()) return;
    setSearchQuery('');
    
    const result = await sendMessage(query);
    
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

        <ChatInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSend={handleSend}
          disabled={isAnalyzing}
        />
      </div>
    );
  }

  // Chat State - Messages
  return (
    <div className="chat-wrapper">
      <ChatHeader onNewChat={handleNewChat} />

      <div className="chat-messages-area">
        {messages.map((message) => (
          <MessageBubble key={message._id || message.id} message={message}>
            {message.type === 'ai' && (
              <AnalysisResults results={message.content} query={message.query} />
            )}
          </MessageBubble>
        ))}

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

      <ChatInput onSend={handleSend} disabled={isAnalyzing} />
    </div>
  );
}