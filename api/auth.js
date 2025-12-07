import express from "express";
import { AuthorizationCode } from "simple-oauth2";

const app = express();

const client = new AuthorizationCode({
  client: {
    id: process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://github.com",
    tokenPath: "/login/oauth/access_token",
    authorizePath: "/login/oauth/authorize",
  },
});

const redirectUri = process.env.REDIRECT_URL; // e.g., https://<your-vercel>.vercel.app/api/auth/callback
const scope = "repo";

app.get("/api/auth", (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: redirectUri,
    scope,
    state: "decap",
  });
  res.redirect(authorizationUri);
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const tokenParams = { code, redirect_uri: redirectUri };
    const accessToken = await client.getToken(tokenParams);
    res.json({ token: accessToken.token.access_token });
  } catch (e) {
    res.status(500).json({ error: "OAuth error", details: e.toString() });
  }
});

export default app;
