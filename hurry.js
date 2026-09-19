/**
 * Early-Bird Hurry Strategy Script
 * Handles live countdown, price slashes, exit/entry popups, WhatsApp prebuilt links,
 * and automatic restoration of original Selar links & regular pricing when deadline passes.
 */

(function () {
  // Configurable Early-Bird Deadline: 3 Days (Sept 22, 2026 23:59:59 WAT GMT+1)
  // Can be tested or overridden by setting localStorage.overrideDeadline
  const defaultDeadline = new Date('2026-09-22T23:59:59+01:00').getTime();
  const deadline = localStorage.getItem('overrideDeadline')
    ? parseInt(localStorage.getItem('overrideDeadline'), 10)
    : defaultDeadline;

  const PHONE_NUMBER = '2348078931982';

  // Original Selar URLs (Normal Flow)
  const SELAR_MASTERCLASS = 'https://selar.com/3i489f7990';
  const SELAR_CHALLENGE = 'https://selar.com/69c5s9b890';

  // Early-Bird WhatsApp Prebuilt Links
  const WA_MASTERCLASS = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
    'Hi Coaches! I am ready to claim the Early-Bird Discount for the AI Masterclass at N25,000 (Saved N5,000). Please send payment details.'
  )}`;
  const WA_CHALLENGE = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
    'Hi Coaches! I am ready to claim the Early-Bird Discount for the 30 Days Challenge at N50,000 (Saved N20,000). Please send payment details.'
  )}`;

  function isExpired() {
    return Date.now() >= deadline;
  }

  function formatTime(ms) {
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  }

  function updateClock() {
    const remaining = deadline - Date.now();
    const expired = remaining <= 0;

    if (expired) {
      applyNormalFlow();
      return;
    }

    const t = formatTime(remaining);

    // Top Banner Tickers
    const bannerDays = document.getElementById('b-days');
    const bannerHours = document.getElementById('b-hours');
    const bannerMins = document.getElementById('b-mins');
    const bannerSecs = document.getElementById('b-secs');

    if (bannerDays) bannerDays.textContent = String(t.days).padStart(2, '0');
    if (bannerHours) bannerHours.textContent = String(t.hours).padStart(2, '0');
    if (bannerMins) bannerMins.textContent = String(t.minutes).padStart(2, '0');
    if (bannerSecs) bannerSecs.textContent = String(t.seconds).padStart(2, '0');

    // Card-Level Countdown Timers across all cards/boxes
    document.querySelectorAll('.c-days').forEach(el => el.textContent = String(t.days).padStart(2, '0'));
    document.querySelectorAll('.c-hours').forEach(el => el.textContent = String(t.hours).padStart(2, '0'));
    document.querySelectorAll('.c-mins').forEach(el => el.textContent = String(t.minutes).padStart(2, '0'));
    document.querySelectorAll('.c-secs').forEach(el => el.textContent = String(t.seconds).padStart(2, '0'));

    // Modal Popup Timer
    const modalHours = document.getElementById('m-hours');
    const modalMins = document.getElementById('m-mins');
    const modalSecs = document.getElementById('m-secs');

    if (modalHours) modalHours.textContent = String(t.hours + t.days * 24).padStart(2, '0');
    if (modalMins) modalMins.textContent = String(t.minutes).padStart(2, '0');
    if (modalSecs) modalSecs.textContent = String(t.seconds).padStart(2, '0');
  }

  function applyEarlyBirdFlow() {
    // Show top banner
    const banner = document.getElementById('countdown-banner');
    if (banner) banner.style.display = 'block';

    // Show Card Countdown Boxes across all cards
    document.querySelectorAll('.card-countdown-box').forEach(el => {
      el.style.display = 'flex';
    });

    // Update Masterclass CTA buttons to WhatsApp
    document.querySelectorAll('.btn-masterclass-cta').forEach(btn => {
      btn.href = WA_MASTERCLASS;
      btn.innerHTML = 'Claim Early-Bird Masterclass — ₦25,000 ↗';
    });

    // Update Challenge CTA buttons to WhatsApp
    document.querySelectorAll('.btn-challenge-cta').forEach(btn => {
      btn.href = WA_CHALLENGE;
      btn.innerHTML = 'Claim Early-Bird Challenge — ₦50,000 ↗';
    });

    // Show Early-Bird Badges & Price Slashes
    document.querySelectorAll('.price-masterclass').forEach(el => {
      el.innerHTML = '<span class="price-slash">₦30,000</span> <span class="price-discount">₦25,000</span>';
    });
    document.querySelectorAll('.price-challenge').forEach(el => {
      el.innerHTML = '<span class="price-slash">₦70,000</span> <span class="price-discount">₦50,000</span>';
    });

    document.querySelectorAll('.price-sub-masterclass').forEach(el => {
      el.textContent = '≈ $17.50 USD (Early-Bird Discount Saved ₦5,000!)';
    });
    document.querySelectorAll('.price-sub-challenge').forEach(el => {
      el.textContent = '≈ $35.00 USD (Early-Bird Discount Saved ₦20,000!)';
    });

    // Setup Popup trigger
    setupPopup();
  }

  function applyNormalFlow() {
    // Hide countdown banner
    const banner = document.getElementById('countdown-banner');
    if (banner) banner.style.display = 'none';

    // Hide Card Countdown Boxes
    document.querySelectorAll('.card-countdown-box').forEach(el => {
      el.style.display = 'none';
    });

    // Hide Popup Modal if open
    const modal = document.getElementById('discount-modal');
    if (modal) modal.style.display = 'none';

    // Reset Masterclass CTA buttons to Selar
    document.querySelectorAll('.btn-masterclass-cta').forEach(btn => {
      btn.href = SELAR_MASTERCLASS;
      btn.innerHTML = 'Get The Masterclass — ₦30,000 ↗';
    });

    // Reset Challenge CTA buttons to Selar
    document.querySelectorAll('.btn-challenge-cta').forEach(btn => {
      btn.href = SELAR_CHALLENGE;
      btn.innerHTML = 'Get The 30 Days Challenge — ₦70,000 ↗';
    });

    // Reset Prices to Normal
    document.querySelectorAll('.price-masterclass').forEach(el => {
      el.innerHTML = '₦30,000';
    });
    document.querySelectorAll('.price-challenge').forEach(el => {
      el.innerHTML = '₦70,000';
    });

    document.querySelectorAll('.price-sub-masterclass').forEach(el => {
      el.textContent = '≈ $21.85 USD';
    });
    document.querySelectorAll('.price-sub-challenge').forEach(el => {
      el.textContent = '≈ $50.98 USD';
    });
  }

  function setupPopup() {
    const modal = document.getElementById('discount-modal');
    if (!modal) return;

    // Check if user already dismissed modal in this session
    if (sessionStorage.getItem('earlyBirdModalDismissed')) return;

    // Trigger popup after 4 seconds
    setTimeout(() => {
      if (!isExpired() && !sessionStorage.getItem('earlyBirdModalDismissed')) {
        modal.classList.add('is-active');
      }
    }, 4000);

    // Close button handler
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('is-active');
        sessionStorage.setItem('earlyBirdModalDismissed', 'true');
      });
    }

    // Overlay background click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('is-active');
        sessionStorage.setItem('earlyBirdModalDismissed', 'true');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (isExpired()) {
      applyNormalFlow();
    } else {
      applyEarlyBirdFlow();
      setInterval(updateClock, 1000);
      updateClock();
    }
  });
})();
