window.mediaPlaylist = [];
window.currentIndex = 0;

/* ===========================
   MUSICS SYSTEM (LOCAL PC)
=========================== */

const SERVER = "http://192.168.12.126:5500";
const ROOT = SERVER + "/MUSICS/";

let currentPath = ROOT;

const listContent = document.getElementById("listContent");
const player = document.getElementById("player");
const musicThumb = document.getElementById("musicThumb");
const currentPathLabel = document.getElementById("currentPathLabel");

/* ===========================
   READ LOCAL FOLDER
=========================== */
async function readFolder(url) {
    try {
        const res = await fetch(url);
        const text = await res.text();

        const parser = new DOMParser();
        const html = parser.parseFromString(text, "text/html");
        const links = [...html.querySelectorAll("a")];

        let items = [];

        links.forEach(a => {
            const name = a.textContent.trim();
            if (name === "../") return;

            if (name.endsWith("/")) {
                items.push({
                    type: "folder",
                    name,
                    path: url + name
                });
            } else if (
                name.endsWith(".mp3") ||
                name.endsWith(".wav") ||
                name.endsWith(".ogg") ||
                name.endsWith(".m4a")
            ) {
                items.push({
                    type: "audio",
                    name,
                    path: url + name
                });
            }
        });

        return items;

    } catch (err) {
        console.error("Folder read error:", err);
        return [];
    }
}

/* ===========================
   RENDER LIST
=========================== */
async function render() {
    currentPathLabel.textContent = currentPath.replace(ROOT, "");

    const items = await readFolder(currentPath);

    listContent.innerHTML = "";
    window.mediaPlaylist = [];

    if (items.length === 0) {
        listContent.innerHTML = "<p>No files found</p>";
        return;
    }

    items.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "item-card";

        if (item.type === "folder") {
            div.innerHTML = `<div class="item-title">📁 ${item.name}</div>`;
            div.onclick = () => {
                currentPath = item.path;
                render();
            };
        }

        if (item.type === "audio") {
            div.innerHTML = `<div class="item-title">🎵 ${item.name}</div>`;
            div.onclick = () => playMusic(item.path);

            // ADD TO PLAYLIST
            window.mediaPlaylist.push(item.path);
        }

        listContent.appendChild(div);
    });
}

/* ===========================
   PLAY MUSIC
=========================== */
function playMusic(fullPath) {
    player.src = fullPath;
    player.play().catch(()=>{});

    window.currentIndex = window.mediaPlaylist.indexOf(fullPath);

    // THUMBNAIL
    let base = fullPath.replace(/\.[^/.]+$/, "");
    let jpg = base + ".jpg";
    let png = base + ".png";

    fetch(jpg).then(r => {
        if (r.ok) musicThumb.style.backgroundImage = `url('${jpg}')`;
        else {
            fetch(png).then(r2 => {
                if (r2.ok) musicThumb.style.backgroundImage = `url('${png}')`;
                else musicThumb.style.backgroundImage = "url('assets/music-default.jpg')";
            });
        }
    });
}

/* ===========================
   BACK BUTTON
=========================== */
document.getElementById("btnBack").onclick = () => {
    if (currentPath !== ROOT) {
        let parts = currentPath.replace(ROOT, "").split("/").filter(Boolean);
        parts.pop();
        currentPath = parts.length ? ROOT + parts.join("/") + "/" : ROOT;
        render();
    }
};

/* ===========================
   ROOT BUTTON
=========================== */
document.getElementById("btnRoot").onclick = () => {
    currentPath = ROOT;
    render();
};

/* ===========================
   NEXT / PREVIOUS
=========================== */
document.getElementById("nextBtn").onclick = () => {
    if (!window.mediaPlaylist.length) return;

    window.currentIndex = (window.currentIndex + 1) % window.mediaPlaylist.length;
    playMusic(window.mediaPlaylist[window.currentIndex]);
};

document.getElementById("prevBtn").onclick = () => {
    if (!window.mediaPlaylist.length) return;

    window.currentIndex = (window.currentIndex - 1 + window.mediaPlaylist.length) % window.mediaPlaylist.length;
    playMusic(window.mediaPlaylist[window.currentIndex]);
};

/* ===========================
   AUTO NEXT
=========================== */
player.addEventListener("ended", () => {
    if (!window.mediaPlaylist.length) return;

    window.currentIndex = (window.currentIndex + 1) % window.mediaPlaylist.length;
    playMusic(window.mediaPlaylist[window.currentIndex]);
});

/* ===========================
   INIT
=========================== */
render();
