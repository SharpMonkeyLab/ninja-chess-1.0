const boardEl = document.getElementById("board");
const cornerMarkInput = document.getElementById("cornerMarkInput");
const jsonBox = document.getElementById("jsonBox");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");

const modeReadout = document.getElementById("modeReadout");
const pieceReadout = document.getElementById("pieceReadout");
const teamReadout = document.getElementById("teamReadout");
const movingReadout = document.getElementById("movingReadout");

const toolButtons = Array.from(document.querySelectorAll(".tool-btn"));
const tileButtons = Array.from(document.querySelectorAll(".tile-btn"));
const pieceButtons = Array.from(document.querySelectorAll(".piece-btn"));
const teamButtons = Array.from(document.querySelectorAll(".team-btn"));
const markColorButtons = Array.from(document.querySelectorAll(".mark-color-btn"));

const uploadConfig = [
  { id: "uploadWhiteKing", previewId: "previewWhiteKing", team: "white", piece: "king", label: "White King" },
  { id: "uploadBlackKing", previewId: "previewBlackKing", team: "black", piece: "king", label: "Black King" },
  { id: "uploadWhiteQueen", previewId: "previewWhiteQueen", team: "white", piece: "queen", label: "White Queen" },
  { id: "uploadBlackQueen", previewId: "previewBlackQueen", team: "black", piece: "queen", label: "Black Queen" },
  { id: "uploadWhiteBishop", previewId: "previewWhiteBishop", team: "white", piece: "bishop", label: "White Bishop" },
  { id: "uploadBlackBishop", previewId: "previewBlackBishop", team: "black", piece: "bishop", label: "Black Bishop" },
  { id: "uploadWhiteKnight", previewId: "previewWhiteKnight", team: "white", piece: "knight", label: "White Knight" },
  { id: "uploadBlackKnight", previewId: "previewBlackKnight", team: "black", piece: "knight", label: "Black Knight" },
  { id: "uploadWhiteRook", previewId: "previewWhiteRook", team: "white", piece: "rook", label: "White Rook" },
  { id: "uploadBlackRook", previewId: "previewBlackRook", team: "black", piece: "rook", label: "Black Rook" }
];

const TOOL_LABELS = {
  tile: "Paint Tile",
  piece: "Place / Move Piece",
  mark: "Corner Mark",
  erase: "Erase Cell"
};

const TILE_NAMES = ["neutral", "water", "fire", "forest", "sand", "stone"];

const state = {
  rows: 8,
  cols: 8,
  selectedTool: "tile",
  selectedTile: "neutral",
  selectedPiece: "king",
  selectedTeam: "white",
  jutsuLibrary: {},
  selectedMarkColor: "neutral",
  selectedCondition: null,
  movingPiece: null,
  currentTurn: "white",
  turnTimerSeconds: 0,
  timerInterval: null,
  clocks: {
    white: 0,
    black: 0
  },

  pieceImages: {
    white: {
      king: null,
      queen: null,
      bishop: null,
      knight: null,
      rook: null,
      pawn: null
    },
    black: {
      king: null,
      queen: null,
      bishop: null,
      knight: null,
      rook: null,
      pawn: null
    }
  },

  pieceNames: {
    white: {
      king: "",
      queen: "",
      bishop: "",
      knight: "",
      rook: ""
    },
    black: {
      king: "",
      queen: "",
      bishop: "",
      knight: "",
      rook: ""
    }
  },

  pieceNameLocked: {
    white: {
      king: false,
      queen: false,
      bishop: false,
      knight: false,
      rook: false
    },
    black: {
      king: false,
      queen: false,
      bishop: false,
      knight: false,
      rook: false
    }
  },

  cells: []
};

const PIECE_SYMBOLS = {
  white: {
    king: "♔",
    queen: "♕",
    rook: "♖",
    bishop: "♗",
    knight: "♘",
    pawn: "♙"
  },
  black: {
    king: "♚",
    queen: "♛",
    rook: "♜",
    bishop: "♝",
    knight: "♞",
    pawn: "♟"
  }
};

const PIECE_TYPES = ["king", "queen", "bishop", "knight", "rook", "pawn"];

const PIECE_MASKS = {
  king: "assets/king-mask.svg",
  queen: "assets/queen-mask.svg",
  bishop: "assets/bishop-mask.svg",
  knight: "assets/knight-mask.svg",
  rook: "assets/rook-mask.svg",
  pawn: "assets/pawn-mask.svg"
};

const whiteTray = document.getElementById("whiteTray");
const blackTray = document.getElementById("blackTray");

const standardSetupBtn = document.getElementById("standardSetupBtn");
const conditionButtons = Array.from(document.querySelectorAll(".condition-btn"));
const clearConditionBtn = document.getElementById("clearConditionBtn");

const CONDITIONS = {
  blinded: {
    symbol: "🚫",
    className: "condition-blinded"
  },
  poisoned: {
    symbol: "☠️",
    className: "condition-poisoned"
  },
  burnt: {
    symbol: "🔥",
    className: "condition-burnt"
  }
};

const SHOWCASE_PIECES = ["king", "queen", "bishop", "knight", "rook"];

const tileDescriptionList = document.getElementById("tileDescriptionList");
const conditionDescriptionList = document.getElementById("conditionDescriptionList");

const TILE_DESCRIPTIONS = {
  neutral: "Neutral ground. No tricks, no drama. Suspiciously calm.",
  water: "Slippery terrain. Great for ducks, terrible for dignity.",
  fire: "Hot ground. Excellent for intimidation, poor for sandals.",
  forest: "Cover and confusion. The trees are judging your strategy.",
  sand: "Movement feels heavier. Also, it gets everywhere.",
  stone: "Solid and stubborn. Like a wall with commitment issues."
};

const CONDITION_DESCRIPTIONS = {
  blinded: "🚫 Blinded: vision is compromised. Confidence remains legally questionable.",
  poisoned: "☠️ Poisoned: something inside is losing an argument with chemistry.",
  burnt: "🔥 Burnt: ongoing pain, crispy edges, bad life choices."
};

const jutsuCsvInput = document.getElementById("jutsuCsvInput");

function createEmptyCell() {
  return {
    tile: "neutral",
    pieceType: null,
    team: null,
    mark: "",
    markColor: "neutral",
    condition: null
  };
}

function createBoardData() {
  return Array.from({ length: state.rows * state.cols }, () => createEmptyCell());
}

function getCellBackground(tileType, row, col) {
  const isLightSquare = (row + col) % 2 === 1;

  if (tileType === "neutral") return isLightSquare ? "var(--neutral-light)" : "var(--neutral-dark)";
  if (tileType === "water") return isLightSquare ? "var(--water-light)" : "var(--water-dark)";
  if (tileType === "fire") return isLightSquare ? "var(--fire-light)" : "var(--fire-dark)";
  if (tileType === "forest") return isLightSquare ? "var(--forest-light)" : "var(--forest-dark)";
  if (tileType === "sand") return isLightSquare ? "var(--sand-light)" : "var(--sand-dark)";
  if (tileType === "stone") return isLightSquare ? "var(--stone-light)" : "var(--stone-dark)";

  return isLightSquare ? "var(--neutral-light)" : "var(--neutral-dark)";
}

function setActiveButton(buttons, activeButton) {
  buttons.forEach((button) => button.classList.remove("active"));

  if (activeButton) {
    activeButton.classList.add("active");
  }
}

function updateReadouts() {
  modeReadout.textContent = TOOL_LABELS[state.selectedTool];
  pieceReadout.textContent = capitalize(state.selectedPiece);
  teamReadout.textContent = capitalize(state.selectedTeam);
  turnReadout.textContent = capitalize(state.currentTurn);

  if (state.movingPiece) {
    movingReadout.textContent = `${capitalize(state.movingPiece.team)} ${capitalize(state.movingPiece.pieceType)}`;
  } else {
    movingReadout.textContent = "None";
  }

  if (state.turnTimerSeconds === 0) {
    whiteTimerReadout.textContent = "Off";
    blackTimerReadout.textContent = "Off";
  } else {
    whiteTimerReadout.textContent = formatTime(state.clocks.white);
    blackTimerReadout.textContent = formatTime(state.clocks.black);
  }
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderTileDescriptions() {
  if (!tileDescriptionList) return;

  tileDescriptionList.innerHTML = "";

  TILE_NAMES.forEach((tileName) => {
    const item = document.createElement("div");
    item.className = "description-item";

    item.innerHTML = `
      <div class="description-title">${capitalize(tileName)}</div>
      <div class="description-text">${TILE_DESCRIPTIONS[tileName] || "No description yet."}</div>
    `;

    tileDescriptionList.appendChild(item);
  });
}

function renderConditionDescriptions() {
  if (!conditionDescriptionList) return;

  conditionDescriptionList.innerHTML = "";

  Object.keys(CONDITIONS).forEach((conditionName) => {
    const condition = CONDITIONS[conditionName];

    const item = document.createElement("div");
    item.className = "description-item";

    item.innerHTML = `
      <div class="description-title">${condition.symbol} ${capitalize(conditionName)}</div>
      <div class="description-text">${CONDITION_DESCRIPTIONS[conditionName] || "No description yet."}</div>
    `;

    conditionDescriptionList.appendChild(item);
  });
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function startClock() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  if (state.turnTimerSeconds === 0) {
    updateReadouts();
    return;
  }

  state.timerInterval = setInterval(() => {
    const current = state.currentTurn;
    state.clocks[current]--;

    if (state.clocks[current] <= 0) {
      state.clocks[current] = 0;
      passTurn();
    }

    updateReadouts();
  }, 1000);

  updateReadouts();
}

function initializeClocks(secondsPerPlayer) {
  state.turnTimerSeconds = secondsPerPlayer;

  if (secondsPerPlayer === 0) {
    state.clocks.white = 0;
    state.clocks.black = 0;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    updateReadouts();
    return;
  }

  state.clocks.white = secondsPerPlayer;
  state.clocks.black = secondsPerPlayer;
  startClock();
}

function passTurn() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  state.currentTurn = state.currentTurn === "white" ? "black" : "white";
  state.movingPiece = null;

  if (state.turnTimerSeconds > 0) {
    startClock();
  } else {
    updateReadouts();
  }
}

function renderUploadPreview(previewEl, label, imageSrc) {
  if (!imageSrc) {
    previewEl.innerHTML = `<span>No image uploaded</span>`;
    return;
  }

  previewEl.innerHTML = `
    <img src="${imageSrc}" alt="${label}">
    <span>${label} uploaded</span>
  `;
}

function setupUploads() {
  uploadConfig.forEach((item) => {
    const input = document.getElementById(item.id);
    const preview = document.getElementById(item.previewId);

    if (!input || !preview) {
      console.warn("Missing upload field or preview:", item.id, item.previewId);
      return;
    }

    renderUploadPreview(preview, item.label, state.pieceImages[item.team][item.piece]);

    input.addEventListener("change", function () {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        state.pieceImages[item.team][item.piece] = event.target.result;
        renderUploadPreview(preview, item.label, event.target.result);
        renderBoard();
      };
      reader.readAsDataURL(file);
    });
  });
}

function renderPieceContent(cellData) {
  if (!cellData.pieceType) return "";

  const teamClass = cellData.team === "black" ? "team-black" : "team-white";
  const pieceType = cellData.pieceType;
  const assignedName = cellData.team ? state.pieceNames[cellData.team][pieceType] : "";
  const spreadsheetPortrait = getPortraitForCharacter(assignedName);
  const imageSrc = cellData.team ? state.pieceImages[cellData.team][pieceType] || spreadsheetPortrait : null;
  const maskSrc = PIECE_MASKS[pieceType];

  if (imageSrc && maskSrc) {
    return `
      <div class="cell-piece ${teamClass}">
        <div
          class="piece-mask-fill"
          style="
            --piece-mask: url('${maskSrc}');
            --piece-image: url('${imageSrc}');
          "
        ></div>
      </div>
    `;
  }

  const fallbackSymbol = PIECE_SYMBOLS[cellData.team]?.[pieceType] || "?";
  return `<div class="cell-piece fallback-piece ${teamClass}">${fallbackSymbol}</div>`;
}

const turnReadout = document.getElementById("turnReadout");
const whiteTimerReadout = document.getElementById("whiteTimerReadout");
const blackTimerReadout = document.getElementById("blackTimerReadout");
const timerSelect = document.getElementById("timerSelect");
const passTurnBtn = document.getElementById("passTurnBtn");

function renderBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${state.cols}, var(--cell-size))`;

  state.cells.forEach((cellData, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";

    const row = Math.floor(index / state.cols);
    const col = index % state.cols;
    const fileLetter = String.fromCharCode(65 + col); // A-H
    const rankNumber = state.rows - row;              // 8 to 1 from top to bottom

    cell.style.background = getCellBackground(cellData.tile, row, col);

    if (state.movingPiece && state.movingPiece.fromIndex === index) {
      cell.classList.add("selected-moving");
    }

    cell.innerHTML = `
  ${renderPieceContent(cellData)}
  ${cellData.mark ? `<div class="corner-mark ${cellData.markColor === "red"
        ? "mark-red"
        : cellData.markColor === "blue"
          ? "mark-blue"
          : "mark-neutral"
        }">${cellData.mark}</div>` : ""}
${cellData.condition ? `<div class="condition-mark ${CONDITIONS[cellData.condition].className}">${CONDITIONS[cellData.condition].symbol}</div>` : ""}
  <div class="coords">${fileLetter}${rankNumber}</div>
`;

    cell.addEventListener("click", () => {
      handleCellClick(index);
    });

    boardEl.appendChild(cell);
  });

  renderTeamTray("black", blackTray);
  renderTeamTray("white", whiteTray);
  updateReadouts();
}

function handleCellClick(index) {
  if (state.selectedTool === "tile") {
    state.cells[index].tile = state.selectedTile;
    renderBoard();
    return;
  }

  if (state.selectedTool === "mark") {
    state.cells[index].mark = cornerMarkInput.value.trim();
    state.cells[index].markColor = state.selectedMarkColor;
    renderBoard();
    return;
  }

  if (state.selectedTool === "erase") {
    state.cells[index] = createEmptyCell();
    if (state.movingPiece && state.movingPiece.fromIndex === index) {
      state.movingPiece = null;
    }
    renderBoard();
    return;
  }

  if (state.selectedTool === "condition") {
    state.cells[index].condition = state.selectedCondition;
    renderBoard();
    return;
  }

  if (state.selectedTool === "condition-clear") {
    state.cells[index].condition = null;
    renderBoard();
    return;
  }

  if (state.selectedTool === "piece") {
    handlePieceModeClick(index);
    renderBoard();
  }
}

function handlePieceModeClick(index) {
  const cell = state.cells[index];

  if (!state.movingPiece) {
    if (cell.pieceType) {
      state.movingPiece = {
        pieceType: cell.pieceType,
        team: cell.team,
        mark: cell.mark,
        markColor: cell.markColor,
        condition: cell.condition,
        fromIndex: index
      };
      return;
    }

    cell.pieceType = state.selectedPiece;
    cell.team = state.selectedTeam;
    return;
  }

  const fromIndex = state.movingPiece.fromIndex;
  const movingTeam = state.movingPiece.team;

  if (fromIndex === index) {
    state.movingPiece = null;
    return;
  }

  if (cell.pieceType && cell.team === movingTeam) {
    return;
  }

  // Move piece and its corner mark
  state.cells[index].pieceType = state.movingPiece.pieceType;
  state.cells[index].team = state.movingPiece.team;
  state.cells[index].mark = state.movingPiece.mark;
  state.cells[index].markColor = state.movingPiece.markColor;
  state.cells[index].condition = state.movingPiece.condition;

  state.cells[fromIndex].pieceType = null;
  state.cells[fromIndex].team = null;
  state.cells[fromIndex].mark = "";
  state.cells[fromIndex].markColor = "neutral";
  state.cells[fromIndex].condition = null;

  state.movingPiece = null;
}

function exportBoard() {
  jsonBox.value = JSON.stringify(
    {
      rows: state.rows,
      cols: state.cols,
      cells: state.cells,
      pieceImages: state.pieceImages,
      pieceNames: state.pieceNames,
      pieceNameLocked: state.pieceNameLocked,
      pieceJutsus: state.pieceJutsus,
      pieceJutsuLocked: state.pieceJutsuLocked,
      jutsuLibrary: state.jutsuLibrary,
      currentTurn: state.currentTurn,
      clocks: state.clocks
    },
    null,
    2
  );
}

function importBoard() {
  try {
    const data = JSON.parse(jsonBox.value);

    if (!data || !Array.isArray(data.cells) || !data.rows || !data.cols) {
      throw new Error("Invalid board data");
    }

    state.rows = 8;
    state.cols = 8;
    state.cells = data.cells;
    state.movingPiece = null;

    state.pieceImages = {
      white: {
        king: data.pieceImages?.white?.king || null,
        queen: data.pieceImages?.white?.queen || null,
        bishop: data.pieceImages?.white?.bishop || null,
        knight: data.pieceImages?.white?.knight || null,
        rook: data.pieceImages?.white?.rook || null
      },
      black: {
        king: data.pieceImages?.black?.king || null,
        queen: data.pieceImages?.black?.queen || null,
        bishop: data.pieceImages?.black?.bishop || null,
        knight: data.pieceImages?.black?.knight || null,
        rook: data.pieceImages?.black?.rook || null
      }
    };

    state.jutsuLibrary = data.jutsuLibrary || {};

    uploadConfig.forEach((item) => {
      const preview = document.getElementById(item.previewId);
      renderUploadPreview(preview, item.label, state.pieceImages[item.team][item.piece]);
    });

    renderBoard();
  } catch (error) {
    alert("Could not import board JSON. Check the format and try again.");
  }
}

function renderTeamTray(team, trayEl) {
  trayEl.innerHTML = "";

  SHOWCASE_PIECES.forEach((pieceType) => {
    const pieceName = state.pieceNames[team][pieceType];
    const isLocked = state.pieceNameLocked[team][pieceType];

    const portraitCandidates = getPortraitCandidates(pieceName);
    const imageSrc = state.pieceImages[team][pieceType] || portraitCandidates[0] || null;

    const card = document.createElement("div");
    card.className = "team-card";

    const title = document.createElement("div");
    title.className = "team-card-name";
    title.textContent = capitalize(pieceType);

    const topRow = document.createElement("div");
    topRow.className = "team-card-top";

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.hidden = true;

    uploadInput.addEventListener("change", () => {
      const file = uploadInput.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = function (event) {
        state.pieceImages[team][pieceType] = event.target.result;
        renderBoard();
      };

      reader.readAsDataURL(file);
    });

    card.appendChild(uploadInput);

    const imageBox = document.createElement("div");
    imageBox.className = "team-card-image-box drop-zone";
    imageBox.title = "Click or drop image here";

    // Click image/symbol to upload
    imageBox.addEventListener("click", () => {
      uploadInput.click();
    });

    // Drag over
    imageBox.addEventListener("dragover", (event) => {
      event.preventDefault();
      imageBox.classList.add("drag-over");
    });

    // Drag leave
    imageBox.addEventListener("dragleave", () => {
      imageBox.classList.remove("drag-over");
    });

    // Drop image
    imageBox.addEventListener("drop", (event) => {
      event.preventDefault();
      imageBox.classList.remove("drag-over");

      const file = event.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();

      reader.onload = function (event) {
        state.pieceImages[team][pieceType] = event.target.result;
        renderBoard();
      };

      reader.readAsDataURL(file);
    });

    if (imageSrc) {
      const img = document.createElement("img");
      img.className = `team-card-image ${team}`;
      img.src = imageSrc;
      if (!state.pieceImages[team][pieceType] && portraitCandidates.length > 1) {
        let portraitIndex = 0;

        img.onerror = function () {
          portraitIndex++;

          if (portraitIndex < portraitCandidates.length) {
            img.src = portraitCandidates[portraitIndex];
          }
        };
      }
      img.alt = `${team} ${pieceType}`;
      imageBox.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "team-card-empty";
      fallback.textContent = PIECE_SYMBOLS[team][pieceType];
      imageBox.appendChild(fallback);
    }

    topRow.appendChild(imageBox);

    const nameArea = document.createElement("div");
    nameArea.className = "team-card-name-area";

    if (isLocked) {
      const lockedName = document.createElement("div");
      lockedName.className = "locked-piece-name";
      lockedName.textContent = pieceName || "Unnamed";

      const actionRow = document.createElement("div");
      actionRow.className = "mini-action-row";

      const editBtn = document.createElement("button");
      editBtn.className = "mini-action-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        state.pieceNameLocked[team][pieceType] = false;
        renderBoard();
      });

      const clearBtn = document.createElement("button");
      clearBtn.className = "mini-action-btn danger";
      clearBtn.textContent = "Clear";
      clearBtn.addEventListener("click", () => {
        state.pieceNames[team][pieceType] = "";
        state.pieceNameLocked[team][pieceType] = false;
        state.pieceImages[team][pieceType] = null;
        renderBoard();
      });

      actionRow.appendChild(editBtn);
      actionRow.appendChild(clearBtn);

      nameArea.appendChild(lockedName);
      nameArea.appendChild(actionRow);
    } else {
      const nameInput = document.createElement("input");
      nameInput.className = "piece-name-input";
      nameInput.type = "text";
      nameInput.placeholder = "Character name";
      nameInput.value = pieceName;

      nameInput.addEventListener("input", () => {
        state.pieceNames[team][pieceType] = nameInput.value;
      });

      const okBtn = document.createElement("button");
      okBtn.className = "mini-action-btn ok";
      okBtn.textContent = "OK";

      okBtn.addEventListener("click", () => {
        state.pieceNames[team][pieceType] = nameInput.value.trim();
        state.pieceNameLocked[team][pieceType] = true;
        renderBoard();
      });

      nameArea.appendChild(nameInput);
      nameArea.appendChild(okBtn);
    }

    const jutsuArea = document.createElement("div");
    jutsuArea.className = "team-card-jutsu-area";

    const matchedJutsu = getJutsuForCharacter(pieceName);

    if (matchedJutsu) {
      jutsuArea.innerHTML = `
    <div class="jutsu-card">
      <div class="jutsu-title">${matchedJutsu.jutsu}</div>
      <div class="jutsu-description">${matchedJutsu.description}</div>
      ${matchedJutsu.cost ? `<div class="jutsu-cost">Cost: ${matchedJutsu.cost}</div>` : ""}
    </div>
  `;
    } else {
      jutsuArea.innerHTML = `
    <div class="jutsu-card empty">
      No jutsu found for this character.
    </div>
  `;
    }

    card.appendChild(title);
    card.appendChild(topRow);
    card.appendChild(nameArea);
    card.appendChild(jutsuArea);

    trayEl.appendChild(card);
  });
}

function standardSetup() {
  state.cells = createBoardData();
  state.movingPiece = null;
  state.currentTurn = "white";

  const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

  backRank.forEach((piece, col) => {
    state.cells[col].pieceType = piece;
    state.cells[col].team = "black";

    state.cells[8 + col].pieceType = "pawn";
    state.cells[8 + col].team = "black";

    state.cells[48 + col].pieceType = "pawn";
    state.cells[48 + col].team = "white";

    state.cells[56 + col].pieceType = piece;
    state.cells[56 + col].team = "white";
  });

  initializeClocks(Number(timerSelect.value));
  renderBoard();
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
        currentRow = [];
        currentValue = "";
      }

      if (char === "\r" && nextChar === "\n") {
        i++;
      }
    } else {
      currentValue += char;
    }
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }

  return rows;
}

function loadJutsuCSV(text) {
  const rows = parseCSV(text);

  if (rows.length < 2) {
    alert("CSV needs a header row and at least one character row.");
    return;
  }

  const headers = rows[0].map(header => normalizeName(header));

  const characterIndex = headers.indexOf("character");
  const jutsuIndex = headers.indexOf("jutsu");
  const descriptionIndex = headers.indexOf("description");
  const costIndex = headers.indexOf("cost");
  const portraitIndex = headers.indexOf("portrait");

  if (characterIndex === -1 || jutsuIndex === -1 || descriptionIndex === -1) {
    alert("CSV must include: character, jutsu, description. Cost is optional.");
    return;
  }

  state.jutsuLibrary = {};

  rows.slice(1).forEach(row => {
    const character = row[characterIndex]?.trim();
    if (!character) return;

    state.jutsuLibrary[normalizeName(character)] = {
      character,
      jutsu: row[jutsuIndex]?.trim() || "",
      description: row[descriptionIndex]?.trim() || "",
      cost: costIndex !== -1 ? row[costIndex]?.trim() || "" : "",
      portrait: portraitIndex !== -1 ? row[portraitIndex]?.trim() || "" : ""
    };
  });

  renderBoard();
  alert("Jutsu spreadsheet loaded.");
}

function getJutsuForCharacter(characterName) {
  if (!characterName) return null;
  return state.jutsuLibrary[normalizeName(characterName)] || null;
}

function getPortraitForCharacter(characterName) {
  const matchedJutsu = getJutsuForCharacter(characterName);
  return matchedJutsu?.portrait || null;
}

function getPortraitCandidates(characterName) {
  const matchedJutsu = getJutsuForCharacter(characterName);
  const portrait = matchedJutsu?.portrait;

  if (!portrait) return [];

  const hasExtension = /\.[a-zA-Z0-9]+$/.test(portrait);

  if (!hasExtension) {
    return [
      `${portrait}.jpg`,
      `${portrait}.jpeg`,
      `${portrait}.png`,
      `${portrait}.webp`
    ];
  }

  const basePath = portrait.replace(/\.[a-zA-Z0-9]+$/, "");

  return [
    portrait,
    `${basePath}.jpg`,
    `${basePath}.jpeg`,
    `${basePath}.png`,
    `${basePath}.webp`
  ];
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedTool = button.dataset.tool;
    setActiveButton(toolButtons, button);
    updateReadouts();
  });
});

tileButtons.forEach((button) => {
  const tileName = button.dataset.tile;

  button.title = TILE_DESCRIPTIONS[tileName] || "";

  button.addEventListener("click", () => {
    state.selectedTile = tileName;
    setActiveButton(tileButtons, button);
  });
});

pieceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedPiece = button.dataset.piece;
    setActiveButton(pieceButtons, button);
    updateReadouts();
  });
});

teamButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedTeam = button.dataset.team;
    setActiveButton(teamButtons, button);
    updateReadouts();
  });
});

markColorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.selectedMarkColor = button.dataset.markColor;
    setActiveButton(markColorButtons, button);
  });
});

exportBtn.addEventListener("click", exportBoard);
importBtn.addEventListener("click", importBoard);

timerSelect.addEventListener("change", () => {
  initializeClocks(Number(timerSelect.value));
});

passTurnBtn.addEventListener("click", () => {
  passTurn();
});

document.querySelectorAll(".clock-line").forEach(el => el.classList.remove("active"));

if (state.currentTurn === "white") {
  whiteTimerReadout.parentElement.classList.add("active");
} else {
  blackTimerReadout.parentElement.classList.add("active");
}

standardSetupBtn.addEventListener("click", standardSetup);

conditionButtons.forEach((button) => {
  const conditionName = button.dataset.condition;

  button.title = CONDITION_DESCRIPTIONS[conditionName] || "";

  button.addEventListener("click", () => {
    state.selectedTool = "condition";
    state.selectedCondition = conditionName;

    setActiveButton(toolButtons, null);
    setActiveButton(conditionButtons, button);
    updateReadouts();
  });
});

clearConditionBtn.addEventListener("click", () => {
  state.selectedTool = "condition-clear";
  state.selectedCondition = null;

  setActiveButton(conditionButtons, clearConditionBtn);
  updateReadouts();
});

jutsuCsvInput.addEventListener("change", () => {
  const file = jutsuCsvInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    loadJutsuCSV(event.target.result);
  };

  reader.readAsText(file);
});

function init() {
  state.cells = createBoardData();
  renderTileDescriptions();
  renderConditionDescriptions();
  updateReadouts();
  renderBoard();
  initializeClocks(0);
}

init();