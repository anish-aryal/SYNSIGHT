import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function PostVolumeChart({ platforms }) {
  const getTimeData = () => {
    if (!platforms) return [];
    
    const reddit = platforms.reddit;
    const bluesky = platforms.bluesky;
    
    let timeData = reddit?.timeAnalysis || bluesky?.timeAnalysis || [];
    
    if (!Array.isArray(timeData) || timeData.length === 0) {
      return [];
    }

    const filteredData = timeData.filter((_, i) => i % 4 === 0);
    return filteredData.map(item => ({
      hour: formatHour(item.hour),
      volume: item.volume
    }));
  };

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const data = getTimeData();

  if (data.length === 0) return null;

  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header">Post Volume by Time</div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: '12px', 
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
}