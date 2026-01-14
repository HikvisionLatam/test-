// WonderOS.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
    Wifi, Settings, FolderOpen, LayoutGrid,
    Home, Layers, Monitor, Briefcase, SlidersHorizontal,
    Cast, PenTool, X, Search, StickyNote, Camera, Crop,
    Calculator, Timer, Hourglass, CheckSquare, Dices,
    Video, Lock, ArrowRightLeft, Smartphone, Music, ChevronLeft, Volume2,
    ChevronDown
} from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useTranslation, Trans } from 'react-i18next'; // IMPORTADO
import WonderBoard from './WonderBoard/WonderBoard';

gsap.registerPlugin(Draggable);

const GOOGLE_APPS = [
    { name: 'Chrome', img: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg' },
    { name: 'Gmail', img: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg' },
    { name: 'Maps', img: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg' },
    { name: 'Drive', img: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg' },
    { name: 'YouTube', img: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg' },
];

const SoftwareTooltip = ({ label, children }) => {
    return (
        <div className="relative group flex flex-col items-center justify-center">
            {children}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 px-3 py-1 bg-gray-900 text-white text-[10px] rounded-md shadow-2xl pointer-events-none whitespace-nowrap z-[9999] backdrop-blur-sm border border-white/20">
                {label}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
        </div>
    );
};

const ToastNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(onClose, 700);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, message]);

    return (
        <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-[9999] transition-all duration-500 ease-out 
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
            <div className="bg-black/80 backdrop-blur-md text-white pl-4 pr-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
                <div className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center text-xs font-mono">i</div>
                <span className="text-sm font-light tracking-wide">{message}</span>
            </div>
        </div>
    );
};

// --- APP: PIANO ---
const PianoApp = ({ onClose }) => {
    const { t } = useTranslation();
    const [volume, setVolume] = useState(50);

    const generateNotes = () => {
         return [
            { note: 'C2', freq: 65.41, type: 'white' }, { note: 'C#2', freq: 69.30, type: 'black' },
            { note: 'D2', freq: 73.42, type: 'white' }, { note: 'D#2', freq: 77.78, type: 'black' },
            { note: 'E2', freq: 82.41, type: 'white' },
            { note: 'F2', freq: 87.31, type: 'white' }, { note: 'F#2', freq: 92.50, type: 'black' },
            { note: 'G2', freq: 98.00, type: 'white' }, { note: 'G#2', freq: 103.83, type: 'black' },
            { note: 'A2', freq: 110.00, type: 'white' }, { note: 'A#2', freq: 116.54, type: 'black' },
            { note: 'B2', freq: 123.47, type: 'white' },

            { note: 'C3', freq: 130.81, type: 'white' }, { note: 'C#3', freq: 138.59, type: 'black' },
            { note: 'D3', freq: 146.83, type: 'white' }, { note: 'D#3', freq: 155.56, type: 'black' },
            { note: 'E3', freq: 164.81, type: 'white' },
            { note: 'F3', freq: 174.61, type: 'white' }, { note: 'F#3', freq: 185.00, type: 'black' },
            { note: 'G3', freq: 196.00, type: 'white' }, { note: 'G#3', freq: 207.65, type: 'black' },
            { note: 'A3', freq: 220.00, type: 'white' }, { note: 'A#3', freq: 233.08, type: 'black' },
            { note: 'B3', freq: 246.94, type: 'white' },

            { note: 'C4', freq: 261.63, type: 'white' }, { note: 'C#4', freq: 277.18, type: 'black' },
            { note: 'D4', freq: 293.66, type: 'white' }, { note: 'D#4', freq: 311.13, type: 'black' },
            { note: 'E4', freq: 329.63, type: 'white' },
            { note: 'F4', freq: 349.23, type: 'white' }, { note: 'F#4', freq: 369.99, type: 'black' },
            { note: 'G4', freq: 392.00, type: 'white' }, { note: 'G#4', freq: 415.30, type: 'black' },
            { note: 'A4', freq: 440.00, type: 'white' }, { note: 'A#4', freq: 466.16, type: 'black' },
            { note: 'B4', freq: 493.88, type: 'white' },

            { note: 'C5', freq: 523.25, type: 'white' }, { note: 'C#5', freq: 554.37, type: 'black' },
            { note: 'D5', freq: 587.33, type: 'white' }, { note: 'D#5', freq: 622.25, type: 'black' },
            { note: 'E5', freq: 659.25, type: 'white' },
            { note: 'F5', freq: 698.46, type: 'white' }, { note: 'F#5', freq: 739.99, type: 'black' },
            { note: 'G5', freq: 783.99, type: 'white' }, { note: 'G#5', freq: 830.61, type: 'black' },
            { note: 'A5', freq: 880.00, type: 'white' }, { note: 'A#5', freq: 932.33, type: 'black' },
            { note: 'B5', freq: 987.77, type: 'white' },

            { note: 'C6', freq: 1046.50, type: 'white' }
        ];
    };

    const notes = generateNotes();

    const playNote = (freq) => {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const vol = volume / 100;
        gainNode.gain.setValueAtTime(vol, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.0);
    };

    return (
        <div className="absolute inset-0 z-[2000] bg-[#333] flex flex-col items-center justify-center animate-fade-in">
            <div className="absolute top-0 w-full p-6 flex justify-between items-center text-white/40 font-light tracking-widest uppercase">
                <span>{t('piano.title')}</span>
            </div>

            <div className="w-full flex justify-center items-center px-4">
                <div className="relative h-60 w-full max-w-[95%] flex justify-center items-start">
                    <div className="flex relative w-full justify-center">
                        {notes.map((n, i) => (
                            n.type === 'white' ? (
                                <div
                                    key={i}
                                    onMouseDown={() => playNote(n.freq)}
                                    className="flex-1 h-60 bg-gradient-to-b from-white to-gray-100 border-x border-gray-400 rounded-b-[4px] active:bg-gray-300 active:scale-y-[0.98] origin-top cursor-pointer relative z-10 shadow-sm"
                                >
                                    <div className="absolute bottom-2 w-full text-center text-[8px] text-gray-400 font-bold opacity-0 hover:opacity-100">{n.note}</div>
                                </div>
                            ) : (
                                <div
                                    key={i}
                                    onMouseDown={() => playNote(n.freq)}
                                    className="w-[2%] h-36 bg-gradient-to-b from-black to-[#222] border-x border-b border-black rounded-b-[4px] active:bg-[#333] active:scale-y-[0.98] origin-top absolute z-20 cursor-pointer shadow-lg"
                                    style={{
                                        left: `${(notes.slice(0, i).filter(x => x.type === 'white').length * (100 / notes.filter(x => x.type === 'white').length)) - (100 / notes.filter(x => x.type === 'white').length / 2)}%`
                                    }}
                                ></div>
                            )
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 w-full h-16 bg-[#222] border-t border-gray-700 flex items-center justify-between px-8">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors font-medium cursor-pointer shadow-lg"
                >
                    <ChevronLeft size={18} /> {t('piano.back')}
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-gray-600">
                        <Volume2 className="text-gray-400" size={18} />
                        <input
                            type="range"
                            min="0" max="100"
                            value={volume}
                            onChange={(e) => setVolume(e.target.value)}
                            className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <span className="text-gray-400 text-xs w-6 text-right">{volume}</span>
                    </div>
                    <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-mono animate-pulse cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        00:00:21
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- APP: RULETA ---
const RandomSelectApp = ({ onClose }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [numOptions, setNumOptions] = useState(6);
    const [spinning, setSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const pickerRef = useRef(null);
    const pickerListRef = useRef(null);
    const wheelRef = useRef(null);
    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    useEffect(() => {
        if (step === 1 && pickerListRef.current) {
            const itemHeight = 60;
            Draggable.create(pickerListRef.current, {
                type: "y",
                bounds: { minY: -((12 - 2) * itemHeight), maxY: 0 },
                inertia: true,
                snap: { y: (value) => Math.round(value / itemHeight) * itemHeight },
                onDragEnd: function () {
                    const index = Math.abs(Math.round(this.y / itemHeight));
                    setNumOptions(index + 2);
                }
            });
        }
    }, [step]);

    const spinWheel = () => {
        if (spinning) return;
        setSpinning(true);
        const totalSegments = numOptions;
        const segmentDegree = 360 / totalSegments;
        const randomSegment = Math.floor(Math.random() * totalSegments);
        const winNumber = randomSegment + 1;
        setWinner(winNumber);
        const extraRotation = 360 * 5;
        const destRotation = extraRotation + ((360 - (randomSegment * segmentDegree)) - (segmentDegree / 2));

        gsap.to(wheelRef.current, {
            rotation: destRotation,
            duration: 5,
            ease: "power4.inOut",
            onComplete: () => {
                setSpinning(false);
                setTimeout(() => setStep(3), 800);
            }
        });
    };

    return (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-[500px] h-[600px] rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden border border-white/20">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 ">{t('roulette.title')}</h3>
                    <button onClick={onClose} className="cursor-pointer "><X className="text-gray-400 hover:text-black transition-colors" /></button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    {step === 1 && (
                        <div className="w-full flex flex-col items-center animate-fade-in">
                            <h4 className="text-gray-500 font-medium mb-6 uppercase tracking-wider text-sm">{t('roulette.options')}</h4>
                            <div className="relative h-[180px] w-full overflow-hidden flex justify-center cursor-grab active:cursor-grabbing mask-linear-fade">
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-[60px] bg-blue-50 rounded-xl border border-blue-200 z-0"></div>
                                <div ref={pickerRef} className="relative z-10 w-full h-full">
                                    <div ref={pickerListRef} className="absolute top-[60px] left-0 w-full flex flex-col items-center">
                                        {Array.from({ length: 11 }, (_, i) => i + 2).map(num => (
                                            <div key={num} className="h-[60px] flex items-center justify-center">
                                                <span className={`text-4xl font-bold transition-all duration-200 ${numOptions === num ? 'text-blue-600 scale-110' : 'text-gray-300 scale-90'}`}>{num}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute top-0 w-full h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"></div>
                                <div className="absolute bottom-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"></div>
                            </div>
                            <div className="w-full px-10 mt-10 flex gap-4">
                                <button onClick={onClose} className="flex-1 py-4 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-lg transition-colors cursor-pointer">{t('roulette.cancel')}</button>
                                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">{t('roulette.next')}</button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="relative w-full h-full flex flex-col items-center justify-center animate-scale-up">
                            <div className="absolute top-6 z-30 drop-shadow-md"><div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-red-600"></div></div>
                            <div className="p-2 rounded-full border-4 border-gray-100 shadow-inner">
                                <div ref={wheelRef} className="w-72 h-72 rounded-full relative shadow-2xl overflow-hidden border-8 border-white" style={{ background: `conic-gradient(${Array.from({ length: numOptions }).map((_, i) => `${colors[i % colors.length]} ${(i * (100 / numOptions))}%, ${colors[i % colors.length]} ${((i + 1) * (100 / numOptions))}%`).join(', ')})` }}>
                                    {Array.from({ length: numOptions }).map((_, i) => { const angle = (360 / numOptions) * i + (360 / numOptions) / 2; return (<div key={i} className="absolute top-0 left-1/2 w-8 h-[50%] -ml-4 flex justify-center pt-4" style={{ transform: `rotate(${angle}deg)`, transformOrigin: 'bottom center' }}><span className="text-white font-bold text-2xl drop-shadow-md transform rotate-180">{i + 1}</span></div>) })}
                                </div>
                            </div>
                            <button onClick={spinWheel} disabled={spinning} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all group border-4 border-gray-50 cursor-pointer">
                                <span className="text-gray-700 font-bold text-sm uppercase group-hover:text-blue-600">{t('roulette.spin')}</span>
                            </button>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="flex flex-col items-center justify-center w-full h-full animate-scale-up">
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('roulette.winner')}</div>
                            <div className="w-40 h-40 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-8 relative">
                                <span className="text-8xl font-black text-white drop-shadow-md">{winner}</span>
                                <div className="absolute -top-4 -right-4 text-4xl animate-bounce delay-100">✨</div>
                                <div className="absolute -bottom-2 -left-4 text-3xl animate-bounce delay-300">🎉</div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => { setStep(1); setSpinning(false); setWinner(null); }} className="px-6 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">{t('roulette.configure')}</button>
                                <button onClick={() => { setStep(2); setSpinning(false); setWinner(null); }} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all cursor-pointer">{t('roulette.spinAgain')}</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MENÚ HERRAMIENTAS ---
const ToolsMenu = ({ isOpen, onClose, onLaunchApp, showToast }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const tools = [
        { name: t('tools.names.note'), icon: <StickyNote className="text-blue-500" />, action: 'demo' },
        { name: t('tools.names.camera'), icon: <Camera className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.screenshot'), icon: <Crop className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.calculator'), icon: <Calculator className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.stopwatch'), icon: <Timer className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.countdown'), icon: <Hourglass className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.voting'), icon: <CheckSquare className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.random'), icon: <Dices className="text-orange-500 glow-cta border-glow" />, action: 'random' },
        { name: t('tools.names.piano'), icon: <Music className="text-purple-500 glow-cta border-glow" />, action: 'piano' },
        { name: t('tools.names.record'), icon: <Video className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.lock'), icon: <Lock className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.transfer'), icon: <ArrowRightLeft className="text-gray-600" />, action: 'demo' },
        { name: t('tools.names.remote'), icon: <Smartphone className="text-gray-600" />, action: 'demo' },
    ];

    return (
        <div className="absolute bottom-16 right-6 bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 w-[320px] z-[1500] animate-scale-up origin-bottom-right" onMouseLeave={onClose}>
            <div className="grid grid-cols-3 gap-4">
                {tools.map((tool, i) => (
                    <div
                        key={i}
                        className="flex flex-col items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-colors group"
                        onClick={() => {
                            if (tool.action === 'random') onLaunchApp('random');
                            else if (tool.action === 'piano') onLaunchApp('piano');
                            else showToast(t('tools.demoMsg', { tool: tool.name }));
                            onClose();
                        }}
                    >
                        <SoftwareTooltip label={tool.action === 'demo' ? `${tool.name}${t('board.menu.demoSuffix')}` : tool.name}>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                {tool.icon}
                            </div>
                        </SoftwareTooltip>
                        <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{tool.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AppIcon = ({ icon, label, bgClass, iconColor = "text-white", onClick, tooltipText, delay = 0, highlight = false }) => {
    return (
        <div
            className="flex flex-col items-center gap-2 group cursor-pointer app-anim opacity-0 transform translate-y-4"
            onClick={onClick}
            style={{ animationDelay: `${delay}ms` }}
        >
            <SoftwareTooltip label={tooltipText || label}>
                <div
                    className={`
                        w-20 h-20 rounded-2xl shadow-lg flex items-center justify-center
                        transition-all duration-300 group-hover:scale-110 group-active:scale-95
                        ${bgClass}
                        ${highlight ? 'glow-cta border-glow-outline' : ''}
                    `}
                >
                    <div className={iconColor}>{icon}</div>
                </div>
            </SoftwareTooltip>
            <span className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-black transition-colors">
                {label}
            </span>
        </div>
    );
};


const FolderIcon = ({ label, onClick, apps }) => {
    return (
        <div className="flex flex-col items-center gap-2 group cursor-pointer app-anim opacity-0 transform translate-y-4" onClick={onClick}>
            <SoftwareTooltip label={label}>
                <div className="w-20 h-20 rounded-2xl bg-[#f1f3f4] border border-white/50 shadow-lg p-3 grid grid-cols-2 gap-2 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 hover:bg-white overflow-hidden">
                    {apps.slice(0, 4).map((app, i) => (
                        <div key={i} className="bg-white rounded-lg flex items-center justify-center shadow-sm p-1"><img src={app.img} alt={app.name} className="w-full h-full object-contain" /></div>
                    ))}
                </div>
            </SoftwareTooltip>
            <span className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-black">{label}</span>
        </div>
    );
};

const ExpandedFolder = ({ isOpen, onClose, apps, onAppClick }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;
    return (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-[#f8f9fa] w-[340px] p-6 rounded-[2rem] shadow-2xl transform transition-all duration-300 animate-scale-up border border-white/60 relative z-[600]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 px-2">
                    <span className="text-gray-500 text-sm font-medium">{t('os.googleAppsTitle')}</span>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-400"><X size={16} /></button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {apps.map((app, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => onAppClick(app.name)}>
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 group-hover:scale-110 transition-transform border border-gray-100"><img src={app.img} alt={app.name} className="w-full h-full object-contain" /></div>
                            <span className="text-xs text-gray-600 font-medium">{app.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL: WONDEROS ---
const WonderOS = () => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [toast, setToast] = useState({ show: false, msg: '' });
    const [isFolderOpen, setIsFolderOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [activeApp, setActiveApp] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    // Formato de fecha localizado usando i18n.language
    const timeString = currentTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateString = currentTime.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (!activeApp) {
                gsap.fromTo('.wallpaper-bg', { opacity: 0 }, { opacity: 1, duration: 1.5 });
                gsap.to('.app-anim', { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.5, ease: "back.out(1.5)" });
                gsap.fromTo('.clock-container', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power3.out" });
            }
        }, containerRef);
        return () => ctx.revert();
    }, [activeApp]);

    const showToast = (msg) => setToast({ show: true, msg });
    
    const handleSearch = (e) => { 
        if (e.key === 'Enter') { 
            if (searchText.trim() === "") return; 
            showToast(t('os.searchDemo')); 
            setSearchText(""); 
        } 
    };

    const handleAppClick = (appName) => {
        if (appName === 'Whiteboard' || appName === t('apps.whiteboard')) {
            setActiveApp('whiteboard');
        } else if (appName === 'WonderCast' || appName === t('apps.wonderCast')) {
            showToast(t('os.castStart'));
        } else {
            showToast(t('os.appDemo', { appName }));
        }
    };

    const ctaHighlightActive = !activeApp && !showIntro;

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden font-sans select-none bg-[#fdf8e4]">

            <ToastNotification message={toast.msg} isVisible={toast.show} onClose={() => setToast({ ...toast, show: false })} />
            <ExpandedFolder isOpen={isFolderOpen} onClose={() => setIsFolderOpen(false)} apps={GOOGLE_APPS} onAppClick={(name) => { setIsFolderOpen(false); handleAppClick(name); }} />
            
            {showIntro && (
                <div className="absolute inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center px-6">
                    <div className="max-w-xl bg-white/95 rounded-3xl shadow-2xl p-8 space-y-4 animate-scale-up">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500">
                            {t('intro.badge')}
                        </p>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                            {t('intro.title')}
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            <Trans i18nKey="intro.desc" components={{ 1: <span className="font-semibold"/>, 3: <span className="font-semibold"/>, 5: <span className="font-semibold"/> }} />
                        </p>

                        <button
                            onClick={() => setShowIntro(false)}
                            className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 text-white text-sm font-medium shadow-lg hover:bg-amber-600 hover:shadow-xl transition-all cursor-pointer"
                        >
                            {t('intro.button')}
                        </button>
                    </div>

                    <div className="absolute bottom-10 flex flex-col items-center gap-1 text-white/80 text-xs animate-bounce">
                        <span className="tracking-wide">{t('intro.tip')}</span>
                        <ChevronDown className="w-5 h-5" />
                    </div>
                </div>
            )}
            
            {activeApp === 'whiteboard' && <WonderBoard onClose={() => setActiveApp(null)} />}
            {activeApp === 'random' && <RandomSelectApp onClose={() => setActiveApp(null)} />}
            {activeApp === 'piano' && <PianoApp onClose={() => setActiveApp(null)} />}

            {activeApp !== 'whiteboard' && (
                <>
                    <div className="absolute inset-0 z-0 wallpaper-bg">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fde68a] opacity-60"></div>
                        <div className="absolute top-[45%] left-[-5%] w-64 h-32 bg-[#fbbf24] rounded-full blur-3xl opacity-40 transform -rotate-12"></div>
                        <div className="absolute bottom-24 right-16 flex flex-col items-center transform rotate-[-5deg] opacity-80">
                            <div className="text-6xl absolute -top-8 -right-4 z-10 filter drop-shadow-md">🎓</div>
                            <div className="w-32 h-32 bg-[#fcd34d] rounded-full shadow-xl flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-50"></div>
                                <div className="flex gap-6 z-10 mt-2"><div className="w-4 h-4 border-t-4 border-amber-800 rounded-full"></div><div className="w-4 h-4 border-t-4 border-amber-800 rounded-full"></div></div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 w-full h-full flex items-center justify-center p-16 pb-24">
                        <div className="w-1/2 flex flex-col items-center justify-center gap-12 clock-container">
                            <div className="text-center">
                                <h1 className="text-[8rem] leading-none font-thin tracking-tighter text-gray-800/90 font-[Inter] tabular-nums">{timeString}</h1>
                                <p className="text-2xl text-gray-500 font-light mt-2 capitalize tracking-wide">{dateString}</p>
                            </div>
                            <SoftwareTooltip label={t('os.searchPlaceholder')}>
                                <div className="bg-white/90 backdrop-blur-xl w-[440px] h-14 rounded-full shadow-lg border border-white/60 flex items-center px-5 gap-3 transition-all ring-2 ring-transparent focus-within:ring-blue-400/30 group">
                                    <div className="shrink-0"><Search className="text-gray-400" size={20} /></div>
                                    <input type="text" placeholder={t('os.searchPlaceholder')} className="flex-1 bg-transparent border-none outline-none text-gray-600 placeholder-gray-400 text-lg h-full font-light" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={handleSearch} />
                                    <div className="shrink-0 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors" onClick={() => showToast(t('os.micDemo'))}><img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Google_mic.svg" alt="Mic" className="w-5 h-5" /></div>
                                </div>
                            </SoftwareTooltip>
                        </div>

                        <div className="w-1/2 flex items-center justify-center pl-10">
                            <div className="grid grid-cols-3 gap-x-10 gap-y-10">

                                <AppIcon label={t('apps.wonderCast')} icon={<Cast size={36} className="text-white" />} bgClass="bg-gradient-to-br from-[#4facfe] to-[#00f2fe]" tooltipText={t('apps.wonderCast')} onClick={() => handleAppClick('WonderCast')} />
                                <AppIcon
                                    label={t('apps.whiteboard')}
                                    icon={<PenTool size={36} className="text-white" />}
                                    bgClass="bg-gradient-to-br from-[#d299c2] to-[#fef9d7] !text-purple-600"
                                    iconColor="text-purple-600"
                                    tooltipText={t('apps.whiteboard')}
                                    onClick={() => handleAppClick('Whiteboard')}
                                    highlight={ctaHighlightActive}
                                />
                                <AppIcon label={t('apps.files')} icon={<FolderOpen size={36} className="text-white" />} bgClass="bg-gradient-to-br from-[#f6d365] to-[#fda085]" tooltipText={t('apps.files')} onClick={() => handleAppClick('Explorador')} />
                                <AppIcon label={t('apps.settings')} icon={<Settings size={36} className="text-white" />} bgClass="bg-gradient-to-br from-[#89f7fe] to-[#66a6ff] grayscale" tooltipText={t('apps.settings')} onClick={() => handleAppClick('Ajustes')} />
                                <div className="flex flex-col items-center gap-2 group cursor-pointer app-anim opacity-0 transform translate-y-4" onClick={() => handleAppClick('Play Store')}>
                                    <SoftwareTooltip label={t('apps.store')}>
                                        <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center p-4 transition-all duration-300 group-hover:scale-110 group-active:scale-95"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" className="w-full h-full object-contain" alt="Play Store" /></div>
                                    </SoftwareTooltip>
                                    <span className="text-gray-700 text-sm font-medium tracking-wide group-hover:text-black">{t('apps.store')}</span>
                                </div>
                                <FolderIcon label={t('apps.googleFolder')} apps={GOOGLE_APPS} onClick={() => setIsFolderOpen(true)} />
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            <ToolsMenu isOpen={isToolsMenuOpen} onClose={() => setIsToolsMenuOpen(false)} onLaunchApp={setActiveApp} showToast={showToast} />
            <div className="absolute bottom-0 left-0 w-full h-14 bg-gray-900/90 backdrop-blur-md flex items-center justify-between px-6 z-[2000] border-t border-white/10 text-white/90 shadow-2xl">
                <div className="flex items-center gap-3">
                    <SoftwareTooltip label={t('bar.input')}>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer" onClick={() => showToast(t('os.sourceHdmi'))}>
                            <Monitor size={18} />
                            <span className="text-xs font-medium tracking-wide">HDMI 1</span>
                        </div>
                    </SoftwareTooltip>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-16">
                    <SoftwareTooltip label={t('bar.allApps')}><button className="hover:bg-white/20 p-2 rounded-lg transition-colors"><LayoutGrid size={22} /></button></SoftwareTooltip>
                    <SoftwareTooltip label={t('bar.home')}><button onClick={() => setActiveApp(null)} className="bg-white/20 p-2 rounded-lg shadow-inner text-white cursor-pointer"><Home size={22} /></button></SoftwareTooltip>
                    <SoftwareTooltip label={t('bar.multitask')}><button className="hover:bg-white/20 p-2 rounded-lg transition-colors"><Layers size={22} /></button></SoftwareTooltip>
                </div>
                <div className="flex items-center gap-6">
                    <SoftwareTooltip label={t('bar.wifi')}><Wifi size={20} className="cursor-pointer hover:text-blue-400" /></SoftwareTooltip>
                    <SoftwareTooltip label={t('bar.quickSettings')}><SlidersHorizontal size={20} className="cursor-pointer hover:text-blue-400" /></SoftwareTooltip>
                    <div className="relative">
                        <SoftwareTooltip label={t('bar.tools')}>
    <Briefcase
        size={20}
        className={`
            cursor-pointer transition-colors
            ${isToolsMenuOpen ? 'text-blue-400' : 'hover:text-blue-400'}
            ${ctaHighlightActive ? 'glow-cta border-glow' : ''}
        `}
        onClick={() => setIsToolsMenuOpen(!isToolsMenuOpen)}
    />
                        </SoftwareTooltip>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes scale-up { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-scale-up { animation: scale-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .mask-linear-fade { mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent); }
                @keyframes glow-cta { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0); transform: translateY(0) scale(1); } 50% { box-shadow: 0 0 30px 0 rgba(59,130,246,0.45); transform: translateY(-2px) scale(1.04); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); transform: translateY(0) scale(1); } }
                .glow-cta { animation: glow-cta 1.8s ease-in-out infinite; }
                @keyframes border-glow { 0% { box-shadow: 0 0 0 0px rgba(255, 215, 0, 0.0), 0 0 0 0px rgba(255, 215, 0, 0.0); } 50% { box-shadow: 0 0 10px 4px rgba(255, 215, 0, 0.7), 0 0 18px 8px rgba(255, 215, 0, 0.5); } 100% { box-shadow: 0 0 0 0px rgba(255, 215, 0, 0.0), 0 0 0 0px rgba(255, 215, 0, 0.0); } }
                .border-glow { animation: border-glow 2s ease-in-out infinite; border-radius: 46px; }
                @keyframes border-glow-outline { 0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.0); } 50% { box-shadow: 0 0 12px 3px rgba(255, 215, 0, 0.8); } 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.0); } }
                .border-glow-outline { position: relative; }
                .border-glow-outline::after { content: ""; position: absolute; inset: -6px; border-radius: inherit; z-index: -1; animation: border-glow-outline 2s ease-in-out infinite; pointer-events: none; }
            `}</style>

        </div>
    );
};

export default WonderOS;