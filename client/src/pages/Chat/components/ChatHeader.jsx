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
  Share2,
  Globe,
  Twitter,
  MessageSquareText,
  CloudSun,
  Check
} from 'lucide-react';
import { useChat } from '../../../api/context/ChatContext';

export default function ChatHeader({ onNewChat, onSaveProject, isInitial }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { selectedPlatform, setSelectedPlatform } = useChat();

  const toggle = () => setDropdownOpen(!dropdownOpen);

  const platforms = [
    { 
      id: 'all', 
      name: 'All Platforms', 
      icon: Globe, 
      description: 'Search across all platforms',
      color: 'all'
    },
    { 
      id: 'twitter', 
      name: 'Twitter / X', 
      icon: Twitter, 
      description: 'Posts from X (Twitter)',
      color: 'twitter'
    },
    { 
      id: 'reddit', 
      name: 'Reddit', 
      icon: MessageSquareText, 
      description: 'Reddit posts & comments',
      color: 'reddit'
    },
    { 
      id: 'bluesky', 
      name: 'Bluesky', 
      icon: CloudSun, 
      description: 'Bluesky posts',
      color: 'bluesky'
    }
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform) || platforms[0];

  const handlePlatformSelect = (platformId) => {
    setSelectedPlatform(platformId);
  };

  return (
    <Container fluid className="chat-header py-2 px-3">
      <Row className="align-items-center">
        <Col xs="auto">
          <Dropdown isOpen={dropdownOpen} toggle={toggle}>
            <DropdownToggle 
              tag="div" 
              className="model-selector"
            >
              <Sparkles size={18} className="text-primary" />
              <span className="model-name">SentimentAI</span>
              <span className="platform-badge">{currentPlatform.name}</span>
              <ChevronDown 
                size={16} 
                className={`text-muted dropdown-chevron ${dropdownOpen ? 'rotated' : ''}`} 
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
                <small className="text-muted">
                  More platforms coming soon
                </small>
              </div>
            </DropdownMenu>
          </Dropdown>
        </Col>
        <Col className="text-end">
          <div className="d-flex justify-content-end align-items-center gap-2">
            {!isInitial && (
              <>
                <Button
                  color="link"
                  size="sm"
                  className="d-flex align-items-center gap-1 text-secondary text-decoration-none"
                  onClick={onSaveProject}
                >
                  <Share2 size={16} />
                  <span className="d-none d-sm-inline">Share</span>
                </Button>
                <Button
                  outline
                  color="dark"
                  size="sm"
                  className="d-flex align-items-center gap-1 rounded-3"
                  onClick={onNewChat}
                >
                  <Plus size={16} />
                  <span>New Chat</span>
                </Button>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}