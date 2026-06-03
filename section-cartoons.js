// CONFIG SEKSIYON SA A
const serverURL = "http://192.168.12.126:5500/";
const rootFolder = "CARTOONS/";   // CARTOONS
const videoExt = ["mp4","mkv","avi","mov","wmv","flv","mp3","wav","ogg","m4a"];

let currentPath = "";
let allItemsIndex = [];

const listContent = document.getElementById("listContent");
const player = document.getElementById("player");
const pathLabel = document.getElementById("currentPathLabel");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");

// LOAD FOLDER
async function loadFolder(url){
  try{
    const res = await fetch(url);
    if(!res.ok) return [];
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text,"text/html");
    return [...doc.querySelectorAll("a")]
      .map(a => a.getAttribute("href"))
      .filter(h => h && h !== "../");
  }catch(e){
    return [];
  }
}

function isMedia(file){
  return videoExt.some(ext => file.toLowerCase().endsWith("." + ext));
}
function isFolder(item){
  return item.endsWith("/");
}

// RENDER CURRENT PATH
async function renderCurrent(){
  listContent.innerHTML = "";
  pathLabel.textContent = "/" + currentPath;

  const items = await loadFolder(serverURL + rootFolder + currentPath);

  items.forEach(item => {
    const full = currentPath + item;

    if(isFolder(item)){
      addFolderCard(full, item);
    } else if(isMedia(item)){
      addFileCard(full, item);
      indexItem(full, item);
    }
  });
}

// FOLDER CARD
function addFolderCard(fullPath, name){
  const div = document.createElement("div");
  div.className = "item-card";
  div.innerHTML = `
    <div class="item-title">📁 ${name.replace("/","")}</div>
    <div class="item-sub" id="count-${fullPath}">Loading...</div>
  `;
  div.onclick = () => {
    currentPath = fullPath;
    renderCurrent();
  };
  listContent.appendChild(div);
  countFilesInFolder(fullPath);
}

// FILE CARD
function addFileCard(fullPath, name){
  const div = document.createElement("div");
  div.className = "item-card";
  div.innerHTML = `
    <div class="item-title">🎬 ${decodeURIComponent(name)}</div>
  `;
  div.onclick = () => playMedia(fullPath);
  listContent.appendChild(div);
}

// COUNT FILES IN FOLDER
async function countFilesInFolder(folderPath){
  const items = await loadFolder(serverURL + rootFolder + folderPath);
  let count = items.filter(isMedia).length;
  const label = document.getElementById("count-" + folderPath);
  if(label) label.textContent = `${count} file(s)`;
}

// PLAY MEDIA
function playMedia(fullPath){
  player.src = serverURL + rootFolder + fullPath;
  player.load();
  player.play().catch(()=>{});
}

// BACK / ROOT
document.getElementById("btnBack").onclick = () => {
  let parts = currentPath.split("/").filter(Boolean);
  parts.pop();
  currentPath = parts.length ? parts.join("/") + "/" : "";
  renderCurrent();
};

document.getElementById("btnRoot").onclick = () => {
  currentPath = "";
  renderCurrent();
};

// INDEX ITEMS FOR SEARCH
function indexItem(fullPath, name){
  const cleanName = decodeURIComponent(name);
  allItemsIndex.push({
    path: fullPath,
    name: cleanName,
    lower: cleanName.toLowerCase()
  });
}

// ADVANCED SEARCH
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  if(!q){
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
    return;
  }

  const matches = allItemsIndex.filter(it => it.lower.includes(q)).slice(0, 20);

  if(matches.length === 0){
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
    return;
  }

  suggestionsBox.innerHTML = "";
  matches.forEach(m => {
    const div = document.createElement("div");
    div.textContent = m.name;
    div.onclick = () => {
      suggestionsBox.style.display = "none";
      searchInput.value = m.name;
      playMedia(m.path);
    };
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.style.display = "block";
});

// INIT
(async () => {
  currentPath = "";
  allItemsIndex = [];
  await renderCurrent();
})();
