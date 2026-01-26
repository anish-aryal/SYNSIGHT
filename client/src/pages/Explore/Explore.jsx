import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Card, CardBody } from 'reactstrap';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import { getTrendingTopics } from '../../api/services/trendingService';

export default function Explore() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTrendingTopics('all');

        if (response.success && response.data.topics) {
          setTopics(response.data.topics);
        } else {
          setTopics([]);
        }
      } catch (err) {
        console.error('Error fetching trending topics:', err);
        setError(err.message || 'Failed to fetch trending topics');
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  const handleTopicClick = (topic) => {
    const query = topic.keywords && topic.keywords.length > 0
      ? topic.keywords.join(' ')
      : topic.title.replace('#', '');

    navigate('/chat', {
      state: {
        autoAnalyze: true,
        query,
        source: 'explore',
        platform: 'bluesky',
        timeframe: 'last24hours'
      }
    });
  };

  return (
    <div className="explore-page">
      <Container className="mt-5">
        <Row>
          <Col>
            <PageHeader
              title="Trending Topics"
              subtitle="Discover what's trending on Bluesky (last 24 hours) - Click any topic to analyze"
            />

            {error && (
              <Alert color="danger" className="mt-3">
                <strong>Error:</strong> {error}
              </Alert>
            )}

            {loading ? (
              <div className="mt-4">
                <Card className="border-0 explore-card">
                  <CardBody className="p-0">
                    <div className="list-group list-group-flush">
                      {[...Array(10)].map((_, index) => (
                        <div
                          key={index}
                          className="list-group-item py-3 px-4"
                        >
                          <div className="d-flex align-items-center gap-3">
                            {/* Skeleton for rank number */}
                            <div
                              className="skeleton-loader"
                              style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                            />

                            {/* Skeleton for content */}
                            <div className="flex-grow-1">
                              <div
                                className="skeleton-loader mb-2"
                                style={{ width: '60%', height: '20px', borderRadius: '4px' }}
                              />
                              <div
                                className="skeleton-loader"
                                style={{ width: '40%', height: '16px', borderRadius: '4px' }}
                              />
                            </div>

                            {/* Skeleton for arrow */}
                            <div
                              className="skeleton-loader"
                              style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className="mt-4">
                {topics.length > 0 ? (
                  <Card className="border-0 explore-card">
                    <CardBody className="p-0">
                      <div className="list-group list-group-flush">
                        {topics.map((topic, index) => (
                          <div
                            key={topic.title + index}
                            className="list-group-item list-group-item-action explore-item d-flex align-items-center justify-content-between py-3 px-4"
                            onClick={() => handleTopicClick(topic)}
                          >
                            <div className="d-flex align-items-center gap-3 flex-grow-1">
                              {/* Ranking Number */}
                              <div
                                className="d-flex align-items-center justify-content-center fw-semibold text-muted explore-rank"
                              >
                                {index + 1}
                              </div>

                              {/* Topic Info */}
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <h6 className="mb-0 fw-semibold">{topic.title}</h6>
                                </div>
                                <div className="d-flex align-items-center gap-2 text-muted explore-meta">
                                  <span className="text-capitalize">{topic.category}</span>
                                </div>
                              </div>

                              {/* Arrow Icon */}
                              <ArrowRight size={20} className="text-muted" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted fs-5">
                      No trending topics found
                    </p>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
