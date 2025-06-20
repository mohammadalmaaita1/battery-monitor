
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// Note: This component is designed to be a continuous background.
// Performance should be monitored, as complex continuous SVG animations can be resource-intensive.

export default function ElectricBackgroundAnimation() {
  const circuitPaths = [
    { d: "M100 85 Q100 70 85 70 L60 70", len: 60, delay: "0.2s", dotDelay: "0.6s" }, // Top-left branch
    { d: "M100 85 Q100 70 115 70 L140 70", len: 60, delay: "0.3s", dotDelay: "0.7s" }, // Top-right branch
    { d: "M85 100 L60 100 Q50 100 50 90 L50 70", len: 70, delay: "0.4s", dotDelay: "0.9s" }, // Mid-left branch
    { d: "M115 100 L140 100 Q150 100 150 90 L150 70", len: 70, delay: "0.5s", dotDelay: "1.0s" }, // Mid-right branch
    { d: "M100 115 Q100 130 85 130 L60 130", len: 60, delay: "0.6s", dotDelay: "1.1s" }, // Bottom-left branch
    { d: "M100 115 Q100 130 115 130 L140 130", len: 60, delay: "0.7s", dotDelay: "1.2s" }, // Bottom-right branch
    { d: "M90 80 L75 80", len: 15, delay: "0.1s", dotDelay: "0.4s"},
    { d: "M110 80 L125 80", len: 15, delay: "0.15s", dotDelay: "0.45s"},
    { d: "M90 120 L75 120", len: 15, delay: "0.2s", dotDelay: "0.5s"},
    { d: "M110 120 L125 120", len: 15, delay: "0.25s", dotDelay: "0.55s"},
  ];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[-10] flex items-center justify-center overflow-hidden pointer-events-none opacity-30 dark:opacity-20" // Increased opacity slightly
      )}
      aria-hidden="true" // Decorative background
    >
      <div className="relative flex items-center justify-center w-full h-full"> {/* Ensure SVG container takes full space */}
        <svg 
          viewBox="0 0 200 200" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full text-primary overflow-visible"
          preserveAspectRatio="xMidYMid slice" // Ensure SVG covers the area
        >
          <g className="animate-battery-pulse-glow">
            <rect x="70" y="75" width="60" height="50" rx="5" ry="5" fill="currentColor" opacity="0.6"/>
            <rect x="70" y="75" width="60" height="50" rx="5" ry="5" stroke="currentColor" strokeWidth="2.5" fill="transparent"/>
            <rect x="85" y="65" width="30" height="10" rx="2" ry="2" fill="currentColor" opacity="0.6"/>
            <rect x="85" y="65" width="30" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5" fill="transparent"/>
            <path d="M96 90 L104 90 L100 100 L106 100 L94 115 L98 102 L92 102 L96 90 Z" 
                  fill="hsl(var(--primary-foreground))" 
                  className="animate-bolt-flicker" 
                  strokeWidth="1" 
                  stroke="hsl(var(--primary-foreground))" />
          </g>

          <g>
            {circuitPaths.map((path, index) => (
              <React.Fragment key={`circuit-bg-${index}`}>
                <path 
                  d={path.d} 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  fill="none" 
                  className="circuit-line" 
                  style={{ 
                    strokeDasharray: path.len, 
                    strokeDashoffset: path.len, 
                    animationDelay: path.delay 
                  }}
                />
                <circle 
                  cx={parseFloat(path.d.slice(path.d.lastIndexOf('L') + 1).split(' ')[0])} 
                  cy={parseFloat(path.d.slice(path.d.lastIndexOf('L') + 1).split(' ')[1])} 
                  r="2.5" 
                  fill="currentColor" 
                  className="circuit-dot" 
                  style={{ animationDelay: path.dotDelay }}
                />
              </React.Fragment>
            ))}
            <circle cx="40" cy="40" r="1.5" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.3s' }}/>
            <circle cx="160" cy="40" r="1.5" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.35s' }}/>
            <circle cx="40" cy="160" r="1.5" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.4s' }}/>
            <circle cx="160" cy="160" r="1.5" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.45s' }}/>
            <circle cx="100" cy="30" r="2" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.5s' }}/>
            <circle cx="100" cy="170" r="2" fill="currentColor" className="circuit-dot decorative-dot" style={{ animationDelay: '1.55s' }}/>
          </g>
        </svg>
      </div>
    </div>
  );
}
