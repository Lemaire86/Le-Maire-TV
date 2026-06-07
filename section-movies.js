// -------------------------------
// CONFIG
// -------------------------------
const JSON_URL = "https://flat-violet-6492.jeanjuniorlemaire.workers.dev/?path=MOVIES/";

let fullData = [];
let currentPath = "";
let currentList = [];
let allItemsIndex = [];

window.mediaPlaylist = [];
window.currentIndex = 0;

const listContent = document.getElementById("listContent");
const player = document.getElementById("player");
const pathLabel = document.getElementById("currentPathLabel");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");


// -------------------------------
// LOAD JSON
// -------------------------------
async function loadJSON() {
    try {
        const res = await fetch(JSON_URL);
        fullData = await res.json();
        loadRoot();
    } catch (e) {
        listContent.innerHTML = "<p style='padding:20px;'>⚠ Cannot load movies</p>";
    }
}


// -------------------------------
// LOAD ROOT
// -------------------------------
function loadRoot() {
    currentPath = "";
    pathLabel.textContent = "/";

    const rootItems = fullData.filter(item => !item.path.includes("/", 1));
    renderList(rootItems);
}


// -------------------------------
// OPEN FOLDER
// -------------------------------
function openFolder(path) {
    currentPath = path;
    pathLabel.textContent = "/" + path;

    const folderItems = fullData.filter(item => item.path.startsWith(path));
    renderList(folderItems);
}


// -------------------------------
// RENDER LIST
// -------------------------------
function renderList(list) {
    listContent.innerHTML = "";
    currentList = list;

    window.mediaPlaylist = [];
    allItemsIndex = [];

    list.forEach(item => {
        if (item.type === "folder") {
            addFolderCard(item);
        } else if (item.type === "file") {
            addFileCard(item);
            window.mediaPlaylist.push(item.url);
            indexItem(item);
        }
    });
}


// -------------------------------
// FOLDER CARD
// -------------------------------
function addFolderCard(item) {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
        <div class="item-title">📁 ${item.name}</div>
        <div class="item-sub" id="count-${item.path}">Loading...</div>
    `;
    div.onclick = () => openFolder(item.path);
    listContent.appendChild(div);

    countFiles(item.path);
}


// -------------------------------
// FILE CARD
// -------------------------------
function addFileCard(item) {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
        <div class="item-title">🎬 ${item.name}</div>
    `;
    div.onclick = () => playMedia(item.url);
    listContent.appendChild(div);
}


// -------------------------------
// COUNT FILES IN FOLDER
// -------------------------------
function countFiles(path) {
    const count = fullData.filter(
        x => x.type === "file" && x.path.startsWith(path)
    ).length;

    const label = document.getElementById("count-" + path);
    if (label) label.textContent = `${count} file(s)`;
}


// -------------------------------
// PLAY MEDIA
// -------------------------------
function playMedia(url) {
    player.src = url;
    player.load();
    player.play();

    window.currentIndex = window.mediaPlaylist.indexOf(url);
}


// -------------------------------
// BACK
// -------------------------------
document.getElementById("btnBack").onclick = () => {
    if (!currentPath.includes("/")) {
        loadRoot();
        return;
    }

    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.join("/") + "/";

    openFolder(newPath);
};


// -------------------------------
// ROOT
// -------------------------------
document.getElementById("btnRoot").onclick = loadRoot;


// -------------------------------
// SEARCH INDEX
// -------------------------------
function indexItem(item) {
    allItemsIndex.push({
        name: item.name,
        url: item.url,
        lower: item.name.toLowerCase()
    });
}


// -------------------------------
// SEARCH
// -------------------------------
searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();

    if (!q) {
        suggestionsBox.style.display = "none";
        return;
    }

    const matches = allItemsIndex.filter(x => x.lower.includes(q)).slice(0, 20);

    if (!matches.length) {
        suggestionsBox.style.display = "none";
        return;
    }

    suggestionsBox.innerHTML = "";
    matches.forEach(m => {
        const div = document.createElement("div");
        div.textContent = m.name;
        div.onclick = () => {
            suggestionsBox.style.display = "none";
            playMedia(m.url);
        };
        suggestionsBox.appendChild(div);
    });

    suggestionsBox.style.display = "block";
});


// -------------------------------
// INIT
// -------------------------------
loadJSON();


// -------------------------------
// NEXT / PREV
// -------------------------------
document.getElementById("nextBtn").onclick = () => {
    if (!window.mediaPlaylist.length) return;

    window.currentIndex = (window.currentIndex + 1) % window.mediaPlaylist.length;
    playMedia(window.mediaPlaylist[window.currentIndex]);
};

document.getElementById("prevBtn").onclick = () => {
    if (!window.mediaPlaylist.length) return;

    window.currentIndex = (window.currentIndex - 1 + window.mediaPlaylist.length) % window.mediaPlaylist.length;
    playMedia(window.mediaPlaylist[window.currentIndex]);
};
