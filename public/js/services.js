(function () {
  'use strict';

  // services list (no explicit icon paths — icons derived from title file names)
  const services = [
    { id: 's1', title: 'Laundry & Dry Cleaning', desc: 'Everyday wear to delicate couture cleaned gently.', tag: 'laundry', price: 120 },
    { id: 's2', title: 'Steam Ironing', desc: 'Crisp, professional finishing for shirts & suits.', tag: 'ironing', price: 30 },
    { id: 's3', title: 'Curtain & Carpet Cleaning', desc: 'Deep-clean and restore large textiles and carpets.', tag: 'home', price: 599 },
    { id: 's4', title: 'Shoe & Bag Spa', desc: 'Restorative cleaning for leather & fabric accessories.', tag: 'accessories', price: 249 },
    { id: 's5', title: 'Express Delivery', desc: 'Same-day pickup & delivery in covered areas.', tag: 'laundry', price: 79 },
    { id: 's6', title: 'Special Care (Silk/Wool)', desc: 'Gentle solvent-based cleaning for delicate fabrics.', tag: 'laundry', price: 399 }
  ];

  // fallback icon (data URL SVG) used when PNG not found
  const iconFallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
       <rect width="24" height="24" rx="6" fill="#eef6ff"/>
       <path d="M6 12h12M6 8h12M6 16h8" stroke="#1678e8" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
     </svg>`
  );

  const grid = document.getElementById('services-grid');
  const chips = Array.from(document.querySelectorAll('.chip'));
  const priceToggle = document.getElementById('priceToggle');
  let pricingMode = 'per-item'; // or 'subscription'

  // helper: convert title -> filename slug (matches how you named PNGs)
  function titleToFilename(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\s()-]/g, '')   // remove special chars except parentheses/hyphen
      .replace(/\s+/g, '-')         // spaces -> hyphen
      .replace(/-+/g, '-')          // collapse multiple hyphens
      .replace(/^\-+|\-+$/g, '');   // trim leading/trailing hyphens
  }

  // render cards
  function render(list) {
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(s => {
      const card = document.createElement('button');
      card.className = 'service-card';
      card.setAttribute('data-id', s.id);
      card.setAttribute('data-tag', s.tag);
      card.setAttribute('aria-label', `${s.title} — ${s.desc}`);

      // Use the exact title text as the PNG filename (URL-encoded to handle spaces/special chars)
      // Example: "Laundry & Dry Cleaning" -> "assets/icons/Laundry%20%26%20Dry%20Cleaning.png"
      const iconPath = `assets/icons/${encodeURIComponent(s.title)}.png`;

      card.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;">
          <img class="service-icon" src="${iconPath}" alt="${s.title} icon" />
          <div style="flex:1">
            <div class="title">${s.title}</div>
            <div class="meta">${s.desc}</div>
          </div>
        </div>
        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;">
          <div class="price" data-base="${s.price}">${formatPrice(s.price)}</div>
          <div class="tag-row"><div class="tag">${capitalize(s.tag)}</div></div>
        </div>
      `;

      // fallback to inline SVG if PNG missing or fails to load
      const imgEl = card.querySelector('.service-icon');
      imgEl.addEventListener('error', () => { imgEl.src = iconFallback; });

      // tilt effect
      card.addEventListener('pointermove', tiltHandler);
      card.addEventListener('pointerleave', resetTilt);
      card.addEventListener('click', () => openBooking(s));
      card.tabIndex = 0;
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBooking(s); } });
      grid.appendChild(card);
    });
  }

  function formatPrice(num) {
    if (pricingMode === 'per-item') return `₹ ${num}`;
    // subscription price example: 4x monthly discount
    const monthly = Math.round(num * 0.28);
    return `₹ ${monthly}/mo`;
  }
  function capitalize(t){ return t[0].toUpperCase() + t.slice(1); }

  // filtering
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      applyFilter(filter);
    });
    chip.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { chip.click(); } });
  });

  function applyFilter(filter) {
    const items = Array.from(grid.children);
    if (filter === 'all') {
      items.forEach(i => i.style.display = '');
    } else {
      items.forEach(i => i.style.display = (i.dataset.tag === filter) ? '' : 'none');
    }
  }

  // pricing toggle
  if (priceToggle) {
    priceToggle.addEventListener('click', () => {
      pricingMode = pricingMode === 'per-item' ? 'subscription' : 'per-item';
      priceToggle.textContent = pricingMode === 'per-item' ? 'Per Item' : 'Subscription';
      priceToggle.setAttribute('aria-pressed', pricingMode === 'subscription');
      // update displayed prices
      document.querySelectorAll('.service-card .price').forEach(el => {
        const base = Number(el.dataset.base);
        el.textContent = formatPrice(base);
      });
    });
  }

  // tilt handlers
  function tiltHandler(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = (px - 0.5) * -12;
    const rotX = (py - 0.5) * 8;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(6px)`;
  }
  function resetTilt(e) {
    e.currentTarget.style.transform = '';
  }

  // booking modal
  const modal = document.getElementById('booking-modal');
  const bookingName = document.getElementById('booking-service-name');
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');
  const modalClose = modal && modal.querySelector('.modal-close');
  const modalCancel = document.getElementById('modal-cancel');

  function openBooking(service) {
    if (!modal) return;
    bookingName.textContent = service.title;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    // focus first input
    setTimeout(() => {
      const f = document.getElementById('bk-name');
      if (f) f.focus();
    }, 60);
    // store context
    modal.dataset.serviceId = service.id;
  }

  function closeBooking() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
    bookingStatus.textContent = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeBooking);
  if (modalCancel) modalCancel.addEventListener('click', closeBooking);
  // escape to close
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBooking(); });

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      bookingStatus.textContent = 'Requesting pickup...';
      const payload = {
        name: document.getElementById('bk-name').value.trim(),
        phone: document.getElementById('bk-phone').value.trim(),
        date: document.getElementById('bk-date').value,
        notes: document.getElementById('bk-notes').value.trim(),
        serviceId: modal.dataset.serviceId
      };
      // basic validation
      if (!payload.name || !payload.phone) {
        bookingStatus.textContent = 'Please enter name and phone.';
        return;
      }
      try {
        // simulate network
        await new Promise(res => setTimeout(res, 900));
        bookingStatus.textContent = 'Pickup requested — we will contact you to confirm.';
        // small success effect then close
        setTimeout(closeBooking, 1600);
      } catch (err) {
        bookingStatus.textContent = 'Failed to request pickup. Try WhatsApp.';
        console.error(err);
      }
    });
  }

  // initial render
  render(services);

  // expose for debugging
  window.__services = { render, services };

})();