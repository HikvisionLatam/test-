import { useState, useMemo, useRef } from 'react';
import { 
    format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isPast, endOfDay,
    addDays, subDays, addWeeks, subWeeks, isSameMonth, addMonths, subMonths, isBefore
} from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { eventColorMap, eventTextColorMap } from './calendarConstants';
import { trackEvent } from '../../../utils/analytics'; 

const localeMap = {
    es: es,
    en: enUS,
    pt: ptBR
};

const MonthView = ({ 
    onDayClick, 
    events, 
    activeFilter, 
    selectedDate, 
    onFilterChange,
    showPast = false
}) => {
    const { t, i18n } = useTranslation();
    const langKey = i18n.language ? i18n.language.split('-')[0] : 'es';
    const currentLocale = localeMap[langKey] || es;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDay, setHoveredDay] = useState(null);
    const [focusedDate, setFocusedDate] = useState(new Date());
    
    const [navTooltip, setNavTooltip] = useState({ show: false, msg: '' });
    
    const dayButtonRefs = useRef(new Map());
    const gridRef = useRef(null);

    const monthMapping = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    
    const handlePrevMonth = () => {
        // Analytics Tracking
        trackEvent('click.action', {
            click_chapter1: 'calendario_eventos',
            click_chapter2: 'vista_mes',
            click_name: 'mes_anterior',
            current_view_date: format(currentDate, 'yyyy-MM')
        });

        const prevMonthDate = subMonths(currentDate, 1);
        const todayStartOfMonth = startOfMonth(new Date());

        if (!showPast && isBefore(prevMonthDate, todayStartOfMonth)) {
            setNavTooltip({ show: true, msg: t('calendar.month_prev_error') });
            setTimeout(() => setNavTooltip({ show: false, msg: '' }), 3000);
            return;
        }

        setCurrentDate(prevMonthDate);
    };

    const handleNextMonth = () => {
        // Analytics Tracking
        trackEvent('click.action', {
            click_chapter1: 'calendario_eventos',
            click_chapter2: 'vista_mes',
            click_name: 'mes_siguiente',
            current_view_date: format(currentDate, 'yyyy-MM')
        });
        setCurrentDate(addMonths(currentDate, 1));
    };

    const eventsByDay = useMemo(() => {
        const grouped = {};
        if (!events) return grouped;
        const year = currentDate.getFullYear();
        
        events.forEach(event => {
            if (!event.mes || !event.dia) return;
            const capitalizedMonth = event.mes.charAt(0).toUpperCase() + event.mes.slice(1).toLowerCase();
            const monthIndex = monthMapping[capitalizedMonth];
            const day = parseInt(event.dia, 10);
            
            if (monthIndex !== undefined && !isNaN(day)) {
                if (monthIndex === currentDate.getMonth()) {
                     const eventDate = new Date(year, monthIndex, day);
                     const dayKey = format(eventDate, 'yyyy-MM-dd');
                     if (!grouped[dayKey]) grouped[dayKey] = [];
                     grouped[dayKey].push(event);
                }
            }
        });
        return grouped;
    }, [events, currentDate]);

    const currentMonthEventTypes = useMemo(() => {
        const allEventsInView = Object.values(eventsByDay).flat();
        const activeEvents = allEventsInView.filter(e => !['Finished', 'Discarded', 'Unreleased'].includes(e.state));
        const types = new Set(activeEvents.map(e => e.tipo_evento).filter(Boolean));
        return Array.from(types);
    }, [eventsByDay]);

    const firstDayOfMonth = startOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: endOfMonth(firstDayOfMonth) });
    const startingDayIndex = (getDay(firstDayOfMonth) + 6) % 7;
    const capitalize = s => s && s[0].toUpperCase() + s.slice(1).toLowerCase();

    const handleGridKeyDown = (e) => {
        let newFocusedDate;
        switch (e.key) {
            case 'ArrowRight': newFocusedDate = addDays(focusedDate, 1); break;
            case 'ArrowLeft': newFocusedDate = subDays(focusedDate, 1); break;
            case 'ArrowDown': newFocusedDate = addWeeks(focusedDate, 1); break;
            case 'ArrowUp': newFocusedDate = subWeeks(focusedDate, 1); break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                const key = format(focusedDate, 'yyyy-MM-dd');
                const button = dayButtonRefs.current.get(key);
                if (button && !button.disabled) button.click();
                return;
            default: return;
        }
        e.preventDefault();
        if (newFocusedDate && isSameMonth(newFocusedDate, currentDate)) {
            setFocusedDate(newFocusedDate);
        }
    };

    const rawWeekdays = t('calendar.weekdays', { returnObjects: true });
    const weekdays = Array.isArray(rawWeekdays) ? rawWeekdays : ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

    // --- FUNCIÓN DE MAPEO DE TRADUCCIÓN ---
    const getEventTypeLabel = (type) => {
        const map = {
            'Webinar & Seminarios': 'type_webinar',
            'Certificaciones': 'type_certification',
            'Open Course': 'type_opencourse'
        };
        // Intenta buscar la clave mapeada, si no existe, usa el tipo original
        return map[type] ? t(`calendar.${map[type]}`) : type;
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm month-view-wrapper font-figtree border border-gray-100 relative">
            
            {navTooltip.show && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50 animate-bounce">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {navTooltip.msg}
                </div>
            )}

            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#D71820]">
                        <i className="far fa-calendar-alt text-lg"></i>
                    </div>
                    <h2 className="text-2xl font-bold font-figtree text-gray-800 m-0 leading-none">
                        {capitalize(format(currentDate, 'LLLL', { locale: currentLocale }))} <span className="text-gray-400 font-medium">{currentDate.getFullYear()}</span>
                    </h2>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={handlePrevMonth}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer text-red relative group"
                        aria-label="Mes anterior"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        onClick={handleNextMonth}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer text-red"
                        aria-label="Mes siguiente"
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN DE FILTROS ACTUALIZADA CON TRADUCCIÓN --- */}
            {currentMonthEventTypes && currentMonthEventTypes.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-6 ml-1">
                    {currentMonthEventTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => {
                                // Analytics Tracking
                                trackEvent('click.action', {
                                    click_chapter1: 'calendario_eventos',
                                    click_chapter2: 'vista_mes',
                                    click_name: 'filtrar_tipo_evento',
                                    filter_value: type,
                                    filter_active: activeFilter === type ? 'desactivar' : 'activar'
                                });
                                onFilterChange && onFilterChange(type);
                            }}
                            className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 border text-xs ${
                                activeFilter === type
                                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                            }`}
                            aria-pressed={activeFilter === type}
                        >
                            <div
                                aria-hidden="true"
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: eventColorMap[type] || eventColorMap.default }}
                            />
                            <span className={`font-semibold ${activeFilter === type ? 'text-blue-600' : 'text-gray-600'}`}>
                                {getEventTypeLabel(type)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-7 mb-2">
                {weekdays.map(d => (
                    <div key={d} className="text-center font-bold text-xs text-gray-400 uppercase tracking-wide py-2" aria-hidden="true">{d}</div>
                ))}
            </div>

            <div 
                className="grid grid-cols-7 gap-y-2"
                role="grid"
                aria-label={`Calendario de ${format(currentDate, 'LLLL yyyy', { locale: currentLocale })}`}
                onKeyDown={handleGridKeyDown}
                ref={gridRef}
            >
                {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`e-${i}`} role="presentation" className="day-cell-wrapper"></div>)}
                
                {daysInMonth.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDay[dayKey] || [];
                    const hasEvents = dayEvents.length > 0;
                    const eventCount = dayEvents.length;
                    
                    const disabledStates = ['Finished', 'Discarded', 'Unreleased'];
                    const isPastDay = isPast(endOfDay(day)) && !isToday(day);
                    const allEventsAreDisabled = hasEvents && dayEvents.every(e => disabledStates.includes(e.state));
                    const isDayDisabled = (!showPast && isPastDay) || allEventsAreDisabled;

                    const uniqueTypes = [...new Set(dayEvents.map(e => e.tipo_evento))];
                    
                    const getDynamicStyles = () => {
                        if (!showPast && isPastDay && !hasEvents) {
                            return { background: 'transparent', color: '#D1D5DB', cursor: 'default' };
                        }
                        if (isDayDisabled) {
                            return { background: '#F3F4F6', color: '#9CA3AF' };
                        }
                        if (!hasEvents) {
                            return { color: isToday(day) ? 'var(--color-principalCalendar)' : '#374151' };
                        }
                        
                        const backgroundColors = uniqueTypes.map(type => eventColorMap[type] || eventColorMap.default);
                        if (backgroundColors.length === 1) {
                            return { background: backgroundColors[0], color: uniqueTypes.length === 1 ? eventTextColorMap[uniqueTypes[0]] || '#FFFFFF' : '#FFFFFF' };
                        } else {
                            return { background: `linear-gradient(135deg, ${backgroundColors.join(', ')})`, color: '#FFFFFF' };
                        }
                    };
                    
                    const getOpacity = () => {
                        if (!activeFilter || !hasEvents || isDayDisabled) return 1;
                        return dayEvents.some(e => e.tipo_evento === activeFilter) ? 1 : 0.25;
                    };

                    const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                    return (
                        <div key={day.toString()} role="gridcell" className="day-cell-wrapper relative flex justify-center py-1">
                            <button
                                ref={el => {
                                    if (el) dayButtonRefs.current.set(dayKey, el);
                                    else dayButtonRefs.current.delete(dayKey);
                                }}
                                tabIndex={format(focusedDate, 'yyyy-MM-dd') === dayKey ? 0 : -1}
                                className={`
                                    relative flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-200
                                    ${isDayDisabled ? 'cursor-not-allowed' : (hasEvents ? 'cursor-pointer hover:scale-110 shadow-sm' : 'cursor-default')}
                                    ${isToday(day) && !hasEvents ? 'border-2 border-red-500' : ''}
                                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                `}
                                style={{
                                    ...getDynamicStyles(),
                                    opacity: getOpacity(),
                                }}
                                disabled={isDayDisabled || !hasEvents}
                                onClick={!isDayDisabled && hasEvents ? () => {
                                    // Analytics Tracking
                                    trackEvent('click.navigation', {
                                        click_chapter1: 'calendario_eventos',
                                        click_chapter2: 'vista_mes',
                                        click_name: 'seleccionar_dia',
                                        selected_date: dayKey,
                                        event_count: eventCount
                                    });
                                    onDayClick(day);
                                } : undefined}
                                onMouseEnter={() => hasEvents && setHoveredDay(dayKey)}
                                onMouseLeave={() => setHoveredDay(null)}
                            >
                                {format(day, 'd')}
                                
                                {hasEvents && !isDayDisabled && (
                                    <span 
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-white text-gray-800 text-[9px] font-extrabold rounded-full flex items-center justify-center border border-gray-100 shadow-sm z-10"
                                        aria-hidden="true"
                                    >
                                        {eventCount}
                                    </span>
                                )}

                                {hasEvents && (
                                    <div className={`calendar-tooltip${hoveredDay === dayKey ? ' show' : ''}`}>
                                        {isDayDisabled 
                                            ? `${eventCount} ${eventCount > 1 ? t('calendar.finished_plural') : t('calendar.finished_singular')}`
                                            : `${eventCount} ${eventCount > 1 ? t('calendar.event_plural') : t('calendar.event_singular')}`
                                        }
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;