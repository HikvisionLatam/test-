const { JWT } = require('google-auth-library');
const creds = require('../../credentials.json');

function getServiceAccountAuth() {
    return new JWT({
        email: creds.client_email,
        key: creds.private_key.replace(/\\n/g, '\n'),
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
        ],
    });
}

module.exports = { getServiceAccountAuth };