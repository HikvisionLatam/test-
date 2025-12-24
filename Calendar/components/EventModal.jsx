import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

const EventModal = ({ event, onClose }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);

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

    // helper de copia robusta (local en este componente)
	const tryCopyText = async (text) => {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				await navigator.clipboard.writeText(text);
				return true;
			} catch (err) { /* fallback */ }
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
		} catch (err) { /* fallback */ }

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
        // Mapeo manual de meses para construir la fecha
        const monthMapping = {
            'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
            'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
        };

        const currentYear = new Date().getFullYear(); 
        const monthIndex = monthMapping[event.mes.charAt(0).toUpperCase() + event.mes.slice(1).toLowerCase()];
        const eventDateObj = new Date(currentYear, monthIndex, parseInt(event.dia));
        
        const [hours, mins] = event.hora_inicio.split(':');
        eventDateObj.setHours(parseInt(hours), parseInt(mins));

        const now = new Date();
        const diffDays = differenceInDays(eventDateObj, now);
        const diffHours = differenceInHours(eventDateObj, now);
        const diffMinutes = differenceInMinutes(eventDateObj, now);

        let timeMsg = "";
        let headerMsg = "✨ ¡No te lo pierdas! ✨";

        if (diffMinutes < 0) {
            timeMsg = "¡El evento ya ha comenzado!";
            headerMsg = "🚨 ¡EN VIVO AHORA! 🚨";
        } else if (diffMinutes < 60) {
            timeMsg = `en ${diffMinutes} minutos`;
            headerMsg = "🚨✨ ¡Ya casi comienza! ✨🚨";
        } else if (diffHours < 24) {
            timeMsg = `hoy a las ${formatTimeAMPM(event.hora_inicio)}`;
            headerMsg = "📅 ¡Es hoy, es hoy! 🚀";
        } else if (diffDays <= 1) {
             timeMsg = "mañana";
             headerMsg = "⏰ ¡Prepárate para mañana! ⏰";
        } else {
            timeMsg = `en ${diffDays} días`;
            headerMsg = `🗓 ¡Faltan ${diffDays} días! 🗓`;
        }

        const textToShare = `
${headerMsg}
🚀 ${event.titulo}
🔍 ${event.description ? event.description.substring(0, 100) + '...' : 'Innovación y tecnología para ti.'}
🗓 ${event.dia} de ${event.mes}
🕙 ${formatTimeAMPM(event.hora_inicio)} - ${formatTimeAMPM(event.hora_fin)}
✅ ¡Aún estás a tiempo de registrarte!
👉 ${event.link_registro}
        `.trim();

        const ok = await tryCopyText(textToShare);
		if (ok) {
			setCopyFeedback(true);
			setTimeout(() => setCopyFeedback(false), 2000);
		} else {
			// fallback visual si no se pudo
			setCopyFeedback(false);
			alert('No fue posible copiar automáticamente. Seleccione y copie manualmente el texto del enlace.');
		}
    };

    const handleDownloadQR = () => {
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm bg-black/40 transition-opacity duration-300" onClick={onClose}>
            <div className="w-full max-w-sm mx-4 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start p-4 border-b border-gray-200">
                    <div className="flex flex-col items-center justify-center bg-gray-100 p-2 rounded-lg mr-4 text-center min-w-[60px]">
                        <span className="text-sm font-bold text-red-600">{event.mes?.substring(0, 3).toUpperCase()}</span>
                        <span className="text-2xl font-bold text-gray-800">{event.dia}</span>
                    </div>
                    <div className="flex-grow">
                        <p className='text-xs font-semibold uppercase text-gray-500 tracking-wider'>{event.modalidad}</p>
                        <p className="text-lg font-bold text-gray-900 leading-snug">{event.titulo}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                        {/* Botón Compartir Nuevo */}
                        <button
                            className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 relative"
                            onClick={handleShare}
                            title="Copiar información"
                        >
                            <i className={`fas ${copyFeedback ? 'fa-check text-green-500' : 'fa-share-alt'}`}></i>
                        </button>
                        <button className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onClose}>
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
                                <p className="text-justify leading-relaxed">{event.description}</p>
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
                                    <p className="text-xs text-gray-500 mb-1">Escanea para acceder desde tu móvil</p>
                                    <button onClick={handleDownloadQR} className=" cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <i className="fas fa-download"></i> Descargar QR
                                    </button>
                                </div>
                            </div>
                        )}
                        <a
                            href={event.link_registro}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-4 py-3 bg-[#D71820] text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            Inscribirse Ahora
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventModal;