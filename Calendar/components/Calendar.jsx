import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { format } from 'date-fns';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css'; 
import { useTranslation } from 'react-i18next';

import MonthView from './MonthView';
import DayView from './DayView';
import './calendar.css';
import { getCountryData } from './calendarConstants';
import { trackEvent } from '../../../utils/analytics';


const inferLanguageFromTab = (tab) => {
    if (!tab) return 'Español';
    try {
        const data = getCountryData(tab) || {};
        const code = (data.code || '').toLowerCase();

        const spanishCodes = new Set(['ar','bo','cl','co','cr','cu','do','ec','sv','gt','hn','mx','ni','pa','py','pe','uy','ve','es','la']);
        if (code === 'br' || code === 'pt') return 'Português';
        if (spanishCodes.has(code)) return 'Español';
        if (['us','gb','ca','au','nz'].includes(code)) return 'English';
    } catch (e) {
    }
    return 'Español';
};

const transformApiEvent = (apiEvent, currentTab) => {
    if (!apiEvent.startTime || !apiEvent.overTime || !apiEvent.id) return null;
    const startDate = new Date(apiEvent.startTime);
    const endDate = new Date(apiEvent.overTime);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const locationParts = (apiEvent.location || '').split(',');
    const lugar = locationParts.length > 1 ? locationParts[0] : apiEvent.location || 'Ubicación no especificada';
    const direccion = locationParts.length > 1 ? locationParts.slice(1).join(', ').trim() : '';

    const lenguajeFinal = apiEvent.languageComplete || inferLanguageFromTab(currentTab);

    return {
        id: apiEvent.id,
        titulo: apiEvent.classroomName,
        tipo_evento: apiEvent.typeEvent || 'Evento',
        state: apiEvent.state,
        mes: months[startDate.getMonth()],
        dia: String(startDate.getDate()),
        registeredNumber: apiEvent.registeredNumber || 0,
        remainCapacity: apiEvent.remainCapacity || 0,
        description: apiEvent.description || '',
        hora_inicio: format(startDate, 'HH:mm'),
        hora_fin: format(endDate, 'HH:mm'),
        link_registro: apiEvent.link ? apiEvent.link : `https://elearning.hikvision.com/americas/classroom/detail/${apiEvent.id}`,
        organizador: apiEvent.lecturer_name,
        lugar: lugar,
        direccion: direccion,
        modalidad: apiEvent.modalidad, 
        lenguaje: lenguajeFinal,
        ciudad: apiEvent.city || '',
    };
};

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

const Calendar = ({ events, availableTabs, defaultTab }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(defaultTab);
    useEffect(() => { if (defaultTab) setActiveTab(defaultTab); }, [defaultTab]);

    const [selectedDate, setSelectedDate] = useState(null);
    const [activeFilter, setActiveFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const searchRef = useRef(null);
    const monthViewRef = useRef(null);
    const [contentHeight, setContentHeight] = useState('auto');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const dropdownResults = useMemo(() => {
        if (!searchTerm) return [];
        return availableTabs.filter(tab => {
            const info = getCountryData(tab);
            return info.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [availableTabs, searchTerm]);

    const transformedEvents = useMemo(() => {
        const eventsForTab = events[activeTab] || [];
        return eventsForTab.map(e => transformApiEvent(e, activeTab)).filter(Boolean);
    }, [activeTab, events]);
    
    const visibleEvents = transformedEvents;

    const filteredEventsForDayView = useMemo(() => {
        if (!activeFilter) return visibleEvents;
        return visibleEvents.filter(event => event.tipo_evento === activeFilter);
    }, [activeFilter, visibleEvents]);

    const uniqueEventTypes = useMemo(() => {
        const activeEvents = visibleEvents.filter(e => !['Finished', 'Discarded', 'Unreleased'].includes(e.state));
        const types = new Set(activeEvents.map(e => e.tipo_evento).filter(Boolean));
        return Array.from(types);
    }, [visibleEvents]);
    
    const debouncedSetTabLogic = useRef(
        debounce((newTab) => {
            setActiveTab(newTab);
            setSelectedDate(null);
            setActiveFilter(null);
        }, 150)
    ).current;

    const handleTabChange = (tab) => {
        debouncedSetTabLogic(tab);
        setSearchTerm(''); 
        setIsDropdownOpen(false); 
    };

    useLayoutEffect(() => {
        if (monthViewRef.current) setContentHeight(`${monthViewRef.current.offsetHeight}px`);
    }, [activeTab, visibleEvents, activeFilter]);
    
    useEffect(() => {
        if (selectedDate && monthViewRef.current) {
            setTimeout(() => setContentHeight(`${monthViewRef.current.offsetHeight}px`), 50);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (selectedDate && activeFilter) {
            const eventsOnSelectedDate = filteredEventsForDayView.filter(event => {
                const eventDate = new Date(new Date().getFullYear(), new Date(Date.parse(event.mes +" 1, 2022")).getMonth(), parseInt(event.dia));
                return eventDate.toDateString() === selectedDate.toDateString();
            });
            if (eventsOnSelectedDate.length === 0) setSelectedDate(null);
        }
    }, [activeFilter, selectedDate, filteredEventsForDayView]);

    const handleDayClick = (day) => { setSelectedDate(day); };
    const handleCloseDayView = () => { setSelectedDate(null); };
    const handleFilterChange = (eventType) => {
        setActiveFilter(prevFilter => (prevFilter === eventType ? null : eventType));
    };

    const monthViewClass = `month-view-wrapper bg-gray-50 ${selectedDate ? 'shrunk' : ''}`;
    const dayViewClass = `day-view-wrapper ${selectedDate ? 'visible' : ''}`;

    return (
        <div className="calendar-root-center bg-gray-50 min-h-screen py-8">
            <div className="calendar-container w-full max-w-[1400px] mx-auto px-4 md:px-6">
                
                <div className="mb-6">
                    {availableTabs.length > 1 && (
                        <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative z-50">
                            
                            <div className="relative w-full md:w-72 shrink-0 mt-1" ref={searchRef}>
                                <div className="inputGroup">
                                    <input 
                                        type="text" 
                                        required 
                                        autoComplete="off"
                                        value={searchTerm}
                                        onFocus={() => {
                                            trackEvent('click.action', {
                                                click_chapter1: 'calendario_eventos',
                                                click_chapter2: 'navegacion_principal',
                                                click_name: 'foco_busqueda_pais'
                                            });
                                            setIsDropdownOpen(true);
                                        }}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                    />
                                    <label htmlFor="name">{t('calendar.search_placeholder')}</label>
                                </div>

                                {isDropdownOpen && searchTerm && dropdownResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                                        <div className="p-1">
                                            {dropdownResults.map(tab => {
                                                const countryData = getCountryData(tab);
                                                return (
                                                    <button
                                                        key={tab}
                                                        onClick={() => {
                                                            trackEvent('click.navigation', {
                                                                click_chapter1: 'calendario_eventos',
                                                                click_chapter2: 'navegacion_principal',
                                                                click_name: 'seleccionar_pais_busqueda',
                                                                selected_country: countryData.name
                                                            });
                                                            handleTabChange(tab);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors group cursor-pointer"
                                                    >
                                                        <img 
                                                            src={`https://flagcdn.com/w40/${countryData.code}.png`} 
                                                            alt={countryData.name}
                                                            className="w-6 h-6 rounded-full object-cover shadow-sm"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                                                            {countryData.name}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {isDropdownOpen && searchTerm && dropdownResults.length === 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-[60]">
                                        {t('calendar.no_countries_found')}
                                    </div>
                                )}
                            </div>

                            <div className="hidden md:block w-px h-10 bg-gray-200 mt-1"></div>

                            <div className="flex-1 w-full min-w-0"> 
                                <Splide 
                                    options={{
                                        autoWidth: true, 
                                        gap: '0.75rem',
                                        pagination: false,
                                        arrows: true,
                                        drag: 'free',
                                        perMove: 1,
                                    }}
                                    className="custom-splide"
                                >
                                    {availableTabs.map(tab => {
                                        const countryData = getCountryData(tab);
                                        const isActive = activeTab === tab;
                                        
                                        return (
                                            <SplideSlide key={tab}>
                                                <button
                                                    onClick={() => {
                                                        trackEvent('click.navigation', {
                                                            click_chapter1: 'calendario_eventos',
                                                            click_chapter2: 'navegacion_principal',
                                                            click_name: 'seleccionar_pais_tab',
                                                            selected_country: countryData.name
                                                        });
                                                        handleTabChange(tab);
                                                    }}
                                                    className={`
                                                        flex items-center gap-2 
                                                        px-4 py-2.5 mt-1 rounded-xl text-sm font-bold 
                                                        transition-all duration-200 ease-out select-none cursor-pointer
                                                        whitespace-nowrap border
                                                        ${isActive 
                                                            ? 'bg-[#D71820] text-white shadow-md border-[#D71820] transform scale-105' 
                                                            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50 hover:border-gray-200 hover:text-gray-900'
                                                        }
                                                    `}
                                                    aria-pressed={isActive}
                                                >
                                                    <img 
                                                        src={`https://flagcdn.com/w40/${countryData.code}.png`} 
                                                        alt={countryData.name}
                                                        className="w-5 h-5 rounded-full object-cover shadow-sm bg-gray-100"
                                                    />
                                                    <span>{countryData.name}</span>
                                                </button>
                                            </SplideSlide>
                                        );
                                    })}
                                </Splide>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="calendar-body">
                    <div className={monthViewClass} ref={monthViewRef}>
                        <MonthView
                            onDayClick={handleDayClick}
                            events={visibleEvents}
                            activeFilter={activeFilter}
                            selectedDate={selectedDate}
                            uniqueEventTypes={uniqueEventTypes} 
                            onFilterChange={handleFilterChange}
                        />
                    </div>

                    {selectedDate && (
                        <div id="agenda-dia" className={`${dayViewClass}`} style={{ height: contentHeight, minHeight: 300 }}>
                            <DayView
                                date={selectedDate}
                                events={filteredEventsForDayView}
                                onClose={handleCloseDayView}
                                currentCountry={activeTab} 
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;