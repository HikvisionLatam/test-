// src/components/DayView.jsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { format, getMonth, getDate, differenceInDays, differenceInMinutes, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import EventModal from './EventModal';
import SimpleQRModal from './SimpleQRModal';
import { eventColorMap } from './calendarConstants';
import InteractionCard from '../../../components/InteractionCard/InteractionCard';

const ROW_HEIGHT = 100;

const DayView = ({ date, events, onClose, currentCountry }) => {
    const [now, setNow] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [dayFilter, setDayFilter] = useState(null);
    
    // Vista por defecto: AGENDA
    const [viewMode, setViewMode] = useState('agenda'); 
    const [qrModalData, setQrModalData] = useState(null);
    const [tooltipMsg, setTooltipMsg] = useState('');

    const firstEventRef = useRef(null);
    const scrollContainerRef = useRef(null);    

    // ID y promise store para respuestas de postMessage
	const pendingCopyPromises = useRef({});

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setDayFilter(null);
    }, [date]);

    useEffect(() => {
		const onMessage = (ev) => {
			const data = ev.data || {};
			if (data.type === 'IFRAME_COPY_RESPONSE' && data.id) {
				const resolver = pendingCopyPromises.current[data.id];
				if (resolver) {
					resolver(data.success);
					delete pendingCopyPromises.current[data.id];
				}
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, []);

    // --- Helpers ---
    const monthMapping = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    const capitalize = s => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
    const hexToRgba = (hex, alpha) => {
        if (!hex) return 'rgba(0,0,0,0.1)';
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex;
    }

    const formatTimeAMPM = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hourInt = parseInt(hours, 10);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        const displayHour = hourInt % 12 || 12; 
        return `${displayHour}:${minutes} ${ampm}`;
    };

    // --- Filtrado ---
    const todayEvents = useMemo(() => events
        .filter(e => {
            if (!e.mes || !e.dia) return false;
            const capitalizedMonth = e.mes.charAt(0).toUpperCase() + e.mes.slice(1).toLowerCase();
            const eventMonth = monthMapping[capitalizedMonth];
            const eventDay = parseInt(e.dia, 10);
            return eventMonth !== undefined && getMonth(date) === eventMonth && getDate(date) === eventDay;
        })
        .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || '')),
        [date, events]);

    const filteredTodayEvents = useMemo(() => {
        if (!dayFilter) return todayEvents;
        return todayEvents.filter(event => event.tipo_evento === dayFilter);
    }, [todayEvents, dayFilter]);

    const dayEventTypes = useMemo(() => {
        return Array.from(new Set(todayEvents.map(e => e.tipo_evento).filter(Boolean)));
    }, [todayEvents]);

    // intento robusto de copiar texto al portapapeles
	const tryCopyText = async (text) => {
		// 1. navigator.clipboard
		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch (err) {
				// continua a fallback
			}
		}

		// 2. execCommand fallback (antiguo)
		try {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			if (ok) return true;
		} catch (err) {
			// continua a postMessage
		}

		// 3. Si estamos en un iframe, pedir al padre que copie
		if (window.parent && window.parent !== window) {
			const id = `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
			const p = new Promise((resolve) => {
				pendingCopyPromises.current[id] = resolve;
				// Nota: targetOrigin se puede reemplazar por el origen conocido en producción
				window.parent.postMessage({ type: 'IFRAME_COPY_TO_CLIPBOARD', id, text }, '*');
				// fallback: si no responde en 3s, resolver false
				setTimeout(() => {
					if (pendingCopyPromises.current[id]) {
						pendingCopyPromises.current[id](false);
						delete pendingCopyPromises.current[id];
					}
				}, 3000);
			});
			return await p;
		}

		return false;
	};

    // --- Handlers: Compartir Dinámico (mejorado) ---
    const handleShare = async (e, event) => {
        e.stopPropagation();

        const currentYear = new Date().getFullYear();
        const eventDateObj = new Date(currentYear, monthMapping[event.mes.charAt(0).toUpperCase() + event.mes.slice(1).toLowerCase()], parseInt(event.dia));
        
        const [hours, mins] = event.hora_inicio.split(':');
        eventDateObj.setHours(parseInt(hours), parseInt(mins));

        const now = new Date();
        const diffDays = differenceInDays(startOfDay(eventDateObj), startOfDay(now));
        const diffMinutes = differenceInMinutes(eventDateObj, now);
        
        let headerMsg = "";
        
        if (diffMinutes < 0) {
            headerMsg = "🚨 ¡EN VIVO AHORA! 🚨";
        } else if (diffDays === 0) {
            headerMsg = "📅 ¡Es hoy, es hoy! 🚀";
        } else if (diffDays === 1) {
             headerMsg = "⏰ ¡Prepárate para mañana! ⏰";
        } else {
            headerMsg = `🗓 ¡Faltan ${diffDays} días! 🗓`;
        }

        const countryText = currentCountry ? `(${currentCountry})` : '';

        const textToShare = `
${headerMsg}
🚀 ¡${event.titulo}!
🔍 ${event.description ? event.description : '¡No te pierdas este gran evento!'}
🗓 ${event.dia} de ${event.mes}
🕙 ${formatTimeAMPM(event.hora_inicio)} - ${formatTimeAMPM(event.hora_fin)} ${countryText}
✅ ¡Aún estás a tiempo de registrarte!
👉 ${event.link_registro}
        `.trim();

        const ok = await tryCopyText(textToShare);
		if (ok) {
			setTooltipMsg('¡Copiado al portapapeles!');
			setTimeout(() => setTooltipMsg(''), 2000);
		} else {
			// Si todo falló, instruir al usuario (fallback manual)
			setTooltipMsg('No se pudo copiar automáticamente. Selecciona y copia manualmente.');
			setTimeout(() => setTooltipMsg(''), 4000);
		}
    };

    const handleOpenQR = (e, event) => {
        e.stopPropagation();
        setQrModalData({ link: event.link_registro, title: event.titulo });
    };

    // --- Lógica Cronograma (Timeline) con Clustering (Side-by-Side) ---
    const calculatePosition = (time) => {
        if (typeof time !== 'string') return 0;
        const [hour, minute] = time.split(':').map(Number);
        return hour * ROW_HEIGHT + (minute / 60) * ROW_HEIGHT;
    };

    const processedTimelineEvents = useMemo(() => {
        if (viewMode !== 'timeline') return [];

        // 1. Calcular posiciones base y dimensiones
        let timelineItems = filteredTodayEvents.map(event => {
            const top = calculatePosition(event.hora_inicio);
            const end = calculatePosition(event.hora_fin);
            const height = Math.max(end - top, ROW_HEIGHT / 2); // Altura mínima
            return {
                ...event,
                top,
                bottom: top + height,
                height,
                baseColor: eventColorMap[event.tipo_evento] || eventColorMap.default,
            };
        });

        // 2. Ordenar por hora de inicio, y luego por duración (mayor duración primero para base sólida)
        timelineItems.sort((a, b) => {
            if (a.top === b.top) return b.height - a.height;
            return a.top - b.top;
        });

        // 3. Agrupamiento en "Clusters" (Grupos que colisionan visualmente)
        const clusters = [];
        if (timelineItems.length > 0) {
            let currentCluster = [timelineItems[0]];
            let clusterEnd = timelineItems[0].bottom;

            for (let i = 1; i < timelineItems.length; i++) {
                const event = timelineItems[i];
                // Si el evento empieza ANTES de que termine el grupo actual, es colisión
                if (event.top < clusterEnd) {
                    currentCluster.push(event);
                    clusterEnd = Math.max(clusterEnd, event.bottom);
                } else {
                    clusters.push(currentCluster);
                    currentCluster = [event];
                    clusterEnd = event.bottom;
                }
            }
            clusters.push(currentCluster);
        }

        // 4. Distribuir columnas dentro de cada Cluster
        let finalEvents = [];

        clusters.forEach(cluster => {
            const columns = []; // Array de "bottoms" de cada columna
            
            cluster.forEach(event => {
                let placed = false;
                // Buscar la primera columna donde quepa el evento
                for (let i = 0; i < columns.length; i++) {
                    // Si el evento empieza después o igual a donde terminó el último de esta columna
                    if (event.top >= columns[i]) {
                        event.colIndex = i;
                        columns[i] = event.bottom; // Actualizar final de columna
                        placed = true;
                        break;
                    }
                }
                
                // Si no cabe en ninguna, crear nueva columna
                if (!placed) {
                    event.colIndex = columns.length;
                    columns.push(event.bottom);
                }
            });

            // Ancho basado en el número total de columnas del cluster
            const totalCols = columns.length;
            const colWidth = 100 / totalCols;

            cluster.forEach(event => {
                // Cálculo de estilos exactos
                event.style = {
                    top: `${event.top}px`,
                    height: `${event.height}px`,
                    left: `calc(${colWidth * event.colIndex}% + ${event.colIndex > 0 ? 5 : 0}px)`, // Margen visual
                    width: `calc(${colWidth}% - 10px)`, // Ancho relativo menos margen
                    position: 'absolute',
                    zIndex: 20 + event.colIndex, // Capas para que no se tapen clicks
                    borderTop: `5px solid ${event.baseColor}`
                };
                
                event.accentColor = event.baseColor;
                event.badgeBg = hexToRgba(event.baseColor, 0.12);
            });
            
            finalEvents = [...finalEvents, ...cluster];
        });

        return finalEvents;

    }, [filteredTodayEvents, viewMode]);

    // --- Auto-scroll Robusto ---
    useEffect(() => {
        if (viewMode === 'timeline' && scrollContainerRef.current) {
            const timeoutId = setTimeout(() => {
                if (firstEventRef.current) {
                    firstEventRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                     scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 150);
            return () => clearTimeout(timeoutId);
        }
    }, [viewMode, date]); 

    // --- Lógica Agenda ---
    const agendaGroups = useMemo(() => {
        if (viewMode !== 'agenda') return [];
        const groups = {};
        filteredTodayEvents.forEach(event => {
            const timeKey = event.hora_inicio;
            if (!groups[timeKey]) groups[timeKey] = [];
            groups[timeKey].push(event);
        });
        return Object.keys(groups).sort().map(time => ({
            time,
            events: groups[time],
            dotColors: groups[time].map(e => eventColorMap[e.tipo_evento] || eventColorMap.default)
        }));
    }, [filteredTodayEvents, viewMode]);

    // --- RENDERIZADO CARD CONTENT (DISEÑO ORIGINAL CON GRID) ---
    const renderCardContent = (event, isAgenda = false) => {
        const baseColor = eventColorMap[event.tipo_evento] || eventColorMap.default;
        const titleSize = isAgenda ? 'text-base' : 'text-sm';
        const detailSize = isAgenda ? 'text-[13px]' : 'text-xs';
        const actionLabel = "Registrarse";

        return (
            <div className="flex flex-col h-full relative" style={{ padding: '16px' }}>
                <div className="flex flex-col gap-[6px] mb-[10px]">
                    <div className="flex justify-between items-start">
                        <span 
                            className="inline-block rounded-md text-[10px] font-bold uppercase tracking-wider"
                            style={{ 
                                backgroundColor: isAgenda ? hexToRgba(baseColor, 0.15) : event.badgeBg, 
                                color: isAgenda ? baseColor : event.accentColor,
                                padding: '3px 8px'
                            }}
                        >
                            {event.tipo_evento}
                        </span>
                    </div>
                    <h4 className={`font-bold text-gray-800 ${titleSize} leading-tight`}>
                        {event.titulo}
                    </h4>
                </div>

                {/* Diseño GRID Original Conservado */}
                <div className={`grid grid-cols-2 gap-x-[10px] gap-y-[5px] ${detailSize} text-gray-600 mb-[10px]`}>
                    <div className="flex flex-col gap-[5px]">
                        <div className="flex items-center gap-[6px]">
                            <i className="far fa-clock w-[14px] text-center text-gray-400"></i>
                            <span>{event.hora_inicio?.substring(0, 5)} - {event.hora_fin?.substring(0, 5)}</span>
                        </div>
                        <div className="flex items-center gap-[6px]">
                            <i className={`fas ${event.modalidad === 'Virtual' ? 'fa-video' : 'fa-map-marker-alt'} w-[14px] text-center text-gray-400`}></i>
                            <span className="truncate">{event.modalidad === 'Virtual' ? 'Online' : (event.lugar || 'Presencial')}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[5px]">
                        <div className="flex items-center gap-[6px]">
                            <i className="fas fa-globe w-[14px] text-center text-gray-400"></i>
                            <span className="truncate">{event.languageComplete || 'Español'}</span>
                        </div>
                        {(event.registeredNumber !== undefined || event.remainCapacity !== undefined) && (
                            <div className="flex items-center gap-[6px]">
                                <i className="fas fa-users w-[14px] text-center text-gray-400"></i>
                                <span className="text-red-600 font-bold">
                                    {event.registeredNumber}/{event.remainCapacity}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {isAgenda && event.description && (
                    <div className="mb-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 leading-relaxed text-justify line-clamp-3">
                            {event.description}
                        </p>
                    </div>
                )}

                {isAgenda && (
                    <div className={`mt-auto flex items-center gap-3 ${!event.description ? 'pt-3 border-t border-gray-100' : ''}`}>
                        <a 
                            href={event.link_registro} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-white text-xs font-bold py-2 px-4 rounded-lg text-center transition-opacity hover:opacity-90 shadow-sm"
                            style={{ backgroundColor: baseColor }}
                        >
                            {actionLabel}
                        </a>
                        <button 
                            onClick={(e) => handleOpenQR(e, event)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                            title="Ver QR"
                        >
                            <i className="fas fa-qrcode"></i>
                        </button>
                        <button 
                            onClick={(e) => handleShare(e, event)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                            title="Compartir"
                        >
                            <i className="fas fa-share-alt"></i>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="day-view-scroll-container h-full flex flex-col bg-gray-50 relative">
            <div className="flex flex-col p-[21px] pb-[10px] sticky top-0 z-40 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100">
                <div className="flex justify-between items-center mb-[10px]">
                    <h3 className="text-xl font-bold font-figtree text-gray-800 mb-0">
                        {capitalize(format(date, "eeee, dd 'de'", { locale: es }))} {capitalize(format(date, 'LLLL', { locale: es }))}
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('agenda')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${viewMode === 'agenda' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-list-ul mr-1"></i> Agenda
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${viewMode === 'timeline' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <i className="fas fa-clock mr-1"></i> Cronograma
                            </button>
                        </div>
                        <button className="p-[8px] rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer" onClick={onClose}>
                            <i className="fas fa-times text-lg"></i>
                        </button>
                    </div>
                </div>
                
                {dayEventTypes.length > 1 && (
                    <div className="flex flex-wrap gap-[8px] pb-2">
                        {dayEventTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setDayFilter(prev => prev === type ? null : type)}
                                className={`cursor-pointer flex items-center gap-[5px] px-[13px] py-[5px] rounded-full text-xs font-medium transition-all duration-200 border ${dayFilter === type ? 'ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                                style={{
                                    borderColor: eventColorMap[type] || eventColorMap.default,
                                    backgroundColor: dayFilter === type ? (eventColorMap[type] || eventColorMap.default) : 'white',
                                    color: dayFilter === type ? '#fff' : (eventColorMap[type] || eventColorMap.default)
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div ref={scrollContainerRef} className="day-view-content relative flex-1 overflow-y-auto">
                {tooltipMsg && (
                    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg z-[100] animate-bounce">
                        {tooltipMsg}
                    </div>
                )}

                {/* === VISTA CRONOGRAMA (TIMELINE) === */}
                {viewMode === 'timeline' && (
                    <div className="relative" style={{ height: `${24 * ROW_HEIGHT}px` }}>
                        {format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && (
                            <div className="absolute w-full flex items-center pointer-events-none" style={{ top: `${calculatePosition(format(now, 'HH:mm'))}px`, zIndex: 40 }}>
                                <div className="text-xs font-bold mr-[5px] bg-red-500 text-white px-[5px] py-[2px] rounded" >{format(now, 'HH:mm')}</div>
                                <div className="w-full h-px bg-red-500 shadow-sm"></div>
                            </div>
                        )}
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                            <div key={hour} className="flex border-t border-gray-100" style={{ height: `${ROW_HEIGHT}px` }}>
                                <div className="text-xs text-gray-400 font-medium p-[8px] w-[50px] text-right pr-[8px] -mt-[10px] z-10">{`${hour}:00`}</div>
                                <div className="w-full border-l border-gray-100"></div>
                            </div>
                        ))}
                        <div className="absolute top-0 bottom-0 left-[50px] right-[8px]">
                            {processedTimelineEvents.map((event, index) => {
                                return (
                                    <InteractionCard
                                        key={event.id || index}
                                        ref={index === 0 ? firstEventRef : null}
                                        className="absolute rounded-lg border border-gray-200 bg-white calendar-event flex flex-col shadow-sm cursor-pointer group hover:z-50 hover:shadow-xl transition-all duration-200"
                                        style={event.style} // Usamos el objeto de estilo calculado completo
                                        onClick={() => setSelectedEvent({ ...event, country: currentCountry })}
                                        cursorText="Registrarse"
                                        accentColor={event.accentColor}
                                        isDisabled={false} 
                                    >
                                        {renderCardContent(event, false)}
                                    </InteractionCard>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* === VISTA AGENDA === */}
                {viewMode === 'agenda' && (
                    <div className="p-6 max-w-4xl mx-auto w-full">
                        {agendaGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <i className="far fa-calendar-times text-4xl mb-3"></i>
                                <p>No hay eventos para este filtro.</p>
                            </div>
                        ) : (
                            agendaGroups.map((group, groupIndex) => (
                                <div key={group.time} className="flex gap-6 mb-8 relative">
                                    <div className="w-20 flex flex-col items-end pt-1 relative shrink-0">
                                        <span className="text-base font-bold text-gray-800 leading-none">
                                            {formatTimeAMPM(group.time)}
                                        </span>
                                        <div className="absolute right-[-37px] top-3 flex gap-1 z-10 bg-gray-50 py-1">
                                            {group.dotColors.map((color, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="w-3 h-3 rounded-full border-2 border-gray-50 shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                ></div>
                                            ))}
                                        </div>
                                        {groupIndex !== agendaGroups.length - 1 ? (
                                            <div className="absolute right-[-29px] top-6 h-[calc(100%+32px)] w-[2px] bg-gray-200"></div>
                                        ) : (
                                            <div className="absolute right-[-29px] top-6 h-full w-[2px] bg-gradient-to-b from-gray-200 to-transparent"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pl-10 pb-2">
                                        <div className={`grid gap-5 ${group.events.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                                            {group.events.map((event, idx) => {
                                                const baseColor = eventColorMap[event.tipo_evento] || eventColorMap.default;
                                                return (
                                                    <InteractionCard
                                                        key={event.id || idx}
                                                        className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                                                        style={{ borderTop: `5px solid ${baseColor}` }}
                                                        onClick={null}
                                                        isDisabled={true} 
                                                    >
                                                        {renderCardContent(event, true)}
                                                    </InteractionCard>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="h-10"></div>
                    </div>
                )}
            </div>

            {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            {qrModalData && <SimpleQRModal link={qrModalData.link} title={qrModalData.title} onClose={() => setQrModalData(null)} />}
        </div>
    );
};

export default DayView;