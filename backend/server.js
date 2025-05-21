require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send("No se proporcionó el código.");

  try {
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      scope: 'identify'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenRes.data.access_token}`
      }
    });

    const user = userRes.data;

    res.send(`
      <h1>Bienvenido, ${user.username}#${user.discriminator}</h1>
      <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" width="100"/>
    `);
  } catch (err) {
    console.error(err);
    res.send("Error durante la autenticación.");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
