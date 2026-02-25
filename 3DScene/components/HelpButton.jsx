import React, { useState } from 'react';
import { HelpCircle, MousePointer2, Move, ZoomIn, X } from 'lucide-react';

const HelpButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {isOpen && (
                <div className="help-card animate-in fade-in zoom-in slide-in-from-bottom-5 duration-300">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <h3 className="font-bold text-gray-800 text-sm">Controles de Escena</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X size={16} />
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Computadora</p>
                        <div className="control-row">
                            <MousePointer2 size={18} className="text-gray-600" />
                            <span>Click Izq + Arrastrar <br /><span className="text-xs text-gray-400">para Rotar</span></span>
                        </div>
                        <div className="control-row mt-2">
                            <ZoomIn size={18} className="text-gray-600" />
                            <span>Scroll Rueda <br /><span className="text-xs text-gray-400">para Zoom</span></span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Móvil / Tablet</p>
                        <div className="control-row">
                            <Move size={18} className="text-gray-600" />
                            <span>Un dedo <br /><span className="text-xs text-gray-400">para Rotar</span></span>
                        </div>
                        <div className="control-row mt-2">
                            <div className="flex gap-1">
                                <span className="key-icon">👌</span>
                            </div>
                            <span>Dos dedos (Pellizco) <br /><span className="text-xs text-gray-400">para Zoom</span></span>
                        </div>
                    </div>
                </div>
            )}

            <button
                className="help-btn cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                title="Ayuda y Controles"
            >
                {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
            </button>
        </div>
    );
};

export default HelpButton;