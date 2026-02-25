// 3DScene/ScenePage.jsx
import React, { Suspense, useState, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

import Pin from './components/Pin';
import SwappingCard from './components/SwappingCard';
import CameraController from './components/CameraController';
import { scenarios } from './data/scenariosData';
import { useMobile } from './hooks/useMobile';
import InstructionBar from './components/InstructionBar';
import InitialAssistant from './components/InitialAssistant';
import Preloader from './components/Preloader'; // <-- IMPORTAMOS TU PRELOADER

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

const ProductionModel = ({ url }) => {
    const { scene } = useGLTF(url);
    return <Center top><primitive object={scene} /></Center>;
};

const ScenePage = () => {
    const { id } = useParams();
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [activeProductId, setActiveProductId] = useState(null);
    const [openedVia, setOpenedVia] = useState(null); 
    
    const isMobile = useMobile();
    const currentScenario = scenarios.find(s => s.id === id);

    const initialCameraPos = useMemo(() => {
        return isMobile ? [18, 20, 18] : [16, 16, 16];
    }, [isMobile]);

    if (!currentScenario) return <div className="flex h-screen w-screen items-center justify-center text-gray-500">Escenario no encontrado</div>;

    const activeCategoryData = activeCategoryId ? currentScenario.pins.find(p => p.id === activeCategoryId) : null;
    const activeProductData = (activeCategoryData && activeProductId) 
        ? activeCategoryData.products.find(p => p.id === activeProductId) 
        : null;

    const handleCategoryClick = (catId) => {
        if (activeCategoryId === catId) {
            setActiveCategoryId(null);
            setActiveProductId(null);
            setOpenedVia(null);
        } else {
            setActiveCategoryId(catId);
            setActiveProductId(null); 
            setOpenedVia('category'); 
        }
    };

    const handleProductClick = (catId, prodId) => {
        setActiveCategoryId(catId);
        setActiveProductId(prodId);
        setOpenedVia('product'); 
    };

    return (
        <div className="w-screen h-screen relative overflow-hidden bg-white font-sans">
            
            {/* TU PRELOADER AQUÍ */}
            <Preloader />

            <InitialAssistant />

            <div id="ui-layer" className="absolute inset-0 pointer-events-none z-[100]">
                <div className="pointer-events-auto">
                    <InstructionBar />
                </div>

                <div 
                    className={`absolute pointer-events-${activeCategoryId ? 'auto' : 'none'} transition-all duration-500 z-[101] ${activeCategoryId ? 'opacity-100' : 'opacity-0'} ${
                        isMobile 
                            ? `bottom-0 left-0 w-full flex justify-center items-end pb-5 ${activeCategoryId ? 'translate-y-0' : 'translate-y-full'}` 
                            : `top-0 right-0 h-full flex items-center pr-10 pb-[60px] ${activeCategoryId ? 'translate-x-0' : 'translate-x-10'}`
                    }`}
                >
                    {activeCategoryData && (
                        <SwappingCard
                            pinData={activeCategoryData}
                            initialProductId={activeProductId} 
                            openedVia={openedVia}
                            onProductSelect={(prodId) => setActiveProductId(prodId)}
                            onClose={() => {
                                setActiveCategoryId(null);
                                setActiveProductId(null);
                                setOpenedVia(null);
                            }}
                        />
                    )}
                </div>
            </div>

            <div id="canvas-layer" className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: initialCameraPos, fov: isMobile ? 65 : 40 }} dpr={[1, 2]} shadows>
                    <color attach="background" args={["#FFFFFF"]} />
                    
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.6} />
                        <spotLight position={[20, 40, 20]} angle={0.25} penumbra={0.2} intensity={1.2} castShadow />
                        <Environment preset="city" blur={1} />

                        <StageRig>
                            <ProductionModel url={currentScenario.modelUrl} />
                            
                            {currentScenario.pins.map(cat => (
                                <React.Fragment key={cat.id}>
                                    <Pin 
                                        type="category"
                                        data={cat} 
                                        color={cat.color}
                                        isActiveCategory={activeCategoryId === cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                    />
                                    {cat.products.map(prod => (
                                        <Pin
                                            key={prod.id}
                                            type="product"
                                            data={{...prod, iconName: cat.iconName}}
                                            color={cat.color}
                                            isHighlighted={activeCategoryId === cat.id}
                                            onClick={() => handleProductClick(cat.id, prod.id)}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </StageRig>

                        <CameraController selectedPin={activeProductData} defaultCameraPosition={initialCameraPos} />
                    </Suspense>

                    <OrbitControls 
                        makeDefault 
                        enablePan={false} 
                        maxPolarAngle={Math.PI / 2 - 0.05}
                        minDistance={4} 
                        maxDistance={50} 
                        enableDamping={true}
                        dampingFactor={0.05}
                    />
                </Canvas>
            </div>
        </div>
    );
};

export default ScenePage;