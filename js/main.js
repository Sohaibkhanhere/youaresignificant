// ============================================================
// SINCERELY YOU ARE SIGNIFICANT, INC. — Production JavaScript
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
  window.addEventListener('scroll', debounce(updateNav, 10), { passive: true });
  updateNav();

  // ---- Navigation: Active link highlighting ----
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const cleanCurrentPage = currentPath.split('/').pop().replace(/\.html$/, '') || 'index';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const cleanHref = href.split('/').pop().replace(/\.html$/, '');
    if (cleanHref === cleanCurrentPage || (cleanCurrentPage === 'index' && (cleanHref === '' || cleanHref === 'index'))) {
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

  // ---- Scroll Reveal Animations (Honors prefers-reduced-motion) ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
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
    // When reduced motion requested or no observer, ensure all content is visible immediately
    document.querySelectorAll('.fade-up, .fade-in, .stagger').forEach(el => {
      el.classList.add('visible');
    });
  }

  // ---- Form Submission Helper (Reusable for Contact & Volunteer Forms) ----
  function setupFormHandler(formElementId, successElementId) {
    const container = document.getElementById(formElementId);
    if (!container) return;

    const formEl = container.tagName === 'FORM' ? container : container.querySelector('form');
    const successEl = document.getElementById(successElementId);
    if (!formEl) return;

    // Initialize speed-trap timestamp token
    const tsInput = formEl.querySelector('[name="form_ts"]');
    if (tsInput) {
      tsInput.value = Date.now().toString();
    }

    function showError(input, message) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      const errorEl = input.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
      }
    }

    function clearError(input) {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
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

      // Client-side cooldown check (prevents rapid multi-clicks / duplicate submissions)
      const now = Date.now();
      const lastSub = parseInt(sessionStorage.getItem('sys_last_sub') || '0', 10);
      if (now - lastSub < 10000) {
        let alertBox = formEl.querySelector('.server-form-error');
        if (!alertBox) {
          alertBox = document.createElement('div');
          alertBox.className = 'server-form-error';
          alertBox.style.cssText = 'background:#fef3c7;border:1px solid #fcd34d;color:#92400e;padding:0.85rem 1rem;border-radius:var(--radius);margin-bottom:1.25rem;font-size:0.9rem;';
          formEl.insertBefore(alertBox, formEl.firstChild);
        }
        alertBox.textContent = 'Please wait a few moments before sending another message.';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }

      let isValid = true;

      const nameInput = formEl.querySelector('[name="name"]');
      const emailInput = formEl.querySelector('[name="email"]');
      const phoneInput = formEl.querySelector('[name="phone"]');
      const inquiryInput = formEl.querySelector('[name="inquiry"]');
      const messageInput = formEl.querySelector('[name="message"]');
      const consentInput = formEl.querySelector('[name="consent"]');
      const hpInput = formEl.querySelector('[name="hp_field"]');
      const submitBtn = formEl.querySelector('[type="submit"]');

      if (nameInput && nameInput.value.trim().length < 2) {
        showError(nameInput, 'Please enter your full name (at least 2 characters).');
        isValid = false;
      } else if (nameInput) clearError(nameInput);

      if (emailInput && !validateEmail(emailInput.value.trim())) {
        showError(emailInput, 'Please enter a valid email address.');
        isValid = false;
      } else if (emailInput) clearError(emailInput);

      if (messageInput && messageInput.value.trim().length < 10) {
        showError(messageInput, 'Please provide a message or details (at least 10 characters).');
        isValid = false;
      } else if (messageInput) clearError(messageInput);

      if (consentInput && !consentInput.checked) {
        showError(consentInput, 'Please acknowledge the confirmation checkbox to continue.');
        isValid = false;
      } else if (consentInput) clearError(consentInput);

      if (!isValid) return;

      // Submission Payload
      const payload = {
        name: nameInput ? nameInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        phone: phoneInput ? phoneInput.value.trim() : '',
        inquiry: inquiryInput ? inquiryInput.value : 'General Inquiry',
        message: messageInput ? messageInput.value.trim() : '',
        consent: consentInput ? consentInput.checked : true,
        hp_field: hpInput ? hpInput.value : '',
        form_ts: tsInput ? tsInput.value : Date.now().toString()
      };

      // Loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg> Submitting…
      `;
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          sessionStorage.setItem('sys_last_sub', Date.now().toString());
          formEl.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'block';
            successEl.classList.add('visible');
            if (result.referenceId) {
              const refSpan = successEl.querySelector('.reference-id');
              if (refSpan) refSpan.textContent = result.referenceId;
            }
            if (result.message) {
              const noteEl = successEl.querySelector('.delivery-status-note');
              if (noteEl) {
                noteEl.textContent = result.message;
                noteEl.style.display = 'block';
              }
            }
            successEl.setAttribute('tabindex', '-1');
            successEl.focus();
          }
        } else if (response.status === 400 || response.status === 429) {
          // Server-side validation failure or rate limit notice
          const serverMsg = result.error || result.message || (result.errors && result.errors.join(' ')) || 'Please correct the highlighted fields and try again.';
          let alertBox = formEl.querySelector('.server-form-error');
          if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.className = 'server-form-error';
            alertBox.style.cssText = 'background:#fde8e8;border:1px solid #f8b4b4;color:#9b1c1c;padding:0.85rem 1rem;border-radius:var(--radius);margin-bottom:1.25rem;font-size:0.9rem;';
            alertBox.setAttribute('role', 'alert');
            formEl.insertBefore(alertBox, formEl.firstChild);
          }
          alertBox.textContent = serverMsg;
          alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          alertBox.setAttribute('tabindex', '-1');
          alertBox.focus();
        } else {
          // Fallback display if server returns 404/500
          console.warn('API submission notice:', result.message || response.statusText);
          formEl.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'block';
            successEl.classList.add('visible');
            successEl.setAttribute('tabindex', '-1');
            successEl.focus();
          }
        }
      } catch (err) {
        // Network error / offline mode fallback
        console.warn('Network request fallback:', err);
        formEl.style.display = 'none';
        if (successEl) {
          successEl.style.display = 'block';
          successEl.classList.add('visible');
          successEl.setAttribute('tabindex', '-1');
          successEl.focus();
        }
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Initialize both forms
  setupFormHandler('contactForm', 'formSuccess');
  setupFormHandler('volunteerForm', 'volunteerSuccess');

  // ---- Smooth Anchor Scrolling ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '#!') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;
        window.scrollTo({ top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  // ---- Accordion / FAQ Keyboard Accessibility ----
  document.querySelectorAll('details.faq-item').forEach(details => {
    details.addEventListener('toggle', () => {
      const summary = details.querySelector('summary');
      if (summary) {
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
      }
    });
  });

  // ---- Config-Driven Donation Architecture Loader ----
  // If Bianca Reid configures an approved online provider in js/config.js,
  // dynamically render the verified secure payment button without changing HTML template markup.
  try {
    if (typeof SYS_CONFIG !== 'undefined' && SYS_CONFIG.donations && SYS_CONFIG.donations.enabled && SYS_CONFIG.donations.checkoutUrl) {
      const donateCard = document.querySelector('.donate-placeholder');
      if (donateCard) {
        const titleEl = donateCard.querySelector('h3');
        const descEl = donateCard.querySelector('p');
        const btnGroup = donateCard.querySelector('.btn-group');

        if (titleEl) titleEl.textContent = 'Make a Secure Online Donation';
        if (descEl) {
          descEl.innerHTML = `
            Your tax-deductible gift directly empowers youth, assists seniors, and strengthens local families in Stockbridge, Jonesboro, and South Metro Atlanta.
            <br><small style="color:var(--text-light);display:block;margin-top:0.5rem;">${SYS_CONFIG.donations.taxDeductibleDisclosure || ''}</small>
          `;
        }
        if (btnGroup) {
          const providerName = SYS_CONFIG.donations.provider === 'zeffy' ? 'Zeffy (100% Free - 0% Fees)' : (SYS_CONFIG.donations.provider === 'paypal' ? 'PayPal Giving Fund' : 'Secure Checkout');
          btnGroup.innerHTML = `
            <a href="${SYS_CONFIG.donations.checkoutUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--gold" style="font-size:1.05rem;padding:0.9rem 2rem;box-shadow:var(--shadow-md);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Donate Online via ${providerName} →
            </a>
            <a href="mailto:admin@youaresignificant.org?subject=Charitable%20Donation%20Inquiry" class="btn btn--outline">
              Inquire About Other Giving
            </a>
          `;
        }
      }
    }
  } catch (err) {
    // Graceful silent fallback to static mail/phone directions
  }

  // ---- Spin icon CSS helper ----
  if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin-icon { animation: spin 0.8s linear infinite; display: inline-block; vertical-align: middle; margin-right: 0.4rem; }
    `;
    document.head.appendChild(style);
  }

})();
