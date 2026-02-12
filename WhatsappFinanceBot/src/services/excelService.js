const ExcelJS = require('exceljs');
const fs = require('fs');
const { MessageMedia } = require('whatsapp-web.js');

async function crearEstadoCuenta(rows, nombreArchivo) {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Estado de Cuenta');

    const headers = [
        'Name',
        'Invoice',
        'E-Invoice No.',
        'Outstanding balance',
        'Billing Date',
        'Due date',
        'Days overdue'
    ];
    ws.addRow(headers);

    // Formato cabecera
    ws.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'd01e26' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // Filas de datos
    rows.forEach(row => {
        ws.addRow([
            row._rawData[2] || '',
            row._rawData[3] || '',
            row._rawData[4] || '',
            row._rawData[9] || '',
            row._rawData[10] || '',
            row._rawData[11] || '',
            row._rawData[12] || ''
        ]);
    });

    // Ajuste de columnas
    ws.columns.forEach(col => {
        let maxLen = 0;
        col.eachCell({ includeEmpty: true }, cell => {
            const len = cell.value?.toString().length || 0;
            if (len > maxLen) maxLen = len;
        });
        col.width = maxLen < 15 ? 15 : maxLen + 2;
    });

    const filePath = `./estado_cuenta_${nombreArchivo}.xlsx`;
    await workbook.xlsx.writeFile(filePath);
    const buffer = fs.readFileSync(filePath);
    return { buffer, filePath };
}

async function enviarEstadoCuenta(client, chatId, rows, nombreArchivo) {
    try {
        const { buffer, filePath } = await crearEstadoCuenta(rows, nombreArchivo);
        const media = new MessageMedia(
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer.toString('base64'),
            filePath.split('/').pop()
        );
        await client.sendMessage(chatId, media, { caption: '*¡Listo! Aquí está tu estado de cuenta 😊.*' });
        fs.unlinkSync(filePath);
    } catch (err) {
        console.error('Error al enviar estado de cuenta:', err);
        await client.sendMessage(chatId, 'Error generando o enviando tu estado de cuenta. Intenta más tarde.');
    }
}

module.exports = { enviarEstadoCuenta };