import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { scenarios } from './data/scenariosData'; // Tus datos
import Pin from './components/Pin';

// Componente simple para cargar modelo
const Model = ({ url }) => {
    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
};

const Experience = () => {
    // Tomamos el primer escenario como ejemplo
    const currentScenario = scenarios[0];

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#1a1a1a' }}>

            <Canvas
                camera={{ position: [5, 2, 5], fov: 45 }}
                // Dpr alto para textos nítidos en móviles
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>

                    {/* ILUMINACIÓN Y ENTORNO */}
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />

                    {/* MODELO 3D */}
                    {/* Puedes ajustar la escala si el modelo es muy grande/pequeño */}
                    <group scale={1}>
                        <Model url={currentScenario.modelUrl} />
                    </group>

                    {/* GENERACIÓN DE PINES */}
                    {currentScenario.pins.map((pin) => (
                        <Pin
                            key={pin.id}
                            position={pin.position} // [x, y, z] desde tu JSON
                            pinData={pin}           // Datos completos del pin (productos, etc.)
                        />
                    ))}

                </Suspense>

                {/* CONTROLES DE CÁMARA */}
                <OrbitControls
                    makeDefault
                    // Limita el zoom para no atravesar la tarjeta
                    minDistance={2}
                    maxDistance={15}
                    // Suavizado para sensación premium
                    enableDamping={true}
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* UI DE CARGA (Opcional) */}
            <div style={{ position: 'absolute', bottom: 20, left: 20, color: 'white' }}>
                <p>Interactúa con los puntos rojos</p>
            </div>

        </div>
    );
};

export default Experience;