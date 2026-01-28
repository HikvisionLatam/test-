// FunctionModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import VirtualKeypad from './VirtualKeypad';
import { generatePath } from './utils';
import { useTranslation } from 'react-i18next';
// --- ANALYTICS IMPORT ---
import { trackEvent } from '../../../../utils/analytics';

const FunctionModal = ({ isOpen, onClose, onInsert, initialData }) => {
    const { t } = useTranslation();
    
    const [functions, setFunctions] = useState({
        linear: { active: false, a: '1', b: '0', color: '#ef4444', label: 'Linear', eq: 'ax + b' },
        quadratic: { active: false, a: '1', b: '0', color: '#22c55e', label: 'Quadratic', eq: 'ax² + b' },
        trig: { active: false, a: '1', b: '0', color: '#3b82f6', label: 'Sine', eq: 'a·sin(x) + b' },
    });

    const [activeInput, setActiveInput] = useState({ type: null, field: null });

    useEffect(() => {
        if (isOpen && initialData) {
            setFunctions(JSON.parse(JSON.stringify(initialData)));
        } else if (isOpen && !initialData) {
             setFunctions({
                linear: { active: true, a: '1', b: '0', color: '#ef4444', label: 'Linear', eq: 'ax + b' },
                quadratic: { active: false, a: '1', b: '0', color: '#22c55e', label: 'Quadratic', eq: 'ax² + b' },
                trig: { active: false, a: '1', b: '0', color: '#3b82f6', label: 'Sine', eq: 'a·sin(x) + b' },
            });
        }
        
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const toggleFunction = (type) => {
        const nextState = !functions[type].active;
        // Analytics: Toggle Function Type
        trackEvent('click.action', {
            click_chapter1: 'WonderHub',
            click_chapter2: 'FunctionModal',
            click_name: 'toggle_function_type',
            function_type: type,
            status: nextState ? 'active' : 'inactive'
        });

        setFunctions(prev => ({
            ...prev,
            [type]: { ...prev[type], active: !prev[type].active }
        }));
    };

    const updateParam = (val) => {
        if (!activeInput.type) return;
        setFunctions(prev => ({
            ...prev,
            [activeInput.type]: {
                ...prev[activeInput.type],
                [activeInput.field]: val
            }
        }));
    };

    return (
        <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            
            <div className="bg-white w-[750px] h-[450px] rounded-xl shadow-2xl flex relative overflow-hidden animate-scale-up font-sans">
                
                <button
                    onClick={() => {
                        // Analytics: Close / Cancel
                        trackEvent('click.action', {
                            click_chapter1: 'WonderHub',
                            click_chapter2: 'FunctionModal',
                            click_name: 'close_modal'
                        });
                        onClose();
                    }}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full z-50 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Columna Izquierda: Selección */}
                <div className="w-[28%] bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('modal.headers.functions')}</h3>
                    {Object.entries(functions).map(([key, data]) => (
                        <div 
                            key={key}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${data.active ? 'bg-white border-blue-400 shadow-sm' : 'bg-gray-100 border-transparent hover:bg-gray-200'}`}
                            onClick={() => toggleFunction(key)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${data.active ? '' : 'bg-gray-400'}`} style={{ backgroundColor: data.active ? data.color : undefined }} />
                                <span className={`text-sm font-medium ${data.active ? 'text-gray-800' : 'text-gray-500'}`}>
                                    {t(`modal.types.${key}`)}
                                </span>
                            </div>
                            {data.active && <Check size={14} className="text-blue-500" />}
                        </div>
                    ))}
                </div>

                {/* Columna Central: Preview */}
                <div className="flex-1 relative bg-white">
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: 'center center'
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-[1px] bg-gray-800 opacity-20" />
                        <div className="h-full w-[1px] bg-gray-800 opacity-20 absolute" />
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 450" preserveAspectRatio="none">
                        {Object.entries(functions).map(([key, data]) => (
                            data.active && (
                                <path
                                    key={key}
                                    d={generatePath(key, 500, 450, data.a, data.b)}
                                    fill="none"
                                    stroke={data.color}
                                    strokeWidth="3"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )
                        ))}
                    </svg>
                </div>

                {/* Columna Derecha: Parámetros */}
                <div className="w-[30%] border-l border-gray-200 p-5 flex flex-col relative bg-white z-40">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t('modal.headers.parameters')}</h3>
                    
                    <div className="flex flex-col gap-6 overflow-y-auto max-h-[300px] pr-1">
                        {Object.entries(functions).map(([key, data]) => (
                            data.active && (
                                <div key={key} className="animate-fade-in">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: data.color}}/>
                                        <span className="text-xs font-bold text-gray-600">{t(`modal.types.${key}`)}</span>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center gap-1 text-sm font-mono text-gray-600">
                                        <span>y=</span>
                                        <button 
                                            onClick={() => {
                                                // Analytics: Start Editing Parameter A
                                                trackEvent('click.action', {
                                                    click_chapter1: 'WonderHub',
                                                    click_chapter2: 'FunctionModal',
                                                    click_name: 'edit_parameter',
                                                    function_type: key,
                                                    parameter: 'a'
                                                });
                                                setActiveInput({ type: key, field: 'a' });
                                            }}
                                            className={`min-w-[28px] px-1 py-0.5 rounded border bg-white text-center hover:border-blue-400 ${activeInput.type === key && activeInput.field === 'a' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}
                                        >
                                            {data.a}
                                        </button>
                                        <span className="text-gray-400 mx-1">
                                            {key === 'linear' ? 'x' : key === 'quadratic' ? 'x²' : 'sin(x)'}
                                        </span>
                                        <span>+</span>
                                        <button 
                                            onClick={() => {
                                                // Analytics: Start Editing Parameter B
                                                trackEvent('click.action', {
                                                    click_chapter1: 'WonderHub',
                                                    click_chapter2: 'FunctionModal',
                                                    click_name: 'edit_parameter',
                                                    function_type: key,
                                                    parameter: 'b'
                                                });
                                                setActiveInput({ type: key, field: 'b' });
                                            }}
                                            className={`min-w-[28px] px-1 py-0.5 rounded border bg-white text-center hover:border-blue-400 ${activeInput.type === key && activeInput.field === 'b' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'}`}
                                        >
                                            {data.b}
                                        </button>
                                    </div>
                                </div>
                            )
                        ))}
                        {!Object.values(functions).some(f => f.active) && (
                            <div className="text-sm text-gray-400 italic text-center mt-10">{t('modal.selectPrompt')}</div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            // Analytics: Confirm Insert
                            const activeCount = Object.values(functions).filter(f => f.active).length;
                            trackEvent('click.action', {
                                click_chapter1: 'WonderHub',
                                click_chapter2: 'FunctionModal',
                                click_name: 'confirm_insert_functions',
                                active_functions_count: activeCount
                            });
                            onInsert(functions);
                        }}
                        className="mt-auto w-full py-2 text-blue-400 cursor-pointer text-sm font-medium"
                    >
                        {t('modal.ok')}
                    </button>
                </div>
            </div>

            {activeInput.type && (
                <VirtualKeypad
                    value={functions[activeInput.type][activeInput.field]}
                    onChange={updateParam}
                    onClose={() => {
                        // Analytics: Finish Editing (Keypad Close)
                        trackEvent('click.action', {
                            click_chapter1: 'WonderHub',
                            click_chapter2: 'FunctionModal',
                            click_name: 'finish_parameter_edit',
                            function_type: activeInput.type
                        });
                        setActiveInput({ type: null, field: null });
                    }}
                />
            )}
        </div>
    );
};

export default FunctionModal;