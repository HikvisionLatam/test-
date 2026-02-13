import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useMobile } from '../hooks/useMobile';

const CameraController = ({ selectedPin, defaultCameraPosition = [10, 8, 10] }) => {
    const { camera, controls } = useThree();
    const isMobile = useMobile();

    useEffect(() => {
        if (!controls) return;

        if (selectedPin) {
            const px = selectedPin.position[0];
            const py = selectedPin.position[1];
            const pz = selectedPin.position[2];

            gsap.to(controls.target, {
                x: px,
                y: py,
                z: pz,
                duration: 1.5,
                ease: "power3.out"
            });

            let targetPos = { x: 0, y: 0, z: 0 };

            const distance = 10; // Antes era 3.5, ahora 10 para ver toda la oficina
            const height = 8;    // Altura para mantener el ángulo picado

            if (isMobile) {
                // MÓVIL: Cámara arriba, Modelo abajo
                targetPos = {
                    x: px,
                    y: py + height + 2, // Muy arriba
                    z: pz + distance    // Lejos en Z
                };
            } else {
                // DESKTOP: Cámara izquierda, Modelo derecha
                // El truco: Sumamos 'distance' a X y Z para mantener el ángulo isométrico
                // pero alejándonos del objeto.
                targetPos = {
                    x: px + distance,
                    y: py + height,
                    z: pz + distance
                };
            }

            gsap.to(camera.position, targetPos);

        } else {
            // --- MODO RESTAURAR (Vista General por defecto) ---
            gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });

            // Volvemos a la posición inicial "Lejana"
            gsap.to(camera.position, {
                x: defaultCameraPosition[0],
                y: defaultCameraPosition[1],
                z: defaultCameraPosition[2],
                duration: 1.2,
                ease: "power2.inOut"
            });
        }

    }, [selectedPin, isMobile, camera, controls, defaultCameraPosition]);

    return null;
};

export default CameraController;