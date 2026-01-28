// WonderBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  MoreHorizontal, ChevronLeft, Eraser, MousePointer2, Image as ImageIcon,
  Video, FileText, Globe, Calculator, Trash2, PieChart, LayoutGrid,
  Clock, Check, Lock, RotateCcw, RotateCw, GripHorizontal, LogOut,
  Menu, Save, Share2, Eye, PlusSquare, ChevronRight, Plus
} from 'lucide-react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useTranslation } from 'react-i18next';
// --- ANALYTICS IMPORT ---
import { trackEvent } from '../../../../utils/analytics'; 

// Importamos los componentes locales
import SoftwareTooltip from './SoftwareTooltip';
import FunctionModal from './FunctionModal';
import BoardObject from './BoardObject';

gsap.registerPlugin(Draggable);

const WonderBoard = ({ onClose }) => {
  const { t } = useTranslation();
  // --- ESTADOS DE OBJETOS Y MODALES ---
  const [objects, setObjects] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState(null); 

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
      // Analytics: Track drag end of menu
      onDragEnd: () => {
        trackEvent('click.action', {
            click_chapter1: 'WonderBoard',
            click_chapter2: 'Menu',
            click_name: 'drag_menu_reposition'
        });
      }
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
    saveHistory(); 
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
    // Analytics: Undo
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Toolbar',
        click_name: 'undo_action',
        history_step: historyStep
    });

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
    // Analytics: Redo
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Toolbar',
        click_name: 'redo_action',
        history_step: historyStep
    });

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
    // Analytics: Clear All
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Toolbar',
        click_name: 'clear_canvas_all'
    });

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
    ctx.strokeStyle = activeTool === 'eraser' ? '#fdfdfd' : color; 
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
  const handleOpenNewGraphModal = () => {
    // Analytics: Open Graph Modal
    trackEvent('click.navigation', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Menu',
        click_name: 'open_tool_modal',
        tool_type: 'function_graph'
    });

    setEditingObject(null); 
    setIsModalOpen(true);
    setIsMenuOpen(false); 
  };

  const handleEditObject = (id, data) => {
    // Analytics: Edit Object
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Canvas',
        click_name: 'edit_object',
        object_id: id,
        object_type: 'function_graph'
    });

    setEditingObject({ id, data });
    setIsModalOpen(true);
  };

  const handleInsertOrUpdate = (functionData) => {
    // Analytics: Confirm Insert/Update
    const actionType = editingObject ? 'update_object' : 'insert_object';
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Modal',
        click_name: actionType,
        object_type: 'function_graph'
    });

    if (editingObject) {
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === editingObject.id ? { ...obj, data: functionData } : obj
        )
      );
    } else {
      setObjects((prev) => [
        ...prev,
        { id: Date.now(), type: 'function-graph', data: functionData },
      ]);
    }
    setIsModalOpen(false);
    setEditingObject(null);
  };

  const handleDeleteObject = (id) => {
    // Analytics: Delete Object
    trackEvent('click.action', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'Canvas',
        click_name: 'delete_object',
        object_id: id
    });

    setObjects((prev) => prev.filter((o) => o.id !== id));
  };

  const handleCloseBoard = () => {
    // Analytics: Exit Board
    trackEvent('click.navigation', {
        click_chapter1: 'WonderBoard',
        click_chapter2: 'System',
        click_name: 'exit_app'
    });
    onClose();
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
        onClose={() => {
            // Analytics: Close Modal (Cancel)
            trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Modal', click_name: 'cancel_modal' });
            setIsModalOpen(false);
        }}
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
            <span>{t('board.menu.title')}</span>
            <div className="menu-drag-handle p-1 rounded-md hover:bg-white/10 cursor-grab active:cursor-grabbing select-none">
              <GripHorizontal size={16} />
            </div>
          </div>

          {[
            { label: t('board.menu.insertPicture'), icon: <ImageIcon />, demo: true, id: 'insert_picture' },
            { label: t('board.menu.shape'), icon: <PieChart />, demo: true, id: 'insert_shape' },
            { label: t('board.menu.flowChart'), icon: <LayoutGrid />, demo: true, id: 'insert_flowchart' },
            { label: t('board.menu.stopwatch'), icon: <Clock />, demo: true, id: 'tool_stopwatch' },
            { label: t('board.menu.openVideo'), icon: <Video />, demo: true, id: 'insert_video' },
            { label: t('board.menu.table'), icon: <LayoutGrid />, demo: true, id: 'insert_table' },
            { label: t('board.menu.note'), icon: <FileText />, demo: true, id: 'insert_note' },
            {
              label: t('board.menu.function'),
              icon: <div className="font-serif italic font-bold text-xl glow-cta border-glow">ƒ</div>,
              action: handleOpenNewGraphModal,
              id: 'tool_function_graph'
            },
            { label: t('board.menu.browser'), icon: <Globe />, demo: true, id: 'tool_browser' },
            { label: t('board.menu.calculator'), icon: <Calculator />, demo: true, id: 'tool_calculator' },
            { label: t('board.menu.voting'), icon: <Check />, demo: true, id: 'tool_voting' },
            { label: t('board.menu.lock'), icon: <Lock />, demo: true, id: 'action_lock' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => {
                // Analytics: Track Tool Selection
                trackEvent('click.action', {
                    click_chapter1: 'WonderBoard',
                    click_chapter2: 'Menu',
                    click_name: 'select_menu_item',
                    item_label: item.label,
                    item_id: item.id || 'unknown'
                });
                if (item.action) item.action();
              }}
              className="flex flex-col gap-2 items-center text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-colors relative group"
            >
              <SoftwareTooltip
                label={item.demo ? `${item.label}${t('board.menu.demoSuffix')}` : item.label}
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
          data={obj.data} 
          onDelete={handleDeleteObject}
          onEdit={handleEditObject} 
        />
      ))}

      {/* --- ISLAS DE HERRAMIENTAS INFERIORES --- */}
      <div className="absolute bottom-14 left-0 w-full px-6 flex items-end justify-between pointer-events-none z-[1600]">
        
        {/* Isla Izquierda: Sistema */}
        <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-1 px-2 py-2 shadow-2xl pointer-events-auto border border-gray-700 mb-2">
          <SoftwareTooltip label={t('board.toolbar.exit')}>
            <button
              onClick={handleCloseBoard}
              className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={20} />
            </button>
          </SoftwareTooltip>
          <div className="w-[1px] h-6 bg-gray-600 mx-1" />
          <SoftwareTooltip label={t('board.toolbar.menu')}>
            <button 
                onClick={() => trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'System', click_name: 'open_main_menu' })}
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label={t('board.toolbar.save')}>
            <button 
                onClick={() => trackEvent('click.download', { click_chapter1: 'WonderBoard', click_chapter2: 'System', click_name: 'save_board' })}
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <Save size={20} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label={t('board.toolbar.share')}>
            <button 
                onClick={() => trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'System', click_name: 'share_board' })}
                className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
            >
              <Share2 size={20} />
            </button>
          </SoftwareTooltip>
        </div>

        {/* Isla Central: Herramientas de Dibujo */}
        <div className="bg-[#1e1e1e] rounded-xl flex items-center gap-3 px-4 py-2 shadow-2xl pointer-events-auto border border-gray-700 mb-2">
          <SoftwareTooltip label={t('board.toolbar.pen')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_tool', tool: 'pen' });
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

          <SoftwareTooltip label={t('board.toolbar.select')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_tool', tool: 'select_cursor' });
                setActiveTool('select');
              }}
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
          <SoftwareTooltip label={t('board.toolbar.white')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_color', color_hex: '#ffffff' });
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
          <SoftwareTooltip label={t('board.toolbar.red')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_color', color_hex: '#ef4444' });
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
          <SoftwareTooltip label={t('board.toolbar.green')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_color', color_hex: '#22c55e' });
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
          <SoftwareTooltip label={t('board.toolbar.blue')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_color', color_hex: '#3b82f6' });
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

          <SoftwareTooltip label={t('board.toolbar.eraser')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'set_tool', tool: 'eraser' });
                setActiveTool('eraser');
              }}
              className={`p-2 rounded-lg cursor-pointer ${
                activeTool === 'eraser'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eraser size={22} />
            </button>
          </SoftwareTooltip>

          <SoftwareTooltip label={t('board.toolbar.more')}>
            <button
              onClick={() => {
                trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Toolbar', click_name: 'toggle_menu_more', state: !isMenuOpen ? 'open' : 'close' });
                setIsMenuOpen(!isMenuOpen);
              }}
              className={`p-2 rounded-lg cursor-pointer ${
                isMenuOpen ? 'text-blue-400' : 'text-blue-500 hover:text-blue-300'
              }`}
            >
              <MoreHorizontal size={26} />
            </button>
          </SoftwareTooltip>

          <div className="w-[1px] h-8 bg-gray-600 mx-1" />

          <SoftwareTooltip label={t('board.toolbar.undo')}>
            <button
              onClick={handleUndo}
              className="p-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <RotateCcw size={22} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label={t('board.toolbar.redo')}>
            <button
              onClick={handleRedo}
              className="p-2 text-gray-400 hover:text-white cursor-pointer"
            >
              <RotateCw size={22} />
            </button>
          </SoftwareTooltip>
          <SoftwareTooltip label={t('board.toolbar.clear')}>
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
            <SoftwareTooltip label={t('board.toolbar.addPage')}>
              <button 
                onClick={() => trackEvent('click.action', { click_chapter1: 'WonderBoard', click_chapter2: 'Pagination', click_name: 'add_page' })}
                className="p-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <PlusSquare size={20} />
              </button>
            </SoftwareTooltip>
            <div className="w-[1px] h-6 bg-gray-600 mx-1" />
            <SoftwareTooltip label={t('board.toolbar.prev')}>
              <button 
                onClick={() => trackEvent('click.navigation', { click_chapter1: 'WonderBoard', click_chapter2: 'Pagination', click_name: 'prev_page' })}
                className="p-2 text-gray-400 hover:text-white cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
            </SoftwareTooltip>
            <span className="text-sm font-mono text-gray-300 px-2">1/1</span>
            <SoftwareTooltip label={t('board.toolbar.next')}>
              <button 
                onClick={() => trackEvent('click.navigation', { click_chapter1: 'WonderBoard', click_chapter2: 'Pagination', click_name: 'next_page' })}
                className="p-2 text-gray-400 hover:text-white cursor-pointer"
              >
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