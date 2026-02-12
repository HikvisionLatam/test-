require('dotenv').config();


module.exports = {
    // IDs y timeouts
    GOOGLE_SHEET_INFO_ID: process.env.GOOGLE_SHEET_INFO_ID,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
    AUTH_TIMEOUT_MS: 60000,
    QR_TIMEOUT_MS: 30000,

    // Administradores y regiones
    ADMIN_NUMBERS: [
        '573223616400@c.us',
        '573227668438@c.us'
    ],
    REGION_ADMIN_MAP: {
        andina: 0,
        bogota: 0,
        cali: 1,
        'eje cafetero': 1,
        costa: 1,
        medellin: 0,
        santander: 1,
    },
    REGIONES: [
        'Andina',
        'Bogotá',
        'Medellín',
        'Cali',
        'Eje Cafetero',
        'Costa',
        'Santander'
    ],
};