/* ==================================================================
   GOOGLE DRIVE INVESTIGATION — MAIN CORE & UTILITIES (game.js)
   ================================================================== */


/* ==================================================================
   0. FIREBASE INITIALIZATION — CLOUD FIRESTORE
   ================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBHuRBaTt1Q4GYZZnL23HNUuzEbpf840ZE",
  authDomain: "team9-puzzle-game.firebaseapp.com",
  projectId: "team9-puzzle-game",
  storageBucket: "team9-puzzle-game.firebasestorage.app",
  messagingSenderId: "517067872756",
  appId: "1:517067872756:web:232b6d4014611b72b8c1a1",
  measurementId: "G-9MMKE19SNJ"
};

let db = null;
let firebaseReady = false;

try {
  if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseReady = true;

    console.log('Firebase Firestore connected successfully.');
  } else {
    console.warn('Firebase SDK not loaded.');
  }
} catch (e) {
  console.error('Firebase initialization failed:', e);
}


/* ==================================================================
   A. STATE
   ================================================================== */

const STORE_KEY = 'gdrive_investigation_v1';
const NAME_KEY  = 'gdrive_investigation_player';

const DEFAULT_STATE = {
  started: false,
  startTime: null,
  endTime: null,
  solved: [false, false, false, false],
  assembled: false,
  finished: false,
  playerName: '',
  scoreSubmitted: false
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


/*
   resetAll only clears the current game session.
   The leaderboard in Firestore is untouched.
   The player's saved name is preserved.
*/
function resetAll() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch (e) {}

  S = { ...DEFAULT_STATE };

  location.reload();
}


/* ==================================================================
   B. TIMER
   ================================================================== */

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

  return (
    (S.finished && S.endTime ? S.endTime : Date.now())
    - S.startTime
  );
}


function tick() {
  if (timerChip) {
    timerChip.textContent = fmt(elapsed());
    timerChip.classList.toggle('stopped', !!S.finished);
  }
}


setInterval(tick, 250);


/* ==================================================================
   C. NAVIGATION
   ================================================================== */

let previousView = 'view-start';


function show(id) {
  const current = document.querySelector('.view.active');

  if (current && current.id !== id) {
    previousView = current.id;
  }

  document
    .querySelectorAll('.view')
    .forEach(v => v.classList.remove('active'));

  const el = document.getElementById(id);

  if (el) {
    el.classList.add('active');
    el.scrollTop = 0;
  }
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

  if (!t) return;

  t.textContent = msg;
  t.classList.add('show');

  clearTimeout(toastT);

  toastT = setTimeout(() => {
    t.classList.remove('show');
  }, 2200);
}


/* ==================================================================
   D. COMPOSITE IMAGE + PIECES
   ================================================================== */

const CI_HTML = `
  <div class="ci-full">
    <div class="ci-grid"></div>
    <div class="ci-wm">EVIDENCE</div>

    <div class="ci-mark tl"></div>
    <div class="ci-mark tr"></div>
    <div class="ci-mark bl"></div>
    <div class="ci-mark br"></div>

    <div class="ci-head">Sequence Analysis</div>
    <div class="ci-dash"></div>

    <div class="ci-circ a"></div>
    <div class="ci-glyph g1">⌕</div>
    <div class="ci-glyph g2">?!</div>

    <div class="ci-tick">
      <i></i><i></i><i></i><i></i><i></i><i></i>
      <i></i><i></i><i></i><i></i><i></i><i></i>
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

  inner.style.transform =
    `scale(${k}) translate(${-qx}px, ${-qy}px)`;

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


/* ==================================================================
   E. DRIVE UI
   ================================================================== */

const FILES = [
  {
    id: 0,
    name: 'Travel_Notes.doc',
    ico: 'ico-1',
    glyph: '📄',
    info: 'Text document · 12 KB · Modified 2 days ago',
    view: 'view-doc1'
  },
  {
    id: 1,
    name: 'Sranger.doc',
    ico: 'ico-2',
    glyph: '🗒️',
    info: 'Text document · 31 KB · Modified 2 days ago',
    view: 'view-doc2'
  },
  {
    id: 2,
    name: 'Personal_Notes.doc',
    ico: 'ico-3',
    glyph: '🔎',
    info: 'Text document · 58 KB · Modified 1 day ago',
    view: 'view-doc3'
  },
  {
    id: 3,
    name: 'Cipher_Log.doc',
    ico: 'ico-4',
    glyph: '🔐',
    info: 'Text document · 9 KB · Modified 6 hours ago',
    view: 'view-doc4'
  }
];


function renderFiles(filter = '') {
  const wrap = document.getElementById('fileList');

  if (!wrap) return;

  wrap.innerHTML = '';

  const q = filter.trim().toLowerCase();

  const list = FILES.filter(
    f => !q || f.name.toLowerCase().includes(q)
  );

  if (!list.length) {
    wrap.innerHTML =
      '<div class="ws-hint" style="padding:18px 2px">No files match “' +
      filter +
      '”.</div>';

    return;
  }

  list.forEach(f => {
    const done = S.solved[f.id];

    const card = document.createElement('div');

    card.className =
      'file-card' + (done ? ' done' : '');

    card.innerHTML = `
      <div class="file-ico ${f.ico}">${f.glyph}</div>

      <div class="file-meta">
        <div class="file-name">${f.name}</div>
        <div class="file-info">${f.info}</div>
      </div>

      <span class="file-tag ${done ? 'tag-done' : 'tag-open'}">
        ${done ? '✓ SOLVED' : 'OPEN'}
      </span>`;

    card.addEventListener('click', () => show(f.view));

    wrap.appendChild(card);
  });
}


function renderPiecesBar(popIdx = -1) {
  const slots = document.getElementById('pbSlots');

  if (!slots) return;

  slots.innerHTML = '';

  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');

    d.className = 'pb-slot';

    if (S.solved[i]) {
      d.classList.add('filled');

      if (i === popIdx) {
        d.classList.add('pop');
      }

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

  const pbCount = document.getElementById('pbCount');

  if (pbCount) {
    pbCount.textContent = n + ' / 4';
  }

  const assembleCard =
    document.getElementById('assembleCard');

  if (assembleCard) {
    assembleCard.style.display =
      (n === 4) ? 'flex' : 'none';
  }
}


const assembleCardEl =
  document.getElementById('assembleCard');


if (assembleCardEl) {
  assembleCardEl.addEventListener('click', () => {
    show('view-assemble');
    buildAssembly();
  });
}


const driveSearchEl =
  document.getElementById('driveSearch');


if (driveSearchEl) {
  driveSearchEl.addEventListener('input', e => {
    renderFiles(e.target.value);
  });
}


/* ==================================================================
   PIECE AWARD MODAL
   ================================================================== */

function awardPiece(idx) {
  if (S.solved[idx]) return;

  S.solved[idx] = true;

  save();

  const searchVal =
    driveSearchEl ? driveSearchEl.value : '';

  renderFiles(searchVal);
  renderPiecesBar(idx);

  const box =
    document.getElementById('modalBox');

  if (!box) return;

  box.innerHTML = `
    <div class="big">🧩</div>

    <h4>Puzzle Piece ${idx + 1} recovered.</h4>

    <p>
      Fragment stored in <b>Recovered Pieces</b>.
    </p>

    <div class="preview" id="mPrev"></div>

    <p style="margin-top:10px;font-size:11px">
      ${S.solved.filter(Boolean).length} of 4 fragments recovered
    </p>

    <div class="btn-row" style="justify-content:center">
      <button class="btn btn-primary" id="mClose">
        Return to My Drive
      </button>
    </div>`;

  box.querySelector('#mPrev')
    .appendChild(makePiece(idx, 110));

  for (let i = 0; i < 16; i++) {
    const c = document.createElement('i');

    c.className = 'confetti';

    c.style.left =
      (Math.random() * 100) + '%';

    c.style.background =
      ['#1a73e8', '#34a853', '#f9ab00', '#d93025', '#a142f4'][i % 5];

    c.style.animationDelay =
      (Math.random() * .5) + 's';

    box.appendChild(c);
  }

  const modalWrap =
    document.getElementById('modalWrap');

  if (modalWrap) {
    modalWrap.classList.add('show');
  }

  box.querySelector('#mClose')
    .addEventListener('click', () => {

      if (modalWrap) {
        modalWrap.classList.remove('show');
      }

      show('view-drive');
    });
}


/* ==================================================================
   F. LEADERBOARD — FIRESTORE
   ================================================================== */


/*
   Convert the player's name into a safe Firestore document ID.

   Example:
   "Felina" → "felina"
   "Ritika Roy" → "ritika_roy"
*/
function sanitizeKey(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '_')
    .substring(0, 100);
}


/*
   Escape player names before displaying them as HTML.
*/
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/*
   Submit the current player's score.

   Firestore collection:

       leaderboard

   Each player gets one document.

   Only the player's fastest time is kept.
*/
function submitScore(callback) {

  if (!firebaseReady || !db) {
    console.warn('Firebase is not ready.');

    if (callback) {
      callback(false);
    }

    return;
  }

  const name =
    (S.playerName || '').trim();

  if (!name) {
    if (callback) {
      callback(false);
    }

    return;
  }

  const timeMs =
    (S.endTime || 0) -
    (S.startTime || 0);

  if (timeMs <= 0) {
    if (callback) {
      callback(false);
    }

    return;
  }

  const key = sanitizeKey(name);

  const ref =
    db.collection('leaderboard').doc(key);


  /*
     Firestore transaction makes sure that if the player
     already has a score, only the faster score is kept.
  */
  db.runTransaction(async transaction => {

    const snapshot =
      await transaction.get(ref);

    if (
      snapshot.exists &&
      snapshot.data() &&
      typeof snapshot.data().timeMs === 'number' &&
      snapshot.data().timeMs <= timeMs
    ) {
      // Existing score is faster.
      return;
    }

    transaction.set(ref, {
      name: name,
      timeMs: timeMs,
      timeFormatted: fmt(timeMs),
      timestamp: Date.now()
    });

  })
  .then(() => {

    console.log('Score saved to Firestore.');

    if (callback) {
      callback(true);
    }

  })
  .catch(error => {

    console.error(
      'submitScore error:',
      error
    );

    if (callback) {
      callback(false);
    }

  });
}


/*
   Load the top 10 fastest players from Firestore.
*/
function loadLeaderboard(targetId) {

  const target =
    document.getElementById(targetId);

  if (!target) return;


  if (!firebaseReady || !db) {

    target.innerHTML =
      '<div class="lb-status">' +
      '⚠️ Leaderboard offline<br>' +
      'Firebase is not connected.' +
      '</div>';

    return;
  }


  target.innerHTML =
    '<div class="lb-status">' +
    'Loading rankings…' +
    '</div>';


  db.collection('leaderboard')
    .orderBy('timeMs', 'asc')
    .limit(10)
    .get()

    .then(snapshot => {

      const rows = [];


      snapshot.forEach(doc => {

        const v = doc.data();

        if (
          v &&
          typeof v.timeMs === 'number'
        ) {
          rows.push(v);
        }

      });


      /*
         Extra sorting to make sure the displayed
         order is definitely fastest → slowest.
      */
      rows.sort(
        (a, b) => a.timeMs - b.timeMs
      );


      if (!rows.length) {

        target.innerHTML =
          '<div class="lb-status">' +
          'No scores recorded yet.<br>' +
          'Be the first!' +
          '</div>';

        return;
      }


      const currentName =
        (S.playerName || '')
          .trim()
          .toLowerCase();


      let html = '';


      rows.forEach((r, i) => {

        const isMe =
          r.name &&
          r.name.trim().toLowerCase() === currentName &&
          S.finished;


        const cls =
          isMe
            ? 'lb-row highlight'
            : 'lb-row';


        const time =
          r.timeFormatted ||
          fmt(r.timeMs);


        html += `
          <div class="${cls}">
            <span>${i + 1}</span>
            <span>${escapeHtml(r.name)}</span>
            <span>${escapeHtml(time)}</span>
          </div>`;
      });


      target.innerHTML = html;

    })

    .catch(error => {

      console.error(
        'loadLeaderboard error:',
        error
      );

      target.innerHTML =
        '<div class="lb-status">' +
        'Could not load rankings.<br>' +
        'Check your Firebase connection.' +
        '</div>';
    });
}


/* ==================================================================
   LEADERBOARD BUTTONS
   ================================================================== */


/*
   Open leaderboard from start screen.
*/
const btnOpenLb =
  document.getElementById('btnOpenLeaderboard');


if (btnOpenLb) {

  btnOpenLb.addEventListener(
    'click',
    () => {

      show('view-leaderboard');

      loadLeaderboard(
        'globalLbList'
      );
    }
  );
}


/*
   Back from leaderboard.
*/
const btnBackFromLb =
  document.getElementById('btnBackFromLb');


if (btnBackFromLb) {

  btnBackFromLb.addEventListener(
    'click',
    () => {
      show(
        previousView ||
        'view-start'
      );
    }
  );
}


/*
   Close leaderboard.
*/
const btnCloseLb =
  document.getElementById('btnCloseLb');


if (btnCloseLb) {

  btnCloseLb.addEventListener(
    'click',
    () => {
      show(
        previousView ||
        'view-start'
      );
    }
  );
}


/* ==================================================================
   J. ASSEMBLY · FINAL QUESTION · COMPLETION
   ================================================================== */

const SCATTER = [
  { x: -58, y: -46, r: -13 },
  { x: 62, y: -54, r: 11 },
  { x: -66, y: 52, r: 9 },
  { x: 54, y: 62, r: -10 }
];


function buildAssembly() {

  const stage =
    document.getElementById('asmStage');

  if (!stage) return;

  stage.classList.remove('done');

  stage
    .querySelectorAll('.slot')
    .forEach(s => s.remove());


  for (let i = 0; i < 4; i++) {

    const slot =
      document.createElement('div');

    slot.className = 'slot';

    slot.style.left =
      ((i % 2) * 150) + 'px';

    slot.style.top =
      (Math.floor(i / 2) * 150) + 'px';

    slot.style.transform =
      `translate(${SCATTER[i].x}px, ${SCATTER[i].y}px) rotate(${SCATTER[i].r}deg)`;

    slot.style.transitionDelay =
      (i * 0.12) + 's';

    slot.appendChild(
      makePiece(i, 150)
    );

    stage.appendChild(slot);
  }


  const btnAssemble =
    document.getElementById('btnAssemble');

  const btnToFinal =
    document.getElementById('btnToFinal');

  const asmTitle =
    document.getElementById('asmTitle');

  const asmSub =
    document.getElementById('asmSub');


  if (btnAssemble) {
    btnAssemble.style.display =
      S.assembled
        ? 'none'
        : 'inline-block';
  }


  if (btnToFinal) {
    btnToFinal.style.display =
      S.assembled
        ? 'inline-block'
        : 'none';
  }


  if (asmTitle) {
    asmTitle.textContent =
      S.assembled
        ? 'Image reconstructed'
        : 'Four fragments recovered';
  }


  if (asmSub) {

    asmSub.textContent =
      S.assembled

        ? 'Photo is complete.'

        : 'Align the fragments to rebuild the original evidence photo.';
  }


  if (S.assembled) {
    stage.classList.add('done');
  }
}


/* ==================================================================
   ASSEMBLE BUTTON
   ================================================================== */

const btnAssembleEl =
  document.getElementById('btnAssemble');


if (btnAssembleEl) {

  btnAssembleEl.addEventListener(
    'click',
    () => {

      const stage =
        document.getElementById('asmStage');

      if (stage) {
        stage.classList.add('done');
      }


      btnAssembleEl.style.display =
        'none';


      S.assembled = true;

      save();


      setTimeout(() => {

        const asmTitle =
          document.getElementById('asmTitle');

        const asmSub =
          document.getElementById('asmSub');

        const btnToFinal =
          document.getElementById('btnToFinal');


        if (asmTitle) {
          asmTitle.textContent =
            'Image reconstructed';
        }


        if (asmSub) {
          asmSub.textContent =
            'The composite evidence photo is complete.';
        }


        if (btnToFinal) {
          btnToFinal.style.display =
            'inline-block';
        }


        toast(
          'Fragments aligned — clue visible'
        );

      }, 1450);
    }
  );
}


/* ==================================================================
   GO TO FINAL QUESTION
   ================================================================== */

const btnToFinalEl =
  document.getElementById('btnToFinal');


if (btnToFinalEl) {

  btnToFinalEl.addEventListener(
    'click',
    () => {

      const holder =
        document.getElementById('finalImage');


      if (holder) {

        holder.innerHTML = '';

        holder.appendChild(
          makeFullImage()
        );
      }


      show('view-final');


      setTimeout(() => {

        const input =
          document.getElementById('finalInput');

        if (input) {
          input.focus();
        }

      }, 380);
    }
  );
}


/* ==================================================================
   FINAL ANSWER
   ================================================================== */

const FINAL_ANSWER = '1381';


function checkFinal() {

  const finalInput =
    document.getElementById('finalInput');

  const raw =
    finalInput
      ? finalInput.value
      : '';

  const clean =
    (raw || '').replace(
      /[^0-9]/g,
      ''
    );


  const msg =
    document.getElementById('finalMsg');


  if (!clean) {

    if (msg) {

      msg.className =
        'msg bad';

      msg.textContent =
        'Enter an answer first.';
    }

    return;
  }


  if (clean === FINAL_ANSWER) {

    if (msg) {

      msg.className =
        'msg ok';

      msg.textContent =
        'Correct. Sequence broken.';
    }


    S.finished = true;

    S.endTime = Date.now();

    save();

    tick();


    setTimeout(() => {

      const finalTime =
        document.getElementById('finalTime');


      if (finalTime) {

        finalTime.textContent =
          fmt(
            S.endTime -
            S.startTime
          );
      }


      show('view-complete');


      /*
         Submit score to Firestore.

         Only mark scoreSubmitted = true
         if the Firebase save actually succeeds.
      */
      submitScore(success => {

        if (success) {

          S.scoreSubmitted = true;

          save();
        }


        loadLeaderboard(
          'completeLbList'
        );

      });

    }, 900);

  } else {

    if (msg) {

      msg.className =
        'msg bad';

      msg.textContent =
        'Incorrect answer. Examine the image again.';
    }


    const box =
      document.querySelector(
        '.final-image-holder'
      );


    if (box) {

      box.classList.add('shake');

      setTimeout(() => {

        box.classList.remove('shake');

      }, 420);
    }


    if (finalInput) {
      finalInput.select();
    }
  }
}


/* ==================================================================
   FINAL ANSWER BUTTON
   ================================================================== */

const btnSubmitFinalEl =
  document.getElementById(
    'btnSubmitFinal'
  );


if (btnSubmitFinalEl) {

  btnSubmitFinalEl.addEventListener(
    'click',
    checkFinal
  );
}


/* ==================================================================
   FINAL ANSWER ENTER KEY
   ================================================================== */

const finalInputEl =
  document.getElementById(
    'finalInput'
  );


if (finalInputEl) {

  finalInputEl.addEventListener(
    'keydown',
    e => {

      if (e.key === 'Enter') {
        checkFinal();
      }

    }
  );
}


/* ==================================================================
   START / RESET
   ================================================================== */

const btnStartEl =
  document.getElementById('btnStart');


if (btnStartEl) {

  btnStartEl.addEventListener(
    'click',
    () => {

      const nameInput =
        document.getElementById(
          'playerName'
        );

      const errEl =
        document.getElementById(
          'nameError'
        );


      const rawName =
        nameInput
          ? (nameInput.value || '').trim()
          : '';


      /*
         Validate investigator name.
      */
      if (!rawName) {

        if (errEl) {
          errEl.textContent =
            'Please enter an investigator name to begin.';
        }

        if (nameInput) {
          nameInput.focus();
        }

        return;
      }


      if (rawName.length < 2) {

        if (errEl) {
          errEl.textContent =
            'Name must be at least 2 characters.';
        }

        if (nameInput) {
          nameInput.focus();
        }

        return;
      }


      if (errEl) {
        errEl.textContent = '';
      }


      if (!S.started) {

        S.started = true;

        S.startTime =
          Date.now();

        S.playerName =
          rawName;

        save();


        try {

          localStorage.setItem(
            NAME_KEY,
            rawName
          );

        } catch (e) {}
      }


      /*
         Reflect avatar with first initial.
      */
      const av =
        document.getElementById(
          'userAvatar'
        );


      if (av) {

        av.textContent =
          rawName
            .charAt(0)
            .toUpperCase();
      }


      show('view-drive');

      toast(
        'Timer started — Drive access granted'
      );
    }
  );
}


/* ==================================================================
   RESET BUTTON
   ================================================================== */

const btnResetStartEl =
  document.getElementById(
    'btnResetStart'
  );


if (btnResetStartEl) {
  btnResetStartEl.addEventListener(
    'click',
    resetAll
  );
}


/* ==================================================================
   PLAY AGAIN BUTTON
   ================================================================== */

const btnPlayAgainEl =
  document.getElementById(
    'btnPlayAgain'
  );


if (btnPlayAgainEl) {
  btnPlayAgainEl.addEventListener(
    'click',
    resetAll
  );
}


/* ==================================================================
   LIVE NAME VALIDATION
   ================================================================== */

const nameInputEl =
  document.getElementById(
    'playerName'
  );


if (nameInputEl) {

  nameInputEl.addEventListener(
    'input',
    () => {

      const errEl =
        document.getElementById(
          'nameError'
        );

      if (errEl) {
        errEl.textContent = '';
      }
    }
  );
}


/* ==================================================================
   BOOTSTRAP INITIALIZER
   ================================================================== */

window.addEventListener(
  'DOMContentLoaded',
  () => {

    load();


    /*
       Build all four puzzle documents.
       These functions are provided by puzzles.js.
    */
    if (typeof buildD1 === 'function') {
      buildD1();
    }

    if (typeof buildD2 === 'function') {
      buildD2();
    }

    if (typeof buildD3 === 'function') {
      buildD3();
    }

    if (typeof buildD4 === 'function') {
      buildD4();
    }


    renderFiles();

    renderPiecesBar();

    tick();


    /*
       Restore saved player name.
    */
    const savedName =
      S.playerName ||
      (function () {

        try {

          return (
            localStorage.getItem(
              NAME_KEY
            ) || ''
          );

        } catch (e) {

          return '';
        }

      })();


    const nameField =
      document.getElementById(
        'playerName'
      );


    if (nameField && savedName) {
      nameField.value =
        savedName;
    }


    /*
       Restore avatar for returning players.
    */
    if (savedName) {

      const av =
        document.getElementById(
          'userAvatar'
        );


      if (av) {

        av.textContent =
          savedName
            .charAt(0)
            .toUpperCase();
      }
    }


    /*
       If the game was already completed,
       show completion screen and make sure
       the score exists in Firestore.
    */
    if (S.finished) {

      const finalTime =
        document.getElementById(
          'finalTime'
        );


      if (finalTime) {

        finalTime.textContent =
          fmt(
            (S.endTime || 0) -
            (S.startTime || 0)
          );
      }


      show('view-complete');


      /*
         If score was not submitted,
         submit it now.
      */
      if (!S.scoreSubmitted) {

        submitScore(success => {

          if (success) {

            S.scoreSubmitted = true;

            save();
          }


          loadLeaderboard(
            'completeLbList'
          );

        });

      } else {

        loadLeaderboard(
          'completeLbList'
        );
      }


    } else if (S.started) {

      /*
         Resume an unfinished game.
      */
      show('view-drive');

      setTimeout(
        () => {

          toast(
            'Session resumed — timer still running'
          );

        },
        500
      );


    } else {

      /*
         New player.
      */
      show('view-start');
    }

  }
);