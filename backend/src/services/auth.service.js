import crypto from 'node:crypto';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const httpError = (status, message) => Object.assign(new Error(message), { status });

export async function login({ email, password }) {
  if (!email) throw httpError(400, 'Email is required');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw httpError(401, 'Invalid email or password');
  }
  return { token: signToken({ id: user.id }), user: { id: user.id, email, name: user.name } };
}

export async function signup({ email, password, name }) {
  if (!email) throw httpError(400, 'Email is required');
  const userExist = await prisma.user.findUnique({ where: { email } });
  if (userExist) {
    throw httpError(409, 'Email already registered');
  }
  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password) },
  });
  return { token: signToken({ id: user.id }), user: { id: user.id, email, name } };
}

export function getGoogleAuthUrl() {
  if (!env.googleClientId) {
    throw httpError(500, 'Google Client ID is not configured on the server');
  }
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: env.googleRedirectUri,
    client_id: env.googleClientId,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'select_account',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function loginWithGoogleCode(code) {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw httpError(500, 'Google OAuth credentials are not configured on the server');
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: env.googleRedirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw httpError(401, tokenData.error_description || 'Failed to exchange Google authorization code');
  }

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await userRes.json();

  if (!userRes.ok || !profile.email) {
    throw httpError(401, 'Failed to retrieve profile from Google');
  }

  return findOrCreateOAuthUser({
    email: profile.email,
    name: profile.name || profile.email.split('@')[0],
  });
}

export async function loginWithGoogleCredential(credential) {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const payload = await res.json();

  if (!res.ok || !payload.email || (env.googleClientId && payload.aud !== env.googleClientId)) {
    throw httpError(401, payload.error_description || 'Invalid Google credential token');
  }

  return findOrCreateOAuthUser({
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
  });
}

async function findOrCreateOAuthUser({ email, name }) {
  if (!email) throw httpError(400, 'Email is required from OAuth provider');
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const randomPassword = crypto.randomUUID();
    user = await prisma.user.create({
      data: {
        email,
        name: name || 'Google User',
        passwordHash: await hashPassword(randomPassword),
      },
    });
  }

  return {
    token: signToken({ id: user.id }),
    user: { id: user.id, email: user.email, name: user.name },
  };
}
