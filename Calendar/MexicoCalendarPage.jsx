// src/MexicoCalendarPage.jsx
import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';


const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const MexicoCalendarPage = () => {
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

                // Ajusta el string EXACTO a como aparece el país en la columna "name" en tu tabla events
                const mexicoEvents = rows.filter(
                    (row) => row.name === 'México' || row.name === 'Mexico'
                );

                setEventsByCountry({ México: mexicoEvents });
            } catch (err) {
                console.error('Error cargando eventos de México:', err);
                setError('No se pudieron cargar los eventos de México.');
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
                    <title>Calendario de Eventos - México</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>Cargando eventos de México...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Helmet>
                    <title>Calendario de Eventos - México</title>
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
                <title>Calendario de Eventos - México</title>
            </Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={['México']}
                defaultTab="México"
            />
        </>
    );
};

export default MexicoCalendarPage;
