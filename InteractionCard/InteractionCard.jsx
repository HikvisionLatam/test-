import React, { useEffect, useRef, forwardRef } from 'react';
import gsap from 'gsap';

const InteractionCard = forwardRef(({
    children,
    onClick,
    className = "",
    style = {},
    cursorText = "Inscribirse",
    accentColor = "#000000",
    isDisabled = false
}, externalRef) => {

    const internalRef = useRef(null);
    const cursorRef = useRef(null);
    const xTo = useRef(null);
    const yTo = useRef(null);

    const setCombinedRef = (node) => {
        internalRef.current = node;
        if (typeof externalRef === 'function') {
            externalRef(node);
        } else if (externalRef) {
            externalRef.current = node;
        }
    };

    useEffect(() => {
        if (isDisabled) return;

        const ctx = gsap.context(() => {
            // Configuración del movimiento
            xTo.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.25, ease: "power3" });
            yTo.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.25, ease: "power3" });

            // Estado inicial oculto
            gsap.set(cursorRef.current, { xPercent: -50, yPercent: -50, scale: 0, opacity: 0 });
        }, internalRef);

        return () => ctx.revert();
    }, [isDisabled]);

    const handleMouseMove = (e) => {
        if (isDisabled || !internalRef.current) return;

        const rect = internalRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Actualizamos posición siempre
        if (xTo.current && yTo.current) {
            xTo.current(x);
            yTo.current(y);
        }
    };

    const handlePointerEnter = (e) => {
        if (isDisabled || !internalRef.current) return;

        // 1. Calcular posición de entrada inmediatamente para evitar "saltos" desde el centro
        const rect = internalRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 2. Forzar al cursor a ir a esa posición YA (sin animación de arrastre inicial)
        if (xTo.current && yTo.current) {
            xTo.current(x);
            yTo.current(y);
        }

        // 3. Matar SOLO animaciones de escala/opacidad previas (para evitar conflictos)
        // NO usamos overwrite: true porque mataría el movimiento x/y
        gsap.killTweensOf(cursorRef.current, "scale,opacity");

        // 4. Animar entrada
        gsap.to(cursorRef.current, {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out(1.7)"
        });
    };

    const handlePointerLeave = () => {
        if (isDisabled) return;

        // 1. Matar animación de entrada pendiente
        gsap.killTweensOf(cursorRef.current, "scale,opacity");

        // 2. Animar salida
        gsap.to(cursorRef.current, {
            scale: 0,
            opacity: 0,
            duration: 0.2,
            ease: "power2.in"
        });
    };

    if (isDisabled) {
        return (
            <div
                className={className}
                style={style}
                onClick={onClick}
            >
                {children}
            </div>
        );
    }

    return (
        <div
            ref={setCombinedRef}
            className={`relative overflow-hidden cursor-none ${className}`}
            style={style}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
        >
            <div className="relative z-10 pointer-events-none">
                {children}
            </div>

            <div
                ref={cursorRef}
                className="pointer-events-none absolute top-0 left-0 z-50 flex flex-col items-center justify-center rounded-full shadow-2xl backdrop-blur-sm"
                style={{
                    backgroundColor: accentColor,
                    width: '85px',
                    height: '85px',
                    border: '2px solid rgba(255,255,255,0.2)'
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-white mb-1"
                    viewBox="0 0 30 24"
                    fill="currentColor"
                >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    <path d="M20 13h-2v3h-3v2h3v3h2v-3h3v-2h-3z" transform="translate(5, 0)" />
                </svg>
                <span
                    className="text-white font-semibold text-[11px] leading-tight text-center px-1"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)', fontFamily: 'inherit' }}
                >
                    {cursorText}
                </span>
            </div>
        </div>
    );
});

export default InteractionCard;