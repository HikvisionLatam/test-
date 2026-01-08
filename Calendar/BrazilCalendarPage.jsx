import { useEffect, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const SUPABASE_URL = 'https://svyoxrtdxvtbuqvqfhwa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Uwf34VWmY2eBIkoP3KCUuw_sC_b0t0V';

const BrazilCalendarPage = () => {
    const { t, i18n } = useTranslation(); // Obtenemos la instancia i18n
    const [eventsByCountry, setEventsByCountry] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- NUEVO: Efecto para cambiar el idioma a Portugués al entrar ---
    useEffect(() => {
        i18n.changeLanguage('pt');
        
        // Opcional: Si quieres que al salir de esta página vuelva a español
        // return () => i18n.changeLanguage('es'); 
    }, [i18n]);
    // ------------------------------------------------------------------

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
                    {/* Usamos t() para que traduzca el título una vez cambiado el idioma */}
                    <title>{t('calendar.title_country', { country: 'Brasil' })}</title>
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
                    <title>{t('calendar.title_country', { country: 'Brasil' })}</title>
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
                <title>{t('calendar.title_country', { country: 'Brasil' })}</title>
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