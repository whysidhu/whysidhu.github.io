const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const pageHeader = document.querySelector('.site-header');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (menuButton && navigation) {
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  };

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    menuButton.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('is-open', !expanded);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

if (themeButton) {
  const root = document.documentElement;
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('portfolio-theme');
  } catch {
    // Keep the default theme when storage is unavailable.
  }

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    root.classList.toggle('theme-light', isLight);
    themeButton.setAttribute('aria-pressed', String(isLight));
    themeButton.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} theme`);
    if (themeLabel) themeLabel.textContent = isLight ? 'Dark' : 'Light';
  };

  applyTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeButton.addEventListener('click', () => {
    const nextTheme = root.classList.contains('theme-light') ? 'dark' : 'light';
    applyTheme(nextTheme);
    try {
      localStorage.setItem('portfolio-theme', nextTheme);
    } catch {
      // The toggle still works for the current page view.
    }
  });
}

const revealTargets = document.querySelectorAll(
  '.intro-grid > div, .section-heading, .interest-card, .skill-note, .project-card, .timeline-item, .future-note, .next-inner > *'
);

if ('IntersectionObserver' in window) {
  revealTargets.forEach((element) => element.setAttribute('data-reveal', ''));
  document.body.classList.add('has-reveals');

  if (prefersReducedMotion) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    revealTargets.forEach((element) => revealObserver.observe(element));
  }
}

const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);
let scrollFrame = 0;

const updateScrollState = () => {
  scrollFrame = 0;
  if (pageHeader) pageHeader.classList.toggle('is-scrolled', window.scrollY > 12);

  const currentSection = observedSections
    .filter((section) => section.getBoundingClientRect().top <= 150)
    .at(-1);

  navLinks.forEach((link) => {
    const isActive = currentSection && link.getAttribute('href') === `#${currentSection.id}`;
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
};

const requestScrollUpdate = () => {
  if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
};

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
updateScrollState();

const canUseMagneticHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion;
const magneticButton = document.querySelector('.button-primary');

if (canUseMagneticHover && magneticButton) {
  magneticButton.addEventListener('pointermove', (event) => {
    const bounds = magneticButton.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left - bounds.width / 2) * 0.08;
    const offsetY = (event.clientY - bounds.top - bounds.height / 2) * 0.08;
    magneticButton.style.setProperty('--mag-x', `${offsetX.toFixed(1)}px`);
    magneticButton.style.setProperty('--mag-y', `${offsetY.toFixed(1)}px`);
  });

  magneticButton.addEventListener('pointerleave', () => {
    magneticButton.style.setProperty('--mag-x', '0px');
    magneticButton.style.setProperty('--mag-y', '0px');
  });
}
