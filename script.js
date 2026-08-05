// Year stamp
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  if (!q || !a) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    item.closest('.faq').querySelectorAll('.faq-item.open').forEach(other => {
      if (other !== item) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      }
    });
    item.classList.toggle('open', !isOpen);
    a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
  });
});

// Sticky mobile CTA — appears after scrolling past the hero
const stickyCta = document.getElementById('stickyCta');
if (stickyCta) {
  const hero = document.querySelector('.hero');
  const onScroll = () => {
    const trigger = hero ? hero.offsetHeight : 300;
    stickyCta.classList.toggle('show', window.scrollY > trigger);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Hero type-morph: a rehearsed line collapses into a relaxed one
const morph = document.getElementById('typeMorph');
if (morph) {
  const rigid = 'هقولها إيه دلوقتي... خطوة واحد، خطوة اتنين...';
  const natural = 'قول اللي في دماغك، وخليك أنت.';
  let i = 0, phase = 'type-rigid', pauseUntil = 0;

  function frame(ts) {
    if (ts < pauseUntil) { requestAnimationFrame(frame); return; }
    if (phase === 'type-rigid') {
      i++;
      morph.innerHTML = rigid.slice(0, i) + '<span class="cursor"></span>';
      if (i >= rigid.length) { phase = 'hold-rigid'; pauseUntil = ts + 900; }
    } else if (phase === 'hold-rigid') {
      phase = 'erase'; 
    } else if (phase === 'erase') {
      i--;
      morph.innerHTML = rigid.slice(0, i) + '<span class="cursor"></span>';
      if (i <= 0) { phase = 'type-natural'; i = 0; }
    } else if (phase === 'type-natural') {
      i++;
      morph.innerHTML = natural.slice(0, i) + '<span class="cursor"></span>';
      if (i >= natural.length) { phase = 'hold-natural'; pauseUntil = ts + 2200; }
    } else if (phase === 'hold-natural') {
      phase = 'type-rigid'; i = 0; pauseUntil = ts + 400;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Sample request form — saves the lead to a Google Sheet (free, no
// submission cap) via a Google Apps Script web app, then continues to
// the sample delivery page regardless of whether the save succeeded
// (never block the user from reading the sample they asked for).
//
// SETUP (one-time, ~5 minutes, completely free):
// 1. Create a new Google Sheet.
// 2. Extensions → Apps Script, paste this, then click Deploy → New deployment
//    → type "Web app" → Execute as "Me" → Who has access "Anyone":
//
//    function doGet(e) {
//      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
//      sheet.appendRow([new Date(), e.parameter.name || '', e.parameter.whatsapp || '']);
//      return ContentService.createTextOutput('ok');
//    }
//
// 3. Copy the deployment URL (ends in /exec) and paste it below.
const LEADS_ENDPOINT = 'https://script.google.com/macros/s/AKfycby1qnQM1dnNvNG5ngJ_8rdZuUQ3ewLJVoleld5wVZmSVrRNYZqT46NX76iPBmYSx4TRYQ/exec';

const sampleForm = document.getElementById('sampleForm');
if (sampleForm) {
  sampleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('firstName').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const params = new URLSearchParams({ name, whatsapp });

    const goToSample = () => { window.location.href = 'thank-you.html?' + params.toString(); };

    if (LEADS_ENDPOINT) {
      // no-cors: Apps Script doesn't return CORS headers by default, so the
      // response can't be read — that's fine, we just fire-and-forget it.
      fetch(LEADS_ENDPOINT + '?' + params.toString(), { mode: 'no-cors' })
        .then(goToSample)
        .catch(goToSample);
    } else {
      goToSample();
    }
  });
}
