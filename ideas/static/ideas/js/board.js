(function () {
const API_URL = '/api/ideas/';
const BOARD_ID = Number(document.body.dataset.boardId) || null;
const boardWrapper = document.getElementById('board-wrapper');
const board = document.getElementById('board');
const addBtn = document.getElementById('add-btn');

const overlay = document.getElementById('idea-popup-overlay');
const popupCard = document.getElementById('idea-popup-card');
const popupTitle = document.getElementById('popup-title');
const popupContent = document.getElementById('popup-content');
const popupColor = document.getElementById('popup-color');
const discardBtn = document.getElementById('discard-btn');
const saveBtn = document.getElementById('save-btn');

const contextPopup = document.getElementById('context-popup');
const editPopupBtn = document.getElementById('edit-popup-btn');
const deletePopupBtn = document.getElementById('delete-popup-btn');

let zoom = 1;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.5;

let popupMode = 'create'; // 'create' | 'edit'
let editingId = null;

function applyZoom() {
    board.style.transform = `scale(${zoom})`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

const csrftoken = getCookie('csrftoken');

function apiFetch(url, options = {}) {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            ...(options.headers || {}),
        },
    });
}

function relativeLuminance(hex) {
    const value = hex.replace('#', '');
    if (value.length !== 6) return 1;
    const r = parseInt(value.substring(0, 2), 16) / 255;
    const g = parseInt(value.substring(2, 4), 16) / 255;
    const b = parseInt(value.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function applyTextColor(card, color) {
    card.classList.toggle('dark-text', relativeLuminance(color) < 0.55);
}

function createCard(idea) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.style.left = idea.pos_x + 'px';
    card.style.top = idea.pos_y + 'px';
    card.style.background = idea.color;
    card.dataset.id = idea.id;
    applyTextColor(card, idea.color);

    const title = document.createElement('h3');
    title.textContent = idea.title;

    const content = document.createElement('p');
    content.textContent = idea.content;

    card.append(title, content);

    makeDraggable(card, idea.id);

    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextPopup(e.clientX, e.clientY, idea.id, card);
    });

    board.appendChild(card);
    return card;
}

function makeDraggable(card, id) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    card.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        card.classList.add('dragging');
        offsetX = e.clientX / zoom - card.offsetLeft;
        offsetY = e.clientY / zoom - card.offsetTop;
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        card.style.left = (e.clientX / zoom - offsetX) + 'px';
        card.style.top = (e.clientY / zoom - offsetY) + 'px';
    });

    card.addEventListener('pointerup', (e) => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('dragging');
        updateIdea(id, {
            pos_x: parseFloat(card.style.left),
            pos_y: parseFloat(card.style.top),
        });
    });
}

function showContextPopup(x, y, id, card) {
    contextPopup.style.left = x + 'px';
    contextPopup.style.top = y + 'px';
    contextPopup.classList.remove('hidden');

    editPopupBtn.onclick = () => {
        hideContextPopup();
        openIdeaPopup('edit', {
            id,
            title: card.querySelector('h3').textContent,
            content: card.querySelector('p').textContent,
            color: rgbToHex(card.style.background) || popupColor.value,
        });
    };

    deletePopupBtn.onclick = () => {
        deleteIdea(id, card);
        hideContextPopup();
    };
}

function hideContextPopup() {
    contextPopup.classList.add('hidden');
    editPopupBtn.onclick = null;
    deletePopupBtn.onclick = null;
}

function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    if (!match) return null;
    return '#' + match.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

document.addEventListener('click', (e) => {
    if (!contextPopup.contains(e.target)) hideContextPopup();
});

function updateIdea(id, data) {
    return apiFetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

function deleteIdea(id, card) {
    apiFetch(`${API_URL}${id}/`, { method: 'DELETE' }).then(() => card.remove());
}

function loadIdeas() {
    fetch(`${API_URL}?board=${BOARD_ID}`)
        .then((res) => res.json())
        .then((ideas) => ideas.forEach(createCard));
}

// Zoom with ctrl + scroll while hovering the board
boardWrapper.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
    applyZoom();
}, { passive: false });

// Create/edit idea popup
function openIdeaPopup(mode, idea) {
    popupMode = mode;
    editingId = idea ? idea.id : null;
    popupTitle.textContent = idea ? idea.title : '';
    popupContent.textContent = idea ? idea.content : '';
    const color = idea ? idea.color : '#ffe066';
    popupColor.value = color;
    popupCard.style.background = color;
    applyTextColor(popupCard, color);
    saveBtn.textContent = mode === 'edit' ? 'Guardar' : 'Agregar';
    overlay.classList.remove('hidden');
    popupTitle.focus();
}

popupColor.addEventListener('input', () => {
    popupCard.style.background = popupColor.value;
    applyTextColor(popupCard, popupColor.value);
});

function closeIdeaPopup() {
    overlay.classList.add('hidden');
    editingId = null;
}

addBtn.addEventListener('click', () => openIdeaPopup('create', null));
discardBtn.addEventListener('click', closeIdeaPopup);
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeIdeaPopup();
});

saveBtn.addEventListener('click', () => {
    const title = popupTitle.textContent.trim();
    if (!title) {
        popupTitle.focus();
        return;
    }
    const content = popupContent.textContent.trim();
    const color = popupColor.value;

    if (popupMode === 'edit' && editingId) {
        updateIdea(editingId, { title, content, color })
            .then(() => {
                const card = board.querySelector(`.idea-card[data-id="${editingId}"]`);
                if (card) {
                    card.querySelector('h3').textContent = title;
                    card.querySelector('p').textContent = content;
                    card.style.background = color;
                    applyTextColor(card, color);
                }
                closeIdeaPopup();
            });
        return;
    }

    apiFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
            board: BOARD_ID,
            title,
            content,
            color,
            pos_x: 40 + Math.random() * 200,
            pos_y: 40 + Math.random() * 200,
        }),
    })
        .then((res) => res.json())
        .then((idea) => {
            createCard(idea);
            closeIdeaPopup();
        });
});

loadIdeas();
})();
