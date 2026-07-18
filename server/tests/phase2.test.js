import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { resetStore } from '../src/data/store.js';

test.beforeEach(() => {
  resetStore();
});

test('budget transaction creation recalculates variance and status', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Phase Two Admin',
      email: 'phase2@example.com',
      password: 'SecurePass123!',
      role: 'admin',
    });

  const token = registerRes.body.data.accessToken;

  const budgetRes = await request(app)
    .post('/api/budget-lines')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Concrete',
      plannedAmount: 1000,
      projectId: 'project-1',
      description: 'Concrete package',
    });

  const lineId = budgetRes.body.data.id;

  const transactionRes = await request(app)
    .post(`/api/budget-lines/${lineId}/transactions`)
    .set('Authorization', `Bearer ${token}`)
    .send({ amount: 250, type: 'spend', description: 'Delivered concrete' });

  assert.equal(transactionRes.status, 201);
  assert.equal(transactionRes.body.data.spentAmount, 250);
  assert.equal(transactionRes.body.data.variance, 750);
  assert.equal(transactionRes.body.data.status, 'at_risk');
});

test('resource assignment rejects overlapping dates with a conflict payload', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Phase Two PM',
      email: 'pm@example.com',
      password: 'SecurePass123!',
      role: 'pm',
    });

  const token = registerRes.body.data.accessToken;

  const resourceRes = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Excavator', type: 'equipment' });

  const resourceId = resourceRes.body.data.id;

  await request(app)
    .post('/api/resource-assignments')
    .set('Authorization', `Bearer ${token}`)
    .send({
      resourceId,
      projectId: 'project-1',
      startDate: '2026-08-01',
      endDate: '2026-08-05',
      role: 'operator',
    });

  const conflictRes = await request(app)
    .post('/api/resource-assignments')
    .set('Authorization', `Bearer ${token}`)
    .send({
      resourceId,
      projectId: 'project-2',
      startDate: '2026-08-03',
      endDate: '2026-08-06',
      role: 'operator',
    });

  assert.equal(conflictRes.status, 409);
  assert.ok(conflictRes.body.data.conflict);
});

test('material consumption decrements stock and records a budget transaction', async () => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Phase Two Supervisor',
      email: 'supervisor@example.com',
      password: 'SecurePass123!',
      role: 'supervisor',
    });

  const token = registerRes.body.data.accessToken;

  const budgetRes = await request(app)
    .post('/api/budget-lines')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Steel',
      plannedAmount: 5000,
      projectId: 'project-1',
      description: 'Steel purchase',
    });

  const materialRes = await request(app)
    .post('/api/materials')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Rebar', quantityOnHand: 20, reorderThreshold: 5, unit: 'tons', budgetLineId: budgetRes.body.data.id });

  const consumeRes = await request(app)
    .post(`/api/materials/${materialRes.body.data.id}/consume`)
    .set('Authorization', `Bearer ${token}`)
    .send({ quantity: 3, budgetLineId: budgetRes.body.data.id, notes: 'Site use' });

  assert.equal(consumeRes.status, 201);
  assert.equal(consumeRes.body.data.material.quantityOnHand, 17);
  assert.equal(consumeRes.body.data.budgetTransaction.amount, 3);
});
