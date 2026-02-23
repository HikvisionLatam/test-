import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three'; // Importamos THREE para matemáticas vectoriales

// CAMBIA ESTO POR TU MODELO
const MODEL_TO_TEST = "/models/isometric_office.glb"; 

const DevModel = () => {
  const { scene } = useGLTF(MODEL_TO_TEST);

  const handleClick = (e) => {
    // Detenemos la propagación para que no atraviese objetos
    e.stopPropagation();

    // 1. OBTENER LA NORMAL (Hacia dónde mira la cara que clickeaste)
    // Clonamos la normal para no modificar la geometría original
    const normal = e.face.normal.clone();
    
    // Transformamos la dirección por si el modelo está rotado en el mundo
    normal.transformDirection(e.object.matrixWorld);

    // 2. CALCULAR "COORDENADA SEGURA"
    // Tomamos el punto exacto del click (e.point)
    // Y le sumamos la normal multiplicada por un valor (ej: 0.15 unidades)
    // Esto "empuja" el punto hacia afuera de la superficie.
    const safePoint = e.point.clone().add(normal.multiplyScalar(0.15));

    // 3. FORMATEAR PARA COPIAR
    const coords = `[${safePoint.x.toFixed(2)}, ${safePoint.y.toFixed(2)}, ${safePoint.z.toFixed(2)}]`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(coords).then(() => {
      // Usamos un console.log con estilo para verlo claro
      console.log(`%c ✅ Coordenada Copiada: ${coords}`, 'background: #222; color: #bada55; font-size: 14px; padding: 4px;');
      alert(`✅ Coordenada ajustada copiada:\n${coords}\n(Se aplicó un offset de 0.15 hacia afuera)`);
    }).catch(err => {
      console.error('Error al copiar', err);
    });
  };

  return (
    <Center>
      <primitive object={scene} onClick={handleClick} />
    </Center>
  );
};

const TestPage = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}> 
      
      {/* UI DE AYUDA */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(0,0,0,0.85)', color: 'white', padding: '20px', borderRadius: '12px', maxWidth: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <h3 style={{marginTop:0, color: '#ff4444'}}>🛠️ Calibrador de Pines</h3>
        <p style={{fontSize: '14px', lineHeight: '1.4'}}>
          Haz click en cualquier superficie (TV, Pared, Suelo).
        </p>
        <p style={{fontSize: '12px', color: '#aaa'}}>
          El sistema calculará automáticamente una posición <strong>15cm hacia afuera</strong> para que el pin no quede enterrado.
        </p>
        <div style={{background: '#333', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace'}}>
            Modelo: {MODEL_TO_TEST}
        </div>
      </div>

      <Canvas camera={{ position: [8, 8, 8], fov: 50 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} intensity={0.5} />
          <Environment preset="city" />
          
          <DevModel />
          
          {/* Grid visual para referencia */}
          <gridHelper args={[20, 20, 0xdddddd, 0xeeeeee]} position={[0, -0.01, 0]} />
          {/* Ejes X,Y,Z para orientarte (Rojo=X, Verde=Y, Azul=Z) */}
          <axesHelper args={[2]} /> 
        </Suspense>

        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
};

export default TestPage;