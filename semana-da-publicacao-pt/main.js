/**
 * Main JavaScript - Semana da Publicação
 * Desenvolvido com padrões de código sênior
 */

// Configurações
const CONFIG = {
  webhook: {
    url: 'https://webhook-editor.infrab42.com/webhook/leads-lista-espera', // Configure no ambiente de produção
    funnelId: 12,
    timeout: 10000
  },
  redirect: {
    url: 'https://metaanalysisacademy.com/semana-da-publicacao/obrigado-sdp',
    delay: 500
  },
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    nameMinLength: 3
  }
};

// State Management
const state = {
  isSubmitting: false,
  phoneInput: null,
  userLocation: null
};

/**
 * Inicialização do App
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Carrega localização do usuário
  try {
    state.userLocation = await getUserLocation();
    console.log('Localização detectada:', state.userLocation);
  } catch (error) {
    console.warn('Não foi possível detectar localização:', error);
  }

  // Inicializações existentes
  initPhoneInput();
  initFormValidation();
  initFormSubmit();
  setupAccessibility();
});

/**
 * Inicializa o campo de telefone com intl-tel-input
 */
function initPhoneInput() {
  const phoneInput = document.querySelector('#phone');

  if (!phoneInput) {
    console.error('Phone input não encontrado');
    return;
  }

  try {
    state.phoneInput = window.intlTelInput(phoneInput, {
      initialCountry: 'br',
      preferredCountries: ['br', 'us', 'pt'],
      separateDialCode: true,
      utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
      autoPlaceholder: 'polite',
      formatOnDisplay: true
    });

    // Remove error ao começar a digitar
    phoneInput.addEventListener('input', () => {
      removeError(phoneInput);
    });

    // Aplica máscara brasileira quando país for Brasil
    phoneInput.addEventListener('input', function() {
      const selectedCountry = state.phoneInput.getSelectedCountryData();

      // Aplica máscara apenas para Brasil (country code 'br')
      if (selectedCountry.iso2 === 'br') {
        const cursorPosition = this.selectionStart;
        const oldLength = this.value.length;

        this.value = applyBrazilianPhoneMask(this.value);

        // Ajusta posição do cursor após formatação
        const newLength = this.value.length;
        const newPosition = cursorPosition + (newLength - oldLength);
        this.setSelectionRange(newPosition, newPosition);
      }
    });

    // Detecta mudança de país no dropdown
    phoneInput.addEventListener('countrychange', function() {
      const selectedCountry = state.phoneInput.getSelectedCountryData();

      // Se mudou para Brasil e há valor, aplica máscara
      if (selectedCountry.iso2 === 'br' && this.value) {
        this.value = applyBrazilianPhoneMask(this.value);
      }
      // Se mudou de Brasil para outro país, remove máscara
      else if (selectedCountry.iso2 !== 'br' && this.value) {
        this.value = removeBrazilianPhoneMask(this.value);
      }
    });

  } catch (error) {
    console.error('Erro ao inicializar phone input:', error);
  }
}

/**
 * Configuração de validação em tempo real
 */
function initFormValidation() {
  const inputs = ['name', 'email', 'education'];
  
  inputs.forEach(inputId => {
    const element = document.getElementById(inputId);
    if (element) {
      element.addEventListener('blur', () => validateField(element));
      element.addEventListener('input', () => removeError(element));
    }
  });
}

/**
 * Valida um campo individual
 */
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';

  switch (field.id) {
    case 'name':
      if (!value) {
        errorMessage = 'Nome é obrigatório';
        isValid = false;
      } else if (value.length < CONFIG.validation.nameMinLength) {
        errorMessage = 'Nome muito curto';
        isValid = false;
      }
      break;

    case 'email':
      if (!value) {
        errorMessage = 'E-mail é obrigatório';
        isValid = false;
      } else if (!CONFIG.validation.emailRegex.test(value)) {
        errorMessage = 'E-mail inválido';
        isValid = false;
      }
      break;

    case 'education':
      if (!value) {
        errorMessage = 'Selecione sua formação';
        isValid = false;
      }
      break;
  }

  if (!isValid) {
    showError(field, errorMessage);
  }

  return isValid;
}

/**
 * Valida o telefone
 */
function validatePhone() {
  const phoneInput = document.querySelector('#phone');
  
  if (!state.phoneInput) {
    showError(phoneInput, 'Erro ao validar telefone');
    return false;
  }

  if (!state.phoneInput.isValidNumber()) {
    showError(phoneInput, 'Telefone inválido');
    return false;
  }

  removeError(phoneInput);
  return true;
}

/**
 * Exibe erro no campo
 */
function showError(field, message) {
  field.classList.add('error');
  
  // Remove mensagem antiga se existir
  const oldError = field.parentElement.querySelector('.error-message');
  if (oldError) {
    oldError.remove();
  }

  // Adiciona nova mensagem
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.setAttribute('role', 'alert');
  field.parentElement.appendChild(errorElement);

  // Foca no campo com erro
  field.focus();

  // Track validation error
  trackEvent('form_validation_error', {
    eventCategory: 'Form',
    eventAction: 'Validation Error',
    eventLabel: field.id,
    error_message: message
  });
}

/**
 * Remove erro do campo
 */
function removeError(field) {
  field.classList.remove('error');
  const errorMessage = field.parentElement.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}

/**
 * Inicializa submit do formulário
 */
function initFormSubmit() {
  const form = document.getElementById('leadForm');
  
  if (!form) {
    console.error('Formulário não encontrado');
    return;
  }

  form.addEventListener('submit', handleFormSubmit);
}

/**
 * Handler do submit do formulário
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  // Previne múltiplos submits
  if (state.isSubmitting) {
    return;
  }

  // Valida todos os campos
  const nameValid = validateField(document.getElementById('name'));
  const emailValid = validateField(document.getElementById('email'));
  const phoneValid = validatePhone();
  const educationValid = validateField(document.getElementById('education'));

  if (!nameValid || !emailValid || !phoneValid || !educationValid) {
    return;
  }

  // Coleta os dados
  const formData = collectFormData();

  // Inicia loading
  setLoadingState(true);

  try {
    // Envia para o webhook
    await sendToWebhook(formData);

    // Prepara dados para o redirect
    const email = encodeURIComponent(document.getElementById('email').value.trim());
    const name = encodeURIComponent(document.getElementById('name').value.trim());
    const utmParams = getAllUTMParams();

    // Cria parâmetro src com todos os UTMs separados por |
    const utmValues = [];
    if (utmParams.utmSource) utmValues.push(`utm_source=${utmParams.utmSource}`);
    if (utmParams.utmCampaign) utmValues.push(`utm_campaign=${utmParams.utmCampaign}`);
    if (utmParams.utmMedium) utmValues.push(`utm_medium=${utmParams.utmMedium}`);
    if (utmParams.utmContent) utmValues.push(`utm_content=${utmParams.utmContent}`);
    if (utmParams.utmTerm) utmValues.push(`utm_term=${utmParams.utmTerm}`);

    const srcValue = utmValues.length > 0 ? utmValues.join('|') : '';

    // Monta URL de destino
    let redirectUrl = CONFIG.redirect.url;
    const params = [`email=${email}`, `name=${name}`];

    // Adiciona parâmetro src combinado se existir
    if (srcValue) {
      params.push(`src=${encodeURIComponent(srcValue)}`);
    }

    // Adiciona UTMs individuais
    if (utmParams.utmSource) params.push(`utm_source=${encodeURIComponent(utmParams.utmSource)}`);
    if (utmParams.utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmParams.utmCampaign)}`);
    if (utmParams.utmMedium) params.push(`utm_medium=${encodeURIComponent(utmParams.utmMedium)}`);
    if (utmParams.utmContent) params.push(`utm_content=${encodeURIComponent(utmParams.utmContent)}`);
    if (utmParams.utmTerm) params.push(`utm_term=${encodeURIComponent(utmParams.utmTerm)}`);

    // Detecta se já existe ? na URL
    if (params.length > 0) {
      const separator = redirectUrl.includes('?') ? '&' : '?';
      redirectUrl += separator + params.join('&');
    }

    // Redireciona após delay
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, CONFIG.redirect.delay);

  } catch (error) {
    console.error('Erro no envio:', error);
    handleSubmitError(error);
    setLoadingState(false);
  }
}

/**
 * Coleta dados do formulário
 */
function collectFormData() {
  // Captura UTM parameters
  const utmParams = getAllUTMParams();

  // Extrai DDI (dial code) do país selecionado
  const selectedCountry = state.phoneInput.getSelectedCountryData();
  const ddi = selectedCountry.dialCode;

  // Remove máscara do telefone antes de enviar
  const phoneValue = document.getElementById('phone').value;
  const phoneClean = removeBrazilianPhoneMask(phoneValue);

  // Formata datetime para timezone de São Paulo
  const datetime = new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Sao_Paulo'
  });

  return {
    funnel_id: CONFIG.webhook.funnelId,
    datetime: datetime,
    name: document.getElementById('name').value.trim(),
    ddi: ddi,
    phone: phoneClean,
    email: document.getElementById('email').value.trim(),
    educationLevel: document.getElementById('education').value,
    device: navigator.userAgent,
    city: state.userLocation?.city || 'Desconhecido',
    state: state.userLocation?.region || 'Desconhecido',
    country: state.userLocation?.country ? state.userLocation.country.toLowerCase() : 'br',
    page: window.location.href,
    utm_source: utmParams.utmSource,
    utm_medium: utmParams.utmMedium,
    utm_campaign: utmParams.utmCampaign,
    utm_term: utmParams.utmTerm,
    utm_content: utmParams.utmContent
  };
}

/**
 * Envia dados para o webhook
 */
async function sendToWebhook(data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.webhook.timeout);

  try {
    const response = await fetch(CONFIG.webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout: requisição demorou muito');
    }
    throw error;
  }
}

/**
 * Trata erros no envio
 */
function handleSubmitError(error) {
  const message = error.message || 'Erro ao enviar formulário. Tente novamente.';
  
  // Exibe alerta amigável
  alert(message);

  // Log para debug
  console.error('Submit Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

/**
 * Gerencia estado de loading
 */
function setLoadingState(loading) {
  state.isSubmitting = loading;
  const submitBtn = document.getElementById('submitBtn');
  
  if (submitBtn) {
    if (loading) {
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
    } else {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  }
}

/**
 * Configurações de acessibilidade
 */
function setupAccessibility() {
  // Adiciona aria-live para feedback de validação
  const form = document.getElementById('leadForm');
  if (form) {
    form.setAttribute('aria-live', 'polite');
  }

  // Melhora navegação por teclado nos botões CTA
  const ctaButtons = document.querySelectorAll('.learning-cta button, .final-button');
  ctaButtons.forEach(btn => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');
  });
}

/**
 * Utilitários - Debounce
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Detecta localização do usuário via ipinfo.io
 * @returns {Promise<Object>} Objeto com city, region, country
 */
async function getUserLocation() {
  try {
    const response = await fetch('https://ipinfo.io/json');
    return await response.json();
  } catch (error) {
    console.warn('Não foi possível detectar localização:', error);
    return { city: 'Desconhecido', region: 'Desconhecido', country: 'BR' };
  }
}

/**
 * Extrai parâmetro UTM da URL
 * @param {string} param - Nome do parâmetro (ex: 'utm_source')
 * @returns {string} Valor do parâmetro ou string vazia
 */
function getUTMParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param) || '';
}

/**
 * Captura todos os parâmetros UTM da URL
 * @returns {Object} Objeto com todos os UTMs
 */
function getAllUTMParams() {
  return {
    utmSource: getUTMParam('utm_source'),
    utmCampaign: getUTMParam('utm_campaign'),
    utmMedium: getUTMParam('utm_medium'),
    utmContent: getUTMParam('utm_content'),
    utmTerm: getUTMParam('utm_term')
  };
}

/**
 * Aplica máscara brasileira progressiva no telefone
 * Formato: (XX) XXXXX-XXXX
 * @param {string} value - Valor do input
 * @returns {string} Valor formatado
 */
function applyBrazilianPhoneMask(value) {
  const numbers = value.replace(/\D/g, '');
  let formatted = '';

  if (numbers.length >= 1) {
    formatted = '(' + numbers.substring(0, 2);
  }
  if (numbers.length >= 3) {
    formatted += ') ' + numbers.substring(2, 7);
  }
  if (numbers.length >= 8) {
    formatted += '-' + numbers.substring(7, 11);
  }

  return formatted;
}

/**
 * Remove máscara do telefone (apenas números)
 * @param {string} value - Valor formatado
 * @returns {string} Apenas números
 */
function removeBrazilianPhoneMask(value) {
  return value.replace(/\D/g, '');
}

/**
 * Limpa todos os campos do formulário
 */
function clearFormFields() {
  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('education').value = '';
}

/**
 * Analytics Helper - Integrado com GTM dataLayer
 * @param {string} eventName - Nome do evento
 * @param {object} eventData - Dados do evento
 */
function trackEvent(eventName, eventData = {}) {
  // Push para dataLayer (GTM captura automaticamente)
  if (window.dataLayer) {
    // Usa setTimeout(0) para não bloquear INP (Core Web Vitals)
    setTimeout(() => {
      window.dataLayer.push({
        event: eventName,
        ...eventData
      });
    }, 0);
  }

  // Mantém compatibilidade com GA4 direto (se existir)
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }

  // Mantém compatibilidade com Facebook Pixel (se existir)
  if (window.fbq) {
    window.fbq('track', eventName, eventData);
  }

  // Debug log
  console.log('Event tracked:', eventName, eventData);
}

// Exporta funções para uso global se necessário
window.trackEvent = trackEvent;
