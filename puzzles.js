/* ==================================================================
   GOOGLE DRIVE INVESTIGATION — PUZZLE MODULES (puzzles.js)
   ================================================================== */

/* ==================================================================
   F. DOCUMENT 1 — SCRAMBLED WORDS
   ================================================================== */
const D1 = [
  { scr: 'VELRAT', ans: ['TRAVEL'] },
  { scr: 'ÉCAF', ans: ['CAFE', 'CAFÉ'] },
  { scr: 'HTAP', ans: ['PATH'] },
  { scr: 'ELUB', ans: ['BLUE'] }
];

function norm(v) {
  return (v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
}

function buildD1() {
  const host = document.getElementById('scrRows');
  host.innerHTML = '';
  D1.forEach((w, i) => {
    const row = document.createElement('div');
    row.className = 'scr-row';
    row.innerHTML = `<div class="scr-word">${w.scr}</div>
                     <div class="scr-arrow">→</div>
                     <input id="d1i${i}" maxlength="10" placeholder="answer" autocomplete="off" spellcheck="false"/>`;
    host.appendChild(row);
  });
  if (S.solved[0]) lockD1();
}

function lockD1() {
  D1.forEach((w, i) => {
    const el = document.getElementById('d1i' + i);
    el.value = w.ans[0];
    el.disabled = true;
    el.classList.add('good');
  });
  document.getElementById('d1Check').disabled = true;
  document.getElementById('d1Clear').disabled = true;
  const m = document.getElementById('d1Msg');
  m.className = 'feedback ok';
  m.textContent = '✓ Document 1 already completed — Puzzle Piece 1 recovered.';
}

document.getElementById('d1Check').addEventListener('click', () => {
  let all = true;
  D1.forEach((w, i) => {
    const el = document.getElementById('d1i' + i);
    const ok = w.ans.map(norm).includes(norm(el.value));
    el.classList.toggle('good', ok);
    el.classList.toggle('wrong', !ok && el.value.trim() !== '');
    if (!ok) all = false;
  });
  const m = document.getElementById('d1Msg');
  if (all) {
    m.className = 'feedback ok';
    m.textContent = 'All four words restored. Fragment unlocked…';
    document.getElementById('d1Check').disabled = true;
    document.getElementById('d1Clear').disabled = true;
    D1.forEach((w, i) => document.getElementById('d1i' + i).disabled = true);
    setTimeout(() => awardPiece(0), 650);
  } else {
    m.className = 'feedback bad';
    m.textContent = 'Some words are still scrambled. Check the red fields.';
    document.querySelector('#view-doc1 .paper').classList.add('shake');
    setTimeout(() => document.querySelector('#view-doc1 .paper').classList.remove('shake'), 420);
  }
});

document.getElementById('d1Clear').addEventListener('click', () => {
  D1.forEach((w, i) => {
    const el = document.getElementById('d1i' + i);
    el.value = '';
    el.classList.remove('good', 'wrong');
  });
  document.getElementById('d1Msg').textContent = '';
});


/* ==================================================================
   G. DOCUMENT 2 — HANGMAN
   ================================================================== */
const HM_WORD = 'STATION';
const HM_MAX = 6;
let hmGuessed = new Set(), hmWrong = 0;

const HM_PARTS = [
  '<circle cx="74" cy="46" r="11" fill="none" stroke="#d93025" stroke-width="3"/>',
  '<line x1="74" y1="57" x2="74" y2="88" stroke="#d93025" stroke-width="3"/>',
  '<line x1="74" y1="64" x2="60" y2="78" stroke="#d93025" stroke-width="3"/>',
  '<line x1="74" y1="64" x2="88" y2="78" stroke="#d93025" stroke-width="3"/>',
  '<line x1="74" y1="88" x2="61" y2="106" stroke="#d93025" stroke-width="3"/>',
  '<line x1="74" y1="88" x2="87" y2="106" stroke="#d93025" stroke-width="3"/>'
];
const HM_GALLOWS = `
  <line x1="12" y1="120" x2="60" y2="120" stroke="#5f6368" stroke-width="4"/>
  <line x1="30" y1="120" x2="30" y2="16"  stroke="#5f6368" stroke-width="4"/>
  <line x1="30" y1="16"  x2="74" y2="16"  stroke="#5f6368" stroke-width="4"/>
  <line x1="74" y1="16"  x2="74" y2="35"  stroke="#5f6368" stroke-width="3"/>`;

function buildD2() {
  const kbd = document.getElementById('hmKbd');
  kbd.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(L => {
    const b = document.createElement('button');
    b.className = 'key';
    b.textContent = L;
    b.dataset.k = L;
    b.addEventListener('click', () => hmGuess(L));
    kbd.appendChild(b);
  });
  if (S.solved[1]) {
    hmGuessed = new Set(HM_WORD.split(''));
    hmWrong = 0;
  }
  hmRender();
  if (S.solved[1]) {
    document.querySelectorAll('#hmKbd .key').forEach(b => b.disabled = true);
    const m = document.getElementById('d2Msg');
    m.className = 'feedback ok';
    m.textContent = '✓ Document 2 already completed — Puzzle Piece 2 recovered.';
  }
}

function hmRender() {
  const blanks = document.getElementById('hmBlanks');
  blanks.innerHTML = '';
  HM_WORD.split('').forEach(ch => {
    const d = document.createElement('div');
    const rev = hmGuessed.has(ch);
    d.className = 'hm-slot' + (rev ? ' rev' : '');
    d.textContent = rev ? ch : '';
    blanks.appendChild(d);
  });
  document.getElementById('hmHearts').innerHTML =
    '❤️'.repeat(HM_MAX - hmWrong) + '<span style="opacity:.25">🖤'.repeat(hmWrong) + '</span>';
  const wrongs = [...hmGuessed].filter(c => !HM_WORD.includes(c));
  document.getElementById('hmWrong').textContent = wrongs.length ? wrongs.join(' ') : '—';
  document.getElementById('hmSvg').innerHTML = HM_GALLOWS + HM_PARTS.slice(0, hmWrong).join('');
}

function hmGuess(L) {
  if (S.solved[1] || hmGuessed.has(L)) return;
  hmGuessed.add(L);
  const btn = document.querySelector(`#hmKbd .key[data-k="${L}"]`);
  const hit = HM_WORD.includes(L);
  btn.disabled = true;
  btn.classList.add(hit ? 'hit' : 'miss');
  if (!hit) hmWrong++;
  hmRender();

  const msg = document.getElementById('d2Msg');
  if (HM_WORD.split('').every(c => hmGuessed.has(c))) {
    msg.className = 'feedback ok';
    msg.textContent = 'Keyword restored: ' + HM_WORD + '. Fragment unlocked…';
    document.querySelectorAll('#hmKbd .key').forEach(b => b.disabled = true);
    setTimeout(() => awardPiece(1), 700);
  } else if (hmWrong >= HM_MAX) {
    msg.className = 'feedback bad';
    msg.textContent = 'Transcript corrupted. Reloading the document…';
    document.querySelectorAll('#hmKbd .key').forEach(b => b.disabled = true);
    setTimeout(() => {
      hmGuessed = new Set();
      hmWrong = 0;
      document.querySelectorAll('#hmKbd .key').forEach(b => {
        b.disabled = false;
        b.classList.remove('hit', 'miss');
      });
      msg.textContent = '';
      hmRender();
    }, 1600);
  } else {
    msg.className = 'feedback';
    msg.textContent = '';
  }
}


/* ==================================================================
   H. DOCUMENT 3 — WORD SEARCH (10x10)
   ================================================================== */
const WS_N = 10;
const WS_WORDS = [
  { w: 'EVIDENCE', hint: 'Proof collected at a scene' },
  { w: 'SEARCH', hint: 'The act of looking thoroughly' },
  { w: 'HIDDEN', hint: 'Kept out of sight' },
  { w: 'TRACE', hint: 'A faint mark left behind' },
  { w: 'CLUE', hint: 'A hint that guides an inquiry' }
];

/* Fixed placements: [row, col, dRow, dCol] */
const WS_PLACE = {
  EVIDENCE: [0, 1, 0, 1],   // horizontal →
  SEARCH: [2, 0, 1, 0],   // vertical ↓
  HIDDEN: [3, 3, 1, 1],   // diagonal ↘
  TRACE: [9, 7, 0, -1],  // horizontal ← (backwards)
  CLUE: [6, 9, -1, 0]   // vertical ↑ (backwards)
};
let wsGrid = [], wsFound = new Set(), wsStart = null;

function buildWsGrid() {
  const g = Array.from({ length: WS_N }, () => Array(WS_N).fill(null));
  Object.entries(WS_PLACE).forEach(([w, [r, c, dr, dc]]) => {
    for (let i = 0; i < w.length; i++) g[r + dr * i][c + dc * i] = w[i];
  });
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < WS_N; r++) {
    for (let c = 0; c < WS_N; c++) {
      if (!g[r][c]) g[r][c] = A[Math.floor(Math.random() * 26)];
    }
  }
  return g;
}

function buildD3() {
  wsGrid = buildWsGrid();
  wsFound = new Set();
  wsStart = null;
  const host = document.getElementById('wsGrid');
  host.innerHTML = '';
  for (let r = 0; r < WS_N; r++) {
    for (let c = 0; c < WS_N; c++) {
      const d = document.createElement('div');
      d.className = 'ws-cell';
      d.textContent = wsGrid[r][c];
      d.dataset.r = r;
      d.dataset.c = c;
      d.addEventListener('click', () => wsClick(r, c));
      host.appendChild(d);
    }
  }
  if (S.solved[2]) {
    WS_WORDS.forEach(o => {
      wsFound.add(o.w);
      wsPaint(o.w);
    });
    const m = document.getElementById('d3Msg');
    m.className = 'feedback ok';
    m.textContent = '✓ Document 3 already completed — Puzzle Piece 3 recovered.';
  }
  renderWsWords();
}

function renderWsWords() {
  const host = document.getElementById('wsWords');
  host.innerHTML = '';
  WS_WORDS.forEach(o => {
    const d = document.createElement('div');
    d.className = 'ws-word' + (wsFound.has(o.w) ? ' found' : '');
    d.innerHTML = (wsFound.has(o.w) ? o.w : o.w.replace(/./g, '•')) + '<span>' + o.hint + '</span>';
    host.appendChild(d);
  });
}

function cellAt(r, c) {
  return document.querySelector(`#wsGrid .ws-cell[data-r="${r}"][data-c="${c}"]`);
}

function wsPaint(word) {
  const [r, c, dr, dc] = WS_PLACE[word];
  for (let i = 0; i < word.length; i++) {
    const el = cellAt(r + dr * i, c + dc * i);
    if (el) {
      el.classList.add('found');
      el.classList.remove('start');
    }
  }
}

function wsClick(r, c) {
  if (S.solved[2]) return;
  const msg = document.getElementById('d3Msg');
  if (!wsStart) {
    wsStart = { r, c };
    cellAt(r, c).classList.add('start');
    msg.className = 'feedback';
    msg.textContent = '';
    return;
  }
  const s = wsStart;
  cellAt(s.r, s.c).classList.remove('start');
  wsStart = null;
  if (s.r === r && s.c === c) return; // tapped same cell → cancel

  const dr = r - s.r, dc = c - s.c;
  const straight = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc));
  if (!straight) {
    msg.className = 'feedback bad';
    msg.textContent = 'Selection must be a straight line (row, column or diagonal).';
    return;
  }
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  const ur = dr === 0 ? 0 : dr / steps;
  const uc = dc === 0 ? 0 : dc / steps;
  let str = '', path = [];
  for (let i = 0; i <= steps; i++) {
    const rr = s.r + ur * i, cc = s.c + uc * i;
    str += wsGrid[rr][cc];
    path.push([rr, cc]);
  }
  const rev = str.split('').reverse().join('');
  const hit = WS_WORDS.map(o => o.w).find(w => (w === str || w === rev) && !wsFound.has(w));

  if (hit) {
    wsFound.add(hit);
    path.forEach(([rr, cc]) => cellAt(rr, cc).classList.add('found'));
    renderWsWords();
    msg.className = 'feedback ok';
    msg.textContent = `Found “${hit}”  ·  ${wsFound.size}/${WS_WORDS.length}`;
    if (wsFound.size === WS_WORDS.length) {
      msg.textContent = 'All terms located. Fragment unlocked…';
      setTimeout(() => awardPiece(2), 700);
    }
  } else {
    path.forEach(([rr, cc]) => {
      const el = cellAt(rr, cc);
      if (!el.classList.contains('found')) {
        el.classList.add('err');
        setTimeout(() => el.classList.remove('err'), 340);
      }
    });
    msg.className = 'feedback bad';
    msg.textContent = 'No match on that line.';
  }
}

document.getElementById('d3Reset').addEventListener('click', () => {
  if (wsStart) {
    cellAt(wsStart.r, wsStart.c).classList.remove('start');
    wsStart = null;
  }
  document.getElementById('d3Msg').textContent = '';
});


/* ==================================================================
   I. DOCUMENT 4 — MINI SUDOKU 4x4
   ================================================================== */
const SK_GIVENS = [
  1, 0, 3, 0,
  0, 4, 0, 2,
  2, 0, 0, 0,
  0, 0, 0, 1
];

function buildD4() {
  const host = document.getElementById('skGrid');
  host.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'sk-cell';
    const g = SK_GIVENS[i];
    if (g) {
      cell.classList.add('given');
      cell.innerHTML = `<span>${g}</span>`;
    } else {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.dataset.i = i;
      inp.addEventListener('input', e => {
        const v = e.target.value.replace(/[^1-4]/g, '');
        e.target.value = v.slice(-1);
        cell.classList.remove('bad');
        if (v) focusNext(i);
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !e.target.value) focusPrev(i);
      });
      cell.appendChild(inp);
    }
    host.appendChild(cell);
  }
  if (S.solved[3]) lockD4();
}

function inputs() {
  return [...document.querySelectorAll('#skGrid input')];
}

function focusNext(i) {
  const n = inputs().find(x => +x.dataset.i > i);
  if (n) n.focus();
}

function focusPrev(i) {
  const p = [...inputs()].reverse().find(x => +x.dataset.i < i);
  if (p) p.focus();
}

function readSk() {
  const v = SK_GIVENS.slice();
  inputs().forEach(inp => {
    v[+inp.dataset.i] = inp.value ? +inp.value : 0;
  });
  return v;
}

function validSk(v) {
  if (v.some(x => !x)) return { ok: false, reason: 'empty' };
  const set = a => new Set(a).size === 4 && a.every(n => n >= 1 && n <= 4);
  for (let r = 0; r < 4; r++) {
    if (!set(v.slice(r * 4, r * 4 + 4))) return { ok: false, reason: 'row ' + (r + 1) };
  }
  for (let c = 0; c < 4; c++) {
    if (!set([v[c], v[c + 4], v[c + 8], v[c + 12]])) return { ok: false, reason: 'column ' + (c + 1) };
  }
  const boxes = [[0, 1, 4, 5], [2, 3, 6, 7], [8, 9, 12, 13], [10, 11, 14, 15]];
  for (let b = 0; b < 4; b++) {
    if (!set(boxes[b].map(i => v[i]))) return { ok: false, reason: 'block ' + (b + 1) };
  }
  return { ok: true };
}

function lockD4() {
  const sol = [1, 2, 3, 4, 3, 4, 1, 2, 2, 1, 4, 3, 4, 3, 2, 1];
  inputs().forEach(inp => {
    inp.value = sol[+inp.dataset.i];
    inp.disabled = true;
  });
  document.querySelectorAll('#skGrid .sk-cell').forEach(c => c.classList.add('solved'));
  document.getElementById('d4Check').disabled = true;
  document.getElementById('d4Clear').disabled = true;
  const m = document.getElementById('d4Msg');
  m.className = 'feedback ok';
  m.textContent = '✓ Document 4 already completed — Puzzle Piece 4 recovered.';
}

document.getElementById('d4Check').addEventListener('click', () => {
  const v = readSk();
  const res = validSk(v);
  const m = document.getElementById('d4Msg');
  if (res.ok) {
    m.className = 'feedback ok';
    m.textContent = 'Matrix verified. Final fragment unlocked…';
    inputs().forEach(i => i.disabled = true);
    document.querySelectorAll('#skGrid .sk-cell').forEach(c => c.classList.add('solved'));
    document.getElementById('d4Check').disabled = true;
    document.getElementById('d4Clear').disabled = true;
    setTimeout(() => awardPiece(3), 700);
  } else if (res.reason === 'empty') {
    m.className = 'feedback bad';
    m.textContent = 'Matrix incomplete — every cell needs a value from 1 to 4.';
    inputs().filter(i => !i.value).forEach(i => {
      i.parentElement.classList.add('bad');
      setTimeout(() => i.parentElement.classList.remove('bad'), 600);
    });
  } else {
    m.className = 'feedback bad';
    m.textContent = 'Conflict detected in ' + res.reason + '. Re-check your values.';
    document.getElementById('skGrid').classList.add('shake');
    setTimeout(() => document.getElementById('skGrid').classList.remove('shake'), 420);
  }
});

document.getElementById('d4Clear').addEventListener('click', () => {
  inputs().forEach(i => {
    i.value = '';
    i.parentElement.classList.remove('bad');
  });
  document.getElementById('d4Msg').textContent = '';
});