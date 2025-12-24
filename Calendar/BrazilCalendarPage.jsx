import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';

// MISMOS VALORES QUE EN LatamCalendarPage
const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const BrazilCalendarPage = () => {
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

                // Filtrar SOLO Brasil (acepta 'Brasil' o 'Brazil' según cómo esté en Supabase)
                const brazilEvents = rows.filter(
                    (row) => row.name === 'Brasil' || row.name === 'Brazil'
                );

                setEventsByCountry({ Brasil: brazilEvents });
            } catch (err) {
                console.error('Error cargando eventos Brasil:', err);
                setError('No se pudieron cargar los eventos de Brasil.');
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
                    <title>Calendario de Eventos - Brasil</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>Cargando eventos de Brasil...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Helmet>
                    <title>Calendario de Eventos - Brasil</title>
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
                <title>Calendario de Eventos - Brasil</title>
            </Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={['Brasil']}
                defaultTab="Brasil"
            />
        </>
    );
};

export default BrazilCalendarPage;
