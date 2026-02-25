// 3DScene/components/CameraController.jsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useMobile } from '../hooks/useMobile';

const CameraController = ({ selectedPin, defaultCameraPosition = [16, 16, 16] }) => {
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

            // Ajustamos las distancias para un mejor primer plano del producto
            const distance = isMobile ? 12 : 8; 
            const height = isMobile ? 10 : 6;    

            let targetPos = { x: 0, y: 0, z: 0 };

            if (isMobile) {
                targetPos = {
                    x: px,
                    y: py + height + 2, 
                    z: pz + distance    
                };
            } else {
                targetPos = {
                    x: px + distance,
                    y: py + height,
                    z: pz + distance
                };
            }

            gsap.to(camera.position, targetPos);

        } else {
            // MODO RESTAURAR VISTA
            gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power2.inOut" });
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