const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { AUTH_TIMEOUT_MS, QR_TIMEOUT_MS } = require('./config');
const handleMessage = require('./handlers/flow');

const client = new Client({
    puppeteer: { headless: true, args: ['--no-sandbox'] },
    authStrategy: new LocalAuth({ clientId: 'FinanceBot' }),
    authTimeoutMs: AUTH_TIMEOUT_MS,
    qrTimeout: QR_TIMEOUT_MS,
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('Client is ready!'));
client.on('authenticated', () => console.log('Authenticated'));
client.on('auth_failure', msg => console.error('Auth failure', msg));
client.on('message', msg => handleMessage(client, msg));

client.initialize();