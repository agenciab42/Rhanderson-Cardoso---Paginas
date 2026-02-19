// ========================================
// Configuration
// ========================================
const CONFIG = {
    webhook: {
        url: 'https://webhook-editor.infrab42.com/webhook/leads-lista-espera',
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

// ========================================
// Particles Animation
// ========================================
class ParticlesAnimation {
    constructor() {
        this.canvas = document.getElementById('particlesCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.connectionDistance = 150;

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.handleResize());
    }

    init() {
        this.handleResize();
        this.createParticles();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    updateParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        this.particles.forEach((p1, i) => {
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(14, 165, 233, ${1 - distance / this.connectionDistance})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            });
        });

        // Draw particles
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// Navigation
// ========================================
class Navigation {
    constructor() {
        this.header = document.querySelector('.header');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav__link');

        this.init();
    }

    init() {
        // Toggle mobile menu
        this.navToggle.addEventListener('click', () => this.toggleMenu());

        // Close menu when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Header scroll effect
        window.addEventListener('scroll', () => this.handleScroll());

        // Smooth scroll for all links
        this.setupSmoothScroll();
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href !== '#' && href !== '#waitlist') {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
}

// ========================================
// Scroll Animations
// ========================================
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all cards
        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });

        // Observe sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }
}

// ========================================
// Waitlist Buttons
// ========================================
class WaitlistButtons {
    constructor() {
        this.buttons = document.querySelectorAll('.btn--primary');
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.textContent.includes('waitlist')) {
                    e.preventDefault();
                    this.handleWaitlistClick();
                }
            });
        });
    }

    handleWaitlistClick() {
        // You can replace this with your actual waitlist form/modal
        alert('Thank you for your interest! The waitlist form will be implemented here.');

        // Example: Open a modal, redirect to a form, etc.
        // window.location.href = 'https://your-waitlist-form.com';
    }
}

// ========================================
// Performance Optimization
// ========================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images when implemented
        this.lazyLoadImages();

        // Debounce resize events
        this.optimizeResize();
    }

    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    optimizeResize() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Trigger custom resize event for optimized handling
                window.dispatchEvent(new Event('optimizedResize'));
            }, 250);
        });
    }
}

// ========================================
// Carousel
// ========================================
class Carousel {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scrollAmount = 350;
        this.init();
    }

    init() {
        const prevButton = document.querySelector(`[data-carousel="${this.container.id}"].carousel__nav--prev`);
        const nextButton = document.querySelector(`[data-carousel="${this.container.id}"].carousel__nav--next`);

        if (prevButton) {
            prevButton.addEventListener('click', () => this.scroll('prev'));
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => this.scroll('next'));
        }

        // Touch swipe support
        this.setupTouchSwipe();
    }

    scroll(direction) {
        const scrollDistance = direction === 'prev' ? -this.scrollAmount : this.scrollAmount;
        this.container.scrollBy({
            left: scrollDistance,
            behavior: 'smooth'
        });
    }

    setupTouchSwipe() {
        let startX = 0;
        let scrollLeft = 0;

        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX;
            scrollLeft = this.container.scrollLeft;
        });

        this.container.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX;
            const walk = (startX - x) * 2;
            this.container.scrollLeft = scrollLeft + walk;
        });
    }
}

// ========================================
// Accordion
// ========================================
class Accordion {
    constructor(selector) {
        this.items = document.querySelectorAll(selector);
        this.init();
    }

    init() {
        this.items.forEach(item => {
            const header = item.querySelector('.module__header, .faq__header');
            if (header) {
                header.addEventListener('click', () => this.toggle(item));
            }
        });
    }

    toggle(item) {
        const isActive = item.classList.contains('active');

        // Close all items (optional: remove this to allow multiple open)
        this.items.forEach(otherItem => {
            otherItem.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    }
}

// ========================================
// Video Modal
// ========================================
class VideoModal {
    constructor() {
        this.modal = document.getElementById('videoModal');
        this.video = document.getElementById('modalVideo');
        this.closeBtn = this.modal.querySelector('.modal__close');
        this.overlay = this.modal.querySelector('.modal__overlay');

        this.init();
    }

    init() {
        // Open modal on video card click
        document.querySelectorAll('.testimonial__card').forEach(card => {
            card.addEventListener('click', () => {
                const videoSrc = card.dataset.video;
                this.open(videoSrc);
            });
        });

        // Close modal
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(videoSrc) {
        this.video.src = `assets/videos/${videoSrc}`;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.video.play();
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.video.pause();
        this.video.src = '';
    }
}

// ========================================
// Phone Input with Intl Tel Input
// ========================================
function initPhoneInput() {
    const phoneInput = document.querySelector('#phone');

    if (!phoneInput) {
        console.error('Phone input not found');
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

        // Remove error on input
        phoneInput.addEventListener('input', () => {
            removeError(phoneInput);
        });

        // Apply Brazilian mask
        phoneInput.addEventListener('input', function() {
            const selectedCountry = state.phoneInput.getSelectedCountryData();

            if (selectedCountry.iso2 === 'br') {
                const cursorPosition = this.selectionStart;
                const oldLength = this.value.length;

                this.value = applyBrazilianPhoneMask(this.value);

                const newLength = this.value.length;
                const newPosition = cursorPosition + (newLength - oldLength);
                this.setSelectionRange(newPosition, newPosition);
            }
        });

        // Handle country change
        phoneInput.addEventListener('countrychange', function() {
            const selectedCountry = state.phoneInput.getSelectedCountryData();

            if (selectedCountry.iso2 === 'br' && this.value) {
                this.value = applyBrazilianPhoneMask(this.value);
            } else if (selectedCountry.iso2 !== 'br' && this.value) {
                this.value = removeBrazilianPhoneMask(this.value);
            }
        });

    } catch (error) {
        console.error('Error initializing phone input:', error);
    }
}

// ========================================
// Field Validation
// ========================================
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

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (field.id) {
        case 'name':
            if (!value) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (value.length < CONFIG.validation.nameMinLength) {
                errorMessage = 'Name too short';
                isValid = false;
            }
            break;

        case 'email':
            if (!value) {
                errorMessage = 'E-mail is required';
                isValid = false;
            } else if (!CONFIG.validation.emailRegex.test(value)) {
                errorMessage = 'Invalid e-mail';
                isValid = false;
            }
            break;

        case 'education':
            if (!value) {
                errorMessage = 'Select your education level';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        showError(field, errorMessage);
    }

    return isValid;
}

function validatePhone() {
    const phoneInput = document.querySelector('#phone');

    if (!state.phoneInput) {
        showError(phoneInput, 'Error validating phone');
        return false;
    }

    if (!state.phoneInput.isValidNumber()) {
        showError(phoneInput, 'Invalid phone number');
        return false;
    }

    removeError(phoneInput);
    return true;
}

function showError(field, message) {
    field.classList.add('error');

    const oldError = field.parentElement.querySelector('.error-message');
    if (oldError) {
        oldError.remove();
    }

    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    field.parentElement.appendChild(errorElement);

    field.focus();

    trackEvent('form_validation_error', {
        eventCategory: 'Form',
        eventAction: 'Validation Error',
        eventLabel: field.id,
        error_message: message
    });
}

function removeError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// ========================================
// Form Submission
// ========================================
function initFormSubmit() {
    const form = document.getElementById('leadForm');

    if (!form) {
        console.error('Form not found');
        return;
    }

    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (state.isSubmitting) {
        return;
    }

    // Validate all fields
    const nameValid = validateField(document.getElementById('name'));
    const emailValid = validateField(document.getElementById('email'));
    const phoneValid = validatePhone();
    const educationValid = validateField(document.getElementById('education'));

    if (!nameValid || !emailValid || !phoneValid || !educationValid) {
        return;
    }

    // Collect form data
    const formData = collectFormData();

    // Start loading
    setLoadingState(true);

    try {
        // Send to webhook
        await sendToWebhook(formData);

        // Prepare redirect
        const email = encodeURIComponent(document.getElementById('email').value.trim());
        const name = encodeURIComponent(document.getElementById('name').value.trim());
        const utmParams = getAllUTMParams();

        // Create src parameter with all UTMs
        const utmValues = [];
        if (utmParams.utmSource) utmValues.push(`utm_source=${utmParams.utmSource}`);
        if (utmParams.utmCampaign) utmValues.push(`utm_campaign=${utmParams.utmCampaign}`);
        if (utmParams.utmMedium) utmValues.push(`utm_medium=${utmParams.utmMedium}`);
        if (utmParams.utmContent) utmValues.push(`utm_content=${utmParams.utmContent}`);
        if (utmParams.utmTerm) utmValues.push(`utm_term=${utmParams.utmTerm}`);

        const srcValue = utmValues.length > 0 ? utmValues.join('|') : '';

        // Build redirect URL
        let redirectUrl = CONFIG.redirect.url;
        const params = [`email=${email}`, `name=${name}`];

        if (srcValue) {
            params.push(`src=${encodeURIComponent(srcValue)}`);
        }

        if (utmParams.utmSource) params.push(`utm_source=${encodeURIComponent(utmParams.utmSource)}`);
        if (utmParams.utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmParams.utmCampaign)}`);
        if (utmParams.utmMedium) params.push(`utm_medium=${encodeURIComponent(utmParams.utmMedium)}`);
        if (utmParams.utmContent) params.push(`utm_content=${encodeURIComponent(utmParams.utmContent)}`);
        if (utmParams.utmTerm) params.push(`utm_term=${encodeURIComponent(utmParams.utmTerm)}`);

        if (params.length > 0) {
            const separator = redirectUrl.includes('?') ? '&' : '?';
            redirectUrl += separator + params.join('&');
        }

        // Redirect after delay
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, CONFIG.redirect.delay);

    } catch (error) {
        console.error('Submit error:', error);
        handleSubmitError(error);
        setLoadingState(false);
    }
}

function collectFormData() {
    const utmParams = getAllUTMParams();

    const selectedCountry = state.phoneInput.getSelectedCountryData();
    const ddi = selectedCountry.dialCode;

    const phoneValue = document.getElementById('phone').value;
    const phoneClean = removeBrazilianPhoneMask(phoneValue);

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
        city: state.userLocation?.city || 'Unknown',
        state: state.userLocation?.region || 'Unknown',
        country: state.userLocation?.country ? state.userLocation.country.toLowerCase() : 'br',
        page: window.location.href,
        utm_source: utmParams.utmSource,
        utm_medium: utmParams.utmMedium,
        utm_campaign: utmParams.utmCampaign,
        utm_term: utmParams.utmTerm,
        utm_content: utmParams.utmContent
    };
}

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
            throw new Error('Timeout: request took too long');
        }
        throw error;
    }
}

function handleSubmitError(error) {
    const message = error.message || 'Error submitting form. Please try again.';

    alert(message);

    console.error('Submit Error:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
}

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

// ========================================
// Utility Functions
// ========================================
async function getUserLocation() {
    try {
        const response = await fetch('https://ipinfo.io/json');
        return await response.json();
    } catch (error) {
        console.warn('Could not detect location:', error);
        return { city: 'Unknown', region: 'Unknown', country: 'BR' };
    }
}

function getUTMParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || '';
}

function getAllUTMParams() {
    return {
        utmSource: getUTMParam('utm_source'),
        utmCampaign: getUTMParam('utm_campaign'),
        utmMedium: getUTMParam('utm_medium'),
        utmContent: getUTMParam('utm_content'),
        utmTerm: getUTMParam('utm_term')
    };
}

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

function removeBrazilianPhoneMask(value) {
    return value.replace(/\D/g, '');
}

function trackEvent(eventName, eventData = {}) {
    if (window.dataLayer) {
        setTimeout(() => {
            window.dataLayer.push({
                event: eventName,
                ...eventData
            });
        }, 0);
    }

    if (window.gtag) {
        window.gtag('event', eventName, eventData);
    }

    if (window.fbq) {
        window.fbq('track', eventName, eventData);
    }

    console.log('Event tracked:', eventName, eventData);
}

window.trackEvent = trackEvent;

// ========================================
// Initialize Everything
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load user location
    try {
        state.userLocation = await getUserLocation();
        console.log('Location detected:', state.userLocation);
    } catch (error) {
        console.warn('Could not detect location:', error);
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        new ParticlesAnimation();
    }

    // Existing functionality
    new Navigation();
    new ScrollAnimations();
    new WaitlistButtons();
    new PerformanceOptimizer();

    // New functionality
    new Carousel('resultsCarousel');
    new Carousel('storiesCarousel');
    new Accordion('.module__item');
    new Accordion('.faq__item');
    new VideoModal();

    // Form functionality (replaces FormValidation class)
    initPhoneInput();
    initFormValidation();
    initFormSubmit();

    // Add loaded class to body for animations
    document.body.classList.add('loaded');
});

// ========================================
// Page Visibility API - Pause animations when tab is not visible
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause resource-intensive operations
        console.log('Page hidden - conserving resources');
    } else {
        // Resume operations
        console.log('Page visible - resuming operations');
    }
});

// ========================================
// Service Worker Registration (for PWA capabilities - optional)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you create a service worker file
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}
