import { useRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";

const MODEL_URL = "/flexVu.glb";

const FlexVu3D = () => {
    const mountRef = useRef(null);
    const controlsRef = useRef(null);
    const rendererRef = useRef(null);
    const modelRef = useRef(null);
    const directionalLightRef = useRef(null);

    // Estado para el cursor
    const [isGrabbing, setIsGrabbing] = useState(false);

    // Estado para el overlay
    const [showOverlay, setShowOverlay] = useState(true);

    // Ocultar overlay al hacer clic
    const handleOverlayClick = () => setShowOverlay(false);

    useEffect(() => {
        if (showOverlay) return; // No inicializar ThreeJS si el overlay está activo

        if (!mountRef.current) return;

        // Escena y cámara
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Cámara y zoom inicial
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1, 4);

        // Renderizador
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(
            mountRef.current.clientWidth,
            mountRef.current.clientHeight
        );
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Luz ambiental suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 2);
        scene.add(ambientLight);

        // Luz direccional con sombras
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(3, 6, 6);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        directionalLightRef.current = directionalLight;

        // Plano para sombras
        const shadowGeometry = new THREE.PlaneGeometry(10, 10);
        const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const shadowPlane = new THREE.Mesh(shadowGeometry, shadowMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.01;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);

        // OrbitControls
        controlsRef.current = new OrbitControls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.05; // Scrub más suave
        controlsRef.current.enablePan = false;
        controlsRef.current.minAzimuthAngle = -Math.PI / 4;
        controlsRef.current.maxAzimuthAngle = Math.PI / 4;
        const fixedDistance = 1;
        controlsRef.current.minDistance = fixedDistance;
        controlsRef.current.maxDistance = fixedDistance;

        // Eventos para el cursor grab/grabbing
        const domElement = renderer.domElement;
        const handlePointerDown = () => setIsGrabbing(true);
        const handlePointerUp = () => setIsGrabbing(false);
        domElement.addEventListener("pointerdown", handlePointerDown);
        domElement.addEventListener("pointerup", handlePointerUp);
        domElement.addEventListener("pointerleave", handlePointerUp);

        // Loader GLTF
        const loader = new GLTFLoader();
        loader.load(
            MODEL_URL,
            (gltf) => {
                modelRef.current = gltf.scene;
                modelRef.current.position.set(0, 0, 0);
                modelRef.current.castShadow = true;

                // Centrado automático del modelo
                const box = new THREE.Box3().setFromObject(modelRef.current);
                const center = box.getCenter(new THREE.Vector3());
                modelRef.current.position.sub(center);

                scene.add(modelRef.current);

                // Apuntar la luz direccional al modelo
                directionalLight.target = modelRef.current;
                scene.add(directionalLight.target);

                // Animación de aparición
                modelRef.current.scale.set(0.01, 0.01, 0.01);
                gsap.to(modelRef.current.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 1.2,
                    ease: "ease.in.out",
                });
            },
            undefined,
            (error) => {
                console.error("Error cargando el modelo:", error);
            }
        );

        // ResizeObserver
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect =
                mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(
                mountRef.current.clientWidth,
                mountRef.current.clientHeight
            );
        };
        const resizeObserver = new window.ResizeObserver(handleResize);
        resizeObserver.observe(mountRef.current);

        // Loop de animación
        let animationId;
        const animate = () => {
            controlsRef.current?.update();
            renderer.render(scene, camera);
            animationId = requestAnimationFrame(animate);
        };
        animate();

        // Limpieza
        return () => {
            cancelAnimationFrame(animationId);
            resizeObserver.disconnect();
            controlsRef.current?.dispose();
            renderer.dispose();
            domElement.removeEventListener("pointerdown", handlePointerDown);
            domElement.removeEventListener("pointerup", handlePointerUp);
            domElement.removeEventListener("pointerleave", handlePointerUp);
            if (modelRef.current) {
                scene.remove(modelRef.current);
                modelRef.current.traverse(child => {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(mat => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                    if (child.geometry) {
                        child.geometry.dispose();
                    }
                });
            }
            if (mountRef.current?.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [showOverlay]); // Solo inicializa ThreeJS cuando el overlay desaparece

    return (
        <>
            <Helmet>
                <title>FlexVu 3D</title>
            </Helmet>
            <div className="relative">
                {showOverlay && (
                    <div className="overlay" onClick={handleOverlayClick}>
                        <div className="overlay-content">
                            <div className="container mx-auto px-4">
                                <h1 className="text-7xl font-figtree font-bold text-white text-center mb-6">Haz clic para explorar el modelo 3D.</h1>
                                <i className="fa-regular fa-circle-play text-8xl"></i>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={mountRef} className='w-[100dvw] h-[100dvh] overflow-hidden relative touch-none' style={{ cursor: isGrabbing ? "grabbing" : "grab", display: showOverlay ? "none" : "block" }} />
                <div className="fixed bottom-0 w-full bg-gray-800 text-white p-4 text-center z-[10] pointer-events-none font-figtree" style={{ display: showOverlay ? "none" : "block" }}>
                    El objeto presentado corresponde a una representación gráfica en 3D del producto <strong>(DS-2SE2C200MWG-E/12).</strong>  El diseño final puede variar en detalles y acabados. Esta visualización tiene fines ilustrativos únicamente.
                </div>
            </div>
        </>
    );
};

export default FlexVu3D;
