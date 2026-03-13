// Trigger reveal animations on scroll
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

const observeRevealElements = () => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => revealObserver.observe(el));
};

// Benefits toggle
const initBenefits = () => {
    document.querySelectorAll('.benefits-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const footer = btn.closest('.ticket-footer');
            const list = footer.querySelector('.benefits-list');
            const arrow = btn.querySelector('.benefits-arrow');
            list.classList.toggle('open');
            arrow.classList.toggle('open');
        });
    });
};

// Ver mais testimonials
const initVerMais = () => {
    const btn = document.getElementById('ver-mais-btn');
    const more = document.getElementById('testimonials-more');
    if (!btn || !more) return;

    btn.addEventListener('click', () => {
        const isOpen = more.classList.toggle('open');
        btn.classList.toggle('open');
        btn.querySelector('span').textContent = isOpen ? 'Ver menos' : 'Ver mais';
        if (isOpen) {
            observeRevealElements();
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    observeRevealElements();
    initBenefits();
    initVerMais();
});

// ============== LEAD FORM MRCC ==============
const MRCC_CONFIG = {
    webhook: { url: 'https://webhook-editor.infrab42.com/webhook/leads-lista-espera', funnelId: 13, timeout: 10000 },
    redirect: { url: '/', delay: 500 },
    validation: { emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, nameMinLength: 3 }
};

const mrccState = { isSubmitting: false, phoneInput: null, userLocation: null };

function mrccLoadIntlTelInput(callback) {
    if (window.intlTelInput) { callback(); return; }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.min.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

function mrccApplyBRMask(v) {
    const n = v.replace(/\D/g, '');
    let f = '';
    if (n.length >= 1) f = '(' + n.substring(0, 2);
    if (n.length >= 3) f += ') ' + n.substring(2, 7);
    if (n.length >= 8) f += '-' + n.substring(7, 11);
    return f;
}

function mrccRemoveBRMask(v) { return v.replace(/\D/g, ''); }

function mrccShowError(field, msg) {
    field.classList.add('error');
    const old = field.parentElement.querySelector('.error-message');
    if (old) old.remove();
    const span = document.createElement('span');
    span.className = 'error-message';
    span.textContent = msg;
    field.parentElement.appendChild(span);
}

function mrccRemoveError(field) {
    field.classList.remove('error');
    const m = field.parentElement.querySelector('.error-message');
    if (m) m.remove();
}

function mrccValidateField(field) {
    const v = field.value.trim();
    let err = '';
    if (field.id === 'name') {
        if (!v) err = 'Nome é obrigatório';
        else if (v.length < 3) err = 'Nome muito curto';
    } else if (field.id === 'email') {
        if (!v) err = 'E-mail é obrigatório';
        else if (!MRCC_CONFIG.validation.emailRegex.test(v)) err = 'E-mail inválido';
    } else if (field.id === 'education') {
        if (!v) err = 'Selecione uma opção';
    }
    if (err) { mrccShowError(field, err); return false; }
    return true;
}

function mrccValidatePhone() {
    const el = document.querySelector('#phone');
    if (!mrccState.phoneInput || !mrccState.phoneInput.isValidNumber()) {
        mrccShowError(el, 'Telefone inválido');
        return false;
    }
    mrccRemoveError(el);
    return true;
}

function mrccGetUTM(p) { return new URLSearchParams(window.location.search).get(p) || ''; }

async function mrccGetLocation() {
    try { return await (await fetch('https://ipinfo.io/json')).json(); }
    catch(e) { return { city: 'Unknown', region: 'Unknown', country: 'BR' }; }
}

function mrccInitPhoneInput() {
    const phoneInput = document.querySelector('#phone');
    if (!phoneInput) return;
    const setup = () => {
        try {
            mrccState.phoneInput = window.intlTelInput(phoneInput, {
                initialCountry: 'br',
                preferredCountries: ['br', 'us', 'pt'],
                separateDialCode: true,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
                autoPlaceholder: 'polite',
                formatOnDisplay: true
            });
            phoneInput.addEventListener('input', function() {
                mrccRemoveError(this);
                const c = mrccState.phoneInput.getSelectedCountryData();
                if (c.iso2 === 'br') {
                    const pos = this.selectionStart, old = this.value.length;
                    this.value = mrccApplyBRMask(this.value);
                    const diff = this.value.length - old;
                    this.setSelectionRange(pos + diff, pos + diff);
                }
            });
            phoneInput.addEventListener('countrychange', function() {
                const c = mrccState.phoneInput.getSelectedCountryData();
                if (c.iso2 !== 'br') this.value = mrccRemoveBRMask(this.value);
                else if (this.value) this.value = mrccApplyBRMask(this.value);
            });
        } catch(e) {}
    };
    phoneInput.addEventListener('focus', () => mrccLoadIntlTelInput(setup), { once: true });
}

function mrccInitForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;
    ['name', 'email', 'education'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => mrccValidateField(el));
            el.addEventListener('input', () => mrccRemoveError(el));
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (mrccState.isSubmitting) return;
        const ok = mrccValidateField(document.getElementById('name'))
            & mrccValidateField(document.getElementById('email'))
            & mrccValidatePhone()
            & mrccValidateField(document.getElementById('education'));
        if (!ok) return;
        mrccState.isSubmitting = true;
        const btn = document.getElementById('submitBtn');
        if (btn) { btn.classList.add('loading'); btn.disabled = true; }
        const country = mrccState.phoneInput ? mrccState.phoneInput.getSelectedCountryData() : { dialCode: '55' };
        const loc = mrccState.userLocation || {};
        const data = {
            funnel_id: MRCC_CONFIG.webhook.funnelId,
            datetime: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }),
            name: document.getElementById('name').value.trim(),
            ddi: country.dialCode,
            phone: mrccRemoveBRMask(document.getElementById('phone').value),
            email: document.getElementById('email').value.trim(),
            educationLevel: document.getElementById('education').value,
            device: navigator.userAgent,
            city: loc.city || 'Unknown',
            state: loc.region || 'Unknown',
            country: (loc.country || 'BR').toLowerCase(),
            page: window.location.href,
            utm_source: mrccGetUTM('utm_source'),
            utm_medium: mrccGetUTM('utm_medium'),
            utm_campaign: mrccGetUTM('utm_campaign'),
            utm_term: mrccGetUTM('utm_term'),
            utm_content: mrccGetUTM('utm_content')
        };
        try {
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), MRCC_CONFIG.webhook.timeout);
            await fetch(MRCC_CONFIG.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: ctrl.signal
            });
            clearTimeout(tid);
            const email = encodeURIComponent(document.getElementById('email').value.trim());
            const name = encodeURIComponent(document.getElementById('name').value.trim());
            const utms = ['utm_source','utm_campaign','utm_medium','utm_content','utm_term']
                .map(p => mrccGetUTM(p) ? `${p}=${encodeURIComponent(mrccGetUTM(p))}` : '').filter(Boolean).join('&');
            let url = MRCC_CONFIG.redirect.url + `?email=${email}&name=${name}`;
            if (utms) url += '&' + utms;
            setTimeout(() => { window.location.href = url; }, MRCC_CONFIG.redirect.delay);
        } catch(err) {
            alert('Erro ao enviar. Tente novamente.');
            mrccState.isSubmitting = false;
            if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
        }
    });
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => mrccGetLocation().then(l => { mrccState.userLocation = l; }).catch(() => {}));
    } else {
        setTimeout(() => mrccGetLocation().then(l => { mrccState.userLocation = l; }).catch(() => {}), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    mrccInitPhoneInput();
    mrccInitForm();
});

// ============== LEAD FORM #2 (bottom) ==============
const mrccState2 = { isSubmitting: false, phoneInput: null, userLocation: null };

function mrccValidateField2(field) {
    const v = field.value.trim();
    let err = '';
    if (field.id === 'name2') {
        if (!v) err = 'Nome é obrigatório';
        else if (v.length < 3) err = 'Nome muito curto';
    } else if (field.id === 'email2') {
        if (!v) err = 'E-mail é obrigatório';
        else if (!MRCC_CONFIG.validation.emailRegex.test(v)) err = 'E-mail inválido';
    } else if (field.id === 'education2') {
        if (!v) err = 'Selecione uma opção';
    }
    if (err) { mrccShowError(field, err); return false; }
    mrccRemoveError(field);
    return true;
}

function mrccValidatePhone2() {
    const el = document.querySelector('#phone2');
    if (!mrccState2.phoneInput || !mrccState2.phoneInput.isValidNumber()) {
        mrccShowError(el, 'Telefone inválido');
        return false;
    }
    mrccRemoveError(el);
    return true;
}

function mrccInitPhoneInput2() {
    const phoneInput = document.querySelector('#phone2');
    if (!phoneInput) return;
    const setup = () => {
        try {
            mrccState2.phoneInput = window.intlTelInput(phoneInput, {
                initialCountry: 'br',
                preferredCountries: ['br', 'us', 'pt'],
                separateDialCode: true,
                utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js',
                autoPlaceholder: 'polite',
                formatOnDisplay: true
            });
            phoneInput.addEventListener('input', function() {
                mrccRemoveError(this);
                const c = mrccState2.phoneInput.getSelectedCountryData();
                if (c.iso2 === 'br') {
                    const pos = this.selectionStart, old = this.value.length;
                    this.value = mrccApplyBRMask(this.value);
                    const diff = this.value.length - old;
                    this.setSelectionRange(pos + diff, pos + diff);
                }
            });
            phoneInput.addEventListener('countrychange', function() {
                const c = mrccState2.phoneInput.getSelectedCountryData();
                if (c.iso2 !== 'br') this.value = mrccRemoveBRMask(this.value);
                else if (this.value) this.value = mrccApplyBRMask(this.value);
            });
        } catch(e) {}
    };
    phoneInput.addEventListener('focus', () => mrccLoadIntlTelInput(setup), { once: true });
}

function mrccInitForm2() {
    const form = document.getElementById('leadForm2');
    if (!form) return;
    ['name2', 'email2', 'education2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => mrccValidateField2(el));
            el.addEventListener('input', () => mrccRemoveError(el));
        }
    });
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (mrccState2.isSubmitting) return;
        const ok = mrccValidateField2(document.getElementById('name2'))
            & mrccValidateField2(document.getElementById('email2'))
            & mrccValidatePhone2()
            & mrccValidateField2(document.getElementById('education2'));
        if (!ok) return;
        mrccState2.isSubmitting = true;
        const btn = document.getElementById('submitBtn2');
        if (btn) { btn.classList.add('loading'); btn.disabled = true; }
        const country = mrccState2.phoneInput ? mrccState2.phoneInput.getSelectedCountryData() : { dialCode: '55' };
        const loc = mrccState2.userLocation || mrccState.userLocation || {};
        const data = {
            funnel_id: MRCC_CONFIG.webhook.funnelId,
            datetime: new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }),
            name: document.getElementById('name2').value.trim(),
            ddi: country.dialCode,
            phone: mrccRemoveBRMask(document.getElementById('phone2').value),
            email: document.getElementById('email2').value.trim(),
            educationLevel: document.getElementById('education2').value,
            device: navigator.userAgent,
            city: loc.city || 'Unknown',
            state: loc.region || 'Unknown',
            country: (loc.country || 'BR').toLowerCase(),
            page: window.location.href,
            utm_source: mrccGetUTM('utm_source'),
            utm_medium: mrccGetUTM('utm_medium'),
            utm_campaign: mrccGetUTM('utm_campaign'),
            utm_term: mrccGetUTM('utm_term'),
            utm_content: mrccGetUTM('utm_content')
        };
        try {
            const ctrl = new AbortController();
            const tid = setTimeout(() => ctrl.abort(), MRCC_CONFIG.webhook.timeout);
            await fetch(MRCC_CONFIG.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                signal: ctrl.signal
            });
            clearTimeout(tid);
            const email = encodeURIComponent(document.getElementById('email2').value.trim());
            const name = encodeURIComponent(document.getElementById('name2').value.trim());
            const utms = ['utm_source','utm_campaign','utm_medium','utm_content','utm_term']
                .map(p => mrccGetUTM(p) ? `${p}=${encodeURIComponent(mrccGetUTM(p))}` : '').filter(Boolean).join('&');
            let url = MRCC_CONFIG.redirect.url + `?email=${email}&name=${name}`;
            if (utms) url += '&' + utms;
            setTimeout(() => { window.location.href = url; }, MRCC_CONFIG.redirect.delay);
        } catch(err) {
            alert('Erro ao enviar. Tente novamente.');
            mrccState2.isSubmitting = false;
            if (btn) { btn.classList.remove('loading'); btn.disabled = false; }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    mrccInitPhoneInput2();
    mrccInitForm2();
});
