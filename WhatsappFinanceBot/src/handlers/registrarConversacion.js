const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getServiceAccountAuth } = require('../services/auth');
const { GOOGLE_SHEET_INFO_ID } = require('../config');

async function registrarConversacion(numero, cantidadMensajes) {
    try {
        const auth = getServiceAccountAuth();
        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_INFO_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const now = new Date();
        const fechaHora = now.toISOString().replace('T', ' ').slice(0, 16);
        await sheet.addRow({
            Numero: numero,
            'Intentos hasta la solución': cantidadMensajes,
            'Horas de Inicio': fechaHora
        });
    } catch (err) {
        console.error('Error registrando conversación:', err);
    }
}

module.exports = registrarConversacion;