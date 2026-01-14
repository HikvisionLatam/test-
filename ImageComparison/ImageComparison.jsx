import { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import "./ImageComparison.css";

gsap.registerPlugin(Draggable);

const ImageComparison = ({ beforeImage, afterImage }) => {
    const containerRef = useRef(null);
    const beforeImageRef = useRef(null);
    const draggerRef = useRef(null);
    const ratioRef = useRef(0.5);
    
    // Estado para saber si la imagen base cargó y podemos iniciar GSAP
    const [isLoaded, setIsLoaded] = useState(false);

    useLayoutEffect(() => {
        if (!isLoaded) return; // Esperamos a que la imagen dicte el tamaño

        const container = containerRef.current;
        const dragger = draggerRef.current;
        const clippedImg = beforeImageRef.current;

        let ctx = gsap.context(() => {
            const updateClip = (xPosition) => {
                // Obtenemos el ancho REAL actual de la imagen renderizada
                const width = container.offsetWidth; 
                const insetAmount = width - xPosition;
                
                gsap.set(clippedImg, { 
                    clipPath: `inset(0px ${insetAmount}px 0px 0px)` 
                });
                
                if(width > 0) ratioRef.current = xPosition / width;
            };

            // Setup inicial
            const initialWidth = container.offsetWidth;
            const startX = initialWidth * ratioRef.current;
            
            gsap.set(dragger, { x: startX });
            updateClip(startX);

            const draggableInstance = Draggable.create(dragger, {
                type: "x",
                bounds: container,
                inertia: true,
                edgeResistance: 0.65,
                onDrag: function() { updateClip(this.x); },
                onThrowUpdate: function() { updateClip(this.x); }
            })[0];

            const onResize = () => {
                const width = container.offsetWidth;
                const newX = width * ratioRef.current;
                gsap.set(dragger, { x: newX });
                updateClip(newX);
                draggableInstance.applyBounds(container);
            };

            window.addEventListener("resize", onResize);

            // Intro Animation
            gsap.fromTo(dragger, 
                { x: 0 }, 
                { 
                    x: initialWidth * 0.5, 
                    duration: 1.5, 
                    ease: "power3.out",
                    onUpdate: function() {
                        const currentX = gsap.getProperty(dragger, "x");
                        updateClip(currentX);
                        draggableInstance.update(true);
                    }
                }
            );

            return () => window.removeEventListener("resize", onResize);

        }, containerRef);

        return () => ctx.revert();
    }, [isLoaded]); // Se ejecuta cuando isLoaded cambia a true

    return (
        <div ref={containerRef} className="img-comp-container">
            {/* Imagen BASE: Controla el tamaño con onLoad */}
            <img 
                src={afterImage} 
                alt="After" 
                className="img-comp-after"
                draggable={false}
                onLoad={() => setIsLoaded(true)} 
            />

            {/* Imagen SUPERIOR: Se recorta */}
            <img 
                ref={beforeImageRef}
                src={beforeImage} 
                alt="Before" 
                className="img-comp-before" 
                draggable={false}
            />

            {/* Dragger */}
            <div ref={draggerRef} className="img-comp-dragger">
                <div className="img-comp-handle-btn">
                    <i className="fa-solid fa-left-right"></i>
                </div>
            </div>
        </div>
    );
};

export default ImageComparison;