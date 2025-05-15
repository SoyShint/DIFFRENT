const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 0; // 0 asigna un puerto automáticamente

const KICK_CLIENT_ID = '01JVARVDGZZ024D2KSBJV5KBDQ';
const KICK_CLIENT_SECRET = 'd1b57b2d5d3c8d5ed61d7b7fbe829ef777357658a1a883b317f36595cce16792';
let KICK_REDIRECT_URI;

app.use(cors());
app.use(express.json());

app.get('/auth/kick', (req, res) => {
    const authUrl = `https://kick.com/oauth/authorize?client_id=${KICK_CLIENT_ID}&redirect_uri=${KICK_REDIRECT_URI}&response_type=code`;
    res.redirect(authUrl);
});

app.get('/auth/kick/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://kick.com/oauth/token', {
            client_id: KICK_CLIENT_ID,
            client_secret: KICK_CLIENT_SECRET,
            code,
            redirect_uri: KICK_REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const { access_token } = response.data;
        res.json({ access_token });
    } catch (error) {
        console.error('Error al intercambiar el código por un token de acceso:', error);
        res.status(500).json({ error: 'Error al autenticar con Kick' });
    }
});

const server = app.listen(PORT, () => {
    const port = server.address().port;
    KICK_REDIRECT_URI = `http://localhost:${port}/auth/kick/callback`;
    console.log(`Servidor escuchando en el puerto ${port}`);
    console.log(`URL de redirección: ${KICK_REDIRECT_URI}`);
});
