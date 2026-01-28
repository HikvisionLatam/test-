// VirtualKeypad.jsx
import React, { useEffect, useRef } from 'react';
import { Globe, X, GripHorizontal, Delete } from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
// --- ANALYTICS IMPORT ---
import { trackEvent } from '../../../../utils/analytics';

gsap.registerPlugin(Draggable);

const VirtualKeypad = ({ value, onChange, onClose }) => {
    const keypadRef = useRef(null);

    useEffect(() => {
        if (!keypadRef.current) return;

        // Centramos el teclado inicialmente en la pantalla
        gsap.set(keypadRef.current, { 
            xPercent: -50, 
            yPercent: -50, 
            left: "50%", 
            top: "80%" // Aparece un poco más abajo del centro
        });

        // Hacemos el teclado arrastrable por toda la ventana
        const instance = Draggable.create(keypadRef.current, {
            type: 'x,y',
            trigger: '.keypad-drag-header', // Solo se arrastra desde la cabecera gris
            bounds: window, // Límites: la pantalla completa
            inertia: true,
            edgeResistance: 0.65,
            zIndexBoost: false,
            // Analytics: Track Keypad Movement
            onDragEnd: function() {
                trackEvent('click.action', {
                    click_chapter1: 'WonderHub',
                    click_chapter2: 'VirtualKeypad',
                    click_name: 'reposition_keypad',
                    pos_x: Math.round(this.x),
                    pos_y: Math.round(this.y)
                });
            }
        })[0];

        return () => { 
            if (instance) instance.kill(); 
        };
    }, []);

    const keys = [
        ['%', '1', '2', '3', 'back'],
        ['-', '4', '5', '6', '.'],
        ['+', '7', '8', '9', '@'],
        ['x', 'Done', '0', 'space', 'Return'], 
    ];

    const handlePress = (k) => {
        const key = k.toLowerCase();
        
        // Analytics: Determine Key Action Type
        let actionName = 'type_character';
        if (key === 'done' || key === 'return') actionName = 'submit_input';
        else if (key === 'back') actionName = 'backspace';
        else if (key === 'space') actionName = 'type_space';

        trackEvent('click.action', {
            click_chapter1: 'WonderHub',
            click_chapter2: 'VirtualKeypad',
            click_name: actionName,
            key_label: k // Registramos qué tecla específica se pulsó
        });

        if (key === 'done' || key === 'return') {
            onClose();
        } else if (key === 'back') {
            onChange(value.toString().slice(0, -1));
        } else if (key === 'space') {
            onChange(value + ' ');
        } else {
            onChange(value + k);
        }
    };

    return (
        <div 
            ref={keypadRef}
            className="fixed w-[340px] bg-[#f3f4f6] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[4000] overflow-hidden border border-gray-300 font-sans"
            style={{ touchAction: 'none' }} // Importante para evitar scroll en móviles al arrastrar
        >
            {/* --- CABECERA DE ARRASTRE --- */}
            <div className="keypad-drag-header bg-[#e5e7eb] w-full h-8 flex items-center justify-center cursor-grab active:cursor-grabbing border-b border-gray-300">
                <div className="w-10 h-1 bg-gray-400 rounded-full" />
            </div>

            <div className="p-3">
                {/* Pantalla del input */}
                <div className="bg-white rounded-lg p-3 mb-3 flex justify-between items-center shadow-inner border border-gray-200">
                    <span className="text-xl font-mono text-gray-800 overflow-hidden whitespace-nowrap min-h-[1.75rem]">
                        {value}
                        <span className="animate-pulse ml-1 text-blue-500">|</span>
                    </span>
                    <Globe size={16} className="text-gray-400" />
                </div>

                {/* Grid de teclas */}
                <div className="grid grid-cols-5 gap-2">
                    {keys.flat().map((k, i) => (
                        <button
                            key={i}
                            onMouseDown={(e) => {
                                // Evitamos que el click propague eventos de drag indeseados
                                e.stopPropagation(); 
                                handlePress(k);
                            }}
                            className={[
                                'h-11 rounded-lg font-bold text-lg shadow-[0_2px_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px] transition-all flex items-center justify-center select-none',
                                (k === 'Return' || k === 'Done') ? 'bg-blue-500 text-white col-span-1 text-sm' : '',
                                k === 'space' ? 'bg-white col-span-1' : '',
                                k === 'back' ? 'bg-gray-400 text-white' : '',
                                !['Return', 'Done', 'space', 'back'].includes(k)
                                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                                    : '',
                            ].join(' ')}
                        >
                            {k === 'back' ? <Delete size={20} /> : k === 'space' ? '␣' : k}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VirtualKeypad;