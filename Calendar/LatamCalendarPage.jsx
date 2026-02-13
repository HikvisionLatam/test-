import { useEffect, useMemo, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
// Importamos la lista fija y la función de normalización
import { FIXED_COUNTRIES_LIST, normalizeCountryName } from './components/calendarConstants.js';

const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const LatamCalendarPage = () => {
    const { t } = useTranslation();
    const [eventsByCountry, setEventsByCountry] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCountry, setUserCountry] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const url = `${SUPABASE_URL}/rest/v1/events?select=*`;
                const res = await fetch(url, {
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
                const rows = await res.json();

                // 1. Separar eventos "Destacados" (o LATAM) del resto
                const destacadosEvents = [];
                const normalEvents = [];

                rows.forEach(row => {
                    // Verificamos si es un evento destacado por tipo o por nombre de 'país' (LATAM)
                    if (row.typeEvent === 'Destacados' || row.name === 'LATAM' || row.name === 'Latam') {
                        // Forzamos el tipo a 'Destacados' para asegurar el estilo visual
                        const enhancedRow = { ...row, typeEvent: 'Destacados', tipo_evento: 'Destacados' };
                        destacadosEvents.push(enhancedRow);
                    } else {
                        normalEvents.push(row);
                    }
                });

                // 2. Inicializar el objeto de agrupación con la LISTA FIJA de países
                // Esto asegura que los países aparezcan aunque no tengan eventos propios (tendrán los destacados)
                const grouped = {};
                FIXED_COUNTRIES_LIST.forEach(country => {
                    grouped[country] = [];
                });
                
                // 3. Agrupar los eventos normales aplicando NORMALIZACIÓN de nombres
                normalEvents.forEach(row => {
                    const rawName = row.name || 'Otros';
                    
                    // --- NORMALIZACIÓN CLAVE ---
                    // Esto convierte "Panama" -> "Panamá", "Brazil" -> "Brasil", etc.
                    // Evitando así que se creen pestañas duplicadas.
                    const countryKey = normalizeCountryName(rawName);

                    // Si la llave ya existe (porque estaba en la lista fija o ya se creó), agregamos el evento
                    if (grouped[countryKey]) {
                        grouped[countryKey].push(row);
                    } else {
                        // Si es un país nuevo que no estaba en la lista fija, lo creamos
                        grouped[countryKey] = [row];
                    }
                });

                // 4. Distribuir los eventos DESTACADOS a TODOS los países
                Object.keys(grouped).forEach(countryKey => {
                    grouped[countryKey] = [...grouped[countryKey], ...destacadosEvents];
                });

                // Limpieza de llaves que no deberían ser pestañas
                delete grouped['LATAM'];
                delete grouped['Latam'];
                // Opcional: decidir si mostrar 'Otros' o borrarlo
                // delete grouped['Otros']; 

                setEventsByCountry(grouped);
            } catch (err) {
                console.error(err);
                setError('No se pudieron cargar los eventos.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Detección de país por IP
    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipwho.is/');
                const data = await response.json();
                if (data && data.success && data.country) {
                    setUserCountry(data.country);
                }
            } catch (error) {
                console.warn("No se pudo detectar la ubicación automáticamente:", error);
            }
        };
        detectCountry();
    }, []);

    const { availableTabs, defaultTab } = useMemo(() => {
        let tabs = Object.keys(eventsByCountry);

        // Ordenar las pestañas según el orden de la LISTA FIJA
        tabs.sort((a, b) => {
            const idxA = FIXED_COUNTRIES_LIST.indexOf(a);
            const idxB = FIXED_COUNTRIES_LIST.indexOf(b);
            
            // Si ambos están en la lista fija, respetar ese orden
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            // Si solo A está, va antes
            if (idxA !== -1) return -1;
            // Si solo B está, va antes
            if (idxB !== -1) return 1;
            // Si ninguno está, orden alfabético normal
            return a.localeCompare(b);
        });

        let def = null;
        
        const searchCountry = userCountry ? normalizeCountryName(userCountry) : null;

        const foundUserCountry = tabs.find(t => 
            searchCountry && t.toLowerCase() === searchCountry.toLowerCase()
        );

        if (foundUserCountry) {
            def = foundUserCountry;
        } else if (tabs.includes('México')) {
            def = 'México'; // Fallback por defecto
        } else {
            def = tabs[0] || null;
        }

        return {
            availableTabs: tabs,
            defaultTab: def,
        };
    }, [eventsByCountry, userCountry]);

    if (loading) return <div className="calendar-root-center"><p>{t('calendar.loading')}</p></div>;
    if (error) return <div className="calendar-root-center"><p>{t('calendar.error_loading')}</p></div>;

    return (
        <>
            <Helmet><title>{t('calendar.title_latam')}</title></Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={availableTabs}
                defaultTab={defaultTab}
            />
        </>
    );
};

export default LatamCalendarPage;