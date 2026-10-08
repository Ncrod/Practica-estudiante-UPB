(function () {
const BOARDS_API_URL = '/api/boards/';
const CURRENT_BOARD_ID = Number(document.body.dataset.boardId) || null;

const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const boardList = document.getElementById('board-list');
const newBoardBtn = document.getElementById('new-board-btn');
const newBoardForm = document.getElementById('new-board-form');
const newBoardInput = document.getElementById('new-board-input');
const newBoardCancel = document.getElementById('new-board-cancel');
const headerBoardPath = document.getElementById('header-board-path');

const boardContextPopup = document.getElementById('board-context-popup');
const boardEditBtn = document.getElementById('board-edit-btn');

const renameOverlay = document.getElementById('rename-board-overlay');
const renameForm = document.getElementById('rename-board-form');
const renameInput = document.getElementById('rename-board-input');
const renameCancel = document.getElementById('rename-board-cancel');

let renamingId = null;

function getCsrfCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const csrftoken = getCsrfCookie('csrftoken');

function sidebarApiFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            ...(options.headers || {}),
        },
    });
}

function openSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.remove('hidden');
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.add('hidden');
}

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarBackdrop.addEventListener('click', closeSidebar);

function renderBoards(boards) {
    boardList.innerHTML = '';
    boards.forEach((b) => {
        const li = document.createElement('li');
        li.textContent = b.name;
        li.dataset.id = b.id;
        li.draggable = true;
        if (b.id === CURRENT_BOARD_ID) {
            li.classList.add('active');
            headerBoardPath.textContent = `/ ${b.name}`;
        }
        li.addEventListener('click', () => {
            window.location.href = `/boards/${b.id}/`;
        });
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showBoardContextPopup(e.clientX, e.clientY, b.id, b.name);
        });
        attachDragHandlers(li);
        boardList.appendChild(li);
    });
}

function loadBoards() {
    sidebarApiFetch(BOARDS_API_URL)
        .then((res) => res.json())
        .then(renderBoards);
}

// Right-click context menu: rename a board
function showBoardContextPopup(x, y, id, name) {
    boardContextPopup.style.left = x + 'px';
    boardContextPopup.style.top = y + 'px';
    boardContextPopup.classList.remove('hidden');

    boardEditBtn.onclick = () => {
        hideBoardContextPopup();
        openRenamePopup(id, name);
    };
}

function hideBoardContextPopup() {
    boardContextPopup.classList.add('hidden');
    boardEditBtn.onclick = null;
}

document.addEventListener('click', (e) => {
    if (!boardContextPopup.contains(e.target)) hideBoardContextPopup();
});

function openRenamePopup(id, name) {
    renamingId = id;
    renameInput.value = name;
    renameOverlay.classList.remove('hidden');
    renameInput.focus();
    renameInput.select();
}

function closeRenamePopup() {
    renameOverlay.classList.add('hidden');
    renamingId = null;
}

renameCancel.addEventListener('click', closeRenamePopup);
renameOverlay.addEventListener('click', (e) => {
    if (e.target === renameOverlay) closeRenamePopup();
});

renameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = renameInput.value.trim();
    if (!name || !renamingId) {
        renameInput.focus();
        return;
    }
    sidebarApiFetch(`${BOARDS_API_URL}${renamingId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    }).then(() => {
        closeRenamePopup();
        if (renamingId === CURRENT_BOARD_ID) {
            headerBoardPath.textContent = `/ ${name}`;
        }
        loadBoards();
    });
});

// Create board
newBoardBtn.addEventListener('click', () => {
    newBoardForm.classList.remove('hidden');
    newBoardInput.value = `Tablero ${boardList.children.length + 1}`;
    newBoardInput.focus();
    newBoardInput.select();
});

newBoardCancel.addEventListener('click', () => {
    newBoardForm.classList.add('hidden');
});

newBoardForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newBoardInput.value.trim();
    if (!name) {
        newBoardInput.focus();
        return;
    }
    sidebarApiFetch(BOARDS_API_URL, {
        method: 'POST',
        body: JSON.stringify({ name }),
    })
        .then((res) => res.json())
        .then((b) => {
            window.location.href = `/boards/${b.id}/`;
        });
});

// Drag and drop reorder
let draggedLi = null;

function attachDragHandlers(li) {
    li.addEventListener('dragstart', (e) => {
        draggedLi = li;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        draggedLi = null;
        [...boardList.children].forEach((el) => el.classList.remove('drag-over'));
        persistBoardOrder();
    });

    li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedLi || draggedLi === li) return;
        const rect = li.getBoundingClientRect();
        const before = e.clientY - rect.top < rect.height / 2;
        boardList.insertBefore(draggedLi, before ? li : li.nextSibling);
    });

    li.addEventListener('drop', (e) => {
        e.preventDefault();
    });
}

function persistBoardOrder() {
    const ids = [...boardList.children].map((li) => li.dataset.id);
    ids.forEach((id, index) => {
        sidebarApiFetch(`${BOARDS_API_URL}${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ order: index }),
        });
    });
}

loadBoards();
})();
