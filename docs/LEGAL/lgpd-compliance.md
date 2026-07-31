# Conformidade LGPD — PIANO LouvorJA Site

> **Data:** 30 de julho de 2026
> **Skill de referência:** `software-development/lgpd-compliance`
> **Status:** First-pass AI-generated. Validação OAB necessária.
> **Escopo:** Landing page institucional (`piano-site`) — sem backend, sem login, sem analytics.

---

## 1. Mapeamento de Dados Pessoais

| Dado                  | Campo do form       | Origem             | Finalidade                                   |
| --------------------- | ------------------- | ------------------ | -------------------------------------------- |
| Nome                  | `form.name`         | Input do usuário   | Identificar remetente na mensagem de contato |
| Email                 | `form.email`        | Input do usuário   | Responder ao contato                         |
| Assunto               | `form.subject`      | Input do usuário   | Categorizar a mensagem                       |
| Mensagem              | `form.message`      | Input do usuário   | Conteúdo livre do contato                    |
| Preferência de idioma | Cookie `piano_lang` | Seleção do usuário | Manter idioma entre sessões                  |

**Dados NÃO coletados:** CPF, telefone, endereço, IP (em banco próprio), dados de navegação, dados sensíveis (religião, saúde). O site não tem GA4, pixels, Sentry ou qualquer tracking.

**Observação:** Embora o público seja adventista (religião), o site NÃO coleta dados sensíveis — apenas nome/email de quem voluntariamente preenche o formulário de contato.

---

## 2. Base Legal (Art. 7, LGPD)

| Dado                           | Base legal                                                      | Fundamento                                                           |
| ------------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Nome, email, assunto, mensagem | **Art. 7, I — Consentimento**                                   | Usuário voluntariamente preenche e envia o formulário                |
| Cookie `piano_lang`            | **Art. 7, IX — Execução de política pública** + isenção técnica | Cookie técnico necessário para funcionamento do i18n (sem profiling) |

**Consentimento deve ser:** livre, informado, inequívoco e para finalidade específica (Art. 8). Implementado via checkbox obrigatório no formulário (ver seção 10).

---

## 3. Subprocessadores

| Subprocessador                     | Localidade             | Dados processados                          | Finalidade                                        | Salvaguarda                                                                   |
| ---------------------------------- | ---------------------- | ------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Web3Forms**                      | EUA (servidores cloud) | Nome, email, assunto, mensagem             | Encaminhamento do formulário de contato por email | Cláusulas contratuais padrão (SCC) — ver política de privacidade do Web3Forms |
| **Vercel/Cloudflare** (hospedagem) | EUA (global edge)      | Logs de acesso (IP, timestamp, user-agent) | Servir conteúdo estático (SSG)                    | Nível adequado de proteção (certificações SOC 2, ISO 27001)                   |

**Observação:** O site é SSG (Static Site Generation) — o conteúdo é pré-renderizado e servido como HTML estático. Não há servidor de aplicação processando dados em tempo real além do submit do form.

---

## 4. Transferência Internacional (Art. 33-36, LGPD)

Web3Forms processa dados em servidores localizados nos EUA. Isso caracteriza transferência internacional de dados pessoais.

**Salvaguardas adotadas (Art. 33, II):**

- Cláusulas Contratuais Padrão (SCC) entre controlador (PIANO) e operador (Web3Forms)
- Web3Forms publica Política de Privacidade em `web3forms.com/privacy`
- Dados são usados exclusivamente para encaminhamento de email — sem profiling, sem venda de dados

**Recomendação:** Documentar na Política de Privacidade do site que dados do formulário são processados nos EUA via Web3Forms, citando Art. 33, II como salvaguarda.

---

## 5. Política de Cookies

### Cookie único: `piano_lang`

| Propriedade | Valor                                                        |
| ----------- | ------------------------------------------------------------ |
| Nome        | `piano_lang`                                                 |
| Tipo        | Técnico (essencial)                                          |
| Finalidade  | Armazenar preferência de idioma (PT-BR, EN, ES)              |
| Duração     | Sessão/persistente (configurável via `@nuxtjs/i18n`)         |
| Contém PII  | Não — armazena apenas código de idioma (`pt-BR`, `en`, `es`) |

**Banner de cookies necessário?** **NÃO.** A LGPD exige consentimento apenas para cookies de rastreamento/analytics/perfilamento. O cookie `piano_lang` é técnico (necessário para funcionamento), enquadrado na isenção do Art. 7, IX. Sem GA4, pixels ou cookies de terceiros = sem obrigação de banner opt-in.

**Conformidade ePrivacy/Cookie Law (UE):** Cookie técnico de preferência também é isento sob a diretiva ePrivacy para visitantes europeus.

---

## 6. Direitos do Titular (Art. 18, LGPD)

Sem sistema de login, os direitos do titular são exercidos via canal DPO (email). Todos devem ser atendidos em até **15 dias úteis** (prazo LGPD).

| Direito (Art. 18)                         | Como exercer   | Como atender (sem backend)                                     |
| ----------------------------------------- | -------------- | -------------------------------------------------------------- |
| I — Confirmação de tratamento             | Email para DPO | Confirmar que dados foram recebidos via Web3Forms              |
| II — Acesso aos dados                     | Email para DPO | Solicitar ao Web3Forms os registros do titular                 |
| III — Correção                            | Email para DPO | Não aplicável (dados em cache do Web3Forms — orientar reenvio) |
| IV — Anonimização/Bloqueio/Eliminação     | Email para DPO | Solicitar exclusão dos registros no Web3Forms                  |
| V — Portabilidade                         | Email para DPO | Exportar dados do Web3Forms em JSON/CSV                        |
| VI — Eliminação                           | Email para DPO | Solicitar delete completo no Web3Forms                         |
| VII — Informação sobre compartilhamento   | Email para DPO | Informar Web3Forms (EUA) como subprocessador                   |
| VIII — Informação sobre não consentimento | Email para DPO | Confirmar                                                      |
| IX — Oposição                             | Email para DPO | Não aplicável (sem perfilamento/legítimo interesse)            |

**Recomendação:** Criar template de resposta padronizado para cada direito, com prazo e procedimento claro.

---

## 7. Retenção de Dados

| Tipo de dado        | Local                       | Prazo de retenção                       | Base                                  |
| ------------------- | --------------------------- | --------------------------------------- | ------------------------------------- |
| Dados do formulário | Web3Forms (email/dashboard) | Até solicitação de exclusão ou 12 meses | Art. 15 (necessidade mínima)          |
| Logs de acesso (IP) | Vercel/Cloudflare           | 6 meses mínimo                          | Marco Civil Art. 15 (obrigação legal) |

**Sem banco de dados próprio:** O site SSG não armazena dados em banco próprio. Toda persistência é no Web3Forms (subprocessador).

---

## 8. Canal DPO (Art. 41, LGPD)

**Encarregado de Tratamento de Dados Pessoais (DPO):**

```
Nome: [A DEFINIR — Rafael Zendron ou designado]
Cargo: Encarregado de Proteção de Dados — PIANO LouvorJA
Email: privacidade@louvorja.app (TODO: configurar ao registrar domínio)
       Email temporário: rafael.zendron22@gmail.com
```

**Pitfall crítico:** O email DPO DEVE ser funcional. Se o domínio `louvorja.app` ainda não está registrado, usar Gmail temporário e migrar ao registrar. Verificar com `dig louvorja.app NS` antes de publicar.

**Funções do DPO:**

- Receber e tramitar solicitações dos titulares (Art. 18)
- Comunicar-se com a ANPD
- Orientar funcionários/colaboradores sobre LGPD
- Elaborar Relatório de Impacto (DPIA) se aplicável

---

## 9. Checklist de Conformidade

### Itens já implementados

- [x] Página de Política de Privacidade (`/privacy`)
- [x] Página de Termos de Uso (`/terms`)
- [x] Cookie técnico apenas (sem tracking/analytics)
- [x] i18n trilíngue (PT-BR, EN, ES) com páginas legais traduzidas
- [x] HTTPS forçado (Vercel/Cloudflare)
- [x] Site SSG — sem backend processando dados em runtime

### Itens pendentes (URGENTE)

- [ ] Checkbox de consentimento LGPD no `contact.vue` (Art. 8)
- [ ] Aviso de que dados vão para Web3Forms (EUA) no formulário
- [ ] Link para Política de Privacidade no formulário de contato
- [ ] Links legais no footer (`TheFooter.vue`)
- [ ] Email DPO funcional
- [ ] Documentar transferência internacional (Art. 33) na Política de Privacidade
- [ ] Template de resposta para direitos do titular (Art. 18)

### Itens não aplicáveis (perfil leve — sem backend)

- [N/A] Banner de cookies (sem cookies de tracking)
- [N/A] Rota de exportar dados (dados apenas no Web3Forms)
- [N/A] Rota de deletar conta (sem contas/login)
- [N/A] Criptografia PII em repouso (sem banco próprio)
- [N/A] Audit log Art. 37 (sem dados de menores/persistência própria)
- [N/A] Consentimento parental (sem coleta intencional de dados de menores)

---

## 10. Recomendações de Implementação

### 10.1 Checkbox de Consentimento no Formulário

Adicionar ao `contact.vue` antes do botão de envio:

```vue
<v-checkbox v-model="consent" :rules="[(v) => !!v || $t('contact.consentRequired')]" required>
  <template #label>
    <span class="text-body-2">
      {{ $t('contact.consentText') }}
      <NuxtLink to="/privacy" target="_blank">{{ $t('contact.consentLink') }}</NuxtLink>
    </span>
  </template>
</v-checkbox>
```

**Chaves i18n (adicionar aos 3 locales):**

```json
{
  "contact": {
    "consentText": "Autorizo o PIANO LouvorJA a armazenar meus dados (nome, email) para responder a este contato, conforme a Política de Privacidade e a LGPD. Os dados são processados via Web3Forms (EUA).",
    "consentLink": "Política de Privacidade",
    "consentRequired": "Você deve aceitar a Política de Privacidade para enviar a mensagem."
  }
}
```

**Validação:** `isValid` deve incluir `consent.value === true`.

### 10.2 Aviso de Transferência Internacional

Texto curto abaixo do formulário:

```
⚠ Seus dados (nome, email, mensagem) são processados pelo Web3Forms
em servidores nos EUA. Ao enviar, você concorda com esta transferência
internacional (Art. 33 LGPD). Veja nossa Política de Privacidade.
```

### 10.3 Links no Footer

Adicionar ao `TheFooter.vue` (em todos os locales):

```vue
<NuxtLink to="/privacy">{{ $t('footer.privacy') }}</NuxtLink>
<NuxtLink to="/terms">{{ $t('footer.terms') }}</NuxtLink>
```

### 10.4 Política de Privacidade — Atualizar

A `PRIVACY_POLICY_PT-BR.md` existente já cobre a maioria dos pontos. Verificar se inclui:

- [ ] Transferência internacional (Art. 33-36) com Web3Forms explícito
- [ ] Canal ANPD (`https://www.gov.br/anpd`) na seção de direitos
- [ ] DPO com nome identificado (Art. 41, § 2º)
- [ ] Política de incidentes (Art. 48) — comunicação à ANPD em 72h

---

## Sanções Aplicáveis (Art. 52-53)

| Sanção            | Valor/Risco                                |
| ----------------- | ------------------------------------------ |
| Advertência       | Pública — dano reputacional                |
| Multa simples     | Até 2% faturamento, máx R$50M por infração |
| Multa diária      | Até regularização                          |
| Bloqueio de dados | Relacionados à infração                    |

**Realidade:** Para projeto sem receita atual, multa seria baseada no valor mínimo. Mas dano reputacional e custos de defesa são significativos mesmo sem faturamento.

---

## Revisão

- **Frequência:** Anual
- **Próxima revisão:** 30 de julho de 2027
- **Gatilhos para revisão imediata:**
  - Adição de analytics/tracking ao site
  - Troca do Web3Forms por outro subprocessador
  - Implementação de login/backend no site
  - Início de monetização
  - Mudanças na LGPD ou regulamentações da ANPD

---

## Limitação

Este documento foi gerado por agente AI com skill jurídica especializada (`software-development/lgpd-compliance`). É uma first-pass de qualidade alta, mas **NÃO substitui validação por advogado OAB** para pontos críticos como:

- Contrato formal com Web3Forms (DPA — Data Processing Agreement)
- Registro formal do DPO
- Resposta a notificação da ANPD

**Custo estimado de validação humana:** R$ 1.000 - R$ 2.000 (escopo apenas do site institucional).

---

_Referência: Lei 13.709/2018 (LGPD), Lei 12.965/2014 (Marco Civil), skill `software-development/lgpd-compliance`._
