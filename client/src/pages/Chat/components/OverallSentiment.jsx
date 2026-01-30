import React from 'react';
import { Row, Col } from 'reactstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Overall Sentiment UI block for Chat page.

export default function OverallSentiment({ percentages }) {
  if (!percentages) return null;

  const data = [
    { name: 'Negative', value: percentages.negative || 0, color: '#ef4444' },
    { name: 'Neutral', value: percentages.neutral || 0, color: '#9ca3af' },
    { name: 'Positive', value: percentages.positive || 0, color: '#10b981' }
  ];

  // Layout and appearance
  return (
    <Row className="justify-content-center">
      <Col xs={12}>
        <div className="donut-container">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="donut-legend">
            <div className="legend-item">
              <div className="legend-dot negative" />
              <span>Negative</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot neutral" />
              <span>Neutral</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot positive" />
              <span>Positive</span>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  );
}