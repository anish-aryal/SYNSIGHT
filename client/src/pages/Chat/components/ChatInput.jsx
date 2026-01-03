import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { ArrowUp, Settings } from 'lucide-react';
import AnalysisOptionsModal from './AnalysisOptionsModal';
import './ChatInput.css';

export default function ChatInput({ value, onChange, onSend, disabled, isInitial }) {
  const [inputValue, setInputValue] = useState(value || '');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) onChange(newValue);
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !disabled) {
      onSend(inputValue);
      setInputValue('');
      if (onChange) onChange('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleOptions = () => setOptionsOpen(!optionsOpen);

  const hasContent = inputValue.trim().length > 0;

  return (
    <div className="chat-input-container">
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <div className="chat-input-box">
              {/* Input Area */}
              <div className="chat-input-main">
                <textarea
                  ref={textareaRef}
                  className="chat-textarea"
                  placeholder="Message SentimentAI..."
                  value={inputValue}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  disabled={disabled}
                  rows={1}
                />
              </div>

              {/* Bottom Actions */}
              <div className="chat-input-actions">
                <div className="chat-input-left">
                  <Button 
                    color="link" 
                    className="options-btn" 
                    onClick={toggleOptions}
                    title="Analysis Options"
                  >
                    <Settings size={18} />
                    <span>Options</span>
                  </Button>
                </div>
                <div className="chat-input-right">
                  <button
                    className={`send-btn ${hasContent ? 'active' : ''}`}
                    onClick={handleSubmit}
                    disabled={disabled || !hasContent}
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="chat-disclaimer">
              SentimentAI can make mistakes. Consider verifying important information.
            </p>
          </Col>
        </Row>
      </Container>

      {/* Options Modal */}
      <AnalysisOptionsModal 
        isOpen={optionsOpen} 
        toggle={toggleOptions} 
      />
    </div>
  );
}