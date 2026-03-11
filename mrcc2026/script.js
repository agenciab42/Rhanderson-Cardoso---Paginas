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
