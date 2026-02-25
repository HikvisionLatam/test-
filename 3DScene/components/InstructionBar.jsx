// 3DScene/components/InstructionBar.jsx
import React from 'react';
import { useMobile } from '../hooks/useMobile';
import { MousePointer2, Move, ZoomIn } from 'lucide-react';

const InstructionBar = () => {
    const isMobile = useMobile();

    return (
        <div className={`absolute left-0 w-full z-[90] flex justify-center items-center flex-nowrap overflow-x-auto no-scrollbar gap-2 md:gap-4 bg-gray-100/60 backdrop-blur-md border-white/50 shadow-sm
            ${isMobile 
                ? 'top-0 border-b pt-[max(45px,env(safe-area-inset-top))] pb-3 px-3' 
                : 'bottom-0 border-t py-3 px-5'
            }`}
        >
            <div className="flex items-center gap-1.5 font-sans text-[10px] md:text-[13px] text-gray-700 font-semibold whitespace-nowrap">
                {isMobile ? <Move size={14} className="text-[#d01c19]" /> : <MousePointer2 size={16} className="text-[#d01c19]" />}
                <span>{isMobile ? 'Desliza para rotar' : 'Clic + Arrastrar para rotar'}</span>
            </div>
            
            <div className="w-[1px] h-3.5 bg-black/15" />
            
            <div className="flex items-center gap-1.5 font-sans text-[10px] md:text-[13px] text-gray-700 font-semibold whitespace-nowrap">
                <ZoomIn size={14} className="text-[#d01c19]" />
                <span>{isMobile ? 'Pellizca para zoom' : 'Scroll para zoom'}</span>
            </div>

            <div className="w-[1px] h-3.5 bg-black/15" />

            <div className="flex items-center gap-1.5 font-sans text-[10px] md:text-[13px] text-gray-700 font-semibold whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#d01c19] inline-block animate-[pulse-dot_2s_infinite]" />
                <span>Clic en pines para explorar</span>
            </div>

            {/* Animación única y ocultar scrollbar */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes pulse-dot {
                    0% { box-shadow: 0 0 0 0 rgba(208, 28, 25, 0.4); }
                    70% { box-shadow: 0 0 0 5px rgba(208, 28, 25, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(208, 28, 25, 0); }
                }
            `}</style>
        </div>
    );
};

export default InstructionBar;