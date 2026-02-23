import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';

const Preloader = () => {
    const { active, progress } = useProgress();
    const [finished, setFinished] = useState(false);
    const barRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (barRef.current) {
            gsap.to(barRef.current, {
                width: `${progress}%`,
                duration: 0.5,
                ease: "power2.out"
            });
        }

        if (progress === 100) {
            const timer = setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = '0';
                }
                setTimeout(() => setFinished(true), 800);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (finished) return null;

    return (
        <div ref={containerRef} className="preloader-container">
            <div style={{ display: 'flex', alignItems: 'baseline', color: '#333' }}>
                <span style={{ fontSize: '80px', fontWeight: '800', lineHeight: 1 }}>
                    <NumberFlow
                        value={Math.round(progress)}
                        format={{ minimumIntegerDigits: 2 }}
                    />
                </span>
                <span style={{ fontSize: '30px', fontWeight: '300', marginLeft: '5px' }}>%</span>
            </div>

            <div className="loader-bar-bg">
                <div ref={barRef} className="loader-bar-fill"></div>
            </div>

            <p style={{ marginTop: '10px', fontSize: '12px', color: '#888', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Cargando Experiencia
            </p>
        </div>
    );
};

export default Preloader;