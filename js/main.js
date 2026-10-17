// ============================================================
// SINCERELY YOU ARE SIGNIFICANT, INC. — Main JavaScript
// ============================================================

(function () {
  'use strict';

  // ---- Utility: debounce ----
  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ---- Navigation: scroll behavior ----
  const nav = document.querySelector('.nav');
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 30) {
      nav.classList.add('nav--scrolled');
      nav.classList.remove('nav--transparent');
    } else {
      nav.classList.remove('nav--scrolled');
      if (nav.dataset.transparent === 'true') {
        nav.classList.add('nav--transparent');
      }
    }
  }
  if (nav && nav.dataset.transparent === 'true') {
    nav.classList.add('nav--transparent');
  }
  window.addEventListener('scroll', debounce(updateNav, 8), { passive: true });
  updateNav();

  // ---- Navigation: Active link highlighting ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Mobile Navigation ----
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileNav = document.querySelector('.nav__mobile');
  const overlay = document.querySelector('.nav__overlay');

  function openMobileNav() {
    hamburger?.classList.add('open');
    mobileNav?.classList.add('open');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger?.setAttribute('aria-expanded', 'true');
    mobileNav?.setAttribute('aria-hidden', 'false');
  }

  function closeMobileNav() {
    hamburger?.classList.remove('open');
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileNav?.setAttribute('aria-hidden', 'true');
  }

  hamburger?.addEventListener('click', () => {
    if (mobileNav?.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  overlay?.addEventListener('click', closeMobileNav);

  document.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  // ---- Scroll Reveal Animations ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    const observerOptions = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-up, .fade-in').forEach(el => {
      revealObserver.observe(el);
    });

    // Stagger groups
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.stagger').forEach(el => {
      staggerObserver.observe(el);
    });
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('.fade-up, .fade-in, .stagger').forEach(el => {
      el.classList.add('visible');
    });
  }

  // ---- Hero Parallax (subtle) ----
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.25;
      heroBg.style.transform = `translateY(${rate}px)`;
    }, { passive: true });
  }

  // ---- Contact Form Handling ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const formEl = contactForm.querySelector('form') || contactForm;
    const successEl = document.getElementById('formSuccess');

    function showError(input, message) {
      input.classList.add('error');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    }

    function clearError(input) {
      input.classList.remove('error');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.classList.remove('visible');
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    formEl.addEventListener('input', (e) => {
      if (e.target.classList.contains('error')) {
        clearError(e.target);
      }
    });

    formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = formEl.querySelector('[name="name"]');
      const emailInput = formEl.querySelector('[name="email"]');
      const messageInput = formEl.querySelector('[name="message"]');
      const consentInput = formEl.querySelector('[name="consent"]');
      const submitBtn = formEl.querySelector('[type="submit"]');

      if (nameInput && nameInput.value.trim().length < 2) {
        showError(nameInput, 'Please enter your full name.');
        isValid = false;
      } else if (nameInput) clearError(nameInput);

      if (emailInput && !validateEmail(emailInput.value.trim())) {
        showError(emailInput, 'Please enter a valid email address.');
        isValid = false;
      } else if (emailInput) clearError(emailInput);

      if (messageInput && messageInput.value.trim().length < 10) {
        showError(messageInput, 'Please provide a brief message (at least 10 characters).');
        isValid = false;
      } else if (messageInput) clearError(messageInput);

      if (consentInput && !consentInput.checked) {
        showError(consentInput, 'Please acknowledge the privacy notice to continue.');
        isValid = false;
      } else if (consentInput) clearError(consentInput);

      if (!isValid) return;

      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Sending…`;
      submitBtn.disabled = true;

      // Simulate submission (owner needs to configure backend)
      await new Promise(r => setTimeout(r, 1200));

      // Show note: form not connected yet
      formEl.style.display = 'none';
      if (successEl) successEl.classList.add('visible');

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    });
  }

  // ---- Smooth Anchor Scrolling ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---- Spin icon CSS ----
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin-icon { animation: spin 0.8s linear infinite; display: inline-block; }
    `;
    document.head.appendChild(style);
  }

  // ---- Image Lazy Loading fallback ----
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
  } else {
    // Basic fallback for older browsers
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imageObserver.unobserve(img);
        }
      });
    });
    lazyImages.forEach(img => imageObserver.observe(img));
  }

  // ---- Page transition overlay ----
  const pageTransition = document.createElement('div');
  pageTransition.id = 'page-transition';
  pageTransition.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: var(--forest-dark, #0F2D22);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.32s cubic-bezier(0.4,0,0.2,1);
  `;
  document.body.appendChild(pageTransition);

  // Fade in on page load
  requestAnimationFrame(() => {
    pageTransition.style.opacity = '0';
  });

  // Fade out on link click (same-origin)
  if (!prefersReducedMotion) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (
        href &&
        !href.startsWith('#') &&
        !href.startsWith('mailto:') &&
        !href.startsWith('tel:') &&
        !href.startsWith('http') &&
        !link.hasAttribute('target')
      ) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          pageTransition.style.opacity = '1';
          setTimeout(() => {
            window.location.href = href;
          }, 280);
        });
      }
    });
  }

})();
