'use client';

import { useEffect, useState } from 'react';

export function DynamicBackground() {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      setPosition({ x, y });
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="bg-base-gradient" />
      <div className="bg-grid" />
      <div className="bg-noise" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />
      <div className="bg-orb orb-4" />
      <div
        className="bg-spotlight"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      />
    </>
  );
}
