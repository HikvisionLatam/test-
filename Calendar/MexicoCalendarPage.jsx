import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const MexicoCalendarPage = () => {
    const { t } = useTranslation();
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
                <Helmet><title>{t('calendar.title_country', { country: 'México' })}</title></Helmet>
                <div className="calendar-root-center">
                    <p>{t('calendar.loading')}</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Helmet><title>{t('calendar.title_country', { country: 'México' })}</title></Helmet>
                <div className="calendar-root-center">
                    <p>{t('calendar.error_loading')}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet><title>{t('calendar.title_country', { country: 'México' })}</title></Helmet>
            <CalendarComponent
                events={eventsByCountry}
                availableTabs={['México']}
                defaultTab="México"
            />
        </>
    );
};

export default MexicoCalendarPage;