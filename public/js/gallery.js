(function () {
  'use strict';

  // Example image dataset — replace srcSmall/srcLarge with your files in assets/images
  const images = [
    { id: 'g1', tag: 'before clothing', title: 'Stain Removal - Before', srcSmall: 'assets/images/gallery/g1-sm.jpg', srcLarge: 'assets/images/gallery/g1.jpg' },
    { id: 'g2', tag: 'after clothing', title: 'Stain Removal - After', srcSmall: 'assets/images/gallery/g2-sm.jpg', srcLarge: 'assets/images/gallery/g2.jpg' },
    { id: 'g3', tag: 'before accessories', title: 'Leather Scuff - Before', srcSmall: 'assets/images/gallery/g3-sm.jpg', srcLarge: 'assets/images/gallery/g3.jpg' },
    { id: 'g4', tag: 'after accessories', title: 'Leather Scuff - After', srcSmall: 'assets/images/gallery/g4-sm.jpg', srcLarge: 'assets/images/gallery/g4.jpg' },
    { id: 'g5', tag: 'after clothing', title: 'Crisp Ironing', srcSmall: 'assets/images/gallery/g5-sm.jpg', srcLarge: 'assets/images/gallery/g5.jpg' },
    { id: 'g6', tag: 'after clothing', title: 'Delicate Finish', srcSmall: 'assets/images/gallery/g6-sm.jpg', srcLarge: 'assets/images/gallery/g6.jpg' }
  ];

  const grid = document.getElementById('gallery-grid');
  const chips = Array.from(document.querySelectorAll('.filters .chip'));
  const toggleLayoutBtn = document.getElementById('toggle-layout');
  const slideshowBtn = document.getElementById('start-slideshow');

  // Lightbox elements
  const lb = document.getElementById('gallery-lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');
  const lbDownload = document.getElementById('lb-download');
  const lbFull = document.getElementById('lb-full');

  let currentIndex = 0;
  let slideshowTimer = null;

  // inline SVG placeholder (data URI) to avoid external file requests
  const placeholderSVG = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'>
    <rect width='100%' height='100%' fill='#f5fbff'/>
    <g fill='#d1e9ff'>
      <rect x='40' y='80' width='160' height='120' rx='10'/>
      <rect x='220' y='40' width='200' height='160' rx='10'/>
      <rect x='440' y='120' width='300' height='160' rx='10'/>
    </g>
    <text x='400' y='320' font-size='22' text-anchor='middle' fill='#7aa7d8' font-family='Arial, Helvetica, sans-serif'>No image available</text>
  </svg>`;
  const placeholderDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(placeholderSVG);

  // render function
  function render() {
    if (!grid) return;
    grid.innerHTML = '';
    images.forEach((img, i) => {
      const smallSrc = img.srcSmall && img.srcSmall.trim() ? img.srcSmall : placeholderDataUrl;
      const largeSrc = img.srcLarge && img.srcLarge.trim() ? img.srcLarge : smallSrc;

      const item = document.createElement('article');
      item.className = 'gallery-item';
      item.setAttribute('data-id', img.id);
      item.setAttribute('data-tags', img.tag);
      item.setAttribute('tabindex', '0');

      // create thumb element (use background image for blur-up effect)
      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'gallery-thumb';
      thumbDiv.setAttribute('role', 'img');
      thumbDiv.setAttribute('aria-label', img.title || 'Gallery image');
      // initial show smallSrc (if smallSrc is a real file it will show, otherwise placeholder)
      thumbDiv.style.backgroundImage = `url('${smallSrc}')`;
      thumbDiv.dataset.src = largeSrc;

      // meta/buttons and caption
      const metaHTML = `
        <div class="gallery-meta">
          <div class="meta-left"><div class="gallery-tag">${(img.tag || '').split(' ')[0].toUpperCase()}</div></div>
          <div class="meta-right">
            <button class="gallery-btn btn-view" data-index="${i}" title="View">View</button>
            <button class="gallery-btn btn-download" data-src="${largeSrc}" title="Download">⬇</button>
          </div>
        </div>
        <div class="gallery-caption">${img.title || ''}</div>
      `;
      item.appendChild(thumbDiv);
      item.insertAdjacentHTML('beforeend', metaHTML);
      grid.appendChild(item);
    });

    // lazy load large images (blur-up). If load fails, fallback to placeholder.
    document.querySelectorAll('.gallery-thumb').forEach((thumb) => {
      const src = thumb.dataset.src || placeholderDataUrl;
      // create an Image to prefetch large image
      const pre = new Image();
      pre.src = src;
      pre.onload = () => {
        thumb.style.backgroundImage = `url('${src}')`;
        thumb.classList.add('loaded');
      };
      pre.onerror = () => {
        // if large image not available, ensure small thumb is shown or placeholder
        const currentBg = window.getComputedStyle(thumb).backgroundImage;
        if (!currentBg || currentBg === 'none' || currentBg.includes('data:image/svg+xml') === false) {
          // ensure placeholder
          thumb.style.backgroundImage = `url('${placeholderDataUrl}')`;
        }
        thumb.classList.add('loaded');
      };
    });

    attachHandlers();
  }

  function attachHandlers() {
    // view buttons open lightbox
    document.querySelectorAll('.btn-view').forEach(b => {
      b.addEventListener('click', (e) => {
        const idx = Number(b.dataset.index);
        openLightbox(idx);
      });
    });

    // download
    document.querySelectorAll('.btn-download').forEach(b => {
      b.addEventListener('click', (e) => {
        const src = b.dataset.src || placeholderDataUrl;
        const a = document.createElement('a');
        a.href = src;
        a.download = src.split('/').pop() || 'image';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });

    // make whole item keyboard openable
    document.querySelectorAll('.gallery-item').forEach((it, idx) => {
      it.addEventListener('click', (e) => {
        if (e.target.closest('.btn-download')) return;
        openLightbox(idx);
      });
      it.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
      });
    });
  }

  // filtering
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      applyFilter(f);
    });
  });

  function applyFilter(filter) {
    const items = Array.from(grid.children);
    if (filter === 'all') {
      items.forEach(i => i.style.display = '');
    } else {
      items.forEach(i => {
        const tags = i.dataset.tags || '';
        i.style.display = tags.includes(filter) ? '' : 'none';
      });
    }
  }

  // layout toggle
  if (toggleLayoutBtn) {
    let isMasonry = true;
    toggleLayoutBtn.addEventListener('click', () => {
      isMasonry = !isMasonry;
      if (isMasonry) {
        grid.classList.remove('grid-mode');
        toggleLayoutBtn.textContent = 'Masonry';
      } else {
        grid.classList.add('grid-mode');
        toggleLayoutBtn.textContent = 'Grid';
      }
    });
  }

  // slideshow
  if (slideshowBtn) {
    slideshowBtn.addEventListener('click', () => {
      if (grid.classList.contains('slideshow')) stopSlideshow(); else startSlideshow();
    });
  }
  function startSlideshow() {
    grid.classList.add('slideshow');
    let idx = 0;
    slideshowTimer = setInterval(() => {
      const items = Array.from(grid.querySelectorAll('.gallery-item'));
      items.forEach(it => it.classList.remove('active'));
      if (items[idx]) items[idx].classList.add('active');
      idx = (idx + 1) % items.length;
    }, 1600);
    slideshowBtn.textContent = 'Stop';
  }
  function stopSlideshow() {
    grid.classList.remove('slideshow');
    clearInterval(slideshowTimer);
    slideshowTimer = null;
    slideshowBtn.textContent = 'Slideshow';
    document.querySelectorAll('.gallery-item').forEach(it => it.classList.remove('active'));
  }

  // lightbox controls
  function openLightbox(index) {
    currentIndex = index;
    showLightboxImage(currentIndex);
    if (!lb) return;
    lb.style.display = 'flex';
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lb) return;
    lb.style.display = 'none';
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function showLightboxImage(index) {
    const img = images[index];
    if (!img) return;
    const largeSrc = img.srcLarge && img.srcLarge.trim() ? img.srcLarge : (img.srcSmall && img.srcSmall.trim() ? img.srcSmall : placeholderDataUrl);
    if (lbImg) {
      lbImg.src = largeSrc;
      lbImg.alt = img.title || '';
    }
    if (lbCaption) lbCaption.textContent = img.title || '';
    if (lbDownload) {
      lbDownload.onclick = () => {
        const a = document.createElement('a');
        a.href = largeSrc;
        a.download = largeSrc.split('/').pop() || 'image';
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
    }
  }
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => { currentIndex = (currentIndex - 1 + images.length) % images.length; showLightboxImage(currentIndex); });
  if (lbNext) lbNext.addEventListener('click', () => { currentIndex = (currentIndex + 1) % images.length; showLightboxImage(currentIndex); });

  // keyboard navigation for lightbox
  document.addEventListener('keydown', (e) => {
    if (!lb || lb.style.display !== 'flex') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % images.length; showLightboxImage(currentIndex); }
    if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + images.length) % images.length; showLightboxImage(currentIndex); }
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });

  // fullscreen toggle
  function toggleFullscreen() {
    const el = lbImg;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen && el.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }
  if (lbFull) lbFull.addEventListener('click', toggleFullscreen);

  // close when clicking outside image area
  if (lb) {
    lb.addEventListener('click', (e) => {
      if (e.target === lb) closeLightbox();
    });
  }

  // initial render
  render();

  // expose helpers for debugging
  window.__gallery = { images, render, openLightbox, startSlideshow, stopSlideshow };

})();