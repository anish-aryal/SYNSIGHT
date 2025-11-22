import React, { useState } from 'react';
import { Container, Row, Col } from 'reactstrap';
import ExploreHeader from './components/ExploreHeader';
import FilterTabs from './components/FilterTabs';
import CategoryButtons from './components/CategoryButtons';
import TopicCard from './components/TopicCard';
import RecentSearches from './components/RecentSearches';
import SearchStats from './components/SearchStats';
import './Explore.css';

export default function Explore() {
  const [activeTab, setActiveTab] = useState('trending');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['All', 'Technology', 'Business', 'Environment', 'Health', 'Entertainment', 'Crypto'];

  const allTopics = [
    {
      id: 1,
      category: 'Technology',
      categoryColor: '#FF5722',
      title: 'AI Revolution',
      mentions: '125K',
      sentiment: 'positive',
      trend: 45
    },
    {
      id: 2,
      category: 'Environment',
      categoryColor: '#4CAF50',
      title: 'Climate Action',
      mentions: '98K',
      sentiment: 'neutral',
      trend: 23
    },
    {
      id: 3,
      category: 'Automotive',
      categoryColor: '#FF5722',
      title: 'Tesla Cybertruck',
      mentions: '87K',
      sentiment: 'positive',
      trend: 67
    },
    {
      id: 4,
      category: 'Technology',
      categoryColor: '#FF5722',
      title: 'ChatGPT Update',
      mentions: '76K',
      sentiment: 'positive',
      trend: 34
    },
    {
      id: 5,
      category: 'Technology',
      categoryColor: '#FF5722',
      title: 'iPhone 16',
      mentions: '65K',
      sentiment: 'positive',
      trend: 12
    },
    {
      id: 6,
      category: 'Health',
      categoryColor: '#2196F3',
      title: 'Mental Health',
      mentions: '54K',
      sentiment: 'neutral',
      trend: 8
    },
    {
      id: 7,
      category: 'Business',
      categoryColor: '#FFC107',
      title: 'Remote Work',
      mentions: '43K',
      sentiment: 'positive',
      trend: 5
    },
    {
      id: 8,
      category: 'Crypto',
      categoryColor: '#9C27B0',
      title: 'NFT Market',
      mentions: '32K',
      sentiment: 'negative',
      trend: 23
    }
  ];

  const recentSearchesData = [
    {
      id: 1,
      title: 'Tesla brand sentiment',
      platform: 'Twitter',
      timeAgo: '2 hours ago',
      sentiment: 78,
      sentimentLabel: 'positive'
    },
    {
      id: 2,
      title: 'Nike vs Adidas',
      platform: 'Reddit',
      timeAgo: '5 hours ago',
      sentiment: 65,
      sentimentLabel: 'positive'
    },
    {
      id: 3,
      title: 'iPhone 15 reviews',
      platform: 'Twitter',
      timeAgo: '1 day ago',
      sentiment: 82,
      sentimentLabel: 'positive'
    },
    {
      id: 4,
      title: 'Climate change discussion',
      platform: 'Reddit',
      timeAgo: '2 days ago',
      sentiment: 45,
      sentimentLabel: 'positive'
    },
    {
      id: 5,
      title: 'AI ethics debate',
      platform: 'Twitter',
      timeAgo: '3 days ago',
      sentiment: 52,
      sentimentLabel: 'positive'
    }
  ];

  const filteredTopics = activeCategory === 'all' 
    ? allTopics 
    : allTopics.filter(topic => topic.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="explore-page">
      <Container className='mt-5'>
        <Row>
          <Col>
            <ExploreHeader />
            
            <FilterTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {activeTab === 'trending' ? (
              <>
                <CategoryButtons 
                  categories={categories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  
                />

                <Row className="g-4">
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topic) => (
                      <Col key={topic.id} xs={12} md={6} lg={4}>
                        <TopicCard topic={topic} />
                      </Col>
                    ))
                  ) : (
                    <Col xs={12}>
                      <div className="text-center py-5">
                        <p className="text-muted fs-5">No topics found in this category</p>
                      </div>
                    </Col>
                  )}
                </Row>
              </>
            ) : (
              <>
                <RecentSearches searches={recentSearchesData} />
                <SearchStats />
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}