import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import SearchBar from './components/SearchBar';
import TrendingTopics from './components/TrendingTopics';
import { Sparkles } from 'lucide-react';
import RecentSearches from './components/Recentsearches';
import './Chat.css';

export default function Chat() {
    const [searchQuery, setSearchQuery] = useState('');

    const trendingTopics = [
        'AI technology',
        'Climate change',
        'Electric vehicles',
        'Remote work',
        'Cryptocurrency',
        'Mental health'
    ];

    const recentSearches = [
        'iPhone 15',
        'Taylor Swift',
        'ChatGPT',
        'Tesla'
    ];

    const handleSearch = (query) => {
        console.log('Searching for:', query);
        // Add your search logic here
    };
    const handleTopicClick = (topic) => {
        setSearchQuery(topic);
    };

    return (
        <div className="chat-page">
            <Container className="chat-container">
                <Row className="justify-content-center">
                    <Col xs={12} md={11} lg={10}>
                        {/* Hero Section */}
                        <div className="chat-hero">
                            <div className="chat-icon-wrapper">
                                <div className="chat-icon gradient-primary">
                                    <Sparkles size={40} color="white" />
                                </div>
                            </div>

                            <h4 className="chat-title">Social Media Sentiment Analysis</h4>
                            <p className="chat-subtitle">
                                Analyze sentiment across platforms with AI-powered insights
                            </p>
                        </div>

                        {/* Search Bar */}
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSearch={handleSearch}
                        />

                        {/* Topics Section */}
                        <Row className="topics-section">
                            <Col xs={12} md={6} className="mb-4 mb-md-0">
                                <TrendingTopics topics={trendingTopics} onTopicClick={handleTopicClick}/>
                            </Col>
                            <Col xs={12} md={6}>
                                <RecentSearches searches={recentSearches} onSearchClick={handleTopicClick} />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

