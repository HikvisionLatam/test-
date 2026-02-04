import React, { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother"; // Club GSAP
import { SplitText } from "gsap/SplitText"; // Club GSAP

import bgDesktop from "./images/BACKGROUND-PC.jpg";
import bgMobile from "./images/BACKGROUD-MO.jpg";
import logo from "./images/LOGO.webp";
import icon1 from "./images/Recurso 1.svg";
import icon2 from "./images/Recurso 3.svg";
import icon3 from "./images/Recurso 4.svg";
import icon4 from "./images/Recurso 5.svg";
import Bullet from "./components/Bullet/Bullet";
import ContactForm from "./ContactForm"; 

// Registramos plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

const ColombiaForm = () => {
    const [showForm, setShowForm] = useState(false);
    
    const mainRef = useRef(null);
    const smootherRef = useRef(null);
    const formRef = useRef(null);

    const handleCTAClick = () => {
        setShowForm(true);
        setTimeout(() => {
            if (smootherRef.current) {
                smootherRef.current.scrollTo(formRef.current, true, "center center");
            } else {
                formRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            
            // 1. Inicializar ScrollSmoother
            smootherRef.current = ScrollSmoother.create({
                wrapper: "#smooth-wrapper",
                content: "#smooth-content",
                smooth: 1.5,
                effects: true
            });

            // 2. NUEVO: Zoom Background al hacer Scroll
            // Seleccionamos la imagen y hacemos que crezca (scale) mientras bajamos
            gsap.to(".bg-zoom", {
                scale: 1.3, // Aumenta al 130%
                ease: "none",
                scrollTrigger: {
                    trigger: "#smooth-wrapper", // Toda la página
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true // Vinculado al movimiento del scroll
                }
            });

            // 3. Animación del Logo (Entrada simple al cargar)
            gsap.from(".logo-anim", { 
                y: -50, 
                opacity: 0, 
                duration: 1.5, 
                ease: "power3.out" 
            });

            // 4. Animación de Textos (SplitText)
            const headings = gsap.utils.toArray(".anim-text");
            headings.forEach((heading) => {
                try {
                    const split = new SplitText(heading, { type: "chars, words" });
                    gsap.from(split.chars, {
                        opacity: 0,
                        y: 30,
                        stagger: 0.02,
                        duration: 1,
                        ease: "back.out",
                        scrollTrigger: {
                            trigger: heading,
                            start: "top 85%",
                            toggleActions: "play none none reverse"
                        }
                    });
                } catch (e) {
                    // Fallback
                    gsap.from(heading, { opacity: 0, y: 30, duration: 1, scrollTrigger: { trigger: heading, start: "top 80%" } });
                }
            });

            // 5. Bullets
            gsap.from(".bullet-item", {
                scrollTrigger: {
                    trigger: ".bullets-container",
                    start: "top 75%",
                },
                y: 100,
                opacity: 0,
                rotationY: 90,
                stagger: 0.2,
                duration: 1.2,
                ease: "power3.out"
            });

        }, mainRef);

        return () => ctx.revert();
    }, [showForm]); 

    const bullets = [
        { id: 1, icon: icon1, title: "Alto brillo y contraste", description: "Detalles nítidos incluso en escenarios exigentes." },
        { id: 2, icon: icon2, title: "Instalación eficiente", description: "Montaje rápido y seguro para cualquier estadio o evento." },
        { id: 3, icon: icon3, title: "Durabilidad garantizada", description: "Materiales resistentes a condiciones climáticas adversas." },
        { id: 4, icon: icon4, title: "Control remoto avanzado", description: "Gestión y monitoreo en tiempo real desde cualquier dispositivo." }
    ];

    return (
        <div ref={mainRef}>
            <div id="smooth-wrapper" className="overflow-hidden">
                <div id="smooth-content">
                    
                    <section style={{ fontFamily: "'Gilroy'" }} className="relative w-full min-h-screen pb-20 overflow-hidden">
                        
                        {/* Fondo con Zoom y Parallax */}
                        <picture className="block w-full absolute top-0 left-0 -z-10 h-full overflow-hidden">
                            <source media="(max-width: 768px)" srcSet={bgMobile} />
                            <img
                                data-speed="0.5"
                                className="bg-zoom w-full h-full object-cover origin-center" // Clase bg-zoom para el GSAP
                                src={bgDesktop}
                                alt="Background"
                            />
                        </picture>

                        <div className="relative z-10 w-full flex flex-col items-center pt-8 md:pt-60 pb-10">
                            <div className="mb-10 pointer-events-none logo-anim">
                                <img src={logo} alt="Logo" className="w-50 md:w-180 object-contain" />
                            </div>

                            <div className="flex flex-col items-center px-4 md:px-5 text-white max-w-6xl w-full mx-auto">
                                <h1 className="anim-text text-1xl md:text-[clamp(2rem,5vw,4rem)] font-regular text-center leading-tight">
                                    Emoción en <span className="font-bold ctc-mdl text-2xl md:text-[clamp(4rem,10vw,8rem)] text-[#ff2e57]">gran </span><span className="font-bold">formato.</span>
                                </h1>
                                
                                <p className="anim-text font-bold text-xs md:text-[clamp(1.5rem,3vw,2rem)] pt-2 md:pt-2 text-center">
                                    Cuando empieza el partido, todo se acelera:
                                </p>
                                <p className="anim-text text-xs md:text-[clamp(1.5rem,3vw,2rem)] max-w-xl text-center leading-relaxed opacity-90">
                                    Gritos, jugadas y adrenalina.
                                    Con nuestras pantallas LED, todo se vive en grande.
                                </p>
                                
                                <div className="bullets-container pt-6 md:pt-20 w-full">
                                    <div className="max-w-4xl mx-auto">
                                        <div className="flex flex-col gap-3 md:gap-6">
                                            {bullets.map(b => (
                                                <div key={b.id} className="bullet-item flex justify-center w-full transform-style-3d">
                                                    <Bullet className="w-full shadow-lg" icon={b.icon} title={b.title} description={b.description} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {!showForm && (
                                    <button
                                        onClick={handleCTAClick}
                                        className="pointer-events-auto bg-[#ff2e57] mt-8 md:mt-16 hover:bg-[#e1254a] text-white font-bold py-3 px-6 md:py-4 md:px-8 rounded-full text-base md:text-xl transition-transform duration-300 ease-out transform hover:scale-110 hover:-translate-y-1 hover:shadow-2xl focus:outline-none cursor-pointer whitespace-nowrap z-50"
                                    >
                                        Quiero más información
                                    </button>
                                )}
                            </div>
                        </div>

                        {showForm && (
                            <div ref={formRef} className="relative z-20 w-full px-4 pb-20">
                                <ContactForm />
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ColombiaForm;