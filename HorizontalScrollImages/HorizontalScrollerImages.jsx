import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import "./HorizontalScrollerImages.css";

gsap.registerPlugin(Draggable, InertiaPlugin);

// Helper para enviar eventos a Google Analytics
const trackGAEvent = (eventName, params) => {
    if (window.gtag) {
        window.gtag("event", eventName, params);
    } else {
        console.log("GA Event (gtag not found):", eventName, params);
    }
};

const HorizontalScroller = ({ images, text, title }) => {
    const [showOverlay, setShowOverlay] = useState(true);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const draggableInstance = useRef(null);
    const [loadedImagesCount, setLoadedImagesCount] = useState(0);

    const handleImageProcessed = () => {
        setLoadedImagesCount(prevCount => prevCount + 1);
    };

    const handleOverlayClick = () => {
        trackGAEvent("begin_scroll_guide", {
            event_category: "Horizontal Scroller",
            event_label: title,
        });

        const overlay = document.querySelector(".overlay");
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => setShowOverlay(false),
        });
    };

    useEffect(() => {
        // Se activa solo cuando todas las imágenes han cargado
        if (loadedImagesCount < images.length) return;

        const container = containerRef.current;
        const content = contentRef.current;

        if (!container || !content) return;

        // Usamos un timeout para asegurar que el CSS se ha aplicado tras el render
        const timer = setTimeout(() => {
            if (draggableInstance.current) {
                draggableInstance.current.kill();
            }

            const dragger = Draggable.create(content, {
                type: "x",
                bounds: container,
                inertia: true,
                onDragStart: () => {
                    gsap.to(container, { cursor: "grabbing" });
                    trackGAEvent("drag_start_guide", {
                        event_category: "Horizontal Scroller",
                        event_label: title,
                    });
                },
                onDragEnd: () => {
                    gsap.to(container, { cursor: "grab" });
                    trackGAEvent("drag_end_guide", {
                        event_category: "Horizontal Scroller",
                        event_label: title,
                    });
                },
            });

            draggableInstance.current = dragger[0];

            // Forzamos una actualización final para máxima seguridad
            draggableInstance.current.update(true);

        }, 100);

        return () => {
            clearTimeout(timer);
            if (draggableInstance.current) {
                draggableInstance.current.kill();
            }
        };

    }, [loadedImagesCount, images.length, title]); // Se ejecuta cuando las imágenes terminan de cargar

    return (
        <div ref={containerRef} className="horizontal-scroller-container">
            {showOverlay && (
                <div className="overlay" onClick={handleOverlayClick}>
                    <div className="overlay-content">
                        <div className="container mx-auto px-4 md:px-8">
                            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-figtree font-bold text-white text-center mb-6">
                                {text}
                            </h1>
                            <i className="fa-regular fa-circle-play text-4xl sm:text-6xl md:text-8xl"></i>
                        </div>
                    </div>
                </div>
            )}
            <div ref={contentRef} className="horizontal-scroller-content">
                {images.map((image, index) => (
                    <div key={index} className="horizontal-scroller-section">
                        <img
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            onLoad={handleImageProcessed}
                            onError={handleImageProcessed}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalScroller;