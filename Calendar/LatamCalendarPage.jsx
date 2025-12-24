// src/LatamCalendarPage.jsx
import { useEffect, useMemo, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';

const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const LatamCalendarPage = () => {
    const [eventsByCountry, setEventsByCountry] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userCountry, setUserCountry] = useState(null);

    // 1. Fetch de Eventos
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
                const grouped = rows.reduce((acc, row) => {
                    const country = row.name || 'Otros';
                    if (!acc[country]) acc[country] = [];
                    acc[country].push(row);
                    return acc;
                }, {});

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

    // 2. Fetch de Geolocalización (IP)
    useEffect(() => {
        const detectCountry = async () => {
            try {
                // Usamos ipapi.co (gratuito y fiable para nombres de países)
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data && data.country_name) {
                    setUserCountry(data.country_name);
                }
            } catch (error) {
            }
        };
        detectCountry();
    }, []);

    // 3. Lógica del Tab por Defecto
    const { availableTabs, defaultTab } = useMemo(() => {
        const tabs = Object.keys(eventsByCountry).sort();
        
        let def = null;

        // Lógica de Prioridad:
        // 1. Si detectamos país por IP y existe en los tabs -> Ese es el default.
        // 2. Si no, buscamos "Argentina" explícitamente.
        // 3. Si no, el primero de la lista.

        // Mapeo de nombres en inglés (API IP) a español (Tu BD) si es necesario
        // ipapi suele devolver en inglés ("Peru" vs "Perú"). Hacemos un chequeo laxo.
        const foundUserCountry = tabs.find(t => 
            userCountry && t.toLowerCase().includes(userCountry.toLowerCase())
        );

        if (foundUserCountry) {
            def = foundUserCountry;
        } else if (tabs.includes('Argentina')) {
            def = 'Argentina';
        } else {
            def = tabs[0] || null;
        }

        return {
            availableTabs: tabs,
            defaultTab: def,
        };
    }, [eventsByCountry, userCountry]);

    if (loading) return <div className="calendar-root-center"><p>Cargando eventos...</p></div>;
    if (error) return <div className="calendar-root-center"><p>{error}</p></div>;
    if (!availableTabs.length) return <div className="calendar-root-center"><p>No hay eventos disponibles.</p></div>;

    return (
        <>
            <Helmet><title>Calendario de Eventos - Latam</title></Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={availableTabs}
                defaultTab={defaultTab}
            />
        </>
    );
};

export default LatamCalendarPage;