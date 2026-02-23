import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as Icons from 'lucide-react';
import { useMobile } from '../hooks/useMobile';

const playPopSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
  audio.volume = 0.4;
  audio.play().catch(e => console.log("Audio play failed", e));
};

const Pin = ({ position, id, data, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const [distanceFactor, setDistanceFactor] = useState(1);
  const groupRef = useRef();
  const { camera } = useThree();
  const isMobile = useMobile(); 

  const IconComponent = Icons[data.iconName] || Icons.CircleDot; 

  useFrame(() => {
    if (groupRef.current) {
      const dist = camera.position.distanceTo(groupRef.current.position);
      const newFactor = Math.min(Math.max(dist / 15, 0.6), 1.2); 
      setDistanceFactor(newFactor);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    playPopSound();
    onSelect(id);
  };

  // --- DIMENSIONES REDUCIDAS (Más sutiles) ---
  const pinHeight = isMobile ? '28px' : '36px'; // Antes: 32 / 40
  const iconSize = isMobile ? 14 : 18;          // Antes: 16 / 20
  const fontSize = isMobile ? '11px' : '13px';  // Antes: 12 / 14
  const minWidth = isMobile ? '28px' : '36px';  // Antes: 32 / 40
  
  // Padding más ajustado
  const paddingExpanded = isMobile ? '4px 14px' : '6px 18px';
  const paddingCollapsed = isMobile ? '4px' : '6px';

  return (
    <group position={position} ref={groupRef}>
      {/* CILINDRO ELIMINADO (Ya no hay línea debajo) */}

      <Html
        position={[0, 0, 0]}
        center
        zIndexRange={[100, 0]}
        scaleFactor={10} 
        style={{
            transform: `scale(${distanceFactor})`,
            transition: 'transform 0.2s ease-out',
            pointerEvents: 'none'
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            background: hovered ? '#1a1a1a' : '#c1120b',
            color: hovered ? '#ffffff' : '#ffffff',
            borderRadius: '30px',
            
            // ESTILOS DINÁMICOS
            padding: hovered ? paddingExpanded : paddingCollapsed,
            minWidth: minWidth,
            height: pinHeight,
            gap: hovered ? (isMobile ? '6px' : '8px') : '0px',

            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            border: '2px solid #1a1a1a',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}
          onClick={handleClick}
          onMouseEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
          onMouseLeave={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: isMobile ? '18px' : '22px' }}>
                <IconComponent size={iconSize} strokeWidth={2} />
            </div>

            <div style={{ 
                opacity: hovered ? 1 : 0, 
                maxWidth: hovered ? '200px' : '0px',
                transition: 'all 0.3s ease',
                fontWeight: 600,
                fontSize: fontSize, 
                fontFamily: "'Inter', sans-serif"
            }}>
                {data.label}
            </div>
        </div>
      </Html>
    </group>
  );
};

export default Pin;