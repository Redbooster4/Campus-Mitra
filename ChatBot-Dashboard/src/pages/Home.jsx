import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaggeredMenu from '../components/StaggeredMenu';
import AnimatedLogo from '../components/AnimatedLogo'; 
import { ArrowRight, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import './styles/Home.css';

const menuItems = [
  { label: 'Dashboard', ariaLabel: 'Go to dashboard', link: '/dashboard' },
  { label: 'Applications', ariaLabel: 'View application', link: '/application' },
  { label: 'Chatbot', ariaLabel: 'Chat with AI', link: '/chat' },
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
    navigate("/onboarding");
  }
  return (
    <div className="wrapper">
      <StaggeredMenu
        position="left"
        items={menuItems}
        socialItems={socialItems}
        displaySocials
        displayItemNumbering={true}
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen={true}
        colors={['#B497CF', '#5227FF']}
        logoUrl={<div className='logo'><AnimatedLogo/></div>}
        accentColor="#5227FF"
        onClick={()=> setSidebarOpen(true)}
      />
      <div className="bg"></div>

      <main className="main">
        <div className="badge">
          <Zap size={14} className="badge-icon" />
          <span>Admissions for 2026 now open</span>
        </div>
        <h1 className="title">
          Navigate your future <br className="hide-mobile"/>
          <span className="text-gradient">
            with confidence.
          </span>
        </h1>
        <p className="description">
          The intelligent, AI-powered admission and counselling portal for SVKM's Shri Bhagubhai Mafatlal Polytechnic. Get personalized guidance, instant document verification, and real-time status updates.
        </p>

        <div className="btngroup">
          <button className="btn btn-primary btn-large" onClick={handleStartApp}>
            <ArrowRight size={18} className='hide'/>
            Start Application 
          </button>
          <button className="btn btn-secondary btn-large" onClick={handleChat}>
            <MessageSquare size={18} className='hide'/>
            Ask AI Counselor
          </button>
        </div>

        <div className="grid">
          <div className="card">
            <div className="icon">
              <MessageSquare size={24} />
            </div>
            <h3 className="featureTitle">24/7 AI Guidance</h3>
            <p className="description">Have questions about courses, cut-offs, or fees? Our AI chatbot provides instant, accurate answers anytime.</p>
          </div>
          <div className="card">
            <div className="icon">
              <ShieldCheck size={24} />
            </div>
            <h3 className="featureTitle">Smart Verification</h3>
            <p className="description">Upload your documents securely. Our system automatically scans and verifies them to speed up your admission process.</p>
          </div>

          <div className="card">
            <div className="icon">
              <Zap size={24} />
            </div>
            <h3 className="featureTitle">Live Tracking</h3>
            <p className="description">Never wonder where you stand. Track your application status step-by-step from inquiry to final confirmation.</p>
          </div>
        </div>
      </main>
    </div>
  );
}