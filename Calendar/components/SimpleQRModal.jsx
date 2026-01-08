import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';

const SimpleQRModal = ({ link, title, onClose }) => {
    const { t } = useTranslation();
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (link) {
            QRCode.toDataURL(link, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                quality: 0.92,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, (err, url) => {
                if (!err) setQrCodeUrl(url);
            });
        }
    }, [link]);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = qrCodeUrl;
        a.download = `QR-${title.replace(/\s+/g, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/30 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col items-center animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{t('calendar.scan_register')}</h3>
                
                {qrCodeUrl ? (
                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner mb-4">
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 object-contain" />
                    </div>
                ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl mb-4">
                        <span className="text-gray-400">{t('calendar.generating')}</span>
                    </div>
                )}

                <div className="flex gap-3 w-full">
                    <button 
                        onClick={handleDownload}
                        className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        <i className="fas fa-download mr-2"></i> {t('calendar.download')}
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        {t('calendar.close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimpleQRModal;