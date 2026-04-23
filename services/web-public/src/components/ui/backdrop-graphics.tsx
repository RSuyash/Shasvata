import React from "react";

type BackdropGraphicProps = {
  className?: string;
};

export function HeroBackdropGraphic({ className = "" }: BackdropGraphicProps) {
  return (
    <svg 
      viewBox="0 0 800 800" 
      className={className} 
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Advanced Glow Filter for bloom effect */}
        <filter id="core-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur1" />
          <feGaussianBlur stdDeviation="24" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Enhanced Gradients */}
        <radialGradient id="backdrop-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="20%" stopColor="#e0e7ff" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ray-gradient" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="30%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="diagonal-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
          <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Embedded CSS for seamless, self-contained animation */}
      <style>
        {`
          .spin-slow { transform-origin: 400px 400px; animation: spin 45s linear infinite; }
          .spin-reverse { transform-origin: 400px 400px; animation: spin-rev 60s linear infinite; }
          .pulse-core { transform-origin: 400px 400px; animation: pulse 4s ease-in-out infinite; }
          .pulse-ray { transform-origin: 400px 400px; animation: pulse-opacity 3s ease-in-out infinite alternate; }
          
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes spin-rev { 100% { transform: rotate(-360deg); } }
          @keyframes pulse { 
            0%, 100% { transform: scale(0.95); opacity: 0.8; } 
            50% { transform: scale(1.05); opacity: 1; } 
          }
          @keyframes pulse-opacity {
            0% { opacity: 0.4; }
            100% { opacity: 0.9; }
          }
        `}
      </style>

      {/* Ambient Background Glow */}
      <circle cx="400" cy="400" r="300" fill="url(#backdrop-core)" opacity="0.4" />

      {/* INNER CORE - Animated Pulse */}
      <g className="pulse-core">
        <circle cx="400" cy="400" r="80" fill="url(#backdrop-core)" filter="url(#core-glow)" />
        <circle cx="400" cy="400" r="16" fill="#ffffff" filter="url(#node-glow)" />
        <circle cx="400" cy="400" r="40" fill="none" stroke="#e0e7ff" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
      </g>

      {/* MIDDLE RING SYSTEM - Forward Spin */}
      <g className="spin-slow">
        {/* Complex dashed rings mimicking tech interfaces */}
        <circle cx="400" cy="400" r="140" fill="none" stroke="#6366f1" strokeWidth="1" strokeDasharray="2 6" opacity="0.8" />
        <circle cx="400" cy="400" r="150" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="20 10 5 10" opacity="0.6" />
        <circle cx="400" cy="400" r="220" fill="none" stroke="#4f46e5" strokeWidth="1" opacity="0.3" />
        
        {/* Orbiting Nodes */}
        <g fill="#818cf8" filter="url(#node-glow)">
          <circle cx="400" cy="250" r="5" />
          <circle cx="400" cy="550" r="5" />
          <circle cx="250" cy="400" r="5" />
          <circle cx="550" cy="400" r="5" />
        </g>
      </g>

      {/* OUTER RING SYSTEM - Reverse Spin */}
      <g className="spin-reverse">
        <circle cx="400" cy="400" r="280" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="1 12" opacity="0.5" />
        <circle cx="400" cy="400" r="290" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="50 30" opacity="0.4" />
        
        {/* Outer Orbiting Nodes */}
        <g fill="#38bdf8" filter="url(#node-glow)">
          <circle cx="598" cy="202" r="4" />
          <circle cx="202" cy="598" r="4" />
          <circle cx="202" cy="202" r="4" />
          <circle cx="598" cy="598" r="4" />
        </g>
      </g>

      {/* STATIC STRUCTURAL RAYS */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="pulse-ray">
        {/* Cardinal Rays */}
        <g stroke="url(#ray-gradient)" strokeWidth="4">
          <path d="M400 120 L400 30" />
          <path d="M400 680 L400 770" />
          <path d="M120 400 L30 400" />
          <path d="M680 400 L770 400" />
        </g>

        {/* Diagonal Rays */}
        <g stroke="url(#diagonal-gradient)" strokeWidth="3">
          <path d="M220 220 L150 150" />
          <path d="M580 220 L650 150" />
          <path d="M220 580 L150 650" />
          <path d="M580 580 L650 650" />
        </g>
      </g>

      {/* NETWORK WEBBING - Connective tissue between geometry */}
      <g fill="none" stroke="#6366f1" strokeWidth="0.5" opacity="0.3">
        <polygon points="400,250 506,294 550,400 506,506 400,550 294,506 250,400 294,294" />
        <polygon points="400,150 576,223 650,400 576,576 400,650 223,576 150,400 223,223" />
        {/* Crosshair lines */}
        <line x1="250" y1="400" x2="550" y2="400" strokeDasharray="2 4" />
        <line x1="400" y1="250" x2="400" y2="550" strokeDasharray="2 4" />
      </g>

    </svg>
  );
}