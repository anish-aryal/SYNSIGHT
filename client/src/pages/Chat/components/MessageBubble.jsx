import React from 'react';
import { Sparkles, User } from 'lucide-react';

export default function MessageBubble({ message, children }) {
  const isUser = message.type === 'user';
  const formatTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const timeLabel = formatTime(message.createdAt);

  return (
    <div className={`message-row ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-row-inner ${isUser ? 'user' : 'ai'}`}>
        <div className={`message-col ${isUser ? 'user' : 'ai'}`}>
          <div className="d-flex align-items-start gap-3">
            <div className="flex-grow-1 overflow-hidden">
              {isUser ? (
                <div className="message-bubble message-bubble-user">
                  <span className="message-avatar user-avatar message-avatar-inline">
                    <User size={14} />
                  </span>
                  <p className="message-content mb-0">{message.content}</p>
                </div>
              ) : (
                <div className="message-bubble message-bubble-ai">
                  <div className="message-bubble-header">
                    <span className="message-avatar gradient-primary message-avatar-inline">
                      <Sparkles size={14} color="white" />
                    </span>
                    <span className="message-name">SentimentAI</span>
                    {timeLabel && <span className="message-time">{timeLabel}</span>}
                  </div>
                  {children}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
