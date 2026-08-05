# Auditoria Jurídica — PIANO LouvorJA Site

> **Data:** 30 de julho de 2026
> **Skill orquestradora:** `legal/legal-compliance-audit`
> **Status:** First-pass AI-generated. Validação OAB necessária para pontos críticos.

## Contexto do Projeto

| Item                         | Detalhe                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| **Produto**                  | PIANO LouvorJA — software de gestão de cultos adventistas                    |
| **Escopo desta auditoria**   | `piano-site` — landing page / site institucional do PIANO                    |
| **Stack**                    | Nuxt 3 (SSG), Vuetify, @nuxtjs/i18n                                          |
| **Páginas**                  | `index.vue` (landing), `docs.vue` (documentação), `contact.vue` (formulário) |
| **i18n**                     | PT-BR, EN, ES (3 línguas)                                                    |
| **Dados pessoais coletados** | Nome, email, assunto, mensagem (formulário de contato)                       |
| **Subprocessador**           | Web3Forms (EUA) — envio do formulário de contato                             |
| **Cookies**                  | `piano_lang` (técnico, i18n) — sem tracking/analytics                        |
| **Analytics**                | Nenhum (sem GA4, pixels, Sentry)                                             |
| **Login/Backend**            | Nenhum — site estático puro                                                  |
| **Pagamentos**               | Nenhum                                                                       |
| **Hospedagem**               | SSG (Vercel/Cloudflare)                                                      |
| **Público-alvo**             | BR + internacional (igrejas adventistas)                                     |
| **Monetização**              | Nenhuma no site atualmente                                                   |

## Matriz APLICA / N/A

| Skill                                       | Aplica?     | Justificativa                                                                |
| ------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `software-development/lgpd-compliance`      | **SIM**     | Coleta nome+email via form. Dados pessoais de brasileiros.                   |
| `legal/juridico-contratos-saas`             | **SIM**     | Precisa de Termos de Uso e Política de Privacidade.                          |
| `legal/juridico-direitos-autorais-musicais` | **SIM**     | Software gerencia música, projeção de letras, hinário, playback. Risco #1.   |
| `legal/juridico-consumidor-saas`            | **SIM**     | Se vier a monetizar, CDC se aplica (relação de consumo).                     |
| `legal/juridico-marcas-patentes`            | **SIM**     | Marca "LouvorJA" — verificar registro INPI.                                  |
| `legal/juridico-civil-responsabilidade`     | **SIM**     | Responsabilidade por dano (bug no software, perda de dados).                 |
| `legal/juridico-fontes-dados`               | **SIM**     | Web3Forms é subprocessador terceiro — ToS e dados.                           |
| `legal/juridico-ia-responsavel`             | **N/A**     | Site não usa LLM/IA para decisão automatizada.                               |
| `legal/juridico-tributario-pj-saas`         | **N/A**     | Sem receita atual. Aplica quando monetizar.                                  |
| `legal/juridico-saas-internacional`         | **N/A**     | Sem clientes internacionais pagantes.                                        |
| `legal/juridico-religioso-estatutario`      | **N/A**     | O site não é a igreja — é um software para igrejas.                          |
| `legal/juridico-eleitoral-apps`             | **N/A**     | Sem funcionalidade política/eleitoral.                                       |
| `legal/juridico-cibercrime`                 | **PARCIAL** | Incident response plan recomendado, mas sem dados sensíveis em larga escala. |
| `legal/juridico-open-source-compliance`     | **N/A**     | Projeto não open-source.                                                     |
| `legal/juridico-trabalho-digital`           | **N/A**     | Sem contratação de devs neste contexto.                                      |
| `legal/juridico-transporte-br`              | **N/A**     | Fora de escopo.                                                              |
| `legal/juridico-trabalhista-motoristas`     | **N/A**     | Fora de escopo.                                                              |
| `legal/juridico-crypto-blockchain`          | **N/A**     | Fora de escopo.                                                              |

## Documentos Gerados

| Arquivo                   | Função                     | Domínio                               |
| ------------------------- | -------------------------- | ------------------------------------- |
| `lgpd-compliance.md`      | Conformidade LGPD do site  | `lgpd-compliance`                     |
| `terms.md`                | Termos de Uso do site      | `juridico-contratos-saas`             |
| `copyright-compliance.md` | Direitos autorais musicais | `juridico-direitos-autorais-musicais` |

## Riscos Críticos (Top 5)

### 1. Direitos Autorais Musicais — RISCO ALTO

O PIANO gerencia hinário adventista, projeção de letras e playback. Execução pública de músicas em culto + projeção de letras + fonogramas é o cenário exato onde a Lei 9.610/98 se aplica. Hinário CPB pode ter restrições. ECAD pode cobrar.

### 2. Sem Páginas Legais — RISCO ALTO

O site não tem Termos de Uso nem Política de Privacidade. Formulário de contato coleta dados pessoais sem base legal documentada. ANPD e advogados verificam isso primeiro.

### 3. Formulário sem Consentimento Explícito — RISCO MÉDIO

O `contact.vue` não tem checkbox de consentimento LGPD. Usuário envia nome+email sem avisar que dados vão para Web3Forms (EUA). Violação Art. 8 LGPD.

### 4. Transferência Internacional sem Cláusulas — RISCO MÉDIO

Web3Forms processa dados em servidores EUA. Política de Privacidade precisa mencionar transferência internacional (Art. 33-36 LGPD) com salvaguarda adequada.

### 5. Marca não registrada — RISCO MÉDIO

"LouvorJA" — verificar se marca está registrada no INPI. Se criada por terceiro, pode haver conflito.

## Checklist de Implementação

### Antes de publicar o site (URGENTE)

- [ ] Criar página `/termos-de-uso` com Termos de Uso
- [ ] Criar página `/politica-de-privacidade` com Política LGPD
- [ ] Adicionar checkbox de consentimento no `contact.vue`
- [ ] Adicionar links legais no footer (`TheFooter.vue`)
- [ ] Adicionar links legais na página de contato
- [ ] Definir email DPO funcional (ex: `privacidade@pianolouvorja.com.br`)

### Antes de monetizar o PIANO (software)

- [ ] Acordos de licenciamento musical (CPB, ECAD)
- [ ] Termos de Uso do SOFTWARE (diferente do site)
- [ ] Política de Privacidade do SOFTWARE (com backend, login, dados de culto)
- [ ] Registro de marca INPI
- [ ] Contrato de prestação de serviço (SaaS)
- [ ] Compliance tributária PJ (Simples Nacional)

### Revisões

- **Frequência:** Anual
- **Próxima revisão:** 30 de julho de 2027
- **Gatilhos para revisão imediata:**
  - Adição de analytics/tracking ao site
  - Implementação de login/contas no software
  - Início de monetização
  - Mudanças na LGPD ou ECA Digital
  - Novo subprocessador

## Limitação

Esta auditoria foi gerada por agentes AI com skills jurídicas especializadas. É uma first-pass de qualidade alta, mas **NÃO substitui validação por advogado OAB** para:

- Registro de marca INPI
- Contratos B2B (se vier a vender o PIANO)
- Defesa judicial
- Acordos de licenciamento musical

**Custo estimado de validação humana:** R$ 2.000 - R$ 5.000 para o pacote completo.

---

_Orquestrado por `legal/legal-compliance-audit` (squad jurídico agentico Hermes)._
