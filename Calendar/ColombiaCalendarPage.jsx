import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const ColombiaCalendarPage = () => {
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

                // Filtrar eventos de Colombia Y eventos Destacados/LATAM
                const colombiaAndFeaturedEvents = rows.filter(row => {
                    const isColombia = row.name === 'Colombia';
                    const isFeatured = row.typeEvent === 'Destacados' || row.name === 'LATAM' || row.name === 'Latam';
                    return isColombia || isFeatured;
                }).map(row => {
                    // Asegurar que los destacados tengan el tipo correcto visualmente
                    if (row.typeEvent === 'Destacados' || row.name === 'LATAM' || row.name === 'Latam') {
                        return { ...row, typeEvent: 'Destacados', tipo_evento: 'Destacados' };
                    }
                    return row;
                });

                setEventsByCountry({ Colombia: colombiaAndFeaturedEvents });
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
                    <title>{t('calendar.title_country', { country: 'Colombia' })}</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>{t('calendar.loading')}</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Helmet>
                    <title>{t('calendar.title_country', { country: 'Colombia' })}</title>
                </Helmet>
                <div className="calendar-root-center">
                    <p>{t('calendar.error_loading')}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>{t('calendar.title_country', { country: 'Colombia' })}</title>
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