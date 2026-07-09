# BANQA Lite Constitution

BANQA Lite é um simulador de banco virtual criado exclusivamente para estudos e portfólio.

## Objetivo

O projeto deve simular o funcionamento básico de um banco digital moderno utilizando tecnologias simples, arquitetura organizada e código fácil de entender.

Sempre priorize simplicidade, legibilidade e manutenção.

Nunca implemente funcionalidades desnecessárias.

Sempre pergunte antes de assumir regras de negócio importantes.

---

## Stack

Frontend

- Vite
- HTML
- CSS
- JavaScript Vanilla

Backend

- Node.js
- Express

Banco

- SQLite
- better-sqlite3

Sem Docker.

Sem TypeScript.

Sem ORM.

Sem frameworks frontend.

---

## Arquitetura

Frontend separado do backend.

Backend organizado em:

routes

controllers

services

repositories

database

utils

Toda regra de negócio deve ficar no backend.

Frontend apenas consome API.

---

## Banco

Existe apenas um arquivo SQLite.

database.db

Criar tabelas automaticamente caso não existam.

---

## Código

Sempre:

funções pequenas

código comentado

nomes claros

responsabilidade única

evitar duplicação

não criar abstrações desnecessárias

---

## Interface

Visual moderno

minimalista

cores sóbrias

responsivo

---

## API

Sempre utilizar REST.

Respostas em JSON.

Mensagens de erro claras.

---

## Implementação

Nunca implemente várias funcionalidades ao mesmo tempo.

Sempre respeite a ordem das tasks.

Cada task deve terminar com aplicação funcional.