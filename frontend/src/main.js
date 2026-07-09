import "./style.css";

const API_BASE_URL = "http://localhost:3000/api";
const TOKEN_KEY = "banqa_token";
const appEl = document.getElementById("app");

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function formatMoneyFromCents(cents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format((Number(cents) || 0) / 100);
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

async function fetchWithAuth(path) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na requisicao autenticada.");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function postWithAuthNoBody(path) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na operacao administrativa.");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

async function postWithAuth(path, body) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na operacao.");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

function parseAmountToCents(value) {
  const normalized = String(value || "").replace(",", ".").trim();
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100);
}

function buildTransactionsQuery(filters = {}) {
  const params = new URLSearchParams();

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.startDate) {
    params.set("startDate", `${filters.startDate}T00:00:00`);
  }

  if (filters.endDate) {
    params.set("endDate", `${filters.endDate}T23:59:59`);
  }

  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

function getCurrentView() {
  const hash = window.location.hash.toLowerCase();

  if (hash === "#cadastro") {
    return "register";
  }

  if (hash === "#cartao") {
    return "card";
  }

  if (hash === "#conta") {
    return "account";
  }

  return "login";
}

function setView(view) {
  const map = {
    login: "#login",
    register: "#cadastro",
    account: "#conta",
    card: "#cartao"
  };

  window.location.hash = map[view] || "#login";
}

async function patchWithAuth(path) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha na operacao do cartao.");
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

function renderLoginScreen() {
  appEl.innerHTML = `
    <section class="panel">
      <h1 class="title">BANQA Lite</h1>
      <p class="subtitle">Entre na sua conta para continuar.</p>
      <form id="login-form" class="form">
        <label class="field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Senha</span>
          <input type="password" name="password" autocomplete="current-password" required />
        </label>
        <button class="btn btn-primary" type="submit">Entrar</button>
      </form>
      <p id="login-message" class="message"></p>
      <button id="to-register" class="btn btn-secondary" type="button">Criar cadastro</button>
    </section>
  `;

  const messageEl = document.getElementById("login-message");
  const formEl = document.getElementById("login-form");
  const toRegisterEl = document.getElementById("to-register");

  toRegisterEl.addEventListener("click", () => setView("register"));

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.textContent = "Validando login...";

    const formData = new FormData(formEl);
    const payload = {
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "").trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        messageEl.textContent = data.message || "Falha ao fazer login.";
        return;
      }

      saveToken(data.token);
      setView("account");
    } catch (error) {
      messageEl.textContent = "Nao foi possivel conectar com a API.";
    }
  });
}

function renderRegisterScreen() {
  appEl.innerHTML = `
    <section class="panel">
      <h1 class="title">Cadastro</h1>
      <p class="subtitle">Crie seu acesso ao BANQA Lite.</p>
      <form id="register-form" class="form">
        <label class="field">
          <span>Nome completo</span>
          <input type="text" name="fullName" autocomplete="name" required />
        </label>
        <label class="field">
          <span>Email</span>
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Senha</span>
          <input type="password" name="password" autocomplete="new-password" required />
        </label>
        <button class="btn btn-primary" type="submit">Cadastrar</button>
      </form>
      <p id="register-message" class="message"></p>
      <button id="to-login" class="btn btn-secondary" type="button">Voltar para login</button>
    </section>
  `;

  const messageEl = document.getElementById("register-message");
  const formEl = document.getElementById("register-form");
  const toLoginEl = document.getElementById("to-login");

  toLoginEl.addEventListener("click", () => setView("login"));

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.textContent = "Criando cadastro...";

    const formData = new FormData(formEl);
    const payload = {
      fullName: String(formData.get("fullName") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || "").trim()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        messageEl.textContent = data.message || "Falha ao cadastrar.";
        return;
      }

      messageEl.textContent = "Cadastro concluido. Faca login para entrar.";
      formEl.reset();
      setTimeout(() => setView("login"), 800);
    } catch (error) {
      messageEl.textContent = "Nao foi possivel conectar com a API.";
    }
  });
}

function renderAccountScreen() {
  const token = getToken();

  if (!token) {
    setView("login");
    return;
  }

  appEl.innerHTML = `
    <section class="panel">
      <h1 class="title">Conta</h1>
      <p class="subtitle">Carregando dados da conta...</p>
      <div id="account-info" class="account-grid"></div>
      <section class="ops-box">
        <h2>Operacoes</h2>
        <div class="ops-grid">
          <form id="deposit-form" class="form compact-form">
            <h3>Deposito</h3>
            <label class="field">
              <span>Valor (R$)</span>
              <input type="number" name="amount" min="0.01" step="0.01" required />
            </label>
            <button class="btn btn-primary" type="submit">Depositar</button>
          </form>
          <form id="withdraw-form" class="form compact-form">
            <h3>Saque</h3>
            <label class="field">
              <span>Valor (R$)</span>
              <input type="number" name="amount" min="0.01" step="0.01" required />
            </label>
            <button class="btn btn-primary" type="submit">Sacar</button>
          </form>
          <form id="transfer-form" class="form compact-form">
            <h3>Transferencia</h3>
            <label class="field">
              <span>Agencia destino</span>
              <input type="text" name="destinationAgency" required />
            </label>
            <label class="field">
              <span>Conta destino</span>
              <input type="text" name="destinationAccount" required />
            </label>
            <label class="field">
              <span>Valor (R$)</span>
              <input type="number" name="amount" min="0.01" step="0.01" required />
            </label>
            <button class="btn btn-primary" type="submit">Transferir</button>
          </form>
        </div>
      </section>
      <section class="filters-box">
        <h2>Filtros do extrato</h2>
        <form id="filters-form" class="filters-grid">
          <label class="field">
            <span>Tipo</span>
            <select name="type">
              <option value="">Todos</option>
              <option value="deposit">Deposito</option>
              <option value="withdraw">Saque</option>
              <option value="transfer_out">Transferencia enviada</option>
              <option value="transfer_in">Transferencia recebida</option>
            </select>
          </label>
          <label class="field">
            <span>Busca</span>
            <input type="text" name="search" placeholder="descricao, referencia ou tipo" />
          </label>
          <label class="field">
            <span>Inicio</span>
            <input type="date" name="startDate" />
          </label>
          <label class="field">
            <span>Fim</span>
            <input type="date" name="endDate" />
          </label>
          <button class="btn btn-primary" type="submit">Aplicar filtros</button>
          <button id="clear-filters" class="btn btn-secondary" type="button">Limpar</button>
        </form>
      </section>
      <div class="statement-box">
        <h2>Extrato</h2>
        <ul id="statement-list" class="statement-list"></ul>
      </div>
      <p id="account-message" class="message"></p>
      <button id="to-card" class="btn btn-secondary" type="button">Cartao virtual</button>
      <button id="reset-db" class="btn btn-danger" type="button">Resetar banco</button>
      <button id="logout" class="btn btn-secondary" type="button">Logout</button>
      <button id="go-login" class="btn btn-secondary" type="button">Trocar de conta</button>
    </section>
  `;

  const toCardEl = document.getElementById("to-card");
  const goLoginEl = document.getElementById("go-login");
  const subtitleEl = appEl.querySelector(".subtitle");
  const accountInfoEl = document.getElementById("account-info");
  const statementListEl = document.getElementById("statement-list");
  const messageEl = document.getElementById("account-message");
  const filtersFormEl = document.getElementById("filters-form");
  const clearFiltersEl = document.getElementById("clear-filters");
  const resetDbEl = document.getElementById("reset-db");
  const logoutEl = document.getElementById("logout");
  const depositFormEl = document.getElementById("deposit-form");
  const withdrawFormEl = document.getElementById("withdraw-form");
  const transferFormEl = document.getElementById("transfer-form");

  const state = {
    filters: {
      type: "",
      search: "",
      startDate: "",
      endDate: ""
    }
  };

  goLoginEl.addEventListener("click", () => {
    clearToken();
    setView("login");
  });

  logoutEl.addEventListener("click", async () => {
    try {
      await postWithAuthNoBody("/logout");
    } catch (error) {
      // Even if logout fails on API, local token is removed to end client session.
    }

    clearToken();
    setView("login");
  });

  resetDbEl.addEventListener("click", async () => {
    const confirmed = window.confirm("Deseja realmente resetar o banco? Esta acao remove todos os dados.");

    if (!confirmed) {
      return;
    }

    try {
      messageEl.textContent = "Resetando banco...";
      await postWithAuthNoBody("/reset");
      clearToken();
      setView("login");
    } catch (error) {
      if (error.statusCode === 401) {
        clearToken();
        setView("login");
        return;
      }

      messageEl.textContent = error.message || "Falha ao resetar banco.";
    }
  });

  toCardEl.addEventListener("click", () => {
    setView("card");
  });

  filtersFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(filtersFormEl);

    state.filters = {
      type: String(formData.get("type") || "").trim(),
      search: String(formData.get("search") || "").trim(),
      startDate: String(formData.get("startDate") || "").trim(),
      endDate: String(formData.get("endDate") || "").trim()
    };

    await loadAccountModule();
  });

  clearFiltersEl.addEventListener("click", async () => {
    filtersFormEl.reset();
    state.filters = {
      type: "",
      search: "",
      startDate: "",
      endDate: ""
    };

    await loadAccountModule();
  });

  async function loadAccountModule() {
    try {
      const queryPath = buildTransactionsQuery(state.filters);
      const [account, transactions] = await Promise.all([
        fetchWithAuth("/account"),
        fetchWithAuth(queryPath)
      ]);

      subtitleEl.textContent = "Dados da conta carregados com sucesso.";
      accountInfoEl.innerHTML = `
        <article class="account-item">
          <h3>Nome</h3>
          <p>${account.name}</p>
        </article>
        <article class="account-item">
          <h3>Saldo</h3>
          <p>${formatMoneyFromCents(account.balanceCents)}</p>
        </article>
        <article class="account-item">
          <h3>Agencia</h3>
          <p>${account.agency || "-"}</p>
        </article>
        <article class="account-item">
          <h3>Conta</h3>
          <p>${account.account || "-"}</p>
        </article>
      `;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        statementListEl.innerHTML = `<li class="statement-empty">Sem movimentacoes no momento.</li>`;
        return;
      }

      statementListEl.innerHTML = transactions
        .map(
          (transaction) => `
            <li class="statement-item">
              <div>
                <strong>${transaction.description || transaction.type || "Movimentacao"}</strong>
                <span>${formatDateTime(transaction.occurred_at)}</span>
              </div>
              <em>${formatMoneyFromCents(transaction.amount_cents)}</em>
            </li>
          `
        )
        .join("");

      messageEl.textContent = "";
    } catch (error) {
      if (error.statusCode === 401) {
        clearToken();
        setView("login");
        return;
      }

      subtitleEl.textContent = "Falha ao carregar dados da conta.";
      messageEl.textContent = error.message || "Erro ao buscar informacoes da conta.";
    }
  }

  async function handleOperationSubmit(event, endpoint, bodyBuilder) {
    event.preventDefault();
    const formEl = event.currentTarget;
    messageEl.textContent = "Processando operacao...";

    try {
      const body = bodyBuilder(new FormData(formEl));

      if (!body) {
        messageEl.textContent = "Informe um valor maior que zero.";
        return;
      }

      const response = await postWithAuth(endpoint, body);
      messageEl.textContent = response.message;
      if (formEl) {
        formEl.reset();
      }
      await loadAccountModule();
    } catch (error) {
      if (error.statusCode === 401) {
        clearToken();
        setView("login");
        return;
      }

      messageEl.textContent = error.message || "Falha ao processar operacao.";
    }
  }

  depositFormEl.addEventListener("submit", (event) =>
    handleOperationSubmit(event, "/deposit", (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));

      if (!amountCents) {
        return null;
      }

      return { amountCents };
    })
  );

  withdrawFormEl.addEventListener("submit", (event) =>
    handleOperationSubmit(event, "/withdraw", (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));

      if (!amountCents) {
        return null;
      }

      return { amountCents };
    })
  );

  transferFormEl.addEventListener("submit", (event) =>
    handleOperationSubmit(event, "/transfer", (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));

      if (!amountCents) {
        return null;
      }

      return {
        destinationAgency: String(formData.get("destinationAgency") || "").trim(),
        destinationAccount: String(formData.get("destinationAccount") || "").trim(),
        amountCents
      };
    })
  );

  loadAccountModule();
}

function renderCardScreen() {
  const token = getToken();

  if (!token) {
    setView("login");
    return;
  }

  appEl.innerHTML = `
    <section class="panel">
      <h1 class="title">Cartao virtual</h1>
      <p class="subtitle">Carregando dados do cartao...</p>
      <div id="card-info" class="card-virtual-box"></div>
      <p id="card-message" class="message"></p>
      <div class="card-actions">
        <button id="card-toggle" class="btn btn-primary" type="button">Atualizar</button>
        <button id="back-account" class="btn btn-secondary" type="button">Voltar para conta</button>
      </div>
    </section>
  `;

  const subtitleEl = appEl.querySelector(".subtitle");
  const cardInfoEl = document.getElementById("card-info");
  const cardMessageEl = document.getElementById("card-message");
  const cardToggleEl = document.getElementById("card-toggle");
  const backAccountEl = document.getElementById("back-account");

  backAccountEl.addEventListener("click", () => {
    setView("account");
  });

  async function loadCard() {
    try {
      const card = await fetchWithAuth("/card");
      subtitleEl.textContent = "Dados do cartao carregados com sucesso.";
      cardInfoEl.innerHTML = `
        <article class="card-virtual-item">
          <h3>Numero mascarado</h3>
          <p>${card.numberMasked}</p>
        </article>
        <article class="card-virtual-item">
          <h3>Validade</h3>
          <p>${card.expiry}</p>
        </article>
        <article class="card-virtual-item">
          <h3>CVV mascarado</h3>
          <p>${card.cvvMasked}</p>
        </article>
        <article class="card-virtual-item">
          <h3>Status</h3>
          <p class="status-${card.status}">${card.status}</p>
        </article>
      `;

      cardToggleEl.textContent = card.status === "blocked" ? "Desbloquear cartao" : "Bloquear cartao";
      cardToggleEl.dataset.status = card.status;
      cardMessageEl.textContent = "";
    } catch (error) {
      if (error.statusCode === 401) {
        clearToken();
        setView("login");
        return;
      }

      subtitleEl.textContent = "Falha ao carregar cartao virtual.";
      cardMessageEl.textContent = error.message || "Erro ao buscar cartao.";
    }
  }

  cardToggleEl.addEventListener("click", async () => {
    try {
      cardMessageEl.textContent = "Atualizando status do cartao...";
      const currentStatus = cardToggleEl.dataset.status;
      const endpoint = currentStatus === "blocked" ? "/card/unblock" : "/card/block";
      await patchWithAuth(endpoint);
      await loadCard();
      cardMessageEl.textContent = "Status do cartao atualizado.";
    } catch (error) {
      if (error.statusCode === 401) {
        clearToken();
        setView("login");
        return;
      }

      cardMessageEl.textContent = error.message || "Falha ao atualizar cartao.";
    }
  });

  loadCard();
}

function render() {
  const view = getCurrentView();

  if (view === "register") {
    renderRegisterScreen();
    return;
  }

  if (view === "account") {
    renderAccountScreen();
    return;
  }

  if (view === "card") {
    renderCardScreen();
    return;
  }

  renderLoginScreen();
}

window.addEventListener("hashchange", render);

if (!window.location.hash) {
  setView(getToken() ? "account" : "login");
} else {
  render();
}
