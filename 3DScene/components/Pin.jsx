import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const Pin = ({ position, id, data, onSelect }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const colorBase = '#d01c19';
  const colorHover = '#990000';

  if (!data) return null;

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(t * 3) * 0.1; 
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    // ELIMINADO: visible={...}. Ahora el grupo siempre es visible.
    <group position={position}>
      
      {/* Aura 3D */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color={colorBase} transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* UI Flotante */}
      <Html
        position={[0, 0, 0]}
        center
        // El rango de Z-Index del Pin es bajo (0 a 100).
        // Como la Card tiene 10,000, la Card siempre ganará.
        zIndexRange={[100, 0]} 
        style={{ pointerEvents: 'none' }}
      >
        <div 
          style={{ 
            position: 'relative', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(id);
          }}
          onMouseEnter={() => {
             setHovered(true);
             document.body.style.cursor = 'pointer';
          }}
          onMouseLeave={() => {
             setHovered(false);
             document.body.style.cursor = 'auto';
          }}
        >
          {/* Círculo del Icono */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: hovered ? colorHover : colorBase, 
            border: '2px solid rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
            transition: 'background 0.3s ease, transform 0.2s ease',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
            overflow: 'hidden'
          }}>
            {data.icon && (data.icon.startsWith('/') || data.icon.startsWith('http')) ? (
                <img 
                    src={data.icon} 
                    alt="icon" 
                    style={{ width: '60%', height: '60%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} 
                />
            ) : (
                <span style={{ fontSize: '16px', color: 'white', fontWeight: 'bold' }}>{data.icon || '+'}</span>
            )}
          </div>

          {/* Tooltip */}
          <div style={{
            position: 'absolute',
            bottom: '42px',
            left: '50%',
            transform: `translateX(-50%) translateY(${hovered ? 0 : '10px'})`,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            opacity: hovered ? 1 : 0,
            pointerEvents: 'none',
            transition: 'all 0.2s ease-out',
            backdropFilter: 'blur(4px)'
          }}>
            {data.label}
            <div style={{ position: 'absolute', bottom: '-4px', left: '50%', marginLeft: '-4px', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid rgba(0,0,0,0.8)' }} />
          </div>

        </div>
      </Html>
    </group>
  );
};

export default Pin;