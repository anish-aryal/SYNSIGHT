import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input, Button } from 'reactstrap';
import { Clock4, Globe, ArrowUp } from 'lucide-react';
import { useChat } from '../../../api/context/ChatContext';
import './ChatInput.css';

const TIMEFRAMES = [
  { value: 'last24hours', label: '24h' },
  { value: 'last7days', label: '7d' },
  { value: 'last30days', label: '30d' },
  { value: 'last90days', label: '90d' }
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'all', label: 'All' }
];

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const [inputValue, setInputValue] = useState(value || '');
  const textareaRef = useRef(null);

  const { analysisOptions, setAnalysisOptions } = useChat();

  useEffect(() => {
    if (value !== undefined) setInputValue(value);
  }, [value]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 180) + 'px';
  }, [inputValue]);

  const hasContent = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInputValue('');
    onChange?.('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeTf = analysisOptions?.timeframe || 'last7days';
  const activeLang = analysisOptions?.language || 'en';

  return (
    <div className="syn-modernComposer">
      <div className={`syn-modernBar ${disabled ? 'is-disabled' : ''}`}>
        <div className="syn-modernChips">
          <div className="syn-chipGroup">
            <span className="syn-chipIcon" aria-hidden="true">
              <Clock4 size={16} />
            </span>

            {TIMEFRAMES.map((tf) => {
              const active = activeTf === tf.value;
              return (
                <button
                  key={tf.value}
                  type="button"
                  className={`syn-chip ${active ? 'is-active' : ''}`}
                  onClick={() => setAnalysisOptions((p) => ({ ...p, timeframe: tf.value }))}
                  disabled={disabled}
                  aria-pressed={active}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          <div className="syn-chipGroup">
            <span className="syn-chipIcon" aria-hidden="true">
              <Globe size={16} />
            </span>

            <Input
              type="select"
              bsSize="sm"
              value={activeLang}
              onChange={(e) => setAnalysisOptions((p) => ({ ...p, language: e.target.value }))}
              disabled={disabled}
              className="syn-chipSelect"
              aria-label="Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </Input>
          </div>
        </div>

        <div className="syn-modernInputRow">
          <textarea
            ref={textareaRef}
            className="syn-modernTextarea"
            placeholder="Message SentimentAI…"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange?.(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
          />

          <Button
            type="button"
            className="syn-modernSend"
            onClick={handleSubmit}
            disabled={disabled || !hasContent}
            aria-label="Send"
          >
            <ArrowUp size={18} />
          </Button>
        </div>
      </div>

      <div className="syn-modernFooter">
        <div className="syn-modernDisclaimer">
          SentimentAI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}
