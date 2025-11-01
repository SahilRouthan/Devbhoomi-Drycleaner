(function () {
  'use strict';

  // Run when DOM ready to avoid timing issues
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const form = document.getElementById('contact-form');
    const sendBtn = document.getElementById('sendBtn');
    const whatsappQuick = document.getElementById('whatsappQuick');
    const waTop = document.getElementById('waTop');

    if (!form) {
      console.warn('contact-form.js: #contact-form not found on page');
      return;
    }

    // ensure status element exists
    let statusEl = document.getElementById('form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.id = 'form-status';
      statusEl.className = 'form-status';
      statusEl.setAttribute('role', 'status');
      statusEl.setAttribute('aria-live', 'polite');
      const actions = form.querySelector('.actions') || form;
      actions.appendChild(statusEl);
    }

    function qv(id) { return (document.getElementById(id) || {}).value || ''; }
    function emailIsValid(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    // toast (simple)
    function showToast(msg, ok = true) {
      let t = document.getElementById('site-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'site-toast';
        t.className = 'site-toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.remove('error', 'show');
      if (!ok) t.classList.add('error');
      // trigger animation
      void t.offsetWidth;
      t.classList.add('show');
      clearTimeout(t._hideTimer);
      t._hideTimer = setTimeout(() => t.classList.remove('show'), 4500);
    }

    function setLoading(isLoading) {
      if (!sendBtn) return;
      if (isLoading) {
        sendBtn.classList.add('loading');
        sendBtn.setAttribute('aria-busy', 'true');
        sendBtn.disabled = true;
      } else {
        sendBtn.classList.remove('loading');
        sendBtn.removeAttribute('aria-busy');
        sendBtn.disabled = false;
      }
    }

    // WhatsApp quick
    if (whatsappQuick) {
      whatsappQuick.addEventListener('click', (e) => {
        e.preventDefault();
        const phone = '919958843588';
        const text = composeWaText();
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
      });
    }
    if (waTop) {
      // ensure waTop has a valid href when clicked
      waTop.addEventListener('click', () => {
        const phone = '919958843588';
        waTop.href = `https://wa.me/${phone}?text=${encodeURIComponent('Hi, I would like to book a pickup. Please assist.')}`;
      });
    }

    function composeWaText() {
      return [
        `Hi, I'm ${qv('name') || '[name]'}`,
        `Phone: ${qv('phone') || '[phone]'}`,
        `Service: ${qv('service') || '[service]'}`,
        `Message: ${qv('message') || '[message]'}`
      ].join('\n');
    }

    // Ensure send button click triggers form submit in older browsers
    if (sendBtn) {
      sendBtn.addEventListener('click', (ev) => {
        // prefer requestSubmit, fallback to submit
        try {
          if (typeof form.requestSubmit === 'function') form.requestSubmit();
          else form.submit();
        } catch (err) {
          console.warn('contact-form: submit fallback failed', err);
        }
      });
    }

    // submit handler
    form.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      ev.stopImmediatePropagation && ev.stopImmediatePropagation();

      // gather values
      const name = qv('name').trim();
      const email = qv('email').trim();
      const phone = qv('phone').trim();
      const pickupAddress = qv('pickup-address').trim();
      const message = qv('message').trim();

      // Check if this is an order confirmation
      const pendingOrder = localStorage.getItem('pendingOrder');
      const isOrder = !!pendingOrder;

      // Validation
      if (!name) {
        const m = 'Please enter your name.';
        statusEl.textContent = m;
        showToast(m, false);
        return;
      }

      if (!phone) {
        const m = 'Please enter your mobile number.';
        statusEl.textContent = m;
        showToast(m, false);
        return;
      }

      if (isOrder && !pickupAddress) {
        const m = 'Please enter your pickup/delivery address.';
        statusEl.textContent = m;
        showToast(m, false);
        return;
      }

      if (!isOrder && !email) {
        const m = 'Please enter your email.';
        statusEl.textContent = m;
        showToast(m, false);
        return;
      }

      if (email && !emailIsValid(email)) {
        const m = 'Please enter a valid email address.';
        statusEl.textContent = m;
        showToast(m, false);
        const em = document.getElementById('email');
        try { em && em.focus(); } catch (e) {}
        return;
      }

      // UI lock
      setLoading(true);
      statusEl.textContent = isOrder ? 'Confirming your order...' : 'Sending your message...';

      // Simulate network; replace with real fetch() when backend available
      try {
        await new Promise(r => setTimeout(r, 900));
        
        if (isOrder) {
          // Process order
          const order = JSON.parse(pendingOrder);
          const orderData = {
            ...order,
            customerName: name,
            customerPhone: phone,
            customerEmail: email,
            pickupAddress: pickupAddress,
            deliveryAddress: qv('delivery-address').trim() || pickupAddress,
            confirmedAt: new Date().toISOString()
          };

          // Save confirmed order (in real app, send to server)
          const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
          orderHistory.push(orderData);
          localStorage.setItem('orderHistory', JSON.stringify(orderHistory));

          // Clear pending order and cart
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('dryCleaningCart');

          const success = `✓ Order Confirmed!\n\nOrder ID: #${Date.now().toString().slice(-6)}\nWe'll contact you at ${phone} to schedule pickup.\n\nThank you for choosing Devbhoomi DryCleans!`;
          statusEl.textContent = success;
          showToast('Order confirmed successfully!', true);
          
          // Show detailed confirmation
          alert(success);
          
          // Redirect to home after confirmation
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          // Regular contact form
          const success = 'Message sent — we will reply within 24 hours.';
          statusEl.textContent = success;
          showToast(success, true);
          form.reset();
          try { document.getElementById('name').focus(); } catch (e) {}
        }
      } catch (err) {
        console.error('contact-form send error', err);
        const fail = isOrder 
          ? 'Failed to confirm order. Please call us at +91 99588 43588.' 
          : 'Failed to send. Try again or contact via WhatsApp.';
        statusEl.textContent = fail;
        showToast(fail, false);
      } finally {
        setLoading(false);
      }
    }, { passive: false });

    // Ctrl/Cmd + Enter to submit
    form.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const submit = form.querySelector('button[type="submit"]') || sendBtn;
        if (submit) submit.click();
      }
    });

    // focus first field for accessibility
    try { document.getElementById('name').focus(); } catch (e) {}

    // marker for debugging
    window.__contactFormHandled = true;
  }
})();