// src/ColombiaCalendarPage.jsx
import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';

// MISMOS VALORES QUE EN LatamCalendarPage
const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';;

const ColombiaCalendarPage = () => {
    const [eventsByCountry, setEventsByCountry] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const url = `${SUPABASE_URL}/rest/v1/events?select=*`;

                const res = await fetch(url, {
                    headers: {
                        apikey: SUPABASE_ANON_KEY,
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Error ${res.status}: ${text}`);
                }

                const rows = await res.json();

                // Filtrar SOLO Colombia (ajusta el string si en Supabase el país se llama distinto)
                const colombiaEvents = rows.filter(
                    (row) => row.name === 'Colombia'
                );

                setEventsByCountry({ Colombia: colombiaEvents });
            } catch (err) {
                console.error('Error cargando eventos Colombia:', err);
                setError('No se pudieron cargar los eventos de Colombia.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Calendario de Eventos - Colombia</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>Cargando eventos de Colombia...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Helmet>
                    <title>Calendario de Eventos - Colombia</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>{error}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Calendario de Eventos - Colombia</title>
            </Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={['Colombia']}
                defaultTab="Colombia"
            />
        </>
    );
};

export default ColombiaCalendarPage;
