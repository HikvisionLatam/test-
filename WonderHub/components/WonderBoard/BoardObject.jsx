// BoardObject.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Edit3, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { generatePath } from './utils';
import SoftwareTooltip from './SoftwareTooltip';

gsap.registerPlugin(Draggable);

const BoardObject = ({ id, data, onDelete, onEdit }) => {
    const ref = useRef(null);
    // scale se mantiene en 1 ya que quitamos la funcionalidad de zoom
    const [scale, setScale] = useState(1); 
    const [isSelected, setIsSelected] = useState(false);

    // Configuración Draggable
    useEffect(() => {
        if (!ref.current) return;
        const instance = Draggable.create(ref.current, {
            type: 'x,y',
            bounds: '.board-canvas',
            inertia: true,
            onPress: () => setIsSelected(true),
        })[0];
        return () => { if (instance) instance.kill(); };
    }, []);

    // Click Outside para deseleccionar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.keypad-drag-handle')) {
                setIsSelected(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtrar funciones activas
    const activeFunctions = Object.entries(data).filter(([_, f]) => f.active);

    return (
        <div
            ref={ref}
            className={`absolute top-1/2 left-1/2 w-[340px] h-[260px] bg-white rounded-xl cursor-grab active:cursor-grabbing group ${
                isSelected ? 'ring-2 ring-blue-500 shadow-2xl z-50' : 'shadow-md z-10'
            }`}
            style={{ transform: `scale(${scale})` }}
        >
            <div className="w-full h-full relative overflow-hidden rounded-xl bg-white border border-gray-100">
                {/* Grid de fondo suave */}
                <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(#999 1px, transparent 1px), linear-gradient(90deg, #999 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        backgroundPosition: 'center center'
                    }}
                />
                
                {/* --- CAMBIO 1: EJES MÁS NEGROS Y VISIBLES --- */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Eje X: Ahora gris oscuro (casi negro) y un poco más grueso (1.5px) */}
                    <div className="w-full h-[1.5px] bg-gray-900" />
                    {/* Eje Y */}
                    <div className="h-full w-[1.5px] bg-gray-900 absolute" />
                </div>

                {/* Renderizado de curvas */}
                <svg className="w-full h-full pointer-events-none" viewBox="0 0 340 260" preserveAspectRatio="none">
                    {activeFunctions.map(([key, func]) => (
                        <path
                            key={key}
                            d={generatePath(key, 340, 260, func.a, func.b)}
                            fill="none"
                            stroke={func.color}
                            strokeWidth="3"
                        />
                    ))}
                </svg>

                {/* Etiquetas de funciones (esquina superior derecha) */}
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1 pointer-events-none">
                    {activeFunctions.map(([key, func]) => (
                        <div key={key} className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/90 shadow-sm border border-gray-100" style={{color: func.color}}>
                            y = {func.a}{key === 'linear' ? 'x' : key === 'quadratic' ? 'x²' : 'sin(x)'} {parseFloat(func.b) >= 0 ? '+' : ''}{func.b}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- BARRA DE HERRAMIENTAS FLOTANTE --- */}
            {isSelected && (
                <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-[#222] text-white flex rounded-lg shadow-xl overflow-visible animate-scale-up items-center p-1 z-[60]">
                    
                    {/* --- CAMBIO 2 y 3: SIN FUNCIONALIDAD Y TOOLTIPS SOLO HOVER --- */}
                    <SoftwareTooltip label="Zoom In">
                        <div className="p-2 text-gray-400 cursor-default">
                            <Plus size={18} />
                        </div>
                    </SoftwareTooltip>
                    
                    <SoftwareTooltip label="Zoom Out">
                        <div className="p-2 text-gray-400 cursor-default">
                            <Minus size={18} />
                        </div>
                    </SoftwareTooltip>

                    <div className="w-[1px] h-4 bg-gray-600 mx-1" />

                    <SoftwareTooltip label="Editar Gráfica">
                        <button 
                            onClick={() => onEdit(id, data)}
                            className="p-2 hover:bg-white/20 rounded-md transition-colors text-blue-300 hover:text-blue-100"
                        >
                            <Edit3 size={18} />
                        </button>
                    </SoftwareTooltip>

                    <SoftwareTooltip label="Eliminar">
                        <button
                            onClick={() => onDelete(id)}
                            className="p-2 hover:bg-red-500/20 rounded-md transition-colors text-red-400 hover:text-red-300"
                        >
                            <Trash2 size={18} />
                        </button>
                    </SoftwareTooltip>
                </div>
            )}
        </div>
    );
};

export default BoardObject;