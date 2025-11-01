(function () {
  // Inject header
  const headerRoot = document.getElementById('header-placeholder');
  headerRoot.innerHTML = `
    <header class="site-header" role="banner">
      <a class="brand" href="index.html">
        <span class="logo">D</span>
        <div style="line-height:1">
          <div style="font-weight:800">Devbhoomi DryCleans</div>
          <div style="font-size:12px;color:var(--muted)">Fresh • Fast • Flawless</div>
        </div>
      </a>
      <nav class="nav" role="navigation" aria-label="Primary">
        <a href="#contact">Contact</a>
        <a href="services.html">Services</a>
        <a href="gallery.html">Gallery</a>
        <a href="offers.html">Offers</a>
      </nav>
      <div style="display:flex;gap:10px;align-items:center">
        <a class="header-cta" href="contact.html">Book Now</a>
        <button id="mobile-menu-toggle" aria-label="Open menu" style="display:none;border:0;background:transparent;font-size:22px">☰</button>
      </div>
    </header>
  `;

  // Inject footer
  const footerRoot = document.getElementById('footer-placeholder');
  footerRoot.innerHTML = `
    <footer id="site-footer" class="site-footer" role="contentinfo">
      <div>
        <div style="font-weight:800">Devbhoomi DryCleans</div>
        <div style="font-size:13px;color:var(--muted)">123 Clean Way, YourCity • <a href="tel:+911234567890">+91 12345 67890</a></div>
      </div>
      <div style="display:flex;gap:12px;align-items:center">
        <nav style="display:flex;gap:10px"><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a></nav>
        <div style="color:var(--muted)">© ${new Date().getFullYear()} Devbhoomi DryCleans</div>
      </div>
    </footer>
  `;

  // ----- existing injections, basic handlers (kept) -----
  // (header/footer injection, contact form, whatsapp link, lightbox basics remain)

  // ENHANCEMENTS: scroll progress, header hide on scroll, tilt, lazy load, back-to-top
  // Scroll progress bar
  const progress = document.createElement('div');
  progress.id = 'scroll-progress';
  document.body.appendChild(progress);
  function updateProgress(){
    const doc = document.documentElement;
    const scroll = (window.scrollY || window.pageYOffset);
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height ? Math.min(100, Math.round((scroll / height) * 100)) : 0;
    progress.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Header hide/show on scroll (mobile-friendly)
  let lastY = window.scrollY || 0;
  const header = document.querySelector('.site-header');
  let ticking = false;
  function handleHeader(){
    const current = window.scrollY || 0;
    if (current > 80) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    if (current > lastY && current > 100) header.classList.add('hidden'); else header.classList.remove('hidden');
    lastY = current;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(handleHeader); ticking = true; }
  }, { passive: true });

  // Reveal-on-scroll with stagger (use data-delay if present)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting){
        const el = en.target;
        el.classList.add('in-view');
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal], section, .feature, .testimonial, .photo').forEach((el,i) => {
    // set CSS delay for nice staggering
    el.style.setProperty('--reveal-delay', `${Math.min(600, i * 60)}ms`);
    io.observe(el);
  });

  // Service card 3D tilt on pointer move
  document.querySelectorAll('.services li').forEach(li => {
    const inner = document.createElement('div'); inner.className = 'card-inner';
    // wrap existing children
    while (li.firstChild) inner.appendChild(li.firstChild);
    li.appendChild(inner);
    li.addEventListener('pointermove', e => {
      const rect = li.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotX = (py - 0.5) * 8;
      const rotY = (px - 0.5) * -12;
      inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      li.classList.add('tilted');
    });
    li.addEventListener('pointerleave', () => {
      inner.style.transform = '';
      li.classList.remove('tilted');
    });
  });

  // Gallery lazy load + loaded blur remove + click accessibility
  document.querySelectorAll('.gallery .photo').forEach(photo => {
    const src = photo.dataset.src;
    if (!src) { photo.classList.add('loaded'); return; }
    const img = new Image();
    img.src = src;
    img.onload = () => { photo.style.backgroundImage = `url('${src}')`; photo.classList.add('loaded'); };
    img.onerror = () => { photo.classList.add('loaded'); };
    // keyboard accessible open
    photo.tabIndex = 0;
    photo.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') photo.click(); });
  });

  // Lightbox: close on ESC and trap simple keyboard
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  document.addEventListener('keydown', (e) => {
    if (!lightbox) return;
    if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false'){
      lightbox.style.display = 'none';
      lightbox.setAttribute('aria-hidden','true');
      lightboxImg.src = '';
    }
  });

  // Hero pointer parallax (subtle)
  const hero = document.querySelector('.hero');
  if (hero){
    hero.setAttribute('data-pointer','true');
    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.backgroundPosition = `${50 + x * 3}% ${50 + y * 3}%`;
    });
    hero.addEventListener('pointerleave', () => hero.style.backgroundPosition = '50% 50%');
  }

  // Back to top button
  const btop = document.createElement('button');
  btop.id = 'back-to-top';
  btop.title = 'Back to top';
  btop.innerHTML = '↑';
  btop.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
  document.body.appendChild(btop);
  window.addEventListener('scroll', () => {
    if ((window.scrollY || 0) > 400) btop.classList.add('show'); else btop.classList.remove('show');
  }, { passive: true });

  // Accessibility: ensure focusable header nav when toggled
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  function checkMobile() {
    if (window.innerWidth <= 480) {
      mobileToggle.style.display = 'inline-block';
      nav.style.display = 'none';
      nav.querySelectorAll('a').forEach(a => a.tabIndex = -1);
    } else {
      mobileToggle.style.display = 'none';
      nav.style.display = '';
      nav.querySelectorAll('a').forEach(a => a.tabIndex = 0);
    }
  }
  mobileToggle.addEventListener('click', () => {
    const showing = nav.style.display === 'flex';
    nav.style.display = showing ? 'none' : 'flex';
    nav.querySelectorAll('a').forEach(a => a.tabIndex = showing ? -1 : 0);
  });
  window.addEventListener('resize', checkMobile);
  checkMobile();

  // Small enhancement for contact form: keyboard submit hint
  (function(){
    const form = document.getElementById('contact-form');
    if (!form) {
      // contact form handled by contact-form.js (or not present on this page)
      return;
    }
    // If needed for simple demo, show basic sending indicator but do not override the main handler:
    const status = document.getElementById('form-status');
    form.addEventListener('submit', (e) => {
      // do not prevent the specialized handler in contact-form.js
      if (status) {
        status.style.display = 'block';
        status.textContent = 'Sending...';
        setTimeout(() => { status.style.display = 'none'; }, 3000);
      }
    });
  })();

  // ----- new enhancements -----
  // (map iframe fallback, console reminders for hero image)

  (function(){
    // map iframe fallback: if iframe doesn't load within timeout or is blocked, show fallback
    const mapIframe = document.getElementById('contact-map');
    const mapFallback = document.getElementById('map-fallback');
    if (mapIframe && mapFallback) {
      let loaded = false;
      // mark loaded when 'load' fires
      mapIframe.addEventListener('load', () => { loaded = true; /* no-op: iframe loaded */ });
      // after 3s check if blocked or failed — show fallback
      setTimeout(() => {
        if (!loaded) {
          console.warn('Map iframe did not load — showing fallback. This may be due to an adblocker or network restriction.');
          mapIframe.style.display = 'none';
          mapFallback.style.display = 'block';
        }
      }, 3000);
    }

    // Helpful console reminder for missing hero image
    const heroEl = document.querySelector('.hero-contact');
    if (heroEl) {
      const bg = window.getComputedStyle(heroEl).backgroundImage || '';
      if (!bg || bg === 'none' || bg.includes('none')) {
        console.info('Hero background image not set or not found. Place a file at assets/images/hero-contact.jpg or update the CSS path.');
      }
    }
  })();

  (function(){
    // Ensure any in-site anchors that point to "#contact" redirect to the contact page.
    // This covers static markup and header HTML injected at runtime.
    function normalizeContactLinks() {
      document.querySelectorAll('a[href="#contact"]').forEach(a => {
        // Update to the actual contact page. Adjust fragment if you want a specific section.
        a.setAttribute('href', 'contact.html#contact-form');
        // keep keyboard-focused users happy
        a.setAttribute('role', 'link');
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', normalizeContactLinks);
    } else {
      normalizeContactLinks();
    }
  })();
})();