
import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

const BccgLogo: React.FC<Props> = ({ className = '', size = 64 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 512 512" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-xl`}
    >
      {/* Outer Crown/Spikes Ring */}
      <g>
        {[...Array(18)].map((_, i) => (
          <path
            key={i}
            d="M256 40 L280 80 L232 80 Z"
            fill="url(#gold_grad)"
            transform={`rotate(${i * 20} 256 256) translate(0 -20)`}
            stroke="#926D00"
            strokeWidth="2"
          />
        ))}
      </g>

      {/* Main Blue Ring */}
      <circle cx="256" cy="256" r="180" fill="#003399" stroke="#CFB53B" strokeWidth="8" />
      <circle cx="256" cy="256" r="150" fill="#0047AB" stroke="#CFB53B" strokeWidth="4" />

      {/* Decorative Dots in Ring */}
      <g>
        {[...Array(40)].map((_, i) => (
          <circle
            key={i}
            cx={256 + 165 * Math.cos((i * 9 * Math.PI) / 180)}
            cy={256 + 165 * Math.sin((i * 9 * Math.PI) / 180)}
            r="3"
            fill="#FFD700"
          />
        ))}
      </g>

      {/* Circular Text (Simplified representation for SVG) */}
      <defs>
        <path id="textPath" d="M 256, 256 m -130, 0 a 130,130 0 1,1 260,0 a 130,130 0 1,1 -260,0" />
        <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FDB931" />
          <stop offset="100%" stopColor="#926D00" />
        </linearGradient>
      </defs>
      
      <text fill="white" fontSize="24" fontWeight="bold" letterSpacing="2">
        <textPath xlinkHref="#textPath" startOffset="0%">
          BOARD OF CONTROL FOR CRICKET IN GULLY
        </textPath>
      </text>

      {/* Central Star */}
      <path
        d="M256 120 L290 200 L376 200 L306 250 L334 330 L256 280 L178 330 L206 250 L136 200 L222 200 Z"
        fill="url(#gold_grad)"
        stroke="#926D00"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Heart Detail at bottom */}
      <path 
        d="M256 410 C256 410 246 400 240 400 C234 400 230 404 230 410 C230 420 256 430 256 430 C256 430 282 420 282 410 C282 404 278 400 272 400 C266 400 256 410 256 410" 
        fill="#FFD700"
      />
    </svg>
  );
};

export default BccgLogo;
