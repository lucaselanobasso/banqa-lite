const { test, expect } = require('@playwright/test');
const crypto = require('node:crypto');

function makeEmail() {
  return `user-${crypto.randomBytes(4).toString('hex')}@example.com`;
}

async function registerUser(request, overrides = {}) {
  const email = overrides.email || makeEmail();
  const payload = {
    fullName: overrides.fullName || 'Usuário Teste',
    email,
    password: overrides.password || 'senha123',
  };

  const response = await request.post('/api/register', { data: payload });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return { response, email, payload, body };
}

async function loginUser(request, email, password = 'senha123') {
  const response = await request.post('/api/login', {
    data: {
      email,
      password,
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return { response, body };
}

test.beforeEach(async ({ request }) => {
  const { email } = await registerUser(request, {
    email: makeEmail(),
    fullName: 'Reset User',
  });
  const login = await loginUser(request, email);

  const resetResponse = await request.post('/api/reset', {
    headers: {
      Authorization: `Bearer ${login.body.token}`,
    },
  });
  expect(resetResponse.ok()).toBeTruthy();
});

test('GET /health retorna status da API', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toMatchObject({
    status: 'ok',
    database: expect.any(String),
  });
});

test('POST /register cria um usuário e cartão virtual', async ({ request }) => {
  const { response, email } = await registerUser(request);

  expect(response.status()).toBe(201);
  const body = await response.json();

  expect(body).toMatchObject({
    id: expect.any(Number),
    full_name: 'Usuário Teste',
    email,
    agency: expect.any(String),
    account_number: expect.any(String),
    balance_cents: 0,
  });
});

test('POST /login autentica usuário e retorna token', async ({ request }) => {
  const email = makeEmail();
  await registerUser(request, { email });

  const { response, body } = await loginUser(request, email);
  expect(response.status()).toBe(200);
  expect(body).toEqual({ token: expect.any(String) });
});

test('POST /logout exige autenticação válida', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.post('/api/logout', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload).toEqual({ message: 'Logout realizado com sucesso.' });
});

test('GET /account retorna dados da conta para usuário autenticado', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.get('/api/account', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload).toMatchObject({
    name: 'Usuário Teste',
    agency: expect.any(String),
    account: expect.any(String),
    balanceCents: 0,
  });
});

test('GET /transactions lista transações com filtros', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.get('/api/transactions?type=deposit&search=dep', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(Array.isArray(payload)).toBeTruthy();
});

test('POST /deposit realiza depósito e atualiza saldo', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.post('/api/deposit', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
    data: {
      amountCents: 1250,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload).toEqual({
    message: 'Deposito realizado com sucesso.',
    balanceCents: 1250,
  });
});

test('POST /withdraw nega saque quando saldo é insuficiente', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.post('/api/withdraw', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
    data: {
      amountCents: 100,
    },
  });

  expect(response.status()).toBe(422);
  const payload = await response.json();
  expect(payload.message).toContain('Saldo insuficiente');
});

test('POST /transfer realiza transferência entre contas', async ({ request }) => {
  const origin = await registerUser(request, { email: makeEmail(), fullName: 'Origem' });
  const destination = await registerUser(request, { email: makeEmail(), fullName: 'Destino' });

  const originLogin = await loginUser(request, origin.email);

  await request.post('/api/deposit', {
    headers: { Authorization: `Bearer ${originLogin.body.token}` },
    data: { amountCents: 5000 },
  });

  const response = await request.post('/api/transfer', {
    headers: { Authorization: `Bearer ${originLogin.body.token}` },
    data: {
      amountCents: 1000,
      destinationAgency: destination.body.agency,
      destinationAccount: destination.body.account_number,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.message).toContain('Transferencia');
});

test('GET /card retorna detalhes do cartão virtual', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const response = await request.get('/api/card', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload).toMatchObject({
    numberMasked: expect.any(String),
    expiry: expect.any(String),
    cvvMasked: expect.any(String),
    status: 'active',
  });
});

test('PATCH /card/block e /card/unblock alteram status do cartão', async ({ request }) => {
  const { email } = await registerUser(request);
  const { body } = await loginUser(request, email);

  const blockResponse = await request.patch('/api/card/block', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });
  expect(blockResponse.status()).toBe(200);
  const blockedPayload = await blockResponse.json();
  expect(blockedPayload.status).toBe('blocked');

  const unblockResponse = await request.patch('/api/card/unblock', {
    headers: {
      Authorization: `Bearer ${body.token}`,
    },
  });
  expect(unblockResponse.status()).toBe(200);
  const unblockedPayload = await unblockResponse.json();
  expect(unblockedPayload.status).toBe('active');
});

test('POST /reset limpa os dados do banco para o cenário de teste', async ({ request }) => {
  const { email } = await registerUser(request, { email: makeEmail(), fullName: 'Reset User' });
  const login = await loginUser(request, email);

  const response = await request.post('/api/reset', {
    headers: {
      Authorization: `Bearer ${login.body.token}`,
    },
  });

  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload).toEqual({ message: 'Banco resetado com sucesso.' });
});
