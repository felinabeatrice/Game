/* ==================================================================
   GOOGLE DRIVE INVESTIGATION — MAIN CORE & UTILITIES (game.js)
   ================================================================== */

/* ---------- A. STATE ---------- */
const STORE_KEY = 'gdrive_investigation_v1';
const DEFAULT_STATE = {
  started: false,
  startTime: null,
  endTime: null,
  solved: [false, false, false, false],
  assembled: false,
  finished: false
};
let S = { ...DEFAULT_STATE };

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(S));
  } catch (e) {}
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p === 'object') {
        S = { ...DEFAULT_STATE, ...p };
      }
    }
  } catch (e) {
    S = { ...DEFAULT_STATE };
  }
}

function resetAll() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch (e) {}
  S = { ...DEFAULT_STATE };
  location.reload();
}

/* ---------- B. TIMER ---------- */
const timerChip = document.getElementById('timerChip');

function fmt(ms) {
  if (ms < 0) ms = 0;
  const t = Math.floor(ms / 1000);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function elapsed() {
  if (!S.started || !S.startTime) return 0;
  return (S.finished && S.endTime ? S.endTime : Date.now()) - S.startTime;
}

function tick() {
  timerChip.textContent = fmt(elapsed());
  timerChip.classList.toggle('stopped', !!S.finished);
}
setInterval(tick, 250);

/* ---------- C. NAVIGATION ---------- */
function show(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  el.scrollTop = 0;
}

document.querySelectorAll('[data-back]').forEach(b => {
  b.addEventListener('click', () => show('view-drive'));
});
document.querySelectorAll('[data-back-assemble]').forEach(b => {
  b.addEventListener('click', () => show('view-assemble'));
});

let toastT;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------- D. COMPOSITE IMAGE + PIECES ---------- */
const CI_HTML = `
  <div class="ci-full">
    <div class="ci-grid"></div>
    <div class="ci-wm">EVIDENCE</div>
    <div class="ci-mark tl"></div><div class="ci-mark tr"></div>
    <div class="ci-mark bl"></div><div class="ci-mark br"></div>
    <div class="ci-head">Sequence Analysis</div>
    <div class="ci-dash"></div>
    <div class="ci-circ a"></div><div class="ci-glyph g1">⌕</div>
    <div class="ci-glyph g2">?!</div>
    <div class="ci-tick">
      <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
    </div>
    <div class="ci-band">
      <span class="ci-num">8</span>
      <span class="ci-num">27</span>
      <span class="ci-num">125</span>
      <span class="ci-num">343</span>
      <span class="ci-num">1381</span>
    </div>
    <div class="ci-q">FIND THE ODD MAN OUT</div>
    <div class="ci-note">One value breaks the pattern</div>
    <div class="ci-circ b"></div>
    <div class="ci-glyph g3">FRAG · A/B</div>
    <div class="ci-glyph g4">FRAG · C/D</div>
    <div class="ci-vign"></div>
  </div>`;

function makePiece(idx, size) {
  const k = size / 150;
  const qx = (idx % 2) * 150;
  const qy = Math.floor(idx / 2) * 150;
  const wrap = document.createElement('div');
  wrap.className = 'piece';
  wrap.style.width = size + 'px';
  wrap.style.height = size + 'px';
  const inner = document.createElement('div');
  inner.className = 'piece-inner';
  inner.style.transform = `scale(${k}) translate(${-qx}px, ${-qy}px)`;
  inner.innerHTML = CI_HTML;
  wrap.appendChild(inner);
  return wrap;
}

function makeFullImage() {
  const wrap = document.createElement('div');
  wrap.className = 'piece';
  wrap.style.width = '300px';
  wrap.style.height = '300px';
  const inner = document.createElement('div');
  inner.className = 'piece-inner';
  inner.innerHTML = CI_HTML;
  wrap.appendChild(inner);
  return wrap;
}

/* ---------- E. DRIVE UI ---------- */
const FILES = [
  { id: 0, name: 'Travel_Notes.doc', ico: 'ico-1', glyph: '📄', info: 'Text document · 12 KB · Modified 2 days ago', view: 'view-doc1' },
  { id: 1, name: 'Sranger.doc', ico: 'ico-2', glyph: '🗒️', info: 'Text document · 31 KB · Modified 2 days ago', view: 'view-doc2' },
  { id: 2, name: 'Personal_Notes.doc', ico: 'ico-3', glyph: '🔎', info: 'Text document · 58 KB · Modified 1 day ago', view: 'view-doc3' },
  { id: 3, name: 'Cipher_Log.doc', ico: 'ico-4', glyph: '🔐', info: 'Text document · 9 KB · Modified 6 hours ago', view: 'view-doc4' }
];

function renderFiles(filter = '') {
  const wrap = document.getElementById('fileList');
  wrap.innerHTML = '';
  const q = filter.trim().toLowerCase();
  const list = FILES.filter(f => !q || f.name.toLowerCase().includes(q));
  if (!list.length) {
    wrap.innerHTML = '<div class="ws-hint" style="padding:18px 2px">No files match “' + filter + '”.</div>';
    return;
  }
  list.forEach(f => {
    const done = S.solved[f.id];
    const card = document.createElement('div');
    card.className = 'file-card' + (done ? ' done' : '');
    card.innerHTML = `
      <div class="file-ico ${f.ico}">${f.glyph}</div>
      <div class="file-meta">
        <div class="file-name">${f.name}</div>
        <div class="file-info">${f.info}</div>
      </div>
      <span class="file-tag ${done ? 'tag-done' : 'tag-open'}">${done ? '✓ SOLVED' : 'OPEN'}</span>`;
    card.addEventListener('click', () => show(f.view));
    wrap.appendChild(card);
  });
}

function renderPiecesBar(popIdx = -1) {
  const slots = document.getElementById('pbSlots');
  slots.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'pb-slot';
    if (S.solved[i]) {
      d.classList.add('filled');
      if (i === popIdx) d.classList.add('pop');
      d.appendChild(makePiece(i, 58));
      const tag = document.createElement('div');
      tag.className = 'idx';
      tag.textContent = '#' + (i + 1);
      d.appendChild(tag);
    } else {
      d.innerHTML = '<span class="lock">🧩</span>';
    }
    slots.appendChild(d);
  }
  const n = S.solved.filter(Boolean).length;
  document.getElementById('pbCount').textContent = n + ' / 4';
  document.getElementById('assembleCard').style.display = (n === 4) ? 'flex' : 'none';
}

document.getElementById('assembleCard').addEventListener('click', () => {
  show('view-assemble');
  buildAssembly();
});
document.getElementById('driveSearch').addEventListener('input', e => renderFiles(e.target.value));

/* ---------- PIECE AWARD MODAL ---------- */
function awardPiece(idx) {
  if (S.solved[idx]) return;
  S.solved[idx] = true;
  save();
  renderFiles(document.getElementById('driveSearch').value);
  renderPiecesBar(idx);

  const box = document.getElementById('modalBox');
  box.innerHTML = `
    <div class="big">🧩</div>
    <h4>Puzzle Piece ${idx + 1} recovered.</h4>
    <p>Fragment stored in <b>Recovered Pieces</b>.</p>
    <div class="preview" id="mPrev"></div>
    <p style="margin-top:10px;font-size:11px">${S.solved.filter(Boolean).length} of 4 fragments recovered</p>
    <div class="btn-row" style="justify-content:center">
      <button class="btn btn-primary" id="mClose">Return to My Drive</button>
    </div>`;
  box.querySelector('#mPrev').appendChild(makePiece(idx, 110));
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = (Math.random() * 100) + '%';
    c.style.background = ['#1a73e8', '#34a853', '#f9ab00', '#d93025', '#a142f4'][i % 5];
    c.style.animationDelay = (Math.random() * .5) + 's';
    box.appendChild(c);
  }
  document.getElementById('modalWrap').classList.add('show');
  box.querySelector('#mClose').addEventListener('click', () => {
    document.getElementById('modalWrap').classList.remove('show');
    show('view-drive');
  });
}

/* ==================================================================
   J. ASSEMBLY · FINAL QUESTION · COMPLETION
   ================================================================== */
const SCATTER = [
  { x: -58, y: -46, r: -13 }, { x: 62, y: -54, r: 11 },
  { x: -66, y: 52, r: 9 }, { x: 54, y: 62, r: -10 }
];

function buildAssembly() {
  const stage = document.getElementById('asmStage');
  stage.classList.remove('done');
  stage.querySelectorAll('.slot').forEach(s => s.remove());
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.style.left = ((i % 2) * 150) + 'px';
    slot.style.top = (Math.floor(i / 2) * 150) + 'px';
    slot.style.transform = `translate(${SCATTER[i].x}px, ${SCATTER[i].y}px) rotate(${SCATTER[i].r}deg)`;
    slot.style.transitionDelay = (i * 0.12) + 's';
    slot.appendChild(makePiece(i, 150));
    stage.appendChild(slot);
  }
  document.getElementById('btnAssemble').style.display = S.assembled ? 'none' : 'inline-block';
  document.getElementById('btnToFinal').style.display = S.assembled ? 'inline-block' : 'none';
  document.getElementById('asmTitle').textContent = S.assembled ? 'Image reconstructed' : 'Four fragments recovered';
  document.getElementById('asmSub').textContent = S.assembled
    ? 'Photo is complete.'
    : 'Align the fragments to rebuild the original evidence photo.';
  if (S.assembled) stage.classList.add('done');
}

document.getElementById('btnAssemble').addEventListener('click', () => {
  const stage = document.getElementById('asmStage');
  stage.classList.add('done');
  document.getElementById('btnAssemble').style.display = 'none';
  S.assembled = true;
  save();
  setTimeout(() => {
    document.getElementById('asmTitle').textContent = 'Image reconstructed';
    document.getElementById('asmSub').textContent = 'The composite evidence photo is complete.';
    document.getElementById('btnToFinal').style.display = 'inline-block';
    toast('Fragments aligned — clue visible');
  }, 1450);
});

document.getElementById('btnToFinal').addEventListener('click', () => {
  const holder = document.getElementById('finalImage');
  holder.innerHTML = '';
  holder.appendChild(makeFullImage());
  show('view-final');
  setTimeout(() => document.getElementById('finalInput').focus(), 380);
});

/* --- Final answer --- */
const FINAL_ANSWER = '1381';

function checkFinal() {
  const raw = document.getElementById('finalInput').value;
  const clean = (raw || '').replace(/[^0-9]/g, '');
  const msg = document.getElementById('finalMsg');
  if (!clean) {
    msg.className = 'msg bad';
    msg.textContent = 'Enter an answer first.';
    return;
  }
  if (clean === FINAL_ANSWER) {
    msg.className = 'msg ok';
    msg.textContent = 'Correct. Sequence broken.';
    S.finished = true;
    S.endTime = Date.now();
    save();
    tick();
    setTimeout(() => {
      document.getElementById('finalTime').textContent = fmt(S.endTime - S.startTime);
      show('view-complete');
    }, 900);
  } else {
    msg.className = 'msg bad';
    msg.textContent = 'Incorrect answer. Examine the image again.';
    const box = document.querySelector('.final-image-holder');
    box.classList.add('shake');
    setTimeout(() => box.classList.remove('shake'), 420);
    document.getElementById('finalInput').select();
  }
}

document.getElementById('btnSubmitFinal').addEventListener('click', checkFinal);
document.getElementById('finalInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkFinal();
});

/* ---------- START / RESET ---------- */
document.getElementById('btnStart').addEventListener('click', () => {
  if (!S.started) {
    S.started = true;
    S.startTime = Date.now();
    save();
  }
  show('view-drive');
  toast('Timer started — Drive access granted');
});
document.getElementById('btnResetStart').addEventListener('click', resetAll);
document.getElementById('btnPlayAgain').addEventListener('click', resetAll);

/* ---------- BOOTSTRAP INITIALIZER ---------- */
window.addEventListener('DOMContentLoaded', () => {
  load();
  buildD1();
  buildD2();
  buildD3();
  buildD4();
  renderFiles();
  renderPiecesBar();
  tick();

  if (S.finished) {
    document.getElementById('finalTime').textContent = fmt((S.endTime || 0) - (S.startTime || 0));
    show('view-complete');
  } else if (S.started) {
    show('view-drive');
    setTimeout(() => toast('Session resumed — timer still running'), 500);
  } else {
    show('view-start');
  }
});