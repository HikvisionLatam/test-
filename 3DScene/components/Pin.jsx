// 3DScene/components/Pin.jsx
import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import * as Icons from 'lucide-react';

const Pin = ({ 
    type = 'category', 
    data, 
    color, 
    isActiveCategory, 
    isHighlighted,    
    onClick 
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = Icons[data.iconName] || Icons.CircleDot;
    const pinColor = color || '#d01c19';

    const categoryIsOpen = !isActiveCategory;

    const handleClick = (e) => {
        e.stopPropagation();
        onClick();
    };

    if (type === 'category') {
        return (
            <group position={data.position}>
                <Html center zIndexRange={[100, 0]}>
                    <div className="cursor-pointer select-none pointer-events-auto" onClick={handleClick}>
                        <div 
                            className={`flex items-center p-1 rounded-full shadow-lg border-2 border-white transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${categoryIsOpen ? 'max-w-[250px]' : 'max-w-[36px]'}`} 
                            style={{ backgroundColor: pinColor }}
                        >
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0">
                                <IconComponent size={16} color={pinColor} strokeWidth={2.5} />
                            </div>
                            <div className={`text-white font-semibold text-[13px] font-sans whitespace-nowrap overflow-hidden transition-all duration-300 ${categoryIsOpen ? 'px-2 opacity-100' : 'px-0 opacity-0 w-0'}`}>
                                {data.label}
                            </div>
                        </div>
                    </div>
                </Html>
            </group>
        );
    }

    // --- RENDER DE PRODUCTO ESPECÍFICO ---
    return (
        <group position={data.position}>
            <Html center zIndexRange={[100, 0]}>
                <div 
                    className={`cursor-pointer relative pointer-events-auto transition-transform duration-300 ${isHighlighted ? 'scale-110' : 'scale-100'}`}
                    onClick={handleClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div 
                        className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-md transition-all duration-300 ${isHighlighted ? 'animate-prod-pulse' : ''}`} 
                        style={{ backgroundColor: pinColor }}
                    >
                        <IconComponent size={16} color="white" strokeWidth={2.5} />
                        
                        {isHovered && (
                            <div 
                                className="absolute bottom-[140%] left-1/2 -translate-x-1/2 bg-white px-3.5 py-1.5 rounded-lg text-[13px] font-sans font-bold whitespace-nowrap pointer-events-none shadow-lg z-50"
                                style={{ color: pinColor }}
                            >
                                {data.name}
                                {/* Flechita blanca hacia abajo */}
                                <div className="absolute top-full left-1/2 -ml-1.5 border-[6px] border-solid border-transparent border-t-white"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Animación conservada en CSS para el pulso de productos */}
                <style jsx>{`
                    .animate-prod-pulse {
                        animation: prod-pulse 1.5s infinite;
                    }
                    @keyframes prod-pulse {
                        0% { box-shadow: 0 0 0 0 rgba(0,0,0,0.4); }
                        70% { box-shadow: 0 0 0 10px rgba(0,0,0,0); }
                        100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
                    }
                `}</style>
            </Html>
        </group>
    );
};

export default Pin;