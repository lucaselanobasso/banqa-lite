import "./style.css";

const API_BASE_URL = "http://localhost:3000/api";
const TOKEN_KEY = "banqa_token";
const appEl = document.getElementById("app");

/* =========================================================
   Ícones (SVG inline, sem dependências externas)
   ========================================================= */
const ICONS = {
  overview:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
  deposit:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M4 19h16"/></svg>',
  withdraw:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V9"/><path d="m7 13 5-5 5 5"/><path d="M4 19h16"/></svg>',
  transfer:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3-4 4 4 4"/><path d="M4 7h13"/><path d="m16 21 4-4-4-4"/><path d="M20 17H7"/></svg>',
  statement:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 12h6M9 16h6M9 8h3"/></svg>',
  card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg>',
  logout:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
  reset:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
  switch:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3v4H7"/><path d="m4 7 3-4 3 4"/><path d="M7 21v-4h10"/><path d="m20 17-3 4-3-4"/></svg>'
};

/* =========================================================
   Utilitários de token e formatação
   ========================================================= */
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

/* =========================================================
   Chamadas à API
   ========================================================= */
async function requestWithAuth(method, path, body, fallbackMessage) {
  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || fallbackMessage);
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

function fetchWithAuth(path) {
  return requestWithAuth("GET", path, undefined, "Falha na requisicao autenticada.");
}

function postWithAuthNoBody(path) {
  return requestWithAuth("POST", path, undefined, "Falha na operacao administrativa.");
}

function postWithAuth(path, body) {
  return requestWithAuth("POST", path, body, "Falha na operacao.");
}

function patchWithAuth(path) {
  return requestWithAuth("PATCH", path, undefined, "Falha na operacao do cartao.");
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

/* =========================================================
   Roteamento (uma pagina por hash, uma acao por pagina)
   ========================================================= */
const ROUTES = {
  login: "#login",
  register: "#cadastro",
  dashboard: "#dashboard",
  deposit: "#deposito",
  withdraw: "#saque",
  transfer: "#transferencia",
  statement: "#extrato",
  card: "#cartao"
};

function getCurrentView() {
  const hash = window.location.hash.toLowerCase();
  const entry = Object.entries(ROUTES).find(([, value]) => value === hash);
  if (entry) {
    return entry[0];
  }
  // Compatibilidade com o hash antigo de conta.
  if (hash === "#conta") {
    return "dashboard";
  }
  return "login";
}

function setView(view) {
  window.location.hash = ROUTES[view] || ROUTES.login;
}

function handleAuthError(error) {
  if (error && error.statusCode === 401) {
    clearToken();
    setView("login");
    return true;
  }
  return false;
}

/* =========================================================
   Tela de login
   ========================================================= */
function renderLoginScreen() {
  appEl.innerHTML = `
    <div class="auth-screen">
      <section class="auth-panel">
        <div class="auth-brand">
          <span class="mark">BANQA</span>
          <span class="tag">Lite</span>
        </div>
        <h1 class="title">Acessar o painel</h1>
        <p class="subtitle">Entre com suas credenciais para ver saldo, extrato e cartão.</p>
        <form id="login-form" class="form">
          <label class="field">
            <span>Email</span>
            <input type="email" name="email" autocomplete="email" required />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="password" autocomplete="current-password" required />
          </label>
          <button class="btn btn-primary btn-block" type="submit">Entrar</button>
        </form>
        <p id="login-message" class="message"></p>
        <div class="auth-switch">
          <button id="to-register" class="btn btn-secondary btn-block" type="button">Criar cadastro</button>
        </div>
      </section>
    </div>
  `;

  const messageEl = document.getElementById("login-message");
  const formEl = document.getElementById("login-form");
  const toRegisterEl = document.getElementById("to-register");

  toRegisterEl.addEventListener("click", () => setView("register"));

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.classList.remove("is-error");
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
        messageEl.classList.add("is-error");
        messageEl.textContent = data.message || "Falha ao fazer login.";
        return;
      }

      saveToken(data.token);
      setView("dashboard");
    } catch (error) {
      messageEl.classList.add("is-error");
      messageEl.textContent = "Nao foi possivel conectar com a API.";
    }
  });
}

/* =========================================================
   Tela de cadastro
   ========================================================= */
function renderRegisterScreen() {
  appEl.innerHTML = `
    <div class="auth-screen">
      <section class="auth-panel">
        <div class="auth-brand">
          <span class="mark">BANQA</span>
          <span class="tag">Lite</span>
        </div>
        <h1 class="title">Criar cadastro</h1>
        <p class="subtitle">Leva menos de um minuto para criar seu acesso.</p>
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
          <button class="btn btn-primary btn-block" type="submit">Cadastrar</button>
        </form>
        <p id="register-message" class="message"></p>
        <div class="auth-switch">
          <button id="to-login" class="btn btn-secondary btn-block" type="button">Voltar para login</button>
        </div>
      </section>
    </div>
  `;

  const messageEl = document.getElementById("register-message");
  const formEl = document.getElementById("register-form");
  const toLoginEl = document.getElementById("to-login");

  toLoginEl.addEventListener("click", () => setView("login"));

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.classList.remove("is-error");
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
        messageEl.classList.add("is-error");
        messageEl.textContent = data.message || "Falha ao cadastrar.";
        return;
      }

      messageEl.textContent = "Cadastro concluido. Faca login para entrar.";
      formEl.reset();
      setTimeout(() => setView("login"), 800);
    } catch (error) {
      messageEl.classList.add("is-error");
      messageEl.textContent = "Nao foi possivel conectar com a API.";
    }
  });
}

/* =========================================================
   Shell do painel (sidebar + topbar), compartilhado por
   todas as paginas autenticadas
   ========================================================= */
const NAV_ITEMS = [
  { view: "dashboard", label: "Visão geral", icon: "overview" },
  { view: "deposit", label: "Depositar", icon: "deposit" },
  { view: "withdraw", label: "Sacar", icon: "withdraw" },
  { view: "transfer", label: "Transferir", icon: "transfer" },
  { view: "statement", label: "Extrato", icon: "statement" },
  { view: "card", label: "Cartão virtual", icon: "card" }
];

function mountShell(activeView, heading, subheading) {
  const navHtml = NAV_ITEMS.map(
    (item) => `
      <button class="nav-link${item.view === activeView ? " is-active" : ""}" data-view="${item.view}" type="button">
        ${ICONS[item.icon]}
        <span>${item.label}</span>
      </button>
    `
  ).join("");

  appEl.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="logo-mark">B</div>
          <div class="logo-text">
            <strong>BANQA</strong>
            <span>Lite</span>
          </div>
        </div>
        <nav class="nav-group">
          <p class="nav-label">Conta</p>
          ${navHtml}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <strong id="sidebar-user-name">—</strong>
            <span id="sidebar-user-account">carregando...</span>
          </div>
          <button class="nav-link" id="logout-btn" type="button">
            ${ICONS.logout}
            <span>Sair</span>
          </button>
          <button class="sidebar-danger-link" id="reset-db-btn" type="button">Resetar dados de teste</button>
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <div class="topbar-heading">
            <h1>${heading}</h1>
            <p>${subheading}</p>
          </div>
          <div class="topbar-balance">
            <span class="label">Saldo</span>
            <strong id="topbar-balance-value">--</strong>
          </div>
        </header>
        <div class="content" id="page-content"></div>
      </div>
    </div>
  `;

  appEl.querySelectorAll(".nav-link[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await postWithAuthNoBody("/logout");
    } catch (error) {
      // Mesmo se a API falhar, o token local e removido para encerrar a sessao.
    }
    clearToken();
    setView("login");
  });

  document.getElementById("reset-db-btn").addEventListener("click", async () => {
    const confirmed = window.confirm("Deseja realmente resetar o banco? Esta acao remove todos os dados.");
    if (!confirmed) {
      return;
    }
    try {
      await postWithAuthNoBody("/reset");
      clearToken();
      setView("login");
    } catch (error) {
      if (!handleAuthError(error)) {
        window.alert(error.message || "Falha ao resetar banco.");
      }
    }
  });

  // Carrega o saldo/nome de forma assincrona sem travar a pagina.
  loadShellAccountSummary();

  return document.getElementById("page-content");
}

async function loadShellAccountSummary() {
  const balanceEl = document.getElementById("topbar-balance-value");
  const nameEl = document.getElementById("sidebar-user-name");
  const accountEl = document.getElementById("sidebar-user-account");

  try {
    const account = await fetchWithAuth("/account");
    if (balanceEl) balanceEl.textContent = formatMoneyFromCents(account.balanceCents);
    if (nameEl) nameEl.textContent = account.name || "Cliente";
    if (accountEl) accountEl.textContent = `Ag ${account.agency || "-"} · Cc ${account.account || "-"}`;
    return account;
  } catch (error) {
    handleAuthError(error);
    if (balanceEl) balanceEl.textContent = "--";
    return null;
  }
}

function requireToken() {
  const token = getToken();
  if (!token) {
    setView("login");
    return null;
  }
  return token;
}

/* =========================================================
   Pagina: Visao geral (dashboard)
   ========================================================= */
function renderDashboardPage() {
  if (!requireToken()) return;

  const contentEl = mountShell("dashboard", "Visão geral", "Seu resumo financeiro em um só lugar.");

  contentEl.innerHTML = `
    <section class="balance-hero">
      <span class="eyebrow">Saldo disponível</span>
      <p class="value" id="hero-balance">carregando...</p>
      <div class="meta-row">
        <div class="meta-item"><span>Titular</span><strong id="hero-name">-</strong></div>
        <div class="meta-item"><span>Agência</span><strong id="hero-agency">-</strong></div>
        <div class="meta-item"><span>Conta</span><strong id="hero-account">-</strong></div>
      </div>
    </section>

    <div class="quick-actions">
      <button class="quick-action tone-positive" data-view="deposit" type="button">
        <span class="icon-badge">${ICONS.deposit}</span>
        <strong>Depositar</strong>
        <span>Adicionar valor à conta</span>
      </button>
      <button class="quick-action tone-negative" data-view="withdraw" type="button">
        <span class="icon-badge">${ICONS.withdraw}</span>
        <strong>Sacar</strong>
        <span>Retirar valor da conta</span>
      </button>
      <button class="quick-action tone-info" data-view="transfer" type="button">
        <span class="icon-badge">${ICONS.transfer}</span>
        <strong>Transferir</strong>
        <span>Enviar para outra conta</span>
      </button>
      <button class="quick-action tone-accent" data-view="card" type="button">
        <span class="icon-badge">${ICONS.card}</span>
        <strong>Cartão virtual</strong>
        <span>Ver ou bloquear cartão</span>
      </button>
    </div>

    <section class="card">
      <div class="card-header">
        <h2>Últimas movimentações</h2>
        <button class="link-btn" id="see-all-statement" type="button">Ver extrato completo</button>
      </div>
      <ul class="statement-list" id="recent-statement">
        <li class="statement-empty">Carregando...</li>
      </ul>
    </section>
  `;

  contentEl.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });
  document.getElementById("see-all-statement").addEventListener("click", () => setView("statement"));

  loadDashboardData();

  async function loadDashboardData() {
    try {
      const [account, transactions] = await Promise.all([
        fetchWithAuth("/account"),
        fetchWithAuth(buildTransactionsQuery({}))
      ]);

      document.getElementById("hero-balance").textContent = formatMoneyFromCents(account.balanceCents);
      document.getElementById("hero-name").textContent = account.name || "-";
      document.getElementById("hero-agency").textContent = account.agency || "-";
      document.getElementById("hero-account").textContent = account.account || "-";

      renderStatementList(document.getElementById("recent-statement"), (transactions || []).slice(0, 5));
    } catch (error) {
      handleAuthError(error);
    }
  }
}

function renderStatementList(listEl, transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    listEl.innerHTML = `<li class="statement-empty">Sem movimentações no momento.</li>`;
    return;
  }

  listEl.innerHTML = transactions
    .map((transaction) => {
      const isNegative = ["withdraw", "transfer_out"].includes(transaction.type);
      return `
        <li class="statement-item">
          <div class="info">
            <strong>${transaction.description || transaction.type || "Movimentação"}</strong>
            <span>${formatDateTime(transaction.occurred_at)}</span>
          </div>
          <span class="amount ${isNegative ? "is-negative" : "is-positive"}">
            ${isNegative ? "-" : "+"} ${formatMoneyFromCents(transaction.amount_cents)}
          </span>
        </li>
      `;
    })
    .join("");
}

/* =========================================================
   Paginas de operacao: deposito, saque, transferencia
   ========================================================= */
function renderOperationPage(config) {
  if (!requireToken()) return;

  const contentEl = mountShell(config.view, config.heading, config.subheading);

  contentEl.innerHTML = `
    <div class="op-page">
      <section class="card op-form-card tone-${config.tone}">
        <div class="card-header">
          <h2>${config.formTitle}</h2>
        </div>
        <form id="op-form" class="compact-form">
          ${config.extraFields || ""}
          <label class="field">
            <span>Valor (R$)</span>
            <input type="number" name="amount" min="0.01" step="0.01" placeholder="0,00" required />
          </label>
          <button class="btn btn-primary btn-block" type="submit">${config.submitLabel}</button>
        </form>
        <p id="op-message" class="message"></p>
      </section>
      <aside class="op-side-note">
        <section class="card">
          <div class="card-header"><h2>Antes de confirmar</h2></div>
          <p>${config.helpText}</p>
        </section>
      </aside>
    </div>
  `;

  const formEl = document.getElementById("op-form");
  const messageEl = document.getElementById("op-message");

  formEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageEl.classList.remove("is-error");
    messageEl.textContent = "Processando operação...";

    const formData = new FormData(formEl);
    const body = config.buildBody(formData);

    if (!body) {
      messageEl.classList.add("is-error");
      messageEl.textContent = "Informe um valor maior que zero.";
      return;
    }

    try {
      const response = await postWithAuth(config.endpoint, body);
      messageEl.classList.remove("is-error");
      messageEl.textContent = response.message || "Operação concluída com sucesso.";
      formEl.reset();
      loadShellAccountSummary();
    } catch (error) {
      if (handleAuthError(error)) return;
      messageEl.classList.add("is-error");
      messageEl.textContent = error.message || "Falha ao processar operação.";
    }
  });
}

function renderDepositPage() {
  renderOperationPage({
    view: "deposit",
    heading: "Depositar",
    subheading: "Adicione dinheiro à sua conta.",
    formTitle: "Novo depósito",
    tone: "positive",
    submitLabel: "Depositar",
    endpoint: "/deposit",
    helpText: "O valor é somado ao saldo imediatamente e aparece no extrato como depósito.",
    buildBody: (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));
      if (!amountCents) return null;
      return { amountCents };
    }
  });
}

function renderWithdrawPage() {
  renderOperationPage({
    view: "withdraw",
    heading: "Sacar",
    subheading: "Retire dinheiro da sua conta.",
    formTitle: "Novo saque",
    tone: "negative",
    submitLabel: "Sacar",
    endpoint: "/withdraw",
    helpText: "O saque só é concluído se o saldo disponível for suficiente para cobrir o valor solicitado.",
    buildBody: (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));
      if (!amountCents) return null;
      return { amountCents };
    }
  });
}

function renderTransferPage() {
  renderOperationPage({
    view: "transfer",
    heading: "Transferir",
    subheading: "Envie dinheiro para outra conta.",
    formTitle: "Nova transferência",
    tone: "info",
    submitLabel: "Transferir",
    endpoint: "/transfer",
    helpText: "Confira agência e conta de destino antes de confirmar — a transferência é processada na hora.",
    extraFields: `
      <label class="field">
        <span>Agência destino</span>
        <input type="text" name="destinationAgency" required />
      </label>
      <label class="field">
        <span>Conta destino</span>
        <input type="text" name="destinationAccount" required />
      </label>
    `,
    buildBody: (formData) => {
      const amountCents = parseAmountToCents(formData.get("amount"));
      if (!amountCents) return null;
      return {
        destinationAgency: String(formData.get("destinationAgency") || "").trim(),
        destinationAccount: String(formData.get("destinationAccount") || "").trim(),
        amountCents
      };
    }
  });
}

/* =========================================================
   Pagina: Extrato (com filtros)
   ========================================================= */
function renderStatementPage() {
  if (!requireToken()) return;

  const contentEl = mountShell("statement", "Extrato", "Consulte e filtre todas as suas movimentações.");

  contentEl.innerHTML = `
    <section class="card" style="margin-bottom: 20px;">
      <div class="card-header"><h2>Filtros</h2></div>
      <form id="filters-form" class="filters-grid">
        <label class="field">
          <span>Tipo</span>
          <select name="type">
            <option value="">Todos</option>
            <option value="deposit">Depósito</option>
            <option value="withdraw">Saque</option>
            <option value="transfer_out">Transferência enviada</option>
            <option value="transfer_in">Transferência recebida</option>
          </select>
        </label>
        <label class="field">
          <span>Busca</span>
          <input type="text" name="search" placeholder="descrição, referência ou tipo" />
        </label>
        <label class="field">
          <span>Início</span>
          <input type="date" name="startDate" />
        </label>
        <label class="field">
          <span>Fim</span>
          <input type="date" name="endDate" />
        </label>
        <div class="filters-actions">
          <button class="btn btn-primary" type="submit">Aplicar filtros</button>
          <button id="clear-filters" class="btn btn-secondary" type="button">Limpar</button>
        </div>
      </form>
    </section>

    <section class="card">
      <div class="card-header"><h2>Movimentações</h2></div>
      <ul class="statement-list" id="statement-list">
        <li class="statement-empty">Carregando...</li>
      </ul>
      <p id="statement-message" class="message"></p>
    </section>
  `;

  const filtersFormEl = document.getElementById("filters-form");
  const clearFiltersEl = document.getElementById("clear-filters");
  const statementListEl = document.getElementById("statement-list");
  const messageEl = document.getElementById("statement-message");

  let filters = { type: "", search: "", startDate: "", endDate: "" };

  filtersFormEl.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(filtersFormEl);
    filters = {
      type: String(formData.get("type") || "").trim(),
      search: String(formData.get("search") || "").trim(),
      startDate: String(formData.get("startDate") || "").trim(),
      endDate: String(formData.get("endDate") || "").trim()
    };
    await loadStatement();
  });

  clearFiltersEl.addEventListener("click", async () => {
    filtersFormEl.reset();
    filters = { type: "", search: "", startDate: "", endDate: "" };
    await loadStatement();
  });

  loadStatement();

  async function loadStatement() {
    try {
      const transactions = await fetchWithAuth(buildTransactionsQuery(filters));
      renderStatementList(statementListEl, transactions);
      messageEl.textContent = "";
    } catch (error) {
      if (handleAuthError(error)) return;
      messageEl.classList.add("is-error");
      messageEl.textContent = error.message || "Erro ao buscar movimentações.";
    }
  }
}

/* =========================================================
   Pagina: Cartao virtual
   ========================================================= */
function renderCardPage() {
  if (!requireToken()) return;

  const contentEl = mountShell("card", "Cartão virtual", "Visualize e gerencie o bloqueio do seu cartão.");

  contentEl.innerHTML = `
    <section class="card" style="max-width: 460px;">
      <div class="virtual-card" id="virtual-card">
        <div class="card-top">
          <span class="card-brand">BANQA</span>
          <div class="chip"></div>
        </div>
        <div class="card-number" id="card-number">•••• •••• •••• ••••</div>
        <div class="card-bottom">
          <div>
            <span>Validade</span>
            <strong id="card-expiry">--/--</strong>
          </div>
          <div>
            <span>CVV</span>
            <strong id="card-cvv">•••</strong>
          </div>
        </div>
      </div>
      <div class="card-status-row">
        <span class="status-pill" id="card-status-pill">carregando</span>
      </div>
      <div class="card-actions-row">
        <button id="card-toggle" class="btn btn-primary" type="button">Atualizar</button>
      </div>
      <p id="card-message" class="message"></p>
    </section>
  `;

  const cardNumberEl = document.getElementById("card-number");
  const cardExpiryEl = document.getElementById("card-expiry");
  const cardCvvEl = document.getElementById("card-cvv");
  const statusPillEl = document.getElementById("card-status-pill");
  const cardToggleEl = document.getElementById("card-toggle");
  const cardMessageEl = document.getElementById("card-message");

  async function loadCard() {
    try {
      const card = await fetchWithAuth("/card");
      cardNumberEl.textContent = card.numberMasked;
      cardExpiryEl.textContent = card.expiry;
      cardCvvEl.textContent = card.cvvMasked;
      statusPillEl.textContent = card.status;
      statusPillEl.className = `status-pill status-${card.status}`;
      cardToggleEl.textContent = card.status === "blocked" ? "Desbloquear cartão" : "Bloquear cartão";
      cardToggleEl.dataset.status = card.status;
      cardMessageEl.textContent = "";
    } catch (error) {
      if (handleAuthError(error)) return;
      cardMessageEl.classList.add("is-error");
      cardMessageEl.textContent = error.message || "Erro ao buscar cartão.";
    }
  }

  cardToggleEl.addEventListener("click", async () => {
    try {
      cardMessageEl.classList.remove("is-error");
      cardMessageEl.textContent = "Atualizando status do cartão...";
      const currentStatus = cardToggleEl.dataset.status;
      const endpoint = currentStatus === "blocked" ? "/card/unblock" : "/card/block";
      await patchWithAuth(endpoint);
      await loadCard();
      cardMessageEl.textContent = "Status do cartão atualizado.";
    } catch (error) {
      if (handleAuthError(error)) return;
      cardMessageEl.classList.add("is-error");
      cardMessageEl.textContent = error.message || "Falha ao atualizar cartão.";
    }
  });

  loadCard();
}

/* =========================================================
   Roteador principal
   ========================================================= */
function render() {
  const view = getCurrentView();

  const pageRenderers = {
    register: renderRegisterScreen,
    dashboard: renderDashboardPage,
    deposit: renderDepositPage,
    withdraw: renderWithdrawPage,
    transfer: renderTransferPage,
    statement: renderStatementPage,
    card: renderCardPage,
    login: renderLoginScreen
  };

  (pageRenderers[view] || renderLoginScreen)();
}

window.addEventListener("hashchange", render);

if (!window.location.hash) {
  setView(getToken() ? "dashboard" : "login");
} else {
  render();
}
