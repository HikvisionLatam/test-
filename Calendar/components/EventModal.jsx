import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { differenceInDays, differenceInHours, differenceInMinutes, format } from 'date-fns';
import { es, enUS, ptBR } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../../utils/analytics'; // Importación de Analytics

const localeMap = { es: es, en: enUS, pt: ptBR };

// --- CONSTANTES DE COLOR (Iguales a DayView) ---
const MODALITY_COLORS = {
    'Virtual': '#8b5cf6', // Violeta
    'Presencial': '#10b981', // Verde Esmeralda
    'default': '#6366f1'
};
const CITY_COLOR = '#f59e0b'; // Naranja/Amber

const EventModal = ({ event, onClose }) => {
    const { t, i18n } = useTranslation();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);

    const langKey = i18n.language ? i18n.language.split('-')[0] : 'es';
    const currentLocale = localeMap[langKey] || es;

    // --- HELPER PARA COLORES RGBA ---
    const hexToRgba = (hex, alpha) => {
        if (!hex) return 'rgba(0,0,0,0.1)';
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        return hex;
    };

    useEffect(() => {
        if (event && event.link_registro) {
            QRCode.toDataURL(event.link_registro, {
                errorCorrectionLevel: 'H', type: 'image/png', quality: 0.92, margin: 1,
            }, (err, url) => {
                if (!err) setQrCodeUrl(url);
            });
        }
    }, [event]);

    if (!event) return null;

    const formatTimeAMPM = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hourInt = parseInt(hours, 10);
        const ampm = hourInt >= 12 ? 'PM' : 'AM';
        const displayHour = hourInt % 12 || 12; 
        return `${displayHour}:${minutes} ${ampm}`;
    };

	const tryCopyText = async (text) => {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch (err) { }
		}
		try {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			if (ok) return true;
		} catch (err) { }

		if (window.parent && window.parent !== window) {
			const id = `${Date.now()}_${Math.random().toString(36).slice(2,9)}`;
			return new Promise((resolve) => {
				const onMessage = (ev) => {
					const d = ev.data || {};
					if (d.type === 'IFRAME_COPY_RESPONSE' && d.id === id) {
						window.removeEventListener('message', onMessage);
						resolve(Boolean(d.success));
					}
				};
				window.addEventListener('message', onMessage);
				window.parent.postMessage({ type: 'IFRAME_COPY_TO_CLIPBOARD', id, text }, '*');
				setTimeout(() => {
					window.removeEventListener('message', onMessage);
					resolve(false);
				}, 3000);
			});
		}
		return false;
	};

    const handleShare = async () => {
        // Analytics Tracking
        trackEvent('click.action', {
            click_chapter1: 'calendario_eventos',
            click_chapter2: 'modal_evento',
            click_name: 'compartir_evento',
            event_id: event.id,
            event_title: event.titulo
        });

        const monthMappingData = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
            'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };

        const currentYear = new Date().getFullYear(); 
        const monthIndex = monthMappingData[event.mes.charAt(0).toUpperCase() + event.mes.slice(1).toLowerCase()];
        const eventDateObj = new Date(currentYear, monthIndex, parseInt(event.dia));
        
        const [hours, mins] = event.hora_inicio.split(':');
        eventDateObj.setHours(parseInt(hours), parseInt(mins));

        const now = new Date();
        const diffDays = differenceInDays(eventDateObj, now);
        const diffHours = differenceInHours(eventDateObj, now);
        const diffMinutes = differenceInMinutes(eventDateObj, now);

        let timeMsg = "";
        let headerMsg = t('calendar.dont_miss');

        if (diffMinutes < 0) {
            timeMsg = t('calendar.started');
            headerMsg = t('calendar.live_now');
        } else if (diffMinutes < 60) {
            timeMsg = t('calendar.in_minutes', { count: diffMinutes });
            headerMsg = t('calendar.almost_start');
        } else if (diffHours < 24) {
            timeMsg = t('calendar.today_at', { time: formatTimeAMPM(event.hora_inicio) });
            headerMsg = t('calendar.is_today');
        } else if (diffDays <= 1) {
             timeMsg = t('calendar.tomorrow_text');
             headerMsg = t('calendar.tomorrow');
        } else {
            timeMsg = t('calendar.in_days', { count: diffDays });
            headerMsg = t('calendar.days_left', { count: diffDays });
        }

        const monthTranslated = format(eventDateObj, 'LLLL', { locale: currentLocale });

        const textToShare = `
${headerMsg}
噫 ${event.titulo}
統 ${event.description ? event.description.substring(0, 100) + '...' : t('calendar.default_desc')}
欄 ${event.dia} ${monthTranslated}
蕗 ${formatTimeAMPM(event.hora_inicio)} - ${formatTimeAMPM(event.hora_fin)}
${t('calendar.still_time')}
痩 ${event.link_registro}
        `.trim();

        const ok = await tryCopyText(textToShare);
		if (ok) {
			setCopyFeedback(true);
			setTimeout(() => setCopyFeedback(false), 2000);
		} else {
			setCopyFeedback(false);
			alert(t('calendar.copy_failed'));
		}
    };

    const handleDownloadQR = () => {
        // Analytics Tracking
        trackEvent('click.download', {
            click_chapter1: 'calendario_eventos',
            click_chapter2: 'modal_evento',
            click_name: 'descargar_qr',
            event_id: event.id,
            event_title: event.titulo
        });

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `QR_${event.titulo.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatTimeInfo = (timeStr) => {
        if (!timeStr) return { time: '', period: '' };
        let [hours, minutes] = timeStr.split(':').map(Number);
        const displayPeriod = hours >= 12 ? 'PM' : 'AM';
        let displayHours = hours % 12 || 12;
        return { time: `${displayHours}:${String(minutes).padStart(2, '0')}`, period: displayPeriod };
    };

    const startTime = formatTimeInfo(event.hora_inicio);
    const endTime = formatTimeInfo(event.hora_fin);
    
    const monthMappingData = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    const monthIndex = monthMappingData[event.mes.charAt(0).toUpperCase() + event.mes.slice(1).toLowerCase()];
    const eventDateForRender = new Date(new Date().getFullYear(), monthIndex, 1);
    const monthAbbr = format(eventDateForRender, 'MMM', { locale: currentLocale }).toUpperCase().replace('.', '');

    // --- Lﾃ敵ICA DE COLORES ---
    const isVirtual = event.modalidad === 'Virtual';
    const modalityColor = isVirtual ? MODALITY_COLORS['Virtual'] : MODALITY_COLORS['Presencial'];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/40 transition-opacity duration-300" onClick={onClose}>
            <div className="w-full max-w-sm mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start p-4 border-b border-gray-200">
                    <div className="flex flex-col items-center justify-center bg-gray-100 p-2 rounded-lg mr-4 text-center min-w-[60px]">
                        <span className="text-sm font-bold text-red-600">{monthAbbr}</span>
                        <span className="text-2xl font-bold text-gray-800">{event.dia}</span>
                    </div>
                    <div className="flex-grow">
                        
                        {/* --- NUEVO CONTENEDOR DE BADGES --- */}
                        <div className="flex flex-wrap gap-2 mb-2">
                             {/* Badge Modalidad */}
                             <span 
                                className="inline-block rounded-md text-[10px] font-bold uppercase tracking-wider"
                                style={{ 
                                    backgroundColor: hexToRgba(modalityColor, 0.15), 
                                    color: modalityColor,
                                    padding: '2px 6px'
                                }}
                            >
                                {isVirtual ? t('calendar.online') : t('calendar.presencial')}
                            </span>

                            {/* Badge Ciudad (Solo si no es virtual y hay ciudad) */}
                            {!isVirtual && event.ciudad && (
                                <span 
                                    className="inline-block rounded-md text-[10px] font-bold uppercase tracking-wider"
                                    style={{ 
                                        backgroundColor: hexToRgba(CITY_COLOR, 0.15), 
                                        color: CITY_COLOR,
                                        padding: '2px 6px'
                                    }}
                                >
                                    <i className="fas fa-map-marker-alt mr-1"></i>
                                    {event.ciudad}
                                </span>
                            )}
                        </div>
                        {/* ---------------------------------- */}

                        <p className="text-lg font-bold text-gray-900 leading-snug">{event.titulo}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                        <button
                            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 relative"
                            onClick={handleShare}
                            title={t('calendar.share')}
                        >
                            <i className={`fas ${copyFeedback ? 'fa-check text-green-500' : 'fa-share-alt'}`}></i>
                        </button>
                        <button className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={() => {
                            // Analytics Tracking
                            trackEvent('click.action', {
                                click_chapter1: 'calendario_eventos',
                                click_chapter2: 'modal_evento',
                                click_name: 'cerrar_modal'
                            });
                            onClose();
                        }}>
                            <i className="fas fa-times text-gray-600"></i>
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5">
                    <div className="flex items-center justify-center my-2 bg-gray-50 py-3 rounded-xl">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-gray-800">{startTime.time}</span>
                            <span className="ml-1 text-xs font-bold text-gray-500">{startTime.period}</span>
                        </div>
                        <div className="mx-4 text-gray-300"><i className="fas fa-arrow-right"></i></div>
                        <div className="text-center">
                            <span className="text-2xl font-bold text-gray-800">{endTime.time}</span>
                            <span className="ml-1 text-xs font-bold text-gray-500">{endTime.period}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                        <div className="flex items-start">
                            <i className="fas fa-user-tie w-6 text-center mt-1 mr-2 text-gray-400"></i>
                            <span className="font-medium">{event.organizador}</span>
                        </div>
                        <div className="flex items-start">
                            <i className="fas fa-map-marker-alt w-6 text-center mt-1 mr-2 text-gray-400"></i>
                            <span>{event.lugar}{event.direccion && ` - ${event.direccion}`}</span>
                        </div>
                        {event.description && (
                            <div className="flex items-start mt-2 pt-2 border-t border-gray-100">
                                <i className="fas fa-align-left w-6 text-center mt-1 mr-2 text-gray-400"></i>
                                <p className="text-justify leading-relaxed max-h-40 overflow-y-auto pr-1">{event.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer QR & Action */}
                {event.link_registro && event.link_registro !== 'nan' && (
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-200">
                        {qrCodeUrl && (
                            <div className="flex items-center gap-4 mb-4 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                <img src={qrCodeUrl} alt="QR" className="w-16 h-16" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 mb-1">{t('calendar.scan_mobile')}</p>
                                    <button onClick={handleDownloadQR} className=" cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <i className="fas fa-download"></i> {t('calendar.download_qr')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <a
                            href={event.link_registro}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                // Analytics Tracking
                                trackEvent('click.exit', {
                                    click_chapter1: 'calendario_eventos',
                                    click_chapter2: 'modal_evento',
                                    click_name: 'ir_registro',
                                    event_id: event.id,
                                    event_title: event.titulo
                                });
                            }}
                            className="flex-items-center justify-center w-full px-4 py-3 bg-[#D71820] text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200 flex"
                        >
                            {t('calendar.subscribe_now')}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventModal;