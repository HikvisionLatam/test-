import React, { Suspense, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

import Pin from './components/Pin';
import SwappingCard from './components/SwappingCard';
import CameraController from './components/CameraController';
import Preloader from './components/Preloader';
import HelpButton from './components/HelpButton';
import { scenarios } from './data/scenariosData';
import { useMobile } from './hooks/useMobile';

// --- RIG FUNCIONAL ---
const StageRig = ({ children }) => {
    const group = useRef();
    useFrame((state) => {
        if (group.current) {
            const x = state.mouse.x * 0.02;
            const y = state.mouse.y * 0.02;

            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x, 0.05);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y, 0.05);
        }
    });
    return <group ref={group}>{children}</group>;
};

// --- SUELO ---
const Ground = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial transparent opacity={0.2} color="#4a4036" />
        </mesh>
    );
}

const ProductionModel = ({ url }) => {
    const { scene } = useGLTF(url);
    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                    child.material.envMapIntensity = 1;
                }
            }
        });
    }, [scene]);

    return <Center top><primitive object={scene} /></Center>;
};

const ScenePage = () => {
    const { id } = useParams();
    const [activePinId, setActivePinId] = useState(null);
    const isMobile = useMobile();

    const currentScenario = scenarios.find(s => s.id === id);

    if (!currentScenario) {
        return <div className="flex items-center justify-center h-screen text-gray-500">Escenario no encontrado</div>;
    }

    const activePinData = activePinId
        ? currentScenario.pins.find(p => p.id === activePinId)
        : null;

    const bgColor = "#F2E8DA";

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: bgColor,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        }}>

            <Preloader />

            {/* UI LAYER */}
            <div id="ui-layer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>

                {/* TÍTULO - SOLO VISIBLE EN ESCRITORIO (!isMobile) */}
                {!isMobile && (
                    <div style={{ position: 'absolute', top: 40, left: 50, color: '#2c2420' }}>
                        <div className="title-animation-wrapper" style={{ overflow: 'hidden' }}>
                            <h1 className="slide-up-text" style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                letterSpacing: '-1.5px',
                                margin: 0,
                                lineHeight: '1'
                            }}>
                                {currentScenario.name}
                            </h1>
                        </div>
                        <div className="title-animation-wrapper" style={{ overflow: 'hidden', marginTop: '8px' }}>
                            <p className="slide-up-text-delay" style={{
                                margin: 0,
                                fontSize: '1rem',
                                color: '#8c8077',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                                Interactive Experience
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'auto' }}>
                    <HelpButton />
                </div>

                <div style={{
                    position: 'absolute',
                    pointerEvents: activePinId ? 'auto' : 'none',
                    opacity: activePinId ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    zIndex: 101,
                    ...(isMobile ? {
                        bottom: 0, left: 0, width: '100%',
                        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                        transform: activePinId ? 'translateY(0)' : 'translateY(100%)'
                    } : {
                        top: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', paddingRight: '40px',
                        transform: activePinId ? 'translateX(0)' : 'translateX(20px)',
                    })
                }}>
                    {activePinId && activePinData && (
                        <SwappingCard
                            pinData={activePinData}
                            onClose={() => setActivePinId(null)}
                        />
                    )}
                </div>
            </div>

            {/* CANVAS LAYER */}
            <div
                id="canvas-layer"
                className="cursor-grab"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    touchAction: 'none'
                }}
            >
                <Canvas
                    camera={{ position: [12, 12, 12], fov: 40 }}
                    dpr={[1, 2]}
                    shadows
                >
                    <color attach="background" args={[bgColor]} />

                    <Suspense fallback={null}>
                        <ambientLight intensity={0.5} />
                        <spotLight
                            position={[20, 40, 20]}
                            angle={0.25}
                            penumbra={0.2}
                            intensity={1.5}
                            castShadow
                            shadow-mapSize={[2048, 2048]}
                        />
                        <Environment 
                            preset="city"
                            blur={1} 
                        />

                        <StageRig>
                            <Ground />
                            <ProductionModel url={currentScenario.modelUrl} />
                            {currentScenario.pins.map(pin => (
                                <Pin key={pin.id} id={pin.id} position={pin.position} data={pin} onSelect={setActivePinId} />
                            ))}
                        </StageRig>

                        <ContactShadows position={[0, 0.01, 0]} opacity={0.6} scale={20} blur={1.5} far={1.5} color="#3a302a" />
                        <CameraController selectedPin={activePinData} defaultCameraPosition={[12, 12, 12]} />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        enablePan={false}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 - 0.05}
                        minDistance={5}
                        maxDistance={30}
                        enableDamping={true}
                        dampingFactor={0.05}
                    />
                </Canvas>
            </div>
        </div>
    );
};
useGLTF.preload("/models/isometric_office-v1.glb", true);
export default ScenePage;