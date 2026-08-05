import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaggeredMenu from '../components/StaggeredMenu';
import AnimatedLogo from '../components/AnimatedLogo'; 
import { ArrowRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import './Home.css';

const menuItems = [
  { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
  { label: 'Applications', ariaLabel: 'View application', link: '/application' },
  { label: 'Chatbot', ariaLabel: 'Chat with AI', link: '/chat' },
  { label: 'Support', ariaLabel: 'Get help', link: '/support' }
];

const socialItems = [
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'Instagram', link: 'https://instagram.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate=useNavigate();

  function handleStartApp(){
   window.open("http://sbmp.ac.in/", "_blank");
  }
  function handleChat(){
    navigate("/chat");
  }

  return (
    <div className="home-wrapper">
      <div className='staggered-menu-wrapper'>
        <StaggeredMenu
          position="left"
          items={menuItems}
          socialItems={socialItems}
          displaySocials
          displayItemNumbering={true}
          menuButtonColor="#ffffff"
          openMenuButtonColor="#fff"
          changeMenuColorOnOpen={true}
          colors={['#B497CF', '#5227FF']}
          logoUrl={AnimatedLogo}
          accentColor="#5227FF"
          onClick={()=> setSidebarOpen(true)}
        />
      </div>
      <div className="bg-glow"></div>
      <main className="main-content">
        <div className="badge">
          <Zap size={14} className="badge-icon" />
          <span>Admissions for 2026 now open</span>
        </div>

        <h1 className="hero-title">
          Navigate your future <br className="hide-mobile"/>
          <span className="text-gradient">
            with confidence.
          </span>
        </h1>

        <p className="hero-description">
          The intelligent, AI-powered admission and counselling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic. Get personalized guidance, instant document verification, and real-time status updates.
        </p>

        <div className="btn-group">
          <button className="btn-primary" onClick={handleStartApp}>
            Start Application
            <ArrowRight size={18} className="arrow-icon" />
          </button>
          
          <button className="btn-secondary">
            <MessageSquare size={18} className="chat-icon" onClick={handleChat}/>
            Ask AI Counselor
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <MessageSquare size={24} />
            </div>
            <h3 className="feature-title">24/7 AI Guidance</h3>
            <p className="feature-desc">Have questions about courses, cut-offs, or fees? Our AI chatbot provides instant, accurate answers anytime.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Smart Verification</h3>
            <p className="feature-desc">Upload your documents securely. Our system automatically scans and verifies them to speed up your admission process.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Live Tracking</h3>
            <p className="feature-desc">Never wonder where you stand. Track your application status step-by-step from inquiry to final confirmation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}