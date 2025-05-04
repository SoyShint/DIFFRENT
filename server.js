const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

const clientId = 'TU_CLIENT_ID';
const clientSecret = 'TU_CLIENT_SECRET';
const redirectUri = 'http://localhost:3000/callback';

let votes = { 1: 0, 2: 0, 3: 0 };
let userVotes = {};

app.post('/auth', async (req, res) => {
    const { code } = req.body;

    const response = await fetch('https://kick.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        const userInfo = await fetch('https://api.kick.com/v1/user', {
            headers: { Authorization: `Bearer ${data.access_token}` },
        });

        if (userInfo.ok) {
            const user = await userInfo.json();
            res.json({ username: user.username });
        } else {
            res.status(500).send('Error al obtener información del usuario');
        }
    } else {
        res.status(500).send('Error al intercambiar el código');
    }
});

app.post('/vote', (req, res) => {
    const { username, candidateId } = req.body;

    if (userVotes[username]) {
        return res.status(400).send('Ya has votado');
    }

    votes[candidateId]++;
    userVotes[username] = candidateId;
    res.send('Voto registrado');
});

app.get('/results', (req, res) => {
    res.json(votes);
});

app.post('/reset', (req, res) => {
    votes = { 1: 0, 2: 0, 3: 0 };
    userVotes = {};
    res.send('Votos reiniciados');
});

app.listen(3000, () => console.log('Servidor escuchando en http://localhost:3000'));
