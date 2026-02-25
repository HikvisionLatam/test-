// 3DScene/components/Preloader.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import NumberFlow from '@number-flow/react';
import gsap from 'gsap';

const Preloader = () => {
    const { progress } = useProgress();
    const [smoothProgress, setSmoothProgress] = useState(0); // Estado para el número fluido
    const [finished, setFinished] = useState(false);
    const barRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // Animamos el valor numérico y la barra al mismo tiempo con GSAP para máxima fluidez
        gsap.to(barRef.current, {
            width: `${progress}%`,
            duration: 0.8, // Aumentamos un poco la duración para que el deslizamiento sea más elegante
            ease: "power3.out"
        });

        // Esta es la clave: animamos el objeto virtual 'val' para actualizar el estado del número
        const obj = { val: smoothProgress };
        gsap.to(obj, {
            val: progress,
            duration: 0.8,
            ease: "power3.out",
            onUpdate: () => setSmoothProgress(obj.val)
        });

        if (progress === 100) {
            const timer = setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.style.opacity = '0';
                    containerRef.current.style.transition = 'opacity 0.8s ease';
                }
                setTimeout(() => setFinished(true), 800);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [progress]);

    if (finished) return null;

    return (
        <div ref={containerRef} className="preloader-container">
            <div style={{ display: 'flex', alignItems: 'baseline', color: '#333' }}>
                <span style={{ fontSize: '80px', fontWeight: '800', lineHeight: 1 }}>
                    <NumberFlow
                        value={Math.round(smoothProgress)} // Usamos el valor suavizado
                        format={{ minimumIntegerDigits: 2 }}
                        // Reducimos la duración del muelle para que no rebote demasiado
                        spring={{ type: 'spring', stiffness: 200, damping: 20 }} 
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