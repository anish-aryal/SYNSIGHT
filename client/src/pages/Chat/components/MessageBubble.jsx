import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Sparkles, User } from 'lucide-react';

export default function MessageBubble({ message, children }) {
  const isUser = message.type === 'user';

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <div className="d-flex align-items-start gap-3">
              {isUser ? (
                <div className="message-avatar user-avatar">
                  <User size={14} />
                </div>
              ) : (
                <div className="message-avatar gradient-primary">
                  <Sparkles size={14} color="white" />
                </div>
              )}
              <div className="flex-grow-1 overflow-hidden">
                <div className="mb-2">
                  <span className="message-name">{isUser ? 'You' : 'SentimentAI'}</span>
                </div>
                {isUser ? (
                  <p className="message-content mb-0">{message.content}</p>
                ) : (
                  children
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}