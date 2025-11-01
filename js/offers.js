// ...new file...
(function () {
  'use strict';

  const offers = [
    { id:'o1', tag:'discount', title:'30% Off - First Order', desc:'New customers — apply code for 30% off on first pickup', code:'FIRST30', price:'₹30–₹399', expiryOffset: 3600, total:200, claimed: 48 },
    { id:'o2', tag:'bundle', title:'Bundle: 5 Shirts Pack', desc:'Save on bulk ironing & cleaning', code:'BUNDLE5', price:'₹499', expiryOffset: 7200, total:120, claimed: 64 },
    { id:'o3', tag:'new', title:'Student Special', desc:'Flat ₹99 per kg for students (valid weekdays)', code:'STUDENT99', price:'₹99/kg', expiryOffset: 86400, total:300, claimed: 21 }
  ];

  const grid = document.getElementById('offers-grid');
  const countdownEl = document.getElementById('offers-countdown');
  const modal = document.getElementById('redeem-modal');
  const modalClose = modal && modal.querySelector('.modal-close');
  const redeemTitle = document.getElementById('redeem-offer-title');
  const redeemName = document.getElementById('redeem-name');
  const redeemPhone = document.getElementById('redeem-phone');
  const redeemSubmit = document.getElementById('redeem-submit');
  const redeemCopy = document.getElementById('redeem-copy');
  const redeemStatus = document.getElementById('redeem-status');

  // simple expiry: choose earliest expiry among offers (demo)
  const earliestExpiry = Date.now() + Math.min(...offers.map(o => o.expiryOffset * 1000));
  let countdownTimer = null;

  function renderOffers(list) {
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(o => {
      // calculate percent claimed
      const percent = Math.min(100, Math.round((o.claimed / o.total) * 100));
      const card = document.createElement('div');
      card.className = 'offer-card';
      card.innerHTML = `
        <div class="offer-inner">
          <div class="offer-flip">
            <div class="offer-front">
              <div class="offer-head">
                <div class="offer-tag">${o.tag.toUpperCase()}</div>
                <div>
                  <div class="offer-title">${o.title}</div>
                  <div class="offer-desc">${o.desc}</div>
                </div>
              </div>
              <div class="offer-foot">
                <div class="offer-price">${o.price}</div>
                <div class="offer-progress" aria-hidden="true"><i style="width:${percent}%"></i></div>
                <div class="offer-actions" style="margin-left:8px;">
                  <button class="chip btn-view-offer" data-id="${o.id}">View</button>
                  <button class="chip btn-flip" data-id="${o.id}">Code</button>
                </div>
              </div>
            </div>

            <div class="offer-back" aria-hidden="true">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div class="offer-title">${o.title}</div>
                  <div class="coupon" data-code="${o.code}">${o.code}</div>
                </div>
                <div class="offer-desc" style="margin-top:6px;">Share code on WhatsApp or copy to clipboard. Limited quantity: ${o.total - o.claimed} left</div>
              </div>
              <div style="display:flex;gap:8px;margin-top:10px;">
                <button class="contact-button primary btn-redeem" data-id="${o.id}">Redeem & Book</button>
                <button class="contact-button btn-copy" data-code="${o.code}">Copy</button>
              </div>
            </div>
          </div>
        </div>
      `;
      // listeners for flip & view added after append
      grid.appendChild(card);
    });

    // attach handlers
    grid.querySelectorAll('.btn-flip').forEach(b => {
      b.addEventListener('click', (e) => {
        const card = b.closest('.offer-card');
        if (!card) return;
        card.classList.toggle('flipped');
      });
    });
    grid.querySelectorAll('.btn-copy').forEach(b => {
      b.addEventListener('click', () => {
        const code = b.dataset.code;
        try {
          navigator.clipboard.writeText(code);
          showToast(`Coupon ${code} copied`);
        } catch (err) {
          showToast('Copy failed — please copy manually', false);
        }
      });
    });
    grid.querySelectorAll('.btn-redeem').forEach(b => {
      b.addEventListener('click', () => openRedeem(b.dataset.id));
    });
    grid.querySelectorAll('.btn-view-offer').forEach(b => {
      b.addEventListener('click', () => openRedeem(b.dataset.id));
    });
  }

  function openRedeem(id) {
    const offer = offers.find(x => x.id === id);
    if (!offer || !modal) return;
    redeemTitle.textContent = `${offer.title} — Code: ${offer.code}`;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    redeemStatus.textContent = '';
    redeemName.value = '';
    redeemPhone.value = '';
    // store current offer id
    modal.dataset.offerId = id;
    setTimeout(() => redeemName.focus(), 80);
  }

  function closeRedeem() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }

  if (modalClose) modalClose.addEventListener('click', closeRedeem);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRedeem(); });

  // redeem submit: simulate claim & booking
  if (redeemSubmit) {
    redeemSubmit.addEventListener('click', async () => {
      const id = modal.dataset.offerId;
      const name = redeemName.value.trim();
      const phone = redeemPhone.value.trim();
      if (!name || !phone) {
        redeemStatus.textContent = 'Please enter name and phone.';
        return;
      }
      redeemStatus.textContent = 'Claiming offer...';
      redeemSubmit.disabled = true;
      try {
        await new Promise(r => setTimeout(r, 900));
        // increment claimed count locally
        const o = offers.find(x => x.id === id);
        if (o) {
          o.claimed = Math.min(o.total, o.claimed + 1);
        }
        renderOffers(offers);
        redeemStatus.textContent = 'Offer claimed — we will contact you to confirm pickup.';
        showToast('Offer claimed — check WhatsApp for details');
        setTimeout(closeRedeem, 1400);
      } catch (err) {
        redeemStatus.textContent = 'Failed to claim. Try via WhatsApp.';
      } finally {
        redeemSubmit.disabled = false;
      }
    });
  }

  if (redeemCopy) {
    redeemCopy.addEventListener('click', () => {
      const id = modal.dataset.offerId;
      const o = offers.find(x => x.id === id);
      if (!o) return;
      navigator.clipboard.writeText(o.code).then(() => showToast('Code copied'), () => showToast('Copy failed', false));
    });
  }

  // filters
  document.getElementById('filter-all').addEventListener('click', () => applyFilter('all', 'filter-all'));
  document.getElementById('filter-discount').addEventListener('click', () => applyFilter('discount', 'filter-discount'));
  document.getElementById('filter-bundle').addEventListener('click', () => applyFilter('bundle', 'filter-bundle'));
  document.getElementById('filter-new').addEventListener('click', () => applyFilter('new', 'filter-new'));

  function applyFilter(tag, btnId) {
    document.querySelectorAll('.offers-actions .chip, .offers-top .chip').forEach(c => c.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
    const filtered = tag === 'all' ? offers : offers.filter(o => o.tag === tag);
    renderOffers(filtered);
  }

  // countdown
  function startCountdown(untilTs) {
    if (!countdownEl) return;
    function tick() {
      const diff = Math.max(0, untilTs - Date.now());
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      countdownEl.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
      if (diff <= 0) {
        clearInterval(countdownTimer);
        countdownEl.textContent = 'Ended';
      }
    }
    tick();
    countdownTimer = setInterval(tick, 1000);
  }
  function pad(n){ return String(n).padStart(2,'0'); }

  // small site toast (reuse from contact page if exists)
  function showToast(msg, ok = true) {
    let t = document.getElementById('site-toast');
    if (!t) {
      t = document.createElement('div'); t.id = 'site-toast'; t.className = 'site-toast'; document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.toggle('error', !ok);
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
  }

  // initial
  renderOffers(offers);
  startCountdown(earliestExpiry);

  // expose for debugging
  window.__offers = { offers, renderOffers, openRedeem };

})();