// WonderHubFrame.jsx
import React, { useState, useEffect } from 'react';

// --- SUB-COMPONENTE: TOOLTIP INTERACTIVO (Z-INDEX 9999) ---
// ... (HardwareElement - Sin cambios)
const HardwareElement = ({ label, children, className, tooltipSide = "top" }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div
            className={`relative group cursor-help ${className}`}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {children}

            {/* Tooltip Logic: Z-INDEX ALTO y ajuste de posición para evitar clipping */}
            <div className={`absolute ${tooltipSide === 'top' ? '-top-10 bottom-auto' : 'top-12 bottom-auto'} left-1/2 transform -translate-x-1/2 
                      px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-[10px] font-medium tracking-wide rounded-md 
                      whitespace-nowrap z-[9999] shadow-xl border border-white/20 pointer-events-none transition-all duration-200 
                      ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}>
                {label}
                <div className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 
                        ${tooltipSide === 'top' ? '-bottom-1' : '-top-1'}`}></div>
            </div>
        </div>
    );
};

// --- NUEVO COMPONENTE: Bloqueador de Interacción Móvil ---
const MobileInteractionGuard = () => (
    // 🌟 AJUSTE: w-screen h-screen para cubrir toda la ventana visible.
    <div className="md:hidden fixed inset-0 w-screen h-screen z-[10000] flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-md p-6 text-center">
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm">
            <h2 className="text-xl font-bold text-red-600 mb-3">Opps! Acceso Restringido ⛔</h2>
            <p className="text-gray-700 mb-4">
                Esta interfaz es una **simulación de una pantalla interactiva** diseñada para pantallas grandes (computadoras de escritorio o tabletas horizontales).
            </p>
            <p className="text-gray-700 font-medium">
                Por favor, accede desde un dispositivo con **mayor ancho de pantalla** para interactuar con el demo.
            </p>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL ---
const WonderHubFrame = ({ children }) => {
    // Definición de estados y efectos para la detección del ancho de pantalla
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            // Usamos 768px como punto de corte para dispositivos medianos (md: en Tailwind)
            const mobileDetected = window.innerWidth < 768;
            setIsMobile(mobileDetected);

            // 🌟 AJUSTE: Aplicar o remover overflow-hidden al cuerpo del documento (o al contenedor principal)
            if (mobileDetected) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = ''; // Restaurar el desplazamiento normal
            }
        };

        // Ejecutar al inicio
        checkMobile();

        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', checkMobile);

        // Limpieza: Asegurar que se restaura el overflow al desmontar el componente
        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.style.overflow = '';
        };
    }, []);

    // 🌟 CORRECCIÓN: Aplicamos overflow-hidden al contenedor principal del marco (wonder-hub-wrapper)
    const wrapperClasses = `min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 md:p-8 select-none font-sans ${isMobile ? 'overflow-hidden' : ''}`;

    return (
        <>
            {/* El guard se renderiza primero si es un dispositivo móvil, cubriendo todo. */}
            {isMobile && <MobileInteractionGuard />}
            
            {/* El overflow-hidden se aplica dinámicamente aquí */}
            <div className={wrapperClasses}>

                {/* CONTENEDOR DISPOSITIVO */}
                {/* ... (el resto del código sigue igual) */}
                <div className="relative w-full max-w-[1400px] aspect-video bg-[#e6e7eb] rounded-lg shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] flex flex-col ring-1 ring-white/70">
                    
                    {/* 1. CÁMARA */}
                    <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 z-[500]">
                        <HardwareElement label="Integrated 4K AI Camera" tooltipSide="bottom">
                            <div className="w-5 h-4 bg-[#111] rounded-md flex items-center justify-center border border-gray-700 shadow-md relative">
                                {/* Lente */}
                                <div className="w-2 h-2 bg-[#000] rounded-full ring-1 ring-[#333] flex items-center justify-center relative overflow-hidden">
                                    <div className="w-1 h-1 bg-[#1e293b] rounded-full opacity-80"></div>
                                    <div className="absolute top-0.5 right-0.5 w-0.5 h-0.5 bg-white blur-[0.2px]"></div>
                                </div>
                                {/* Micrófono pequeño al lado */}
                                <div className="absolute right-2 w-0.5 h-0.5 bg-gray-500 rounded-full"></div>
                            </div>
                        </HardwareElement>
                    </div>

                    {/* 2. PANTALLA (Bezel Negro) - Aquí sí mantenemos overflow-hidden para el contenido de la pantalla */}
                    <div className="flex-1 bg-black mx-4 mt-4 relative border-[8px] border-black rounded-t-[2px] shadow-inner overflow-hidden">
                        <div className="w-full h-full bg-black relative">
                            {children}
                        </div>
                    </div>

                    {/* 3. BARRA INFERIOR (Restaurada a la versión original para escritorio) */}
                    <div className="h-16 md:h-20 bg-gradient-to-b from-[#ececed] via-[#e2e2e6] to-[#d4d4d9] w-full relative flex items-center justify-between px-6 md:px-12 border-t border-white/50 rounded-b-lg shadow-inner z-40">

                        {/* === IZQUIERDA: PUERTOS === */}
                        <div className="flex items-end gap-3 md:gap-4 pb-2 w-1/3">
                            {/* USB 3.0 x2 */}
                            {[1, 2].map((i) => (
                                <HardwareElement key={i} label="USB 3.0">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-7 h-3 bg-[#2a2a2a] border-[1.5px] border-[#a3a3a3] rounded-[1px] relative shadow-inner flex flex-col justify-end">
                                            <div className="w-full h-[50%] bg-[#0051ba]"></div>
                                        </div>
                                        <span className="text-[8px] text-[#666] font-bold tracking-tight scale-90">USB</span>
                                    </div>
                                </HardwareElement>
                            ))}

                            {/* TOUCH-USB */}
                            <HardwareElement label="Touch USB">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-6 h-6 bg-[#dcdcdc] border-[1.5px] border-[#999] rounded-[2px] flex items-center justify-center shadow-inner">
                                        <div className="w-3 h-3 bg-[#1a1a1a] rounded-[1px] border border-gray-400"></div>
                                    </div>
                                    <span className="text-[8px] text-[#666] font-bold tracking-tight scale-90">TOUCH-USB</span>
                                </div>
                            </HardwareElement>

                            {/* HDMI */}
                            <HardwareElement label="HDMI In">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-8 h-3.5 bg-[#2a2a2a] relative flex items-center justify-center shadow-inner"
                                        style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}>
                                        <div className="w-5 h-0.5 bg-[#b8860b] opacity-30"></div>
                                    </div>
                                    <span className="text-[8px] text-[#666] font-bold tracking-tight scale-90">HDMI</span>
                                </div>
                            </HardwareElement>

                            {/* Type-C */}
                            <HardwareElement label="Type-C">
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-6 h-2.5 bg-[#1a1a1a] rounded-full border border-[#888] flex items-center justify-center shadow-inner">
                                        <div className="w-3.5 h-1 bg-[#111] rounded-full border border-[#444]"></div>
                                    </div>
                                    <span className="text-[8px] text-[#666] font-bold tracking-tight scale-90">Type-C</span>
                                </div>
                            </HardwareElement>

                            {/* Sensores pequeños */}
                            <div className="flex gap-2 mb-4 ml-1 opacity-70">
                                <div className="w-3 h-1.5 bg-[#333] rounded-sm"></div>
                                <div className="w-3 h-1.5 bg-[#600] rounded-sm"></div>
                            </div>
                        </div>

                        {/* === CENTRO: LÁPICES + BOTONERA === */}
                        <div className="flex-1 flex items-end justify-center pb-2 relative h-full gap-4 md:gap-8">
                            
                            {/* LÁPIZ IZQUIERDO (Magnetic Pen) */}
                            <HardwareElement label="Stylus Pen (Magnetic)" className="mb-1">
                                <div className="w-24 md:w-32 h-2.5 bg-gradient-to-b from-[#4a4a4a] to-[#222] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-b border-white/10"></div>
                            </HardwareElement>

                            {/* Consola Central */}
                            <div className="flex flex-col items-center justify-end z-10">
                                <span className="text-[9px] font-extrabold tracking-[0.25em] text-[#555] mb-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                                    HIKVISION
                                </span>
                                <div className="flex items-center gap-4 bg-[#d4d4d8] px-5 py-1.5 rounded-full shadow-[inset_0_2px_5px_rgba(0,0,0,0.15),0_1px_0_rgba(255,255,255,1)] border-b border-white/30">
                                    <HardwareElement label="Power">
                                        <button className="w-5 h-5 rounded-full bg-gradient-to-br from-[#f3f4f6] to-[#d1d5db] shadow-sm border border-[#a1a1aa] flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full border-[1.5px] border-gray-500 border-t-transparent relative">
                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-[1.5px] h-1.5 bg-gray-500"></div>
                                            </div>
                                        </button>
                                    </HardwareElement>
                                    <div className="flex gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-[#f3f4f6] to-[#bdbdbf] shadow-sm border border-[#a1a1aa]"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* LÁPIZ DERECHO (Magnetic Pen) */}
                            <HardwareElement label="Stylus Pen (Magnetic)" className="mb-1">
                                <div className="w-24 md:w-32 h-2.5 bg-gradient-to-b from-[#4a4a4a] to-[#222] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] border-b border-white/10"></div>
                            </HardwareElement>
                        </div>

                        {/* === DERECHA: AUDIO Y NFC === */}
                        <div className="flex items-end justify-end gap-6 pb-3 w-1/3">
                            <HardwareElement label="Stereo Speaker">
                                <div className="hidden lg:block w-28 h-3 bg-[#cacad1] rounded-full shadow-inner border-b border-white/50 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-evenly px-2 opacity-60">
                                        {[...Array(20)].map((_, i) => <div key={i} className="w-[1.5px] h-[1.5px] bg-[#555] rounded-full"></div>)}
                                    </div>
                                </div>
                            </HardwareElement>

                            <HardwareElement label="NFC Sensor">
                                <div className="flex flex-col items-center justify-end gap-1 opacity-60">
                                    <div className="w-8 h-8 border border-gray-400 rounded flex items-center justify-center bg-gradient-to-br from-transparent to-black/5">
                                        <div className="w-4 h-4 border border-gray-500 rounded-full flex items-center justify-center">
                                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                        </div>
                                    </div>
                                    <span className="text-[6px] font-bold tracking-widest text-gray-600">NFC</span>
                                </div>
                            </HardwareElement>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default WonderHubFrame;