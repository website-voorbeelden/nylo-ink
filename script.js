document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const year = document.querySelector('[data-year]');

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 30);
}

function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu?.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px' })
  : null;

document.querySelectorAll('.reveal').forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add('visible');
});

if (year) year.textContent = new Date().getFullYear();
updateHeader();

const statsSection = document.querySelector('[data-stats]');
const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function renderCounter(counter, value) {
  const decimals = Number(counter.dataset.decimals || 0);
  const decimal = counter.dataset.decimal || '.';
  const suffix = counter.dataset.suffix || '';
  const number = value.toFixed(decimals).replace('.', decimal);
  counter.textContent = `${number}${suffix}`;
}

function animateCounter(counter) {
  if (counter.dataset.counted === 'true') return;
  counter.dataset.counted = 'true';

  const target = Number(counter.dataset.count || 0);
  const delay = Number(counter.dataset.delay || 0);
  const duration = 3000;

  if (reduceMotion) {
    renderCounter(counter, target);
    return;
  }

  window.setTimeout(() => {
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderCounter(counter, target * eased);

      if (progress < 1) requestAnimationFrame(tick);
      else renderCounter(counter, target);
    }

    requestAnimationFrame(tick);
  }, delay);
}

function startCounters() {
  counters.forEach(animateCounter);
}

if (statsSection && 'IntersectionObserver' in window && !reduceMotion) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      startCounters();
      statsObserver.disconnect();
    }
  }, { threshold: 0.35 });
  statsObserver.observe(statsSection);
} else {
  startCounters();
}
