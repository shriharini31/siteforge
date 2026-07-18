import request from 'supertest';
import app from '../src/app.js';

describe('Auth register/login flow', () => {
  test('register -> login -> refresh', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Password123!',
        role: 'client-viewer',
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.error).toBeNull();
    expect(registerRes.body.data.user.email).toBe('testuser@example.com');
    expect(registerRes.headers['set-cookie'] && registerRes.headers['set-cookie'][0]).toEqual(expect.stringContaining('refreshToken='));

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.error).toBeNull();
    expect(loginRes.body.data.accessToken).toBeDefined();
    expect(loginRes.headers['set-cookie'] && loginRes.headers['set-cookie'][0]).toEqual(expect.stringContaining('refreshToken='));

    const refreshCookie = loginRes.headers['set-cookie'][0].split(';')[0];

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', refreshCookie);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.error).toBeNull();
    expect(refreshRes.body.data.accessToken).toBeDefined();
  });

  test('root route returns ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
