const API_URL = '/api/ideas/';
const board = document.getElementById('board');
const form = document.getElementById('new-idea-form');

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

function createCard(idea) {
    const card = document.createElement('div');
    card.className = 'idea-card';
    card.style.left = idea.pos_x + 'px';
    card.style.top = idea.pos_y + 'px';
    card.style.background = idea.color;
    card.dataset.id = idea.id;

    const title = document.createElement('h3');
    title.contentEditable = true;
    title.textContent = idea.title;

    const content = document.createElement('p');
    content.contentEditable = true;
    content.textContent = idea.content;

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.addEventListener('click', () => deleteIdea(idea.id, card));
    actions.appendChild(deleteBtn);

    card.append(title, content, actions);

    const saveText = () => updateIdea(idea.id, {
        title: title.textContent.trim(),
        content: content.textContent.trim(),
    });
    title.addEventListener('blur', saveText);
    content.addEventListener('blur', saveText);

    makeDraggable(card, idea.id);

    board.appendChild(card);
}

function makeDraggable(card, id) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    card.addEventListener('pointerdown', (e) => {
        if (e.target.isContentEditable) return;
        dragging = true;
        card.classList.add('dragging');
        offsetX = e.clientX - card.offsetLeft;
        offsetY = e.clientY - card.offsetTop;
        card.setPointerCapture(e.pointerId);
    });

    card.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        card.style.left = (e.clientX - offsetX) + 'px';
        card.style.top = (e.clientY - offsetY) + 'px';
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
    fetch(API_URL)
        .then((res) => res.json())
        .then((ideas) => ideas.forEach(createCard));
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('new-title');
    const content = document.getElementById('new-content');
    const color = document.getElementById('new-color');

    apiFetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
            title: title.value,
            content: content.value,
            color: color.value,
            pos_x: 40 + Math.random() * 200,
            pos_y: 40 + Math.random() * 200,
        }),
    })
        .then((res) => res.json())
        .then((idea) => {
            createCard(idea);
            form.reset();
            color.value = '#ffe066';
        });
});

loadIdeas();
