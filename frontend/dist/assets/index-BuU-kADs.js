(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))o(e);new MutationObserver(e=>{for(const c of e)if(c.type==="childList")for(const r of c.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function n(e){const c={};return e.integrity&&(c.integrity=e.integrity),e.referrerPolicy&&(c.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?c.credentials="include":e.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function o(e){if(e.ep)return;e.ep=!0;const c=n(e);fetch(e.href,c)}})();const b="http://localhost:3000/api",L="banqa_token",g=document.getElementById("app");function f(){return localStorage.getItem(L)}function q(t){localStorage.setItem(L,t)}function p(){localStorage.removeItem(L)}function T(t){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format((Number(t)||0)/100)}function N(t){return t?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(t)):"-"}async function S(t){const a=f(),n=await fetch(`${b}${t}`,{method:"GET",headers:{Authorization:`Bearer ${a}`}}),o=await n.json();if(!n.ok){const e=new Error(o.message||"Falha na requisicao autenticada.");throw e.statusCode=n.status,e}return o}async function x(t){const a=f(),n=await fetch(`${b}${t}`,{method:"POST",headers:{Authorization:`Bearer ${a}`}}),o=await n.json();if(!n.ok){const e=new Error(o.message||"Falha na operacao administrativa.");throw e.statusCode=n.status,e}return o}async function M(t,a){const n=f(),o=await fetch(`${b}${t}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify(a)}),e=await o.json();if(!o.ok){const c=new Error(e.message||"Falha na operacao.");throw c.statusCode=o.status,c}return e}function v(t){const a=String(t||"").replace(",",".").trim(),n=Number(a);return!Number.isFinite(n)||n<=0?null:Math.round(n*100)}function O(t={}){const a=new URLSearchParams;t.type&&a.set("type",t.type),t.search&&a.set("search",t.search),t.startDate&&a.set("startDate",`${t.startDate}T00:00:00`),t.endDate&&a.set("endDate",`${t.endDate}T23:59:59`);const n=a.toString();return n?`/transactions?${n}`:"/transactions"}function P(){const t=window.location.hash.toLowerCase();return t==="#cadastro"?"register":t==="#cartao"?"card":t==="#conta"?"account":"login"}function d(t){const a={login:"#login",register:"#cadastro",account:"#conta",card:"#cartao"};window.location.hash=a[t]||"#login"}async function R(t){const a=f(),n=await fetch(`${b}${t}`,{method:"PATCH",headers:{Authorization:`Bearer ${a}`}}),o=await n.json();if(!n.ok){const e=new Error(o.message||"Falha na operacao do cartao.");throw e.statusCode=n.status,e}return o}function j(){g.innerHTML=`
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
  `;const t=document.getElementById("login-message"),a=document.getElementById("login-form");document.getElementById("to-register").addEventListener("click",()=>d("register")),a.addEventListener("submit",async o=>{o.preventDefault(),t.textContent="Validando login...";const e=new FormData(a),c={email:String(e.get("email")||"").trim(),password:String(e.get("password")||"").trim()};try{const r=await fetch(`${b}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}),s=await r.json();if(!r.ok){t.textContent=s.message||"Falha ao fazer login.";return}q(s.token),d("account")}catch{t.textContent="Nao foi possivel conectar com a API."}})}function z(){g.innerHTML=`
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
  `;const t=document.getElementById("register-message"),a=document.getElementById("register-form");document.getElementById("to-login").addEventListener("click",()=>d("login")),a.addEventListener("submit",async o=>{o.preventDefault(),t.textContent="Criando cadastro...";const e=new FormData(a),c={fullName:String(e.get("fullName")||"").trim(),email:String(e.get("email")||"").trim(),password:String(e.get("password")||"").trim()};try{const r=await fetch(`${b}/register`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)}),s=await r.json();if(!r.ok){t.textContent=s.message||"Falha ao cadastrar.";return}t.textContent="Cadastro concluido. Faca login para entrar.",a.reset(),setTimeout(()=>d("login"),800)}catch{t.textContent="Nao foi possivel conectar com a API."}})}function V(){if(!f()){d("login");return}g.innerHTML=`
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
  `;const a=document.getElementById("to-card"),n=document.getElementById("go-login"),o=g.querySelector(".subtitle"),e=document.getElementById("account-info"),c=document.getElementById("statement-list"),r=document.getElementById("account-message"),s=document.getElementById("filters-form"),E=document.getElementById("clear-filters"),B=document.getElementById("reset-db"),D=document.getElementById("logout"),I=document.getElementById("deposit-form"),k=document.getElementById("withdraw-form"),$=document.getElementById("transfer-form"),w={filters:{type:"",search:"",startDate:"",endDate:""}};n.addEventListener("click",()=>{p(),d("login")}),D.addEventListener("click",async()=>{try{await x("/logout")}catch{}p(),d("login")}),B.addEventListener("click",async()=>{if(window.confirm("Deseja realmente resetar o banco? Esta acao remove todos os dados."))try{r.textContent="Resetando banco...",await x("/reset"),p(),d("login")}catch(i){if(i.statusCode===401){p(),d("login");return}r.textContent=i.message||"Falha ao resetar banco."}}),a.addEventListener("click",()=>{d("card")}),s.addEventListener("submit",async l=>{l.preventDefault();const i=new FormData(s);w.filters={type:String(i.get("type")||"").trim(),search:String(i.get("search")||"").trim(),startDate:String(i.get("startDate")||"").trim(),endDate:String(i.get("endDate")||"").trim()},await h()}),E.addEventListener("click",async()=>{s.reset(),w.filters={type:"",search:"",startDate:"",endDate:""},await h()});async function h(){try{const l=O(w.filters),[i,u]=await Promise.all([S("/account"),S(l)]);if(o.textContent="Dados da conta carregados com sucesso.",e.innerHTML=`
        <article class="account-item">
          <h3>Nome</h3>
          <p>${i.name}</p>
        </article>
        <article class="account-item">
          <h3>Saldo</h3>
          <p>${T(i.balanceCents)}</p>
        </article>
        <article class="account-item">
          <h3>Agencia</h3>
          <p>${i.agency||"-"}</p>
        </article>
        <article class="account-item">
          <h3>Conta</h3>
          <p>${i.account||"-"}</p>
        </article>
      `,!Array.isArray(u)||u.length===0){c.innerHTML='<li class="statement-empty">Sem movimentacoes no momento.</li>';return}c.innerHTML=u.map(m=>`
            <li class="statement-item">
              <div>
                <strong>${m.description||m.type||"Movimentacao"}</strong>
                <span>${N(m.occurred_at)}</span>
              </div>
              <em>${T(m.amount_cents)}</em>
            </li>
          `).join(""),r.textContent=""}catch(l){if(l.statusCode===401){p(),d("login");return}o.textContent="Falha ao carregar dados da conta.",r.textContent=l.message||"Erro ao buscar informacoes da conta."}}async function C(l,i,u){l.preventDefault();const m=l.currentTarget;r.textContent="Processando operacao...";try{const y=u(new FormData(m));if(!y){r.textContent="Informe um valor maior que zero.";return}const F=await M(i,y);r.textContent=F.message,m&&m.reset(),await h()}catch(y){if(y.statusCode===401){p(),d("login");return}r.textContent=y.message||"Falha ao processar operacao."}}I.addEventListener("submit",l=>C(l,"/deposit",i=>{const u=v(i.get("amount"));return u?{amountCents:u}:null})),k.addEventListener("submit",l=>C(l,"/withdraw",i=>{const u=v(i.get("amount"));return u?{amountCents:u}:null})),$.addEventListener("submit",l=>C(l,"/transfer",i=>{const u=v(i.get("amount"));return u?{destinationAgency:String(i.get("destinationAgency")||"").trim(),destinationAccount:String(i.get("destinationAccount")||"").trim(),amountCents:u}:null})),h()}function H(){if(!f()){d("login");return}g.innerHTML=`
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
  `;const a=g.querySelector(".subtitle"),n=document.getElementById("card-info"),o=document.getElementById("card-message"),e=document.getElementById("card-toggle");document.getElementById("back-account").addEventListener("click",()=>{d("account")});async function r(){try{const s=await S("/card");a.textContent="Dados do cartao carregados com sucesso.",n.innerHTML=`
        <article class="card-virtual-item">
          <h3>Numero mascarado</h3>
          <p>${s.numberMasked}</p>
        </article>
        <article class="card-virtual-item">
          <h3>Validade</h3>
          <p>${s.expiry}</p>
        </article>
        <article class="card-virtual-item">
          <h3>CVV mascarado</h3>
          <p>${s.cvvMasked}</p>
        </article>
        <article class="card-virtual-item">
          <h3>Status</h3>
          <p class="status-${s.status}">${s.status}</p>
        </article>
      `,e.textContent=s.status==="blocked"?"Desbloquear cartao":"Bloquear cartao",e.dataset.status=s.status,o.textContent=""}catch(s){if(s.statusCode===401){p(),d("login");return}a.textContent="Falha ao carregar cartao virtual.",o.textContent=s.message||"Erro ao buscar cartao."}}e.addEventListener("click",async()=>{try{o.textContent="Atualizando status do cartao...";const E=e.dataset.status==="blocked"?"/card/unblock":"/card/block";await R(E),await r(),o.textContent="Status do cartao atualizado."}catch(s){if(s.statusCode===401){p(),d("login");return}o.textContent=s.message||"Falha ao atualizar cartao."}}),r()}function A(){const t=P();if(t==="register"){z();return}if(t==="account"){V();return}if(t==="card"){H();return}j()}window.addEventListener("hashchange",A);window.location.hash?A():d(f()?"account":"login");
