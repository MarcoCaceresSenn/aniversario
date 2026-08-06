/* =============================================
   ANNIVERSARY APP - app.js
   ============================================= */

// Estado global del progreso
const state = {
  completed: [false, false, false, false]
};

// =============================================
// NAVEGACIÓN
// =============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add('active');
    screen.scrollTop = 0;
    window.scrollTo(0, 0);
  }
}

function startJourney() {
  createPetals(); // inicia pétalos si no están
  showScreen('screen-hub');
}

function goHub() {
  showScreen('screen-hub');
}

function restartAll() {
  state.completed = [false, false, false, false];
  ['chapter-1','chapter-2','chapter-3','chapter-4'].forEach((id, i) => {
    const card = document.getElementById(id);
    const status = document.getElementById(`status-${i+1}`);
    card.classList.remove('completed');
    if (i > 0) {
      card.classList.add('locked');
      card.querySelector('.chapter-icon').textContent = '🔒';
      status.textContent = '🔒 Bloqueado';
    } else {
      card.querySelector('.chapter-icon').textContent = '🌸';
      status.textContent = '▶ Jugar';
    }
  });
  resetMemory();
  resetPuzzle();
  resetTravel();
  resetWordle();
  showScreen('screen-intro');
}

function openChapter(n) {
  if (n === 1) {
    resetMemory();
    showScreen('screen-game1');
  } else if (n === 2) {
    if (!state.completed[0]) { showToast('Completa el Capítulo I primero 🌸'); return; }
    resetPuzzle();
    showScreen('screen-game2');
  } else if (n === 3) {
    if (!state.completed[1]) { showToast('Completa el Capítulo II primero 💕'); return; }
    resetTravel();
    showScreen('screen-game3');
  } else if (n === 4) {
    if (!state.completed[2]) { showToast('Completa el Capítulo III primero ✈️'); return; }
    resetWordle();
    showScreen('screen-game4');
  }
}

function completeChapter(n) {
  state.completed[n - 1] = true;
  const card = document.getElementById(`chapter-${n}`);
  const status = document.getElementById(`status-${n}`);
  card.classList.add('completed');
  card.querySelector('.chapter-icon').textContent = '✓';
  status.textContent = '✓ Completado';

  // Desbloquear siguiente
  if (n < 4) {
    const next = document.getElementById(`chapter-${n+1}`);
    const nextStatus = document.getElementById(`status-${n+1}`);
    next.classList.remove('locked');
    next.querySelector('.chapter-icon').textContent = n === 1 ? '🌹' : n === 2 ? '✈️' : '✨';
    nextStatus.textContent = '▶ Jugar';
  }

  // Mostrar recompensa después de un momento
  setTimeout(() => showScreen(`screen-reward${n}`), 600);
}

// =============================================
// TOAST NOTIFICATIONS
// =============================================
function showToast(msg, duration = 2600) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// =============================================
// PÉTALOS DE FONDO (pantalla intro)
// =============================================
function createPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  container.innerHTML = '';
  const emojis = ['🌸', '🌹', '💕', '🌷', '✿'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (4 + Math.random() * 6) + 's';
    p.style.animationDelay = (Math.random() * 6) + 's';
    p.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
    container.appendChild(p);
  }
}
createPetals();

// =============================================
// MINIJUEGO 1: MEMORY DE CORAZONES
// =============================================
const MEMORY_SYMBOLS = ['💕','🌹','🌸','🦋','💍','🌙','⭐','🎶'];
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryMoves = 0;
let memoryLocked = false;
let memoryCursor = 0; // índice de foco con teclado

function buildMemoryDeck() {
  const deck = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function resetMemory() {
  memoryFlipped = [];
  memoryMatched = 0;
  memoryMoves = 0;
  memoryLocked = false;
  memoryCursor = 0;
  document.getElementById('move-count').textContent = '0';
  document.getElementById('pairs-found').textContent = '0';
  renderMemoryBoard();
}

function renderMemoryBoard() {
  const board = document.getElementById('memory-board');
  board.innerHTML = '';
  const deck = buildMemoryDeck();
  memoryCards = deck.map((symbol, i) => ({ symbol, flipped: false, matched: false, index: i }));

  memoryCards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'memory-card';
    el.setAttribute('role', 'gridcell');
    el.setAttribute('aria-label', 'Carta oculta');
    el.setAttribute('tabindex', i === 0 ? '0' : '-1');
    el.dataset.index = i;
    el.innerHTML = `
      <div class="card-inner">
        <div class="card-front">💌</div>
        <div class="card-back">${card.symbol}</div>
      </div>`;
    el.addEventListener('click', () => flipMemoryCard(i));
    el.addEventListener('keydown', handleMemoryKeydown);
    board.appendChild(el);
  });
  updateMemoryCursor(0);
}

function updateMemoryCursor(newIndex) {
  const cards = document.querySelectorAll('.memory-card');
  cards.forEach(c => c.classList.remove('cursor-focus'));
  memoryCursor = Math.max(0, Math.min(newIndex, cards.length - 1));
  if (cards[memoryCursor]) {
    cards[memoryCursor].classList.add('cursor-focus');
    cards[memoryCursor].setAttribute('tabindex', '0');
    cards[memoryCursor].focus();
  }
  cards.forEach((c, i) => {
    if (i !== memoryCursor) c.setAttribute('tabindex', '-1');
  });
}

function handleMemoryKeydown(e) {
  const cols = 4;
  const total = memoryCards.length;
  let next = memoryCursor;
  if (e.key === 'ArrowRight') next = Math.min(memoryCursor + 1, total - 1);
  else if (e.key === 'ArrowLeft') next = Math.max(memoryCursor - 1, 0);
  else if (e.key === 'ArrowDown') next = Math.min(memoryCursor + cols, total - 1);
  else if (e.key === 'ArrowUp') next = Math.max(memoryCursor - cols, 0);
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipMemoryCard(memoryCursor); return; }
  else return;
  e.preventDefault();
  updateMemoryCursor(next);
}

function flipMemoryCard(index) {
  if (memoryLocked) return;
  const card = memoryCards[index];
  if (!card || card.flipped || card.matched) return;
  if (memoryFlipped.length === 2) return;

  card.flipped = true;
  memoryFlipped.push(index);

  const el = document.querySelectorAll('.memory-card')[index];
  el.classList.add('flipped');
  el.setAttribute('aria-label', card.symbol);

  if (memoryFlipped.length === 2) {
    memoryMoves++;
    document.getElementById('move-count').textContent = memoryMoves;
    memoryLocked = true;

    const [a, b] = memoryFlipped;
    if (memoryCards[a].symbol === memoryCards[b].symbol) {
      // Par encontrado
      setTimeout(() => {
        [a, b].forEach(i => {
          memoryCards[i].matched = true;
          document.querySelectorAll('.memory-card')[i].classList.add('matched');
        });
        memoryMatched++;
        document.getElementById('pairs-found').textContent = memoryMatched;
        memoryFlipped = [];
        memoryLocked = false;
        if (memoryMatched === MEMORY_SYMBOLS.length) {
          setTimeout(() => {
            showToast('¡Lo encontraste todo, Amorcito! 💕');
            setTimeout(() => completeChapter(1), 1400);
          }, 400);
        }
      }, 500);
    } else {
      // No coincide
      setTimeout(() => {
        [a, b].forEach(i => {
          memoryCards[i].flipped = false;
          const cardEl = document.querySelectorAll('.memory-card')[i];
          cardEl.classList.remove('flipped');
          cardEl.setAttribute('aria-label', 'Carta oculta');
        });
        memoryFlipped = [];
        memoryLocked = false;
      }, 1000);
    }
  }
}

// =============================================
// MINIJUEGO 2: PUZZLE DESLIZANTE 4x4
// =============================================
const PUZZLE_SIZE = 4;
let puzzleState = [];  // array de 16 valores, 0 = hueco
let puzzleMoves = 0;
let puzzleComplete = false;

function buildPuzzleGoal() {
  const goal = [];
  for (let i = 1; i < PUZZLE_SIZE * PUZZLE_SIZE; i++) goal.push(i);
  goal.push(0);
  return goal;
}

function puzzleShuffle(arr) {
  let tiles = [...arr];
  // Hacer muchos movimientos válidos para garantizar solucionabilidad
  for (let k = 0; k < 200; k++) {
    const blank = tiles.indexOf(0);
    const neighbors = getAdjacentToBlank(blank);
    const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[blank], tiles[pick]] = [tiles[pick], tiles[blank]];
  }
  return tiles;
}

function getAdjacentToBlank(blankPos) {
  const row = Math.floor(blankPos / PUZZLE_SIZE);
  const col = blankPos % PUZZLE_SIZE;
  const adj = [];
  if (row > 0) adj.push(blankPos - PUZZLE_SIZE);
  if (row < PUZZLE_SIZE - 1) adj.push(blankPos + PUZZLE_SIZE);
  if (col > 0) adj.push(blankPos - 1);
  if (col < PUZZLE_SIZE - 1) adj.push(blankPos + 1);
  return adj;
}

function resetPuzzle() {
  puzzleMoves = 0;
  puzzleComplete = false;
  document.getElementById('puzzle-moves').textContent = '0';
  puzzleState = puzzleShuffle(buildPuzzleGoal());
  renderPuzzleBoard();
}

function renderPuzzleBoard() {
  const board = document.getElementById('puzzle-board');
  if (!board) return;
  board.innerHTML = '';
  const n = PUZZLE_SIZE;

  puzzleState.forEach((val, pos) => {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece' + (val === 0 ? ' empty' : '');
    piece.setAttribute('role', 'gridcell');
    piece.dataset.pos = pos;

    if (val !== 0) {
      // Posición correcta de esta pieza en la imagen
      const origRow = Math.floor((val - 1) / n);
      const origCol = (val - 1) % n;
      piece.style.backgroundImage = "url('photos/photo2.jpg')";
      piece.style.backgroundSize = `${n * 100}% ${n * 100}%`;
      piece.style.backgroundPosition = `${(origCol / (n-1)) * 100}% ${(origRow / (n-1)) * 100}%`;
      piece.setAttribute('aria-label', `Pieza ${val}`);
      piece.setAttribute('tabindex', '0');
      piece.addEventListener('click', () => movePuzzlePiece(pos));
      piece.addEventListener('keydown', handlePuzzleKeydown);

      // Marcar correctas
      const curRow = Math.floor(pos / n);
      const curCol = pos % n;
      if (origRow === curRow && origCol === curCol) piece.classList.add('correct');
    } else {
      piece.setAttribute('aria-label', 'Espacio vacío');
    }
    board.appendChild(piece);
  });
}

function movePuzzlePiece(clickedPos) {
  if (puzzleComplete) return;
  const blankPos = puzzleState.indexOf(0);
  const adj = getAdjacentToBlank(blankPos);
  if (!adj.includes(clickedPos)) return;

  [puzzleState[blankPos], puzzleState[clickedPos]] = [puzzleState[clickedPos], puzzleState[blankPos]];
  puzzleMoves++;
  document.getElementById('puzzle-moves').textContent = puzzleMoves;
  renderPuzzleBoard();

  if (isPuzzleSolved()) {
    puzzleComplete = true;
    setTimeout(() => {
      showToast('¡Puzzle completo! 🌹');
      setTimeout(() => completeChapter(2), 1400);
    }, 400);
  }
}

function handlePuzzleKeydown(e) {
  if (puzzleComplete) return;
  const blankPos = puzzleState.indexOf(0);
  const blankRow = Math.floor(blankPos / PUZZLE_SIZE);
  const blankCol = blankPos % PUZZLE_SIZE;
  let targetPos = -1;

  // Mover el hueco con flechas (la pieza adyacente se desplaza hacia el hueco)
  if (e.key === 'ArrowRight' && blankCol > 0)             targetPos = blankPos - 1;
  else if (e.key === 'ArrowLeft' && blankCol < PUZZLE_SIZE-1) targetPos = blankPos + 1;
  else if (e.key === 'ArrowDown' && blankRow > 0)          targetPos = blankPos - PUZZLE_SIZE;
  else if (e.key === 'ArrowUp' && blankRow < PUZZLE_SIZE-1) targetPos = blankPos + PUZZLE_SIZE;
  else if (e.key === 'Enter' || e.key === ' ') {
    const pos = parseInt(e.currentTarget.dataset.pos);
    movePuzzlePiece(pos);
    return;
  } else return;

  e.preventDefault();
  if (targetPos >= 0) movePuzzlePiece(targetPos);
}

function isPuzzleSolved() {
  const goal = buildPuzzleGoal();
  return puzzleState.every((v, i) => v === goal[i]);
}

// ---- Botón Resolver (genérico) ----
const SOLVE_MSGS = [
  '¿Así que te rendiste? 😏\n¿segura que no puedes sola?',
  '¡Wow! ¿Ya? Jaja 😂\n¿quieres que lo resuelva por ti?',
  'Oye oye oye… 👀\n¿Eso es una bandera blanca? jajaja',
  '¿Ya te cansaste, Amorcito? 🥺\n¿quieres que lo desbloquee?',
  'Jajaja 😄 okay okay…\n¿De verdad quieres saltarte esto?',
];

let _solveTargetChapter = null;

function openSolveModal(chapterNum) {
  if (_solveTargetChapter !== null) return; // ya abierto
  _solveTargetChapter = chapterNum;
  const msg = SOLVE_MSGS[Math.floor(Math.random() * SOLVE_MSGS.length)];
  document.getElementById('solve-modal-msg').textContent = msg;
  document.getElementById('solve-modal').classList.add('open');
}

function closeSolveModal() {
  document.getElementById('solve-modal').classList.remove('open');
  _solveTargetChapter = null;
}

function confirmSolve() {
  const n = _solveTargetChapter;
  closeSolveModal();
  if (n === null) return;
  puzzleComplete = true; // para el puzzle; los demás no lo necesitan
  showToast('¡Capítulo desbloqueado! (con ayudita 😜) 🌹');
  setTimeout(() => completeChapter(n), 1200);
}

// Wrappers por juego (los botones del HTML los llaman)
function solvePuzzle()  { if (!puzzleComplete)  openSolveModal(2); }
function solveMemory()  { if (memoryMatched < MEMORY_SYMBOLS.length) openSolveModal(1); }
function solveTravel()  { if (!travelSolved)    openSolveModal(3); }
function solveWordle()  { if (!wordleGameOver)  openSolveModal(4); }

// =============================================
// MINIJUEGO 3: WORDLE - PALABRA SECRETA
// =============================================
// ✏️ PALABRA SECRETA: Cambia esta palabra de 6 letras por la que quieras
// Sugerencias: AMARTE, CONTIGO, BESAME -> pero deben ser exactamente 6 letras
// Ejemplos de 6 letras: ALMAZO, ETERNO, BESAME, JUNTOS, SUENOS
const WORDLE_SECRET = 'AMARTE'; // ✏️ CAMBIA ESTA PALABRA (6 letras, sin tildes)
const WORDLE_HINT   = 'Pista: es lo que siento cada día 💕'; // ✏️ pista opcional

const WORDLE_ROWS = 6;
const WORDLE_COLS = WORDLE_SECRET.length;

let wordleGrid = [];
let wordleCurrentRow = 0;
let wordleCurrentCol = 0;
let wordleGameOver = false;
let wordleRevealedKeys = {};

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L','Ñ'],
  ['ENTER','Z','X','C','V','B','N','M','⌫']
];

function resetWordle() {
  wordleGrid = Array.from({ length: WORDLE_ROWS }, () => Array(WORDLE_COLS).fill(''));
  wordleCurrentRow = 0;
  wordleCurrentCol = 0;
  wordleGameOver = false;
  wordleRevealedKeys = {};
  document.getElementById('wordle-message').textContent = WORDLE_HINT;
  renderWordleGrid();
  renderWordleKeyboard();
}

function renderWordleGrid() {
  const grid = document.getElementById('wordle-grid');
  grid.innerHTML = '';
  for (let r = 0; r < WORDLE_ROWS; r++) {
    const row = document.createElement('div');
    row.className = 'wordle-row';
    row.setAttribute('role', 'row');
    for (let c = 0; c < WORDLE_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'wordle-cell';
      cell.id = `wc-${r}-${c}`;
      cell.setAttribute('role', 'gridcell');
      cell.textContent = wordleGrid[r][c];
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

function renderWordleKeyboard() {
  const kb = document.getElementById('wordle-keyboard');
  kb.innerHTML = '';
  KEYBOARD_ROWS.forEach(keys => {
    const row = document.createElement('div');
    row.className = 'wordle-keyboard-row';
    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'wordle-key' + (k.length > 1 ? ' wide' : '');
      btn.textContent = k;
      btn.id = `wkey-${k}`;
      btn.setAttribute('aria-label', k === '⌫' ? 'Borrar' : k);
      if (wordleRevealedKeys[k]) btn.classList.add(wordleRevealedKeys[k]);
      btn.addEventListener('click', () => handleWordleInput(k));
      row.appendChild(btn);
    });
    kb.appendChild(row);
  });
}

function handleWordleInput(key) {
  if (wordleGameOver) return;
  if (key === '⌫' || key === 'Backspace') {
    if (wordleCurrentCol > 0) {
      wordleCurrentCol--;
      wordleGrid[wordleCurrentRow][wordleCurrentCol] = '';
      updateWordleCell(wordleCurrentRow, wordleCurrentCol, '');
    }
  } else if (key === 'ENTER' || key === 'Enter') {
    submitWordleGuess();
  } else if (/^[A-ZÑ]$/i.test(key) && key.length === 1) {
    if (wordleCurrentCol < WORDLE_COLS) {
      const letter = key.toUpperCase();
      wordleGrid[wordleCurrentRow][wordleCurrentCol] = letter;
      updateWordleCell(wordleCurrentRow, wordleCurrentCol, letter, true);
      wordleCurrentCol++;
    }
  }
}

function updateWordleCell(row, col, letter, filled = false) {
  const cell = document.getElementById(`wc-${row}-${col}`);
  if (!cell) return;
  cell.textContent = letter;
  cell.className = 'wordle-cell' + (filled && letter ? ' filled' : '');
}

function submitWordleGuess() {
  if (wordleCurrentCol < WORDLE_COLS) {
    showToast(`Escribe las ${WORDLE_COLS} letras 💌`);
    return;
  }
  const guess = wordleGrid[wordleCurrentRow].join('');
  const secret = WORDLE_SECRET.toUpperCase();
  const result = evaluateGuess(guess, secret);

  revealWordleRow(wordleCurrentRow, result, guess, () => {
    // Actualizar teclado
    result.forEach((status, i) => {
      const key = guess[i];
      const current = wordleRevealedKeys[key];
      if (status === 'correct' ||
         (status === 'present' && current !== 'correct') ||
         (status === 'absent'  && !current)) {
        wordleRevealedKeys[key] = status;
      }
    });
    renderWordleKeyboard();

    if (result.every(s => s === 'correct')) {
      wordleGameOver = true;
      document.getElementById('wordle-message').textContent = '¡Lo lograste! 🥰 Sabías cuál era...';
      setTimeout(() => completeChapter(4), 2000);
    } else {
      wordleCurrentRow++;
      wordleCurrentCol = 0;
      if (wordleCurrentRow >= WORDLE_ROWS) {
        wordleGameOver = true;
        document.getElementById('wordle-message').textContent =
          `Era "${secret}" 💕 ¡Inténtalo de nuevo!`;
      }
    }
  });
}

function evaluateGuess(guess, secret) {
  const result = Array(WORDLE_COLS).fill('absent');
  const secretArr = secret.split('');
  const guessArr  = guess.split('');
  const usedSecret = Array(WORDLE_COLS).fill(false);
  const usedGuess  = Array(WORDLE_COLS).fill(false);

  // Primer paso: correctos
  for (let i = 0; i < WORDLE_COLS; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = 'correct';
      usedSecret[i] = true;
      usedGuess[i]  = true;
    }
  }
  // Segundo paso: presentes
  for (let i = 0; i < WORDLE_COLS; i++) {
    if (usedGuess[i]) continue;
    for (let j = 0; j < WORDLE_COLS; j++) {
      if (!usedSecret[j] && guessArr[i] === secretArr[j]) {
        result[i] = 'present';
        usedSecret[j] = true;
        break;
      }
    }
  }
  return result;
}

function revealWordleRow(row, result, guess, callback) {
  const delay = 300;
  result.forEach((status, i) => {
    setTimeout(() => {
      const cell = document.getElementById(`wc-${row}-${i}`);
      if (cell) {
        cell.classList.add(status, 'revealed');
      }
      if (i === result.length - 1) setTimeout(callback, 200);
    }, i * delay);
  });
}

// Teclado físico para Wordle
document.addEventListener('keydown', (e) => {
  const game4Active = document.getElementById('screen-game4').classList.contains('active');
  if (!game4Active) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === 'Enter') handleWordleInput('Enter');
  else if (e.key === 'Backspace') handleWordleInput('Backspace');
  else if (/^[a-zA-ZñÑ]$/.test(e.key)) handleWordleInput(e.key.toUpperCase());
});

// =============================================
// MINIJUEGO 3: NUESTRO MEJOR VIAJE
// =============================================

// ✏️ CONFIGURA TU VIAJE AQUÍ:
// Cambia TRAVEL_ANSWER por el nombre del destino (sin tildes, en mayúsculas)
// Edita las pistas con detalles reales de su viaje
const TRAVEL_ANSWER = 'VALDIVIA'; // ✏️ El destino correcto (mayúsculas, sin tildes)

const TRAVEL_CLUES = [
  // ✏️ 5 pistas, de más genérica a más específica
  { icon: '🌧️', text: 'Una ciudad famosa por su lluvia… y por su encanto.' },
  { icon: '🌊', text: 'El río la abraza y la convierte en algo único.' },
  { icon: '🦭', text: 'Los lobos marinos en el mercado son parte del paisaje.' },
  { icon: '�', text: 'Tierra de cerveza artesanal y arquitectura alemana.' },
  { icon: '💕', text: 'La ciudad donde tú y yo nos perdimos juntos.' },
];

// Respuestas aceptadas alternativas (opcional, por si tiene alias)
// ✏️ Puedes agregar variantes del nombre separadas por comas
const TRAVEL_ACCEPTED = ['VALDIVIA'];

let travelClueIndex  = 0;
let travelAttempts   = 0;
let travelSolved     = false;

function resetTravel() {
  travelClueIndex = 0;
  travelAttempts  = 0;
  travelSolved    = false;
  document.getElementById('travel-clue-total').textContent = TRAVEL_CLUES.length;
  document.getElementById('travel-input').value = '';
  document.getElementById('travel-feedback').textContent = '';
  ['travel-star-1','travel-star-2','travel-star-3'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('earned');
    el.classList.add('dim');
  });
  const attemptsEl = document.getElementById('travel-attempts');
  if (attemptsEl) attemptsEl.innerHTML = '';
  renderTravelClue();
}

function renderTravelClue() {
  const clue = TRAVEL_CLUES[travelClueIndex];
  document.getElementById('travel-clue-num').textContent  = travelClueIndex + 1;
  document.getElementById('travel-clue-icon').textContent = clue.icon;
  document.getElementById('travel-clue-text').textContent = clue.text;

  // Recrear el nodo para forzar la animación
  const card = document.getElementById('travel-clue-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = '';

  const nextBtn = document.getElementById('travel-next-btn');
  if (nextBtn) {
    nextBtn.disabled = travelClueIndex >= TRAVEL_CLUES.length - 1;
  }
}

function showNextClue() {
  if (travelClueIndex < TRAVEL_CLUES.length - 1) {
    travelClueIndex++;
    renderTravelClue();
  }
}

function submitTravelGuess() {
  if (travelSolved) return;
  const input = document.getElementById('travel-input');
  const raw   = input.value.trim();
  if (!raw) { showToast('Escribe un destino ✈️'); return; }

  const guess = raw.toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // quitar tildes

  travelAttempts++;
  const correct = TRAVEL_ACCEPTED.some(a => guess === a);

  // Añadir intento a la lista
  const attemptsEl = document.getElementById('travel-attempts');
  const tag = document.createElement('div');
  tag.className = 'travel-attempt-tag';
  tag.innerHTML = correct
    ? `<span>✓</span> <span>${raw}</span>`
    : `<span>✗</span> <span>${raw}</span>`;
  attemptsEl.appendChild(tag);
  input.value = '';

  if (correct) {
    travelSolved = true;
    // Calcular estrellas según cuántas pistas se usaron
    const starsEarned = travelClueIndex <= 1 ? 3 : travelClueIndex <= 3 ? 2 : 1;
    awardTravelStars(starsEarned);
    document.getElementById('travel-feedback').textContent =
      starsEarned === 3 ? '¡Lo recordaste enseguida! 🥰' :
      starsEarned === 2 ? '¡Muy bien, Amorcito! 💕' :
                         '¡Lo lograste! Ese viaje fue especial 🌊';
    setTimeout(() => completeChapter(3), 2200);
  } else {
    document.getElementById('travel-feedback').textContent =
      travelAttempts < 3 ? 'Mmm, no es ese… sigue intentando 💭' : '¡Piénsalo bien! Fue muy especial 🗺️';
    // Auto-mostrar siguiente pista si se equivoca
    if (!document.getElementById('travel-next-btn').disabled) {
      setTimeout(() => {
        showNextClue();
        showToast('Aquí va otra pista 🗺️');
      }, 1000);
    }
  }
}

function awardTravelStars(n) {
  for (let i = 1; i <= n; i++) {
    setTimeout(() => {
      const star = document.getElementById(`travel-star-${i}`);
      star.classList.remove('dim');
      star.classList.add('earned');
    }, i * 250);
  }
}

// =============================================
// FUEGOS ARTIFICIALES (pantalla final)
// =============================================
function launchFireworks() {
  const container = document.getElementById('fireworks');
  if (!container) return;
  const colors = ['#c9748f','#c8a96e','#f2d9e2','#ffffff','#e8a0b4','#f0e4c8'];

  function burst() {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.7;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.className = 'fw-particle';
      const angle = (i / 18) * 2 * Math.PI;
      const dist  = 60 + Math.random() * 80;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      p.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
      container.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    }
  }

  // Lanzar rafagas
  burst();
  let count = 0;
  const interval = setInterval(() => {
    burst();
    count++;
    if (count > 12) clearInterval(interval);
  }, 700);
}

// Observador: lanza fuegos cuando aparece la pantalla final
const rewardObserver = new MutationObserver(() => {
  if (document.getElementById('screen-reward4').classList.contains('active')) {
    launchFireworks();
  }
});
rewardObserver.observe(document.getElementById('screen-reward4'), {
  attributes: true, attributeFilter: ['class']
});

// =============================================
// INICIALIZAR
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  renderMemoryBoard();
  resetPuzzle();
  resetTravel();
  resetWordle();
});
