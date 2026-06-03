<script>

const serverURL = "http://192.168.12.126:5500/";

// 🔥 CHANJE SA SELMAN POU CHAQUE PAGE
// MOVIES / CARTOONS / VIDEOS / ADULTS / MUSICS
const rootFolder = "MUSICS/";

// 🔥 EXTENSIONS
const videoExt = ["mp4","mkv","avi","mov","wmv","flv"];
const audioExt = ["mp3","wav","ogg","m4a"];

// 📂 LOAD FOLDER SAFE
async function loadFolder(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return [];

        const text = await res.text();

        const doc = new DOMParser()
            .parseFromString(text,"text/html");

        const links = [...doc.querySelectorAll("a")];

        return links
            .map(a => a.getAttribute("href"))
            .filter(h => h && h !== "../");

    } catch (e) {
        console.log("Folder error:", e);
        return [];
    }
}

// 🎯 DETECT MEDIA TYPE
function isVideo(file) {
    return videoExt.some(ext => file.toLowerCase().endsWith("." + ext));
}

function isAudio(file) {
    return audioExt.some(ext => file.toLowerCase().endsWith("." + ext));
}

// 🚀 MAIN LOADER (WORK FOR ALL FOLDERS)
async function loadMedia() {

    const grid = document.getElementById("adultsGrid"); 
    // 👆 SA WORK FOR ALL PAGES (moviesGrid, musicsGrid etc)
    // SI OU VLE, CHANJE ID LA NAN HTML LA SELMAN

    const rootItems = await loadFolder(serverURL + rootFolder);

    for (const item of rootItems) {

        const fullPath = serverURL + rootFolder + item;

        // 📁 SUBFOLDER
        if (item.endsWith("/")) {

            const subFiles = await loadFolder(fullPath);

            for (const file of subFiles) {

                const filePath = fullPath + file;

                if (isVideo(file) || isAudio(file)) {
                    addCard(grid, filePath, file);
                }
            }

        } else {

            if (isVideo(item) || isAudio(item)) {
                addCard(grid, fullPath, item);
            }
        }
    }
}

// 🎨 CREATE CARD
function addCard(grid, mediaURL, fileName) {

    const card = document.createElement("div");
    card.className = "adult-card";

    let icon = "🎬";
    if (isAudio(fileName)) icon = "🎵";

    card.innerHTML = `
        <img src="thumbnail.png" style="width:100%; border-radius:8px;">
        <div class="adult-title">${icon} ${decodeURIComponent(fileName)}</div>
    `;

    card.onclick = () => {

        const player = document.getElementById("player");

        const safeURL = mediaURL
            .split("/")
            .map(p => encodeURIComponent(p))
            .join("/");

        player.src = safeURL;
        player.load();

        player.play().catch(err => {
            console.log("Play error:", err);
        });
    };

    grid.appendChild(card);
}

// 🔙 NAV
function goBack(){ history.back(); }
function goForward(){ history.forward(); }

// 🚀 START
loadMedia();

</script>