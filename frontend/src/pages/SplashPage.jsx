import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/splash.css';

export default function SplashPage() {
  const [phase, setPhase] = useState('logo');   // logo → tagline → exit
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 1400);
    const t2 = setTimeout(() => setPhase('exit'),    2600);
    const t3 = setTimeout(() => navigate('/login'),  3200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div className={`splash-container ${phase === 'exit' ? 'splash-exit' : ''}`}>

      {/* animated background grid */}
      <div className="splash-grid" />

      {/* center glow */}
      <div className="splash-glow" />

      <div className={`splash-content ${phase !== 'logo' ? 'content-up' : ''}`}>
        <div className={`splash-icon-wrap ${phase !== 'logo' ? 'icon-pulse' : ''}`}>
          <span className="splash-key">🔑</span>
          <div className="splash-ring ring1" />
          <div className="splash-ring ring2" />
        </div>

        <h1 className="splash-title">
          <span className="title-call">Call</span>
          <span className="title-my">My</span>
          <span className="title-driver">Driver</span>
        </h1>

        <div className={`splash-tagline ${phase === 'tagline' || phase === 'exit' ? 'tagline-show' : ''}`}>
          Your vehicle. Our driver. Your safety.
        </div>
      </div>

      {/* loading bar */}
      <div className={`splash-bar-wrap ${phase !== 'logo' ? 'bar-show' : ''}`}>
        <div className="splash-bar" />
      </div>

    </div>
  );
}