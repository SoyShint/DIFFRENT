
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  const params = new URLSearchParams(event.queryStringParameters);
  const code = params.get("code");

  if (!code) {
    return {
      statusCode: 400,
      body: "Missing code parameter."
    };
  }

  const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
  const REDIRECT_URI = "https://diffrent.netlify.app/callback";

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "identify"
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return {
        statusCode: 400,
        body: JSON.stringify(tokenData)
      };
    }

    // Step 2: Fetch user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();

    // Redirect to welcome page with user data in query (could be improved with sessions)
    const redirectTo = `/welcome.html?username=${encodeURIComponent(userData.username)}#${userData.discriminator}`;
    return {
      statusCode: 302,
      headers: {
        Location: redirectTo
      }
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "Internal Server Error: " + err.message
    };
  }
};
