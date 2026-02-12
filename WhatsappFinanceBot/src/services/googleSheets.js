const { GoogleSpreadsheet } = require('google-spreadsheet');
const { getServiceAccountAuth } = require('./auth');
const { GOOGLE_SHEET_ID } = require('../config');

async function loadSheet(docId) {
    const auth = getServiceAccountAuth();
    const doc = new GoogleSpreadsheet(docId, auth);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
}

// Busca nombre por NIT y opcional código
async function buscarEnGoogleSheets(nit, codigo = null) {
    const sheet = await loadSheet(process.env.GOOGLE_SHEET_ID);
    const rows = await sheet.getRows();

    const filasNit = rows.filter(row =>
        row._rawData[0]?.toString().trim() === nit.toString().trim()
    );
    if (!filasNit.length) return null;

    if (!codigo) {
        return { nombre: filasNit[0]._rawData[2]?.toString().trim() || '' };
    }

    const fila = filasNit.find(row =>
        row._rawData[1]?.toString().trim() === codigo.toString().trim()
    );
    if (!fila) return null;
    return { nombre: fila._rawData[2]?.toString().trim() || '' };
}

module.exports = {
  loadSheet,
  buscarEnGoogleSheets
};