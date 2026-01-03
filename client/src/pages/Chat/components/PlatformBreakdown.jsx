import React from 'react';
import { Row, Col } from 'reactstrap';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export default function PlatformBreakdown({ platformBreakdown }) {
  if (!platformBreakdown || platformBreakdown.length === 0) return null;

  const data = platformBreakdown.map(p => ({
    name: p.platform,
    positive: p.sentimentDistribution?.positive || 0,
    neutral: p.sentimentDistribution?.neutral || 0,
    negative: p.sentimentDistribution?.negative || 0,
    total: p.totalPosts
  }));

  const chartData = data.map(item => {
    const total = item.positive + item.neutral + item.negative || 1;
    return {
      name: item.name,
      negative: Math.round((item.negative / total) * 100),
      neutral: Math.round((item.neutral / total) * 100),
      positive: Math.round((item.positive / total) * 100),
      totalPosts: item.total
    };
  });

  return (
    <div className="platform-chart-container">
      <Row>
        <Col xs={12}>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                width={70}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" />
              <Bar dataKey="neutral" stackId="a" fill="#9ca3af" />
              <Bar dataKey="positive" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col xs={12}>
          <div className="donut-legend">
            <div className="legend-item">
              <div className="legend-dot negative" />
              <span>negative</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot neutral" />
              <span>neutral</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot positive" />
              <span>positive</span>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col xs={12}>
          <div className="platform-stats">
            {data.map((platform, index) => (
              <div key={index} className="platform-stat">
                <div className="platform-stat-label">{platform.name}</div>
                <div className="platform-stat-value">{platform.total.toLocaleString()} posts</div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}