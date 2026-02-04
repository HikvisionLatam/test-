import { useEffect, useMemo, useState } from 'react';
import CalendarComponent from './components/Calendar.jsx';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

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

    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipwho.is/');
                const data = await response.json();
                if (data && data.success && data.country) {
                    // console.log("País detectado:", data.country);
                    setUserCountry(data.country);
                }
            } catch (error) {
                console.warn("No se pudo detectar la ubicación automáticamente:", error);
            }
        };
        detectCountry();
    }, []);

    const { availableTabs, defaultTab } = useMemo(() => {
        const tabs = Object.keys(eventsByCountry).sort();
        let def = null;
        
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

    if (loading) return <div className="calendar-root-center"><p>{t('calendar.loading')}</p></div>;
    if (error) return <div className="calendar-root-center"><p>{t('calendar.error_loading')}</p></div>;
    if (!availableTabs.length) return <div className="calendar-root-center"><p>{t('calendar.no_events')}</p></div>;

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