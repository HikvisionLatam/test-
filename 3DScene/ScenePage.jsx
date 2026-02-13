import React, { Suspense, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center } from '@react-three/drei';

import Pin from './components/Pin';
import SwappingCard from './components/SwappingCard';
import CameraController from './components/CameraController';
import { scenarios } from './data/scenariosData';
import { useMobile } from './hooks/useMobile';

const ProductionModel = ({ url }) => {
    const { scene } = useGLTF(url);

    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    return (
        <Center top>
            <primitive object={scene} />
        </Center>
    );
};

const ScenePage = () => {
    const { id } = useParams();
    const [activePinId, setActivePinId] = useState(null);
    const isMobile = useMobile();

    const currentScenario = scenarios.find(s => s.id === id);

    if (!currentScenario) {
        return <div style={{ padding: 50 }}>Error: Escenario no encontrado ({id})</div>;
    }

    const activePinData = activePinId
        ? currentScenario.pins.find(p => p.id === activePinId)
        : null;

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            background: '#ffffff', 
            position: 'relative', 
            overflow: 'hidden', 
            fontFamily: "'Gilroy', sans-serif" 
        }}>

            <div id="ui-layer" style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none', 
                zIndex: 100 
            }}>
                <div style={{
                    position: 'absolute', 
                    pointerEvents: activePinId ? 'auto' : 'none',
                    opacity: activePinId ? 1 : 0, 
                    transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)', 
                    zIndex: 101,
                    ...(isMobile ? {
                        bottom: '0px', 
                        left: '0px', 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'flex-end',
                        paddingBottom: '20px', 
                        transform: activePinId ? 'translateY(0)' : 'translateY(100%)' 
                    } : {
                        top: '50%', 
                        left: '40px', 
                        transform: 'translateY(-50%)',
                    })
                }}>
                    {activePinId && activePinData && (
                        <div style={{ 
                            width: isMobile ? '100%' : 'auto', 
                            display: 'flex',
                            justifyContent: 'center'
                        }}>
                            <SwappingCard 
                                pinData={activePinData} 
                                onClose={() => setActivePinId(null)} 
                            />
                        </div>
                    )}
                </div>
            </div>

            <div id="canvas-layer" style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 1,
                touchAction: 'none' 
            }}>
                <Canvas camera={{ position: [12, 12, 12], fov: 45 }} dpr={[1, 2]} shadows>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.7} />
                        <spotLight position={[20, 20, 20]} intensity={0.8} castShadow />
                        <Environment preset="city" />

                        <ProductionModel url={currentScenario.modelUrl} />

                        {currentScenario.pins.map(pin => (
                            <Pin
                                key={pin.id} id={pin.id} position={pin.position} data={pin} onSelect={setActivePinId}
                            />
                        ))}

                        <ContactShadows position={[0, 0, 0]} opacity={0.3} blur={2.5} scale={20} color="#000000" />

                        <CameraController selectedPin={activePinData} defaultCameraPosition={[12, 12, 12]} />
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        enablePan={false}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 - 0.05}
                        minDistance={5}
                        maxDistance={25}
                        enableDamping
                    />
                </Canvas>
            </div>
        </div>
    );
};

export default ScenePage;