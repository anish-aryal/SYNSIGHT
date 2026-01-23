import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';

const formatDate = (value) => {
  if (!value) return '';
  if (String(value).includes('T')) {
    const date = new Date(`${value}:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleTimeString('en-US', { hour: 'numeric' });
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTooltipDate = (value) => {
  if (!value) return '';
  if (String(value).includes('T')) {
    const date = new Date(`${value}:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const normalizeSeries = (data) => {
  if (!Array.isArray(data)) return [];
  const withComputed = data
    .map((item) => ({
      date: item.date,
      label: formatDate(item.date),
      positive: item.positive || 0,
      neutral: item.neutral || 0,
      negative: item.negative || 0,
      total: item.total || (item.positive || 0) + (item.neutral || 0) + (item.negative || 0)
    }))
    .map((item) => {
      if (!item.total) {
        return {
          ...item,
          positivePct: 0,
          neutralPct: 0,
          negativePct: 0,
          dominantLabel: 'No data',
          dominantPct: 0,
          dominantValue: null
        };
      }
      const positivePct = Math.round((item.positive / item.total) * 100);
      const neutralPct = Math.round((item.neutral / item.total) * 100);
      const negativePct = Math.round((item.negative / item.total) * 100);
      const maxPct = Math.max(positivePct, neutralPct, negativePct);
      const dominantLabel = maxPct === positivePct
        ? 'Positive'
        : maxPct === neutralPct
          ? 'Neutral'
          : 'Negative';
      const dominantPct = dominantLabel === 'Positive'
        ? positivePct
        : dominantLabel === 'Neutral'
          ? neutralPct
          : negativePct;
      const bandStart = dominantLabel === 'Negative'
        ? 0
        : dominantLabel === 'Neutral'
          ? 33.333
          : 66.666;
      const dominantValue = bandStart + (dominantPct / 100) * 33.333;

      return {
        ...item,
        positivePct,
        neutralPct,
        negativePct,
        dominantLabel,
        dominantPct,
        dominantValue
      };
    })
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const filled = withComputed.map((item, index) => {
    if (item.dominantValue !== null) {
      return { ...item, dominantValueFilled: item.dominantValue };
    }
    let prev = null;
    let next = null;
    for (let j = index - 1; j >= 0; j--) {
      if (withComputed[j].dominantValue !== null) {
        prev = withComputed[j].dominantValue;
        break;
      }
    }
    for (let j = index + 1; j < withComputed.length; j++) {
      if (withComputed[j].dominantValue !== null) {
        next = withComputed[j].dominantValue;
        break;
      }
    }
    let filledValue = null;
    if (prev !== null && next !== null) {
      filledValue = (prev + next) / 2;
    } else if (prev !== null) {
      filledValue = prev;
    } else if (next !== null) {
      filledValue = next;
    }
    return { ...item, dominantValueFilled: filledValue };
  });
  return filled;
};

const DominantTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="sentiment-tooltip">
      <div className="sentiment-tooltip-title">Date: {formatTooltipDate(point.date)}</div>
      <div className="sentiment-tooltip-row negative">Negative: {point.negativePct}%</div>
      <div className="sentiment-tooltip-row neutral">Neutral: {point.neutralPct}%</div>
      <div className="sentiment-tooltip-row positive">Positive: {point.positivePct}%</div>
      <div className="sentiment-tooltip-foot">{point.total} posts</div>
    </div>
  );
};

export default function SentimentOverTimeChart({ data }) {
  const series = normalizeSeries(data);
  if (series.length === 0) return null;
  return (
    <Card className="section-card">
      <CardBody className="p-0">
        <div className="section-header">Sentiment Over Time</div>
        <div className="section-body">
          <Row>
            <Col xs={12}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <ReferenceArea y1={0} y2={33.333} fill="#fee2e2" fillOpacity={0.45} />
                  <ReferenceArea y1={33.333} y2={66.666} fill="#f3f4f6" fillOpacity={0.6} />
                  <ReferenceArea y1={66.666} y2={100} fill="#d1fae5" fillOpacity={0.5} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    domain={[0, 100]}
                    ticks={[16.5, 50, 83.5]}
                    tickFormatter={(value) => (value < 30 ? 'Negative' : value < 70 ? 'Neutral' : 'Positive')}
                  />
                  <Tooltip
                    content={<DominantTooltip />}
                  />
                  <ReferenceLine y={33.333} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <ReferenceLine y={66.666} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="dominantValueFilled"
                    stroke="#93c5fd"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="dominantValue"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb' }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
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
