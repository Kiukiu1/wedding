(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Envelope intro
     --------------------------------------------------------------------- */
  var overlay = document.getElementById('envelopeOverlay');
  var flap = document.getElementById('envelopeFlap');
  var openBtn = document.getElementById('openInvite');

  function openInvitation() {
    document.body.classList.remove('is-locked');
    flap.classList.add('is-open');
    setTimeout(function () {
      overlay.classList.add('is-hidden');
    }, 550);

    var bgm = document.getElementById('bgm');
    var musicToggle = document.getElementById('musicToggle');
    if (bgm && bgm.paused) {
      bgm.play().then(function () {
        if (musicToggle) musicToggle.classList.add('is-playing');
      }).catch(function () { /* autoplay blocked, user can still press the music toggle */ });
    }
  }
  if (openBtn) openBtn.addEventListener('click', openInvitation);

  /* ---------------------------------------------------------------------
     Side dot nav — smooth scroll + active state
     --------------------------------------------------------------------- */
  var dotItems = document.querySelectorAll('.dotnav__item');
  var sections = Array.prototype.map.call(dotItems, function (item) {
    return document.getElementById(item.getAttribute('data-target'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && dotItems.length) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          dotItems.forEach(function (item) {
            item.classList.toggle('is-active', item.getAttribute('data-target') === entry.target.id);
          });
        }
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal — staggered per section/group
     --------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  var revealGroups = new Map();
  revealEls.forEach(function (el) {
    var group = el.closest('section') || document.body;
    var count = revealGroups.get(group) || 0;
    el.style.transitionDelay = Math.min(count, 7) * 90 + 'ms';
    revealGroups.set(group, count + 1);
  });

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
     Timeline — draw the connecting line in as it scrolls into view
     --------------------------------------------------------------------- */
  var timeline = document.querySelector('.timeline');
  if (timeline && 'IntersectionObserver' in window) {
    var timelineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          timeline.classList.add('is-drawn');
          timelineObserver.unobserve(timeline);
        }
      });
    }, { threshold: 0.2 });
    timelineObserver.observe(timeline);
  } else if (timeline) {
    timeline.classList.add('is-drawn');
  }

  /* ---------------------------------------------------------------------
     Hero — subtle parallax drift on scroll
     --------------------------------------------------------------------- */
  var heroFrame = document.querySelector('.hero__frame');
  var heroSection = document.getElementById('hero');
  if (heroFrame && heroSection && window.matchMedia('(min-width: 700px)').matches) {
    var parallaxTicking = false;
    var applyParallax = function () {
      var rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        heroFrame.style.transform = 'translateY(' + (rect.top * -0.12) + 'px)';
      }
      parallaxTicking = false;
    };
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        window.requestAnimationFrame(applyParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
    applyParallax();
  }

  /* ---------------------------------------------------------------------
     Gallery — gentle 3D tilt following the cursor
     --------------------------------------------------------------------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.gallery__item').forEach(function (item) {
      item.addEventListener('mousemove', function (e) {
        var rect = item.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        item.style.transform =
          'perspective(600px) rotateX(' + (relY * -12).toFixed(2) + 'deg) ' +
          'rotateY(' + (relX * 12).toFixed(2) + 'deg) scale(1.05)';
      });
      item.addEventListener('mouseleave', function () {
        item.style.transform = '';
      });
    });
  }

  /* ---------------------------------------------------------------------
     Countdown timer
     --------------------------------------------------------------------- */
  var WEDDING_DATE = new Date('2026-07-19T08:00:00+07:00').getTime();
  var elDays = document.getElementById('cd-days');
  var elHours = document.getElementById('cd-hours');
  var elMins = document.getElementById('cd-mins');
  var elSecs = document.getElementById('cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  var prevCountdown = { days: null, hours: null, mins: null, secs: null };
  function setCountdownCell(el, key, value) {
    if (!el) return;
    var text = pad(value);
    if (prevCountdown[key] !== null && prevCountdown[key] !== text) {
      el.classList.remove('is-pulsing');
      void el.offsetWidth; /* restart animation */
      el.classList.add('is-pulsing');
    }
    el.textContent = text;
    prevCountdown[key] = text;
  }

  function tickCountdown() {
    var diff = WEDDING_DATE - Date.now();
    if (diff < 0) diff = 0;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    setCountdownCell(elDays, 'days', days);
    setCountdownCell(elHours, 'hours', hours);
    setCountdownCell(elMins, 'mins', mins);
    setCountdownCell(elSecs, 'secs', secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------------------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------------------- */
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var currentIndex = 0;

  function showLightbox(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    lightboxImg.src = galleryItems[currentIndex].getAttribute('data-full');
    lightbox.classList.add('is-open');
    document.body.classList.add('is-locked');
  }
  function hideLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImg.src = '';
    document.body.classList.remove('is-locked');
  }
  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { showLightbox(i); });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showLightbox(currentIndex - 1); });
  if (lightboxNext) lightboxNext.addEventListener('click', function () { showLightbox(currentIndex + 1); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) hideLightbox();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') hideLightbox();
    if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
  });

  /* ---------------------------------------------------------------------
     Events — map links
     --------------------------------------------------------------------- */
  document.querySelectorAll('.map-btn').forEach(function (btn) {
    var mapUrl = btn.getAttribute('data-map-url');
    if (!mapUrl) {
      var location = btn.getAttribute('data-location');
      mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(location);
    }
    btn.setAttribute('href', mapUrl);
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener');
  });

  /* ---------------------------------------------------------------------
     Guestbook
     --------------------------------------------------------------------- */
  var STORAGE_KEY = 'wedding_wishes_thanhnam_thuphuong';
  var wishForm = document.getElementById('wishForm');
  var wishMessageInput = document.getElementById('wishMessage');
  var wishList = document.getElementById('wishList');
  var chipList = document.getElementById('chipList');

  function loadWishes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }
  function saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (e) { /* storage unavailable */ }
  }
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function renderWishes() {
    var wishes = loadWishes();
    wishList.innerHTML = wishes.map(function (w) {
      return '<div class="wish">' +
        '<span class="wish__time">' + escapeHtml(w.time) + '</span>' +
        '<p class="wish__msg">' + escapeHtml(w.message) + '</p>' +
        '</div>';
    }).join('');
  }
  renderWishes();

  if (chipList) {
    chipList.addEventListener('click', function (e) {
      if (e.target.classList.contains('chip')) {
        wishMessageInput.value = e.target.textContent;
        wishMessageInput.focus();
      }
    });
  }

  if (wishForm) {
    wishForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var message = wishMessageInput.value.trim();
      if (!message) return;
      var wishes = loadWishes();
      wishes.unshift({
        message: message,
        time: new Date().toLocaleDateString('vi-VN')
      });
      saveWishes(wishes);
      renderWishes();
      wishForm.reset();
    });
  }

  /* ---------------------------------------------------------------------
     Toast helper
     --------------------------------------------------------------------- */
  var toast = document.getElementById('copyToast');
  var toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 1800);
  }

  /* ---------------------------------------------------------------------
     Background music toggle
     --------------------------------------------------------------------- */
  var musicToggle = document.getElementById('musicToggle');
  var bgm = document.getElementById('bgm');
  if (musicToggle && bgm) {
    musicToggle.addEventListener('click', function () {
      if (bgm.paused) {
        bgm.play().then(function () {
          musicToggle.classList.add('is-playing');
        }).catch(function () {
          showToast('Thêm file audio/nhac-nen.mp3 để bật nhạc nền.');
        });
      } else {
        bgm.pause();
        musicToggle.classList.remove('is-playing');
      }
    });
  }
})();
