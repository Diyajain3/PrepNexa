import { env } from '../config/env.js';
import * as authService from '../services/auth.service.js';

export async function signup(req, res) {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const result = await authService.login(req.body);
  res.json(result);
}

export function googleRedirect(req, res) {
  const url = authService.getGoogleAuthUrl();
  res.redirect(url);
}

export async function googleCallback(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`${env.clientUrl}/login?error=${encodeURIComponent(error || 'Google login cancelled')}`);
  }

  try {
    const result = await authService.loginWithGoogleCode(String(code));
    const token = encodeURIComponent(result.token);
    const user = encodeURIComponent(JSON.stringify(result.user));
    return res.redirect(`${env.clientUrl}/login?token=${token}&user=${user}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    let message = err.message || 'Failed to authenticate with Google';
    if (message.includes('prisma') || err.name === 'PrismaClientKnownRequestError' || message.includes('ECONNREFUSED')) {
      message = 'Cannot connect to the database. Please make sure PostgreSQL is running.';
    }
    return res.redirect(`${env.clientUrl}/login?error=${encodeURIComponent(message)}`);
  }
}

export async function googleToken(req, res) {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: 'Google credential token is required' });
  }
  const result = await authService.loginWithGoogleCredential(credential);
  res.json(result);
}
