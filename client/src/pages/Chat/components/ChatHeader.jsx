import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { 
  Sparkles, 
  ChevronDown,
  Plus,
  Globe,
  Twitter,
  Check
} from 'lucide-react';
import { useChat } from '../../../api/context/ChatContext';

const RedditIcon = ({ size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="13" r="5" />
    <circle cx="9.6" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="14.4" cy="13" r="0.9" fill="currentColor" stroke="none" />
    <path d="M10.5 15.6c.9.8 2.1.8 3 0" />
    <path d="M15 9l2.2-1.6" />
    <circle cx="18.2" cy="6.4" r="1" />
  </svg>
);

const BlueskyIcon = ({ size = 18, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12c-2.8-2.8-6.2-2.3-6.2.4 0 2.7 2.6 4.4 6.2 4.4" />
    <path d="M12 12c2.8-2.8 6.2-2.3 6.2.4 0 2.7-2.6 4.4-6.2 4.4" />
  </svg>
);

export default function ChatHeader({ onNewChat, isInitial }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedPlatform, setSelectedPlatform } = useChat();

  const toggle = () => setDropdownOpen(!dropdownOpen);

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: Globe, description: 'Search across all platforms', color: 'all' },
    { id: 'twitter', name: 'Twitter / X', icon: Twitter, description: 'Posts from X (Twitter)', color: 'twitter' },
    { id: 'reddit', name: 'Reddit', icon: RedditIcon, description: 'Reddit posts & comments', color: 'reddit' },
    { id: 'bluesky', name: 'Bluesky', icon: BlueskyIcon, description: 'Bluesky posts', color: 'bluesky' }
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform) || platforms[0];
  const PlatformIcon = currentPlatform?.icon || Globe;

  const handlePlatformSelect = (platformId) => setSelectedPlatform(platformId);

  return (
    <Container fluid className="chat-header">
      <Row className="align-items-center">
        <Col>
          <div className="chat-header-left">
            <div className="chat-title">
              <div className="chat-title-icon gradient-primary">
                <Sparkles size={18} color="white" />
              </div>
              <div className="chat-title-text">
                <div className="chat-title-name">Sentiment Analysis Chat</div>
              </div>
            </div>

            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle tag="button" type="button" className="chat-platform-toggle">
                <div className={`platform-icon-wrapper ${currentPlatform.color} chat-platform-icon`}>
                  <PlatformIcon size={16} />
                </div>
                <span className="chat-platform-label">{currentPlatform.name}</span>
                <ChevronDown
                  size={14}
                  className={`dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`}
                />
              </DropdownToggle>

              <DropdownMenu className="platform-dropdown-menu">
                <div className="dropdown-header-text">Select Platform</div>

                {platforms.map((platform) => {
                  const IconComponent = platform.icon;
                  const isSelected = currentPlatform.id === platform.id;

                  return (
                    <DropdownItem
                      key={platform.id}
                      onClick={() => handlePlatformSelect(platform.id)}
                      className={`platform-dropdown-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div className={`platform-icon-wrapper ${platform.color}`}>
                          <IconComponent size={18} />
                        </div>
                        <div className="platform-info">
                          <div className="platform-name">{platform.name}</div>
                          <div className="platform-description">{platform.description}</div>
                        </div>
                        {isSelected && (
                          <div className="ms-auto">
                            <Check size={16} className="text-primary" />
                          </div>
                        )}
                      </div>
                    </DropdownItem>
                  );
                })}

                <DropdownItem divider />
                <div className="dropdown-footer-text">
                  <small className="text-muted">More platforms coming soon</small>
                </div>
              </DropdownMenu>
            </Dropdown>
          </div>
        </Col>

        <Col className="text-end">
          <div className="d-flex justify-content-end align-items-center gap-2">
            {!isInitial && (
              <Button
                outline
                color="dark"
                size="sm"
                className="chat-header-action chat-new-btn"
                onClick={onNewChat}
              >
                <Plus size={16} />
                <span>New Chat</span>
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
