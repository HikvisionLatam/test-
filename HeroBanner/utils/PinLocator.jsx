import React, { useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

const PinLocator = () => {
    const [imageSrc, setImageSrc] = useState("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=1000&q=90");

    const [pins, setPins] = useState([]);
    const [copied, setCopied] = useState(false);
    const imageRef = useRef(null);

    const handleImageClick = (e) => {
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newPin = {
            x: parseFloat(x.toFixed(1)),
            y: parseFloat(y.toFixed(1)),
            label: `Nuevo Pin ${pins.length + 1}`
        };

        setPins([...pins, newPin]);
    };

const generateCode = () => {
    const formattedPins = pins.map(p => ({
        x: p.x,
        y: p.y,
        label: "Título del Producto",
        icon: "PONER_ICONO_AQUI",
        link: "#",
        linkText: "Ver más"
    }));
    return JSON.stringify(formattedPins, null, 4);
};
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 p-8 flex flex-col items-center font-sans text-white">

            <div className="max-w-4xl w-full space-y-6">

                <div className="flex justify-between items-end border-b border-slate-700 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-red-400">📍 Pin Locator Tool</h1>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Pegar URL de imagen..."
                            className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm w-64 text-white"
                            value={imageSrc}
                            onChange={(e) => setImageSrc(e.target.value)}
                        />
                        <button onClick={() => setPins([])} className="px-4 py-2 text-xs font-bold bg-slate-700 hover:bg-slate-600 rounded text-white">
                            Limpiar Pines
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 relative bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl group">
                        <p className="absolute top-2 left-2 z-50 bg-black/50 px-2 py-1 text-xs rounded pointer-events-none">
                            Modo Click Activo
                        </p>

                        <div className="relative cursor-crosshair" onClick={handleImageClick}>
                            <img
                                ref={imageRef}
                                src={imageSrc}
                                alt="Referencia"
                                className="w-full h-auto object-contain block select-none"
                            />

                            {pins.map((pin, i) => (
                                <div
                                    key={i}
                                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg pointer-events-none"
                                    style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-mono text-sm font-bold text-slate-300">Coordenadas Generadas:</h3>
                            <button
                                onClick={copyToClipboard}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                            >
                                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                            </button>
                        </div>

                        <pre className="flex-1 bg-slate-950 p-4 rounded text-xs font-mono text-green-400 overflow-auto whitespace-pre-wrap select-all">
                            {generateCode()}
                        </pre>

                        <p className="mt-3 text-xs text-slate-500 italic">
                            * Copia esto y pégalo en tu array 'securityPins' dentro de HeroBanner.jsx
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PinLocator;