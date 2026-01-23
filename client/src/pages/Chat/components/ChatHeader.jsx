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
  FolderPlus,
  Plus,
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
    { id: 'all', name: 'All Platforms', icon: Globe, description: 'Search across all platforms', color: 'all' },
    { id: 'twitter', name: 'Twitter / X', icon: Twitter, description: 'Posts from X (Twitter)', color: 'twitter' },
    { id: 'reddit', name: 'Reddit', icon: MessageSquareText, description: 'Reddit posts & comments', color: 'reddit' },
    { id: 'bluesky', name: 'Bluesky', icon: CloudSun, description: 'Bluesky posts', color: 'bluesky' }
  ];

  const currentPlatform = platforms.find(p => p.id === selectedPlatform) || platforms[0];

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
                <div className="chat-title-subtitle">Ask anything about social media sentiment</div>
              </div>
            </div>

            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle tag="button" type="button" className="chat-platform-toggle">
                <Globe size={14} />
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
              <>
                <Button
                  color="link"
                  size="sm"
                  className="chat-header-action chat-save-btn gradient-primary text-white"
                  onClick={onSaveProject}
                  disabled={!onSaveProject}
                >
                  <FolderPlus size={16} />
                  <span>Save as Project</span>
                </Button>

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
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
