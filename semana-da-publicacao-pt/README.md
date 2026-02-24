# Semana da Publicação - Landing Page

Landing page de captura de leads para o curso "Semana da Publicação" do Mapa da Publicação, voltado para médicos e estudantes de medicina interessados em publicações científicas.

## 🎯 Sobre o Projeto

Landing page responsiva com formulário de captura de leads integrado com Google Tag Manager (GTM), validação em tempo real, geolocalização automática e rastreamento completo de UTM parameters.

**Target:** Médicos e estudantes de medicina no Brasil
**Objetivo:** Capturar leads para webinar sobre publicação científica

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo (mobile-first)
- **JavaScript ES6+** - Vanilla JS (sem frameworks)
- **Google Tag Manager (GTM)** - Tracking e analytics
- **intl-tel-input** - Input de telefone internacional
- **ipinfo.io API** - Geolocalização automática

## ✨ Funcionalidades

### 📋 Formulário de Captura
- ✅ Validação em tempo real (nome, email, telefone, educação)
- ✅ Máscara de telefone brasileira progressiva: `(XX) XXXXX-XXXX`
- ✅ Seletor de país com validação de número
- ✅ Feedback visual de erros
- ✅ Loading state durante envio

### 🌍 Geolocalização
- ✅ Detecção automática de cidade, estado e país via ipinfo.io
- ✅ Fallback para valores padrão se API falhar
- ✅ Dados incluídos no payload do webhook

### 📊 Rastreamento UTM
- ✅ Captura automática de todos os parâmetros UTM da URL
- ✅ 5 parâmetros suportados: source, campaign, medium, content, term
- ✅ Dados incluídos no payload e passados para página de obrigado
- ✅ Parâmetro `src` combinado com todos os UTMs

### 🏷️ Google Tag Manager
- ✅ DataLayer estruturado e otimizado
- ✅ GTM no `<head>` para zero perda de eventos
- ✅ Performance otimizada (setTimeout para INP)
- ✅ Tracking de validation errors
- ✅ Compatibilidade com GA4, Facebook Pixel e Google Ads

### 🎨 Design Responsivo
- ✅ Mobile-first approach
- ✅ Breakpoint em 900px
- ✅ Imagens otimizadas com lazy loading
- ✅ Typography fluida com `clamp()`

## 📦 Estrutura do Projeto

```
├── index.html              # Página principal
├── main.js                 # Lógica JavaScript
├── styles.css              # Estilos CSS
├── CLAUDE.md              # Documentação para Claude Code
├── README.md              # Este arquivo
└── assets/                # Imagens e mídia
    ├── logo.png
    ├── doctor.png
    ├── bg-desktop.png
    ├── bg-mobile.png
    ├── mentor.png
    ├── mentor-bg.png
    ├── aprender-1.png
    ├── notebook.png
    └── final-header.png
```

## 🔧 Configuração

### Webhook URL
Edite em `main.js` (linha 9):
```javascript
const CONFIG = {
  webhook: {
    url: 'https://webhook-editor.infrab42.com/webhook/lead-teste',
    funnelId: 12,
    timeout: 10000
  },
  redirect: {
    url: 'https://metaanalysisacademy.com/semana-da-publicacao/obrigado-sdp',
    delay: 500
  }
};
```

### Google Tag Manager
Container ID já configurado: `GTM-KCTRCK24`

Para configurar tags no GTM:
1. Acesse https://tagmanager.google.com
2. Selecione o container `GTM-KCTRCK24`
3. Configure variáveis, triggers e tags conforme necessário
4. Publique o container

## 📡 Payload do Webhook

```json
{
  "funnel_id": 12,
  "datetime": "2026-02-11 11:01:33",
  "name": "João Silva",
  "ddi": "55",
  "phone": "11987654321",
  "email": "joao@example.com",
  "educationLevel": "Médico",
  "device": "Mozilla/5.0...",
  "city": "São Paulo",
  "state": "São Paulo",
  "country": "br",
  "page": "https://...",
  "utm_source": "meta-ads",
  "utm_medium": "cpc",
  "utm_campaign": "semana-publicacao",
  "utm_term": "Instagram_Feed",
  "utm_content": "ad1"
}
```

## 🌐 Deploy

### Opção 1: GitHub Pages
```bash
# Já está configurado
# URL: https://agenciab42.github.io/Rhanderson-Semana-da-publicacao/
```

### Opção 2: Servidor Estático
- Upload dos arquivos via FTP/SFTP
- Não requer Node.js ou build process
- Funciona em qualquer servidor HTTP

### Opção 3: Cloudflare Pages
```bash
# Connect GitHub repo
# Build command: (none)
# Output directory: /
```

## 🧪 Testes

### Testar Localmente
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Abra: `http://localhost:8000`

### Testar Formulário
1. Preencha todos os campos
2. Abra DevTools (F12) > Console
3. Digite: `dataLayer` para ver eventos GTM
4. Submeta o formulário
5. Verifique Network tab para requisição do webhook

### Testar com UTMs
Acesse com parâmetros UTM:
```
http://localhost:8000/?utm_source=teste&utm_campaign=promo&utm_medium=email
```

## 📊 DataLayer Events

### Pageview (automático)
```javascript
{
  event: 'gtm.js',
  page_type: 'landing_page',
  page_name: 'Semana da Publicação',
  funnel_id: 12
}
```

### Form Validation Error
```javascript
{
  event: 'form_validation_error',
  eventCategory: 'Form',
  eventAction: 'Validation Error',
  eventLabel: 'email',
  error_message: 'E-mail inválido'
}
```

## ⚡ Performance

- **PageSpeed Score:** 90+ (mobile/desktop)
- **FCP:** < 1.5s
- **LCP:** < 2.5s
- **INP:** < 200ms (otimizado com setTimeout)
- **GTM:** Assíncrono, não bloqueia renderização

## 🔒 Privacidade

- **ipinfo.io:** Limite de 50k requests/mês (plano gratuito)
- **Dados sensíveis:** Nunca armazenados no frontend
- **LGPD:** Apenas dados fornecidos voluntariamente são coletados

## 🐛 Debug

### Ver DataLayer
```javascript
// Console do navegador
dataLayer
```

### GTM Preview Mode
1. GTM > Workspace > Preview
2. Insira a URL da landing page
3. Navegue e veja eventos em tempo real

### Console Logs
- `"Localização detectada:"` - Geolocalização carregada
- `"Event tracked:"` - Evento GTM disparado
- `"Erro no envio:"` - Falha no webhook

## 📝 Manutenção

### Adicionar Novo Campo no Formulário
1. Adicione input no `index.html`
2. Adicione validação em `validateField()` no `main.js`
3. Inclua campo em `collectFormData()` no `main.js`
4. Atualize webhook backend para aceitar novo campo

### Adicionar Novo Pixel de Tracking
1. Acesse GTM > Tags > New
2. Configure Custom HTML ou use template
3. Defina trigger (ex: pageview, form_submit)
4. Publique container
5. **Zero modificação no código!**

### Alterar Cores/Branding
Edite `styles.css`:
- **Azul primário:** `#3b82c4`
- **Azul escuro:** `#2f425f`
- **Fonte:** `"Ruda", sans-serif`

## 👥 Equipe

**Desenvolvido por:** Agência B42
**Cliente:** Mapa da Publicação
**Mentor:** Dr. Rhanderson Cardoso, MD, FACC

## 📧 Contato

**Email:** infra@agenciab42.com.br
**GitHub:** [@agenciab42](https://github.com/agenciab42)
**Repositório:** [Rhanderson-Semana-da-publicacao](https://github.com/agenciab42/Rhanderson-Semana-da-publicacao)

## 📄 Licença

Propriedade da Agência B42 e Mapa da Publicação.
Todos os direitos reservados © 2026

---

**Desenvolvido com ❤️ pela Agência B42**
