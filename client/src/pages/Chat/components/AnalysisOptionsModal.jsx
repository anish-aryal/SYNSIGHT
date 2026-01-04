import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Row,
  Col,
  Input,
  Label,
  Collapse
} from 'reactstrap';
import {
  Settings,
  Clock,
  Globe,
  MapPin,
  Filter,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Twitter,
  MessageSquareText,
  Linkedin,
  Instagram,
  Facebook
} from 'lucide-react';
import { useChat } from '../../../api/context/ChatContext';
import './AnalysisOptionsModal.css';

// Default options
const DEFAULT_OPTIONS = {
  timeframe: 'last7days',
  analysisDepth: 'standard',
  platforms: {
    twitter: true,
    reddit: true,
    bluesky: true,
    linkedin: false,
    instagram: false,
    facebook: false
  },
  location: 'all',
  language: 'en',
  filters: {
    excludeRetweets: false,
    excludeReplies: false,
    minEngagement: 0
  },
  contentSettings: {
    includeMedia: true,
    includeLinks: true
  }
};

export default function AnalysisOptionsModal({ isOpen, toggle }) {
  const { analysisOptions, setAnalysisOptions } = useChat();
  
  // Local state with default values
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  // Collapse states
  const [openSections, setOpenSections] = useState({
    timeScope: true,
    platforms: true,
    location: false,
    filters: false,
    content: false
  });

  // Sync with context when modal opens
  useEffect(() => {
    if (isOpen) {
      // Merge context options with defaults to ensure all properties exist
      setOptions(prev => ({
        ...DEFAULT_OPTIONS,
        ...analysisOptions,
        platforms: {
          ...DEFAULT_OPTIONS.platforms,
          ...(analysisOptions?.platforms || {})
        },
        filters: {
          ...DEFAULT_OPTIONS.filters,
          ...(analysisOptions?.filters || {})
        },
        contentSettings: {
          ...DEFAULT_OPTIONS.contentSettings,
          ...(analysisOptions?.contentSettings || {})
        }
      }));
    }
  }, [isOpen, analysisOptions]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handlePlatformToggle = (platform) => {
    setOptions(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: !prev.platforms?.[platform]
      }
    }));
  };

  const handleApply = () => {
    setAnalysisOptions(options);
    toggle();
  };

  const handleReset = () => {
    setOptions(DEFAULT_OPTIONS);
  };

  const platforms = [
    { id: 'twitter', name: 'Twitter/X', icon: Twitter },
    { id: 'reddit', name: 'Reddit', icon: MessageSquareText },
    { id: 'bluesky', name: 'Bluesky', icon: Globe },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'facebook', name: 'Facebook', icon: Facebook }
  ];

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="options-modal" size="md" centered>
      {/* Header */}
      <ModalHeader className="options-modal-header border-0 pb-0" close={<span />}>
        <div className="d-flex align-items-center gap-3">
          <div className="options-header-icon">
            <Settings size={20} color="white" />
          </div>
          <div>
            <h5 className="mb-0 fw-semibold">Analysis Options</h5>
            <p className="mb-0 text-muted small">Configure your sentiment analysis parameters</p>
          </div>
        </div>
        <button className="options-close-btn" onClick={toggle}>
          <X size={20} />
        </button>
      </ModalHeader>

      <ModalBody className="options-modal-body">
        {/* Time & Scope Section */}
        <div className="options-section">
          <button 
            className="options-section-toggle"
            onClick={() => toggleSection('timeScope')}
          >
            <div className="d-flex align-items-center gap-2">
              <Clock size={18} className="text-primary" />
              <span>Time & Scope</span>
            </div>
            {openSections.timeScope ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <Collapse isOpen={openSections.timeScope}>
            <div className="options-section-content">
              <Row className="g-3">
                <Col xs={6}>
                  <Label className="options-label">Timeframe</Label>
                  <Input
                    type="select"
                    className="options-select"
                    value={options.timeframe || 'last7days'}
                    onChange={(e) => setOptions(prev => ({ ...prev, timeframe: e.target.value }))}
                  >
                    <option value="last24hours">Last 24 hours</option>
                    <option value="last7days">Last 7 days</option>
                    <option value="last30days">Last 30 days</option>
                    <option value="last90days">Last 90 days</option>
                    <option value="custom">Custom range</option>
                  </Input>
                </Col>
                <Col xs={6}>
                  <Label className="options-label">Analysis Depth</Label>
                  <Input
                    type="select"
                    className="options-select"
                    value={options.analysisDepth || 'standard'}
                    onChange={(e) => setOptions(prev => ({ ...prev, analysisDepth: e.target.value }))}
                  >
                    <option value="quick">Quick</option>
                    <option value="standard">Standard</option>
                    <option value="deep">Deep Analysis</option>
                  </Input>
                </Col>
              </Row>
            </div>
          </Collapse>
        </div>

        {/* Platforms Section */}
        <div className="options-section">
          <button 
            className="options-section-toggle"
            onClick={() => toggleSection('platforms')}
          >
            <div className="d-flex align-items-center gap-2">
              <Globe size={18} className="text-primary" />
              <span>Platforms</span>
            </div>
            {openSections.platforms ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <Collapse isOpen={openSections.platforms}>
            <div className="options-section-content">
              <Row className="g-2">
                {platforms.map((platform) => {
                  const isChecked = options.platforms?.[platform.id] || false;
                  return (
                    <Col xs={6} key={platform.id}>
                      <div 
                        className={`platform-checkbox ${isChecked ? 'checked' : ''}`}
                        onClick={() => handlePlatformToggle(platform.id)}
                      >
                        <div className={`checkbox-indicator ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <span className="checkmark">✓</span>}
                        </div>
                        <span className="platform-checkbox-label">{platform.name}</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </Collapse>
        </div>

        {/* Location & Language Section */}
        <div className="options-section">
          <button 
            className="options-section-toggle"
            onClick={() => toggleSection('location')}
          >
            <div className="d-flex align-items-center gap-2">
              <MapPin size={18} className="text-success" />
              <span>Location & Language</span>
            </div>
            {openSections.location ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <Collapse isOpen={openSections.location}>
            <div className="options-section-content">
              <Row className="g-3">
                <Col xs={6}>
                  <Label className="options-label">Location</Label>
                  <Input
                    type="select"
                    className="options-select"
                    value={options.location || 'all'}
                    onChange={(e) => setOptions(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="all">All Locations</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">Europe</option>
                    <option value="asia">Asia</option>
                  </Input>
                </Col>
                <Col xs={6}>
                  <Label className="options-label">Language</Label>
                  <Input
                    type="select"
                    className="options-select"
                    value={options.language || 'en'}
                    onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="all">All Languages</option>
                  </Input>
                </Col>
              </Row>
            </div>
          </Collapse>
        </div>

        {/* Filters Section */}
        <div className="options-section">
          <button 
            className="options-section-toggle"
            onClick={() => toggleSection('filters')}
          >
            <div className="d-flex align-items-center gap-2">
              <Filter size={18} className="text-warning" />
              <span>Filters</span>
            </div>
            {openSections.filters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <Collapse isOpen={openSections.filters}>
            <div className="options-section-content">
              <div className="d-flex flex-column gap-2">
                <div className="filter-checkbox">
                  <Input
                    type="checkbox"
                    id="excludeRetweets"
                    checked={options.filters?.excludeRetweets || false}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      filters: { 
                        ...prev.filters, 
                        excludeRetweets: e.target.checked 
                      }
                    }))}
                  />
                  <Label for="excludeRetweets" className="mb-0 ms-2">Exclude retweets</Label>
                </div>
                <div className="filter-checkbox">
                  <Input
                    type="checkbox"
                    id="excludeReplies"
                    checked={options.filters?.excludeReplies || false}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      filters: { 
                        ...prev.filters, 
                        excludeReplies: e.target.checked 
                      }
                    }))}
                  />
                  <Label for="excludeReplies" className="mb-0 ms-2">Exclude replies</Label>
                </div>
              </div>
            </div>
          </Collapse>
        </div>

        {/* Content Settings Section */}
        <div className="options-section">
          <button 
            className="options-section-toggle"
            onClick={() => toggleSection('content')}
          >
            <div className="d-flex align-items-center gap-2">
              <FileText size={18} className="text-danger" />
              <span>Content Settings</span>
            </div>
            {openSections.content ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <Collapse isOpen={openSections.content}>
            <div className="options-section-content">
              <div className="d-flex flex-column gap-2">
                <div className="filter-checkbox">
                  <Input
                    type="checkbox"
                    id="includeMedia"
                    checked={options.contentSettings?.includeMedia || false}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      contentSettings: { 
                        ...prev.contentSettings, 
                        includeMedia: e.target.checked 
                      }
                    }))}
                  />
                  <Label for="includeMedia" className="mb-0 ms-2">Include posts with media</Label>
                </div>
                <div className="filter-checkbox">
                  <Input
                    type="checkbox"
                    id="includeLinks"
                    checked={options.contentSettings?.includeLinks || false}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      contentSettings: { 
                        ...prev.contentSettings, 
                        includeLinks: e.target.checked 
                      }
                    }))}
                  />
                  <Label for="includeLinks" className="mb-0 ms-2">Include posts with links</Label>
                </div>
              </div>
            </div>
          </Collapse>
        </div>
      </ModalBody>

      <ModalFooter className="options-modal-footer border-0">
        <Button color="link" className="reset-btn" onClick={handleReset}>
          Reset
        </Button>
        <Button className="apply-btn gradient-primary" onClick={handleApply}>
          Apply Options
        </Button>
      </ModalFooter>
    </Modal>
  );
}