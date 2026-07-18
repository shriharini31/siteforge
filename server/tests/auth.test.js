import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('register creates a user and returns an auth envelope', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Alice Builder',
      email: 'alice@example.com',
      password: 'SecurePass123!',
      role: 'client-viewer',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.error, null);
  assert.equal(res.body.data.user.email, 'alice@example.com');
  assert.equal(res.body.data.user.role, 'client-viewer');
  assert.ok(res.headers['set-cookie'][0].includes('refreshToken='));
});

test('login issues access and refresh tokens', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'SecurePass123!' });

  assert.equal(res.status, 200);
  assert.equal(res.body.error, null);
  assert.ok(res.body.data.accessToken);
  assert.ok(res.headers['set-cookie'][0].includes('refreshToken='));
});

test('refresh endpoint returns a new access token for a valid refresh cookie', async () => {
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@example.com', password: 'SecurePass123!' });

  const refreshCookie = loginRes.headers['set-cookie'][0].split(';')[0];

  const res = await request(app)
    .post('/api/auth/refresh')
    .set('Cookie', refreshCookie);

  assert.equal(res.status, 200);
  assert.equal(res.body.error, null);
  assert.ok(res.body.data.accessToken);
});

test('root route returns a JSON API greeting', async () => {
  const res = await request(app).get('/');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});
