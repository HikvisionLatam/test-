// WonderBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MoreHorizontal, ChevronLeft, Eraser, MousePointer2, Image as ImageIcon,
  Video, FileText, Globe, Calculator, Trash2, PieChart, LayoutGrid,
  Clock, Check, Lock, RotateCcw, RotateCw, GripHorizontal, LogOut,
  Menu, Save, Share2, Eye, PlusSquare, ChevronRight
} from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';

// Importamos los componentes locales
import SoftwareTooltip from './SoftwareTooltip';
import FunctionModal from './FunctionModal';
import BoardObject from './BoardObject';

gsap.registerPlugin(Draggable);

const WonderBoard = ({ onClose }) => {
  // --- ESTADOS DE OBJETOS Y MODALES ---
  const [objects, setObjects] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null); // Estado para controlar qué objeto se edita

  // --- ESTADOS DE DIBUJO ---
  const [activeTool, setActiveTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);

  // --- REFS ---
  const canvasRef = useRef(null);
  const menuRef = useRef(null);

  // --- HISTORIAL (Undo/Redo) ---
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // --- DRAGGABLE DEL MENÚ FLOTANTE ---
  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;

    const el = menuRef.current;
    gsap.set(el, { x: 0, y: 0 });

    const instance = Draggable.create(el, {
      type: 'x,y',
      bounds: '.board-canvas',
      inertia: true,
      edgeResistance: 0.65,
      trigger: '.menu-drag-handle',
    })[0];

    return () => {
      if (instance) instance.kill();
    };
  }, [isMenuOpen]);

  // --- CONFIGURACIÓN INICIAL DEL CANVAS ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    saveHistory(); // Guardar estado inicial en blanco
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.strokeStyle = color;
    }
  }, [color]);

  // --- GESTIÓN DEL HISTORIAL ---
  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      const img = new Image();
      img.src = history[newStep];
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      const img = new Image();
      img.src = history[newStep];
      img.onload = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistory();
  };

  // --- LÓGICA DE DIBUJO ---
  const startDraw = (e) => {
    if (activeTool !== 'pen' && activeTool !== 'eraser') return;
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = activeTool === 'eraser' ? 30 : 3;
    ctx.strokeStyle = activeTool === 'eraser' ? '#fdfdfd' : color; // El borrador pinta del color del fondo
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveHistory();
    }
  };

  // --- GESTIÓN DE OBJETOS (GRÁFICAS) ---

  // Abrir modal para crear NUEVA gráfica
  const handleOpenNewGraphModal = () => {
    setEditingObject(null); // Aseguramos que no estamos editando
    setIsModalOpen(true);
    setIsMenuOpen(false); // Cerramos el menú flotante
  };

  // Abrir modal para EDITAR gráfica existente
  const handleEditObject = (id, data) => {
    setEditingObject({ id, data });
    setIsModalOpen(true);
  };

  // Callback cuando el modal presiona "Insert Graph"
  const handleInsertOrUpdate = (functionData) => {
    if (editingObject) {
      // Estamos actualizando una existente
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === editingObject.id ? { ...obj, data: functionData } : obj
        )
      );
    } else {
      // Estamos creando una nueva
      setObjects((prev) => [
        ...prev,
        { id: Date.now(), type: 'function-graph', data: functionData },
      ]);
    }
    setIsModalOpen(false);
    setEditingObject(null);
  };

  const handleDeleteObject = (id) => {
    setObjects((prev) => prev.filter((o) => o.id !== id));
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#fdfdfd] z-[1500] flex flex-col font-sans board-canvas overflow-hidden">
      {/* --- FONDO RAYADO --- */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(#fdfdfd 0px, #fdfdfd 24px, #94a3b8 25px)',
        }}
      />

      {/* --- CANVAS DE DIBUJO --- */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-10 touch-none ${
          activeTool === 'select' ? 'pointer-events-none' : 'cursor-crosshair'
        }`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
      />

      {/* --- MODAL DE FUNCIONES --- */}
      <FunctionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsertOrUpdate}
        initialData={editingObject ? editingObject.data : null}
      />

      {/* --- MENÚ FLOTANTE "MORE TOOLS" --- */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute bottom-32 left-1/2 bg-[#1e1e1e] w-[520px] p-4 rounded-2xl shadow-2xl z-[2000] grid grid-cols-4 gap-4 border border-gray-600 animate-fade-in-soft"
          style={{ marginLeft: '-260px' }}
        >
          {/* Header con título y grip visual */}
          <div className="col-span-4 flex justify-between items-center text-gray-400 text-sm mb-2 border-b border-gray-600 pb-2">
            <span>More Tools</span>
            <div className="menu-drag-handle p-1 rounded-md hover:bg-white/10 cursor-grab active:cursor-grabbing select-none">
              <GripHorizontal size={16} />
            </div>
          </div>

          {[
            { label: 'Insert Picture', icon: <ImageIcon />, demo: true },
            { label: 'Shape', icon: <PieChart />, demo: true },
            { label: 'Flow Chart', icon: <LayoutGrid />, demo: true },
            { label: 'Stopwatch', icon: <Clock />, demo: true },
            { label: 'Open Video', icon: <Video />, demo: true },
            { label: 'Table', icon: <LayoutGrid />, demo: true },
            { label: 'Note', icon: <FileText />, demo: true },
            {
              label: 'Function',
              icon: <div className="font-serif italic font-bold text-xl glow-cta border-glow">ƒ</div>,
              action: handleOpenNewGraphModal, // Acción actualizada
            },
            { label: 'Browser', icon: <Globe />, demo: true },
            { label: 'Calculator', icon: <Calculator />, demo: true },
            { label: 'Voting', icon: <Check />, demo: true },
            { label: 'Lock', icon: <Lock />, demo: true },
          ].map((item, i) => (
            <div
              key={i}
              onClick={item.action}
              className="flex flex-col gap-2 items-center text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors relative group"
            >
              <SoftwareTooltip
                label={item.demo ? `${item.label} (Demo)` : item.label}
              >
                <div className="text-xl mb-1">{item.icon}</div>
              </SoftwareTooltip>
              <span className="text-[10px] text-center">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* --- OBJETOS INSERTADOS (GRÁFICAS) --- */}
      {objects.map((obj) => (
        <BoardObject
          key={obj.id}
          id={obj.id}
          data={obj.data} // Pasamos la data completa (multifunción)
          onDelete={handleDeleteObject}
          onEdit={handleEditObject} // Conectamos la función de editar
        />
      ))}

      {/* --- ISLAS DE HERRAMIENTAS INFERIORES --- */}
      <div className="absolute bottom-14 left-0 w-full px-6 flex items-end justify-between pointer-events-none z-[1600]">
        
        {/* Isla Izquierda: Sistema */}
        <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-1 px-2 py-2 shadow-2xl pointer-events-auto border border-gray-700 mb-2">
          <SoftwareTooltip label="Salir">
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={20} />
            </button>
          </SoftwareTooltip>
          <div className="w-[1px] h-6 bg-gray-600 mx-1" />
          <SoftwareTooltip label="Menú">
            <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer">
              <Menu size={20} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label="Guardar">
            <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer">
              <Save size={20} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label="Compartir">
            <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer">
              <Share2 size={20} />
            </button>
          </SoftwareTooltip>
        </div>

        {/* Isla Central: Herramientas de Dibujo */}
        <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-3 px-4 py-2 shadow-2xl pointer-events-auto border border-gray-700 mb-2">
          <SoftwareTooltip label="Lápiz">
            <button
              onClick={() => {
                setActiveTool('pen');
                setColor('#000000');
              }}
              className={`p-2 rounded-lg relative cursor-pointer ${
                activeTool === 'pen'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
              {activeTool === 'pen' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </button>
          </SoftwareTooltip>

          <SoftwareTooltip label="Selector">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-lg cursor-pointer ${
                activeTool === 'select'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MousePointer2 size={22} />
            </button>
          </SoftwareTooltip>

          <div className="w-[1px] h-8 bg-gray-600 mx-1" />

          {/* Selector de Colores */}
          <SoftwareTooltip label="Blanco">
            <button
              onClick={() => {
                setActiveTool('pen');
                setColor('#ffffff');
              }}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                color === '#ffffff'
                  ? 'border-blue-500 scale-110'
                  : 'border-transparent hover:scale-110'
              } bg-white transition-transform`}
            />
          </SoftwareTooltip>
          <SoftwareTooltip label="Rojo">
            <button
              onClick={() => {
                setActiveTool('pen');
                setColor('#ef4444');
              }}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                color === '#ef4444'
                  ? 'border-white scale-110'
                  : 'border-transparent hover:scale-110'
              } bg-[#ef4444] transition-transform`}
            />
          </SoftwareTooltip>
          <SoftwareTooltip label="Verde">
            <button
              onClick={() => {
                setActiveTool('pen');
                setColor('#22c55e');
              }}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                color === '#22c55e'
                  ? 'border-white scale-110'
                  : 'border-transparent hover:scale-110'
              } bg-[#22c55e] transition-transform`}
            />
          </SoftwareTooltip>
          <SoftwareTooltip label="Azul">
            <button
              onClick={() => {
                setActiveTool('pen');
                setColor('#3b82f6');
              }}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                color === '#3b82f6'
                  ? 'border-white scale-110'
                  : 'border-transparent hover:scale-110'
              } bg-[#3b82f6] transition-transform`}
            />
          </SoftwareTooltip>

          <div className="w-[1px] h-8 bg-gray-600 mx-1" />

          <SoftwareTooltip label="Borrador">
            <button
              onClick={() => setActiveTool('eraser')}
              className={`p-2 rounded-lg cursor-pointer ${
                activeTool === 'eraser'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eraser size={22} />
            </button>
          </SoftwareTooltip>

          <SoftwareTooltip label="Más Herramientas">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg cursor-pointer ${
                isMenuOpen ? 'text-blue-400' : 'text-blue-500 hover:text-blue-300'
              }`}
            >
              <MoreHorizontal size={26} />
            </button>
          </SoftwareTooltip>

          <div className="w-[1px] h-8 bg-gray-600 mx-1" />

          <SoftwareTooltip label="Deshacer">
            <button
              onClick={handleUndo}
              className="p-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <RotateCcw size={22} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label="Rehacer">
            <button
              onClick={handleRedo}
              className="p-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <RotateCw size={22} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label="Limpiar Pizarra">
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-400 hover:text-red-400 cursor-pointer"
            >
              <Trash2 size={22} />
            </button>
          </SoftwareTooltip>
        </div>

        {/* Isla Derecha: Paginación */}
        <div className="flex items-end gap-3 pointer-events-auto mb-2">
          <div className="bg-[#1e1e1e] rounded-xl flex items-center p-2 shadow-2xl border border-gray-700 h-14">
            <SoftwareTooltip label="Agregar Página">
              <button className="p-2 text-gray-400 hover:text-white cursor-pointer">
                <PlusSquare size={20} />
              </button>
            </SoftwareTooltip>
            <div className="w-[1px] h-6 bg-gray-600 mx-1" />
            <SoftwareTooltip label="Anterior">
              <button className="p-2 text-gray-400 hover:text-white cursor-pointer">
                <ChevronLeft size={20} />
              </button>
            </SoftwareTooltip>
            <span className="text-sm font-mono text-gray-300 px-2">1/1</span>
            <SoftwareTooltip label="Siguiente">
              <button className="p-2 text-gray-400 hover:text-white cursor-pointer">
                <ChevronRight size={20} />
              </button>
            </SoftwareTooltip>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        @keyframes fade-in-soft {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fade-in-soft {
          animation: fade-in-soft 0.18s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WonderBoard;