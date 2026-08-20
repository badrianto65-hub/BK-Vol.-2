import React from 'react';

interface LogoKonselorProps {
  className?: string;
  size?: number | string;
}

export const LogoKonselor: React.FC<LogoKonselorProps> = ({ className = 'w-10 h-10', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 500 500"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Outer Yellow Boundary Ring with Dark Outline */}
      <circle
        cx="250"
        cy="250"
        r="232"
        fill="#f3c213"
        stroke="#231f20"
        strokeWidth="4"
      />

      {/* Inner Blue Background Disc */}
      <circle
        cx="250"
        cy="250"
        r="204"
        fill="#2b7ebc"
        stroke="#231f20"
        strokeWidth="3"
      />

      {/* Inner Left Crescent Moon Arc (Yellow) */}
      <path
        d="M 250,46 A 204,204 0 1,0 422,352 C 340,430 110,390 82,250 C 60,140 180,60 250,46 Z"
        fill="#f3c213"
        stroke="#231f20"
        strokeWidth="2.5"
      />

      {/* Upper Symbol Loop (Circle for P / Key) */}
      <circle
        cx="290"
        cy="150"
        r="68"
        fill="none"
        stroke="#f3c213"
        strokeWidth="24"
      />
      <circle
        cx="290"
        cy="150"
        r="68"
        fill="none"
        stroke="#231f20"
        strokeWidth="3"
      />

      {/* Vertical Yellow Bar (P / Key Stem) */}
      <rect
        x="276"
        y="82"
        width="26"
        height="325"
        fill="#f3c213"
        stroke="#231f20"
        strokeWidth="3"
      />

      {/* Bottom Right "KONSELOR" Yellow Horizontal Banner */}
      <g filter="url(#subtle-shadow)">
        <rect
          x="266"
          y="390"
          width="208"
          height="52"
          rx="4"
          fill="#f3c213"
          stroke="#231f20"
          strokeWidth="3"
        />
        <text
          x="370"
          y="427"
          fill="#1b5887"
          fontSize="30"
          fontWeight="900"
          fontFamily="'Arial Black', 'Inter', system-ui, sans-serif"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          KONSELOR
        </text>
      </g>
    </svg>
  );
};

