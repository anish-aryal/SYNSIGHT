import { Card } from 'reactstrap';
import { ChevronLeft, TrendingUp, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SynsightLogo from '../../../components/SynsightLogo';

// Auth Left Panel UI block for Auth page.

export default function AuthLeftPanel() {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Analysis',
      description: 'Track sentiment trends across multiple platforms instantly'
    },
    {
      icon: Users,
      title: 'Audience Insights',
      description: 'Understand what your audience really thinks'
    },
    {
      icon: Zap,
      title: 'AI-Powered Reports',
      description: 'Get comprehensive insights with advanced AI analysis'
    }
  ];

  // Layout and appearance
  return (
    <Card className="auth-left-card border-0">
      <div className="auth-left-content">
        <div className="auth-back-link" onClick={() => navigate('/')}>
          <ChevronLeft size={18} />
          <span>Back</span>
        </div>

        <div className="auth-branding">
          <div className="auth-logo">
            <SynsightLogo className="auth-logo-mark" />
          </div>
          
          <h2 className="auth-brand-name">SYNSIGHT</h2>
          <p className="auth-tagline">
            Powerful social media sentiment analysis platform
            for modern brands
          </p>

          <div className="auth-features">
            {features.map((feature, index) => (
              <div key={index} className="auth-feature-item">
                <div className="auth-feature-icon">
                  <feature.icon size={18} color="#155DFC" />
                </div>
                <div className="auth-feature-content">
                  <h6 className="fw-semibold mb-0">{feature.title}</h6>
                  <p className="text-muted mb-0">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
