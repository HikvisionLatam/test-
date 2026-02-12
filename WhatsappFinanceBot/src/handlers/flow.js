// src/handlers/flow.js
const path = require('path');
const fs = require('fs');
const { Client, MessageMedia } = require('whatsapp-web.js');
const { loadSheet, buscarEnGoogleSheets } = require('../services/googleSheets');
const { enviarEstadoCuenta } = require('../services/excelService');
const registrarConversacion = require('./registrarConversacion');
const { timeouts, clearTimeouts } = require('../utils/timeouts');
const { ADMIN_NUMBERS, REGION_ADMIN_MAP, REGIONES } = require('../config');

const conversationStates = {};
const userData = {};
const messageCounters = {};

async function handleMessage(client, msg) {
    const from = msg.from;
    const body = msg.body.trim();
    const numero = from.replace(/@c\.us$/, '');

    // Contador de mensajes
    if (!messageCounters[from]) messageCounters[from] = 0;
    messageCounters[from]++;

    // Nuevo chat o reinicio → saludo + menú
    if (!conversationStates[from] || conversationStates[from] === 'ended') {
        conversationStates[from] = 'menu_inicial';
        clearTimeouts(from);
        // preservamos datos previos si existen, o inicializamos intentos
        userData[from] = userData[from] || { nitAttempts: 0, codeAttempts: 0 };

        // Mensaje de bienvenida (sin imagen)
        await client.sendMessage(from, '¡Hola! 👋 Gracias por contactarte con finanzas. Soy _*Zoe*_ ✨, tu asistente virtual especializado en agilizar y facilitar todos tus trámites. 📑💬');

        // Menú inicial
        await client.sendMessage(
            from,
            '✨ *¿Qué deseas hacer hoy?* ✨\n\n *1.* 📄  Descargar tu estado de cuenta.  \n *2.*  🛠️ Realizar otra solicitud.   \n\n 👉 Por favor, responde con el *número* correspondiente a tu elección.'
        );
        timeouts[from] = {
            recordatorio: setTimeout(() => remindInactive(client, from), 2400000),
        };
        return;
    }

    switch (conversationStates[from]) {
        // -------------------
        case 'menu_inicial':
            clearTimeouts(from);
            if (body === '1') {
                const ud = userData[from];
                if (ud.nit && ud.codigo) {
                    // Si ya validó antes, reenvío directo
                    const sheet = await loadSheet(process.env.GOOGLE_SHEET_ID);
                    const rows = (await sheet.getRows()).filter(
                        r => r._rawData[0] === ud.nit && r._rawData[1] === ud.codigo
                    );
                    await enviarEstadoCuenta(client, from, rows, sanitizeFileName(ud.nombre));
                    conversationStates[from] = 'post_estado';
                    await client.sendMessage(from, '*¿Necesitas algo más?* 😊\n\n *1.* Sí, necesito ayuda adicional.\n *2.* No, eso es todo. ¡Gracias! \n\n 👉 Por favor, responde con el *número* correspondiente a tu elección.');
                } else {
                    // Primera vez validando estado de cuenta
                    conversationStates[from] = 'esperando_nit';
                    userData[from].nitAttempts = 0;
                    await client.sendMessage(from, '📝 Por favor, ingresa tu _*NIT*_ sin puntos ni espacios y sin digito de verificación para continuar. \n\n *Ejemplo:*  `123456789`');
                }
            } else if (body === '2') {
                conversationStates[from] = 'seleccionando_region';
                await client.sendMessage(from, buildRegionMenu());
            } else {
                await client.sendMessage(from, '⚠️ Opción no válida. \n\n Por favor responde únicamente con *1* o *2* según tu elección.');
            }
            break;

        // -------------------
        case 'esperando_nit':
            clearTimeouts(from);
            await handleNitFlow(client, from, body, numero, 'esperando_codigo');
            break;

        case 'esperando_codigo':
            clearTimeouts(from);
            await handleCodigoFlow(client, from, body, numero, async () => {
                const ud = userData[from];
                const sheet = await loadSheet(process.env.GOOGLE_SHEET_ID);
                const rows = (await sheet.getRows()).filter(
                    r => r._rawData[0] === ud.nit && r._rawData[1] === ud.codigo
                );
                await enviarEstadoCuenta(client, from, rows, sanitizeFileName(ud.nombre));
                conversationStates[from] = 'post_estado';
                await client.sendMessage(from, '*¿Necesitas algo más?* 😊\n\n *1.* Sí, necesito ayuda adicional.\n *2.* No, eso es todo. ¡Gracias! \n\n 👉 Por favor, responde con el *número* correspondiente a tu elección.');
            });
            break;

        // -------------------
        case 'post_estado':
            clearTimeouts(from);

            if (body === '1') {
                // Vuelve al menú inicial conservando ud.nit/ud.codigo
                conversationStates[from] = 'menu_inicial';
                await client.sendMessage(
                    from,
                    '✨ *¿Qué deseas hacer ahora?* ✨\n\n' +
                    ' *1.* 📄  Descargar tu estado de cuenta.\n' +
                    ' *2.*  🛠️ Realizar otra solicitud.\n\n' +
                    '👉 Por favor, responde con el *número* correspondiente a tu elección.'
                );
            }
            else if (body === '2') {
                // Cerrar chat
                await client.sendMessage(
                    from,
                    '🌟 *¡Gracias por utilizar nuestros servicios!* 😊 \n\n ¡Hasta pronto! 👋✨'
                );
                // Enviar sticker de despedida (puedes cambiar el archivo por el que desees)
                const stickerPath = path.resolve(__dirname, '../assets/byeSticker.webp'); 
                try {
                    const sticker = MessageMedia.fromFilePath(stickerPath);
                    await client.sendMessage(from, sticker, { sendMediaAsSticker: true });
                } catch {
                    // Si falla, no envía sticker
                }
                await registrarConversacion(numero, messageCounters[from]);
                delete messageCounters[from];
                conversationStates[from] = 'ended';
            }
            else {
                // Opción inválida: repetir validación sin cerrar
                await client.sendMessage(
                    from,
                    '⚠️ Opción no válida.\n\nPor favor responde únicamente con *1* o *2* según tu elección.'
                );
                // conversationStates[from] queda en 'post_estado'
            }
            break;


        // -------------------
        case 'seleccionando_region':
            clearTimeouts(from);
            {
                const idx = parseInt(body, 10) - 1;
                if (idx >= 0 && idx < REGIONES.length) {
                    userData[from].region = REGIONES[idx].toLowerCase();
                    const ud = userData[from];
                    if (ud.nit && ud.codigo) {
                        // Ya tiene NIT/Código válidos → directo a solicitud
                        conversationStates[from] = 'esperando_solicitud';
                        await client.sendMessage(from, '📝 Ahora, por favor, *escribe* claramente tu *solicitud.* \n\n Esto nos permitirá ayudarte rápidamente y darte una respuesta precisa. ¡Gracias! 🚀');
                    } else {
                        // Necesita validar NIT/Código
                        conversationStates[from] = 'esperando_nit_solicitud';
                        ud.nitAttempts = 0;
                        await client.sendMessage(from, '📝 Por favor, ingresa tu _*NIT*_ sin puntos ni espacios y sin digito de verificación para continuar. \n\n *Ejemplo:*  `123456789`');
                    }
                } else {
                    await client.sendMessage(from, '⚠️ Selección inválida. Por favor, elige una región válida del menú para continuar. 🇨🇴🌎 \n\n ¡Gracias por tu cooperación! 😊');
                }
            }
            break;

        // -------------------
        case 'esperando_nit_solicitud':
            clearTimeouts(from);
            await handleNitFlow(client, from, body, numero, 'esperando_codigo_solicitud');
            break;

        case 'esperando_codigo_solicitud':
            clearTimeouts(from);
            await handleCodigoFlow(client, from, body, numero, () => {
                conversationStates[from] = 'esperando_solicitud';
                client.sendMessage(from, '📝 Ahora, por favor, *escribe* claramente tu *solicitud.* \n\n Esto nos permitirá ayudarte rápidamente y darte una respuesta precisa. ¡Gracias! 🚀');
            });
            break;

        // -------------------
        case 'esperando_solicitud':
            clearTimeouts(from);
            {
                const ud = userData[from];
                ud.solicitud = body;
                const admin = ADMIN_NUMBERS[REGION_ADMIN_MAP[ud.region]] || ADMIN_NUMBERS[0];

                const msgAdmin = `
🚀 *¡Nueva solicitud recibida!* 📩

👤 *Nombre:* ${ud.nombre}
🆔 *NIT:* ${ud.nit}
🔑 *Código:* ${ud.codigo}
🌎 *Región:* ${ud.region.charAt(0).toUpperCase() + ud.region.slice(1)}

📝 *Solicitud:*
\`\`\`
${ud.solicitud}
\`\`\``;


                // Enviar al admin
                await client.sendMessage(admin, msgAdmin);

                // Tarjeta de contacto
                try {
                    const contactCard = await msg.getContact();
                    await client.sendMessage(admin, contactCard, {
                        caption: '*Tarjeta de contacto del usuario*'
                    });
                } catch {
                    await client.sendMessage(admin, `*Contacto del usuario:* +${numero}`);
                }

                // Confirmación al usuario y fin de chat
                await client.sendMessage(from, '📩 *¡Recibido!* Tu solicitud ha sido registrada exitosamente. Pronto nos pondremos en contacto contigo. 🚀😊\n\n🌟 *¡Gracias por utilizar nuestros servicios!*');
                // Enviar sticker de despedida (puedes cambiar el archivo por el que desees)
                const stickerPath = path.resolve(__dirname, '../assets/byeSticker.webp');
                try {
                    const sticker = MessageMedia.fromFilePath(stickerPath);
                    await client.sendMessage(from, sticker, { sendMediaAsSticker: true });
                } catch {
                    // Si falla, no envía sticker
                }
                await registrarConversacion(numero, messageCounters[from]);
                delete messageCounters[from];
                conversationStates[from] = 'ended';
            }
            break;
    }
}

// — Helpers —

function buildRegionMenu() {
    return '🌎🇨🇴 *Selecciona tu región:*\n\n' +
        REGIONES.map((r, i) => `🔹 *${i + 1}*. ${r}`).join('\n') + '\n\n 👉 Por favor, responde con el *número* correspondiente a tu elección.';
}


function remindInactive(client, from) {
    if (!conversationStates[from] || conversationStates[from] === 'ended') return;
    client.sendMessage(from, '👋✨ *¿Sigues ahí?* Si necesitas ayuda o deseas continuar con otra consulta, ¡aquí estoy para ayudarte! 😊');
    timeouts[from].final = setTimeout(() => endInactive(client, from), 2400000);
}

function endInactive(client, from) {
    if (conversationStates[from] !== 'ended') {
        client.sendMessage(from, '⏰ Chat finalizado por inactividad.\n\n\  Si necesitas ayuda nuevamente, ¡estaré encantado de atenderte! 😊✨ \n\n ¡Hasta pronto! 👋');
        conversationStates[from] = 'ended';
    }
}

function endWithError(client, from, numero) {
    client.sendMessage(from, 'Error interno. Intenta otra vez.');
    conversationStates[from] = 'ended';
    registrarConversacion(numero, messageCounters[from]);
    delete messageCounters[from];
}

function sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function handleNitFlow(client, from, nit, numero, nextState) {
    const ud = userData[from];
    ud.nitAttempts++;
    let res;
    try { res = await buscarEnGoogleSheets(nit); }
    catch (e) { return endWithError(client, from, numero); }

    if (!res) {
        const left = 3 - ud.nitAttempts;
        if (left > 0) {
            await client.sendMessage(from, `⚠️ El NIT: *${nit}* es incorrecto. Por favor, verifica e inténtalo nuevamente. \n\n  Te quedan ${left} intento(s). 🔑🕒 \n\n  ¡Gracias por tu cooperación! 😊`);
        } else {
            await client.sendMessage(from, '🚫 Has excedido los 3 intentos permitidos \n\n 🔄 Reiniciando chat... Por favor, vuelve a empezar cuando estés listo.\n\n ¡Gracias por tu comprensión! 😊✨');
            conversationStates[from] = 'ended';
        }
        return;
    }

    // NIT válido
    ud.nit = nit;
    ud.nombre = res.nombre;
    ud.codeAttempts = 0;
    conversationStates[from] = nextState;
    await client.sendMessage(from, `👋 ¡Hola, *${res.nombre}* Por favor, ingresa tu *código de cliente* para continuar. \n\n ¡Gracias! 🔑😊`);
}

async function handleCodigoFlow(client, from, codigo, numero, onSuccess) {
    const ud = userData[from];
    ud.codeAttempts++;
    let res;
    try { res = await buscarEnGoogleSheets(ud.nit, codigo); }
    catch (e) { return endWithError(client, from, numero); }

    if (!res) {
        const left = 3 - ud.codeAttempts;
        if (left > 0) {
            await client.sendMessage(from, `⚠️ El código ${codigo} es incorrecto. Por favor, verifica e inténtalo nuevamente. \n\n  Te quedan ${left} intento(s). 🔑🕒 \n\n  ¡Gracias por tu cooperación! 😊`);
        } else {
            await client.sendMessage(from, '🚫 Has excedido los 3 intentos permitidos \n\n 🔄 Reiniciando chat... Por favor, vuelve a empezar cuando estés listo.\n\n ¡Gracias por tu comprensión! 😊✨');
            conversationStates[from] = 'ended';
        }
        return;
    }

    // Código válido
    ud.codigo = codigo;
    await onSuccess();
}

module.exports = handleMessage;
