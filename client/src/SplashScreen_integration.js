// ─────────────────────────────────────────────────────────────────────────────
// HOW TO INTEGRATE SplashScreen into your MarketMind·AI app
// ─────────────────────────────────────────────────────────────────────────────

// 1. INSTALL FRAMER MOTION (if not already):
//    npm install framer-motion

// 2. COPY both files into your src/ folder:
//    src/SplashScreen.jsx
//    src/SplashScreen.css

// 3. In your main.jsx (or index.jsx), wrap App with the splash:
// ─────────────────────────────────────────────────────────────────────────────

// main.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SplashScreen from './SplashScreen';
import './SplashScreen.css';   // ← import cinematic CSS
import App from './App';

function Root() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}
      {/* App renders underneath, becomes visible after splash exits */}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.4s ease' }}>
        <App />
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

// ─────────────────────────────────────────────────────────────────────────────
// ALTERNATIVELY — use it inside App.jsx itself:
// ─────────────────────────────────────────────────────────────────────────────

// At the top of App.jsx, add:
//   import SplashScreen from './SplashScreen';
//   import './SplashScreen.css';
//
// Inside the App component:
//   const [showSplash, setShowSplash] = useState(true);
//
// In the render return:
//   if (showSplash) {
//     return <SplashScreen onComplete={() => setShowSplash(false)} />;
//   }
//   // ... rest of your App JSX

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION TIMELINE REFERENCE
// ─────────────────────────────────────────────────────────────────────────────
//
//  0.0s  ─── Screen appears (deep navy, grid lines fade in, particles spawn)
//  0.2s  ─── Circle ring begins stroke-draw (SVG dashoffset animation)
//  0.35s ─── M letter path begins stroke-draw
//  1.6s  ─── Draw completes → Neon silver glow blooms on M + circle
//  2.0s  ─── "MARKET · MIND" text fades up letter-by-letter with kerning expand
//  2.1s  ─── Accent divider line + "AI" label appears
//  2.55s ─── Tagline + version chip fades in, data ticker begins scrolling
//  2.6s  ─── Progress bar fills
//  3.4s  ─── EXIT: entire screen zooms out (scale 1→0.88) + blur + fade
//  4.3s  ─── onComplete() fires, main app takes over
//
// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMISATION TIPS
// ─────────────────────────────────────────────────────────────────────────────
//
// ▸ Speed it up:  Change T_HOLD = 2.5 in SplashScreen.jsx for a snappier exit
// ▸ Skip in dev:  const [showSplash] = useState(process.env.NODE_ENV !== 'development')
// ▸ Persist skip: localStorage.getItem('splashSeen') to skip on revisit
// ▸ Logo tweak:   Edit LOGO_M_PATH in SplashScreen.jsx to match your exact SVG
//                 Then update M_PATH_LENGTH using:
//                 document.querySelector('path').getTotalLength()  (in browser console)
// ─────────────────────────────────────────────────────────────────────────────
