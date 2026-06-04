// GLOBAL PLAYLIST
window.mediaPlaylist = [];
window.currentIndex = 0;

/* =========================
   PLAYLIST SOURCES
========================= */
const mainPlaylist = "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/le_maire_tv.m3u";

const countryPlaylists = {
  HT: "https://raw.githubusercontent.com/Lemaire86/Le-Maire-TV/refs/heads/main/CODE%20IPTV/lmtv.m3u",
  FR: "https://iptv-org.github.io/iptv/countries/fr.m3u",
  US: "https://iptv-org.github.io/iptv/countries/us.m3u"
};

const languagePlaylists = {
  FR: "https://iptv-org.github.io/iptv/languages/fra.m3u",
  US: "https://iptv-org.github.io/iptv/languages/eng.m3u",
  ES: "https://iptv-org.github.io/iptv/languages/spa.m3u"
};

/* =========================
   DATA
========================= */
let allChannels = [];
let filteredChannels = [];
let allIndex = [];

let currentFolder = "categories";
let currentCategory = "all";

/* =========================
   ELEMENTS
========================= */
const player = document.getElementById("player");
const listContent = document.getElementById("listContent");
const nowPlaying = document.getElementById("nowPlaying");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("searchSuggestions");

/* =========================
   FETCH
========================= */
async function fetchText(url){
  const res = await fetch(url);
  return await res.text();
}

/* =========================
   PARSE M3U
========================= */
function parseM3U(text){
  const lines = text.split("\n");
  let channels = [];
  let info = null;

  for(let line of lines){
    line = line.trim();

    if(line.startsWith("#EXTINF")){
      const match = line.match(/,(.*)$/);
      const group = line.match(/group-title="([^"]*)"/i);

      info = {
        name: match ? match[1] : "Unknown",
        group: group ? group[1].toLowerCase() : ""
      };
    }
    else if(line && !line.startsWith("#") && info){
      info.url = line;
      channels.push(info);
      info = null;
    }
  }

  return channels;
}

/* =========================
   LOADERS
========================= */
async function loadMain(){
  const txt = await fetchText(mainPlaylist);
  allChannels = parseM3U(txt);
  indexChannels();
  renderChannels();
}

async function loadCountry(code){
  const txt = await fetchText(countryPlaylists[code]);
  allChannels = parseM3U(txt);
  indexChannels();
  renderChannels();
}

async function loadLanguage(code){
  const txt = await fetchText(languagePlaylists[code]);
  allChannels = parseM3U(txt);
  indexChannels();
  renderChannels();
}

/* =========================
   INDEX FOR SEARCH
========================= */
function indexChannels(){
  allIndex = [];
  allChannels.forEach(ch => {
    allIndex.push({
      name: ch.name,
      lower: ch.name.toLowerCase(),
      url: ch.url
    });
  });
}

/* =========================
   RENDER FOLDERS
========================= */
function renderFolders(){

  listContent.innerHTML = "";

  if(currentFolder === "categories"){
    addFolder("all", "All Channels");
    addFolder("movies", "Movies");
    addFolder("sports", "Sports");
    addFolder("news", "News");
    addFolder("kids", "Kids");
    addFolder("music", "Music");
    addFolder("documentary", "Documentary");
    addFolder("religious", "Religious");
    addFolder("family", "Family");
    addFolder("comedy", "Comedy");
    addFolder("outdoor", "Outdoor");
    addFolder("relax", "Relax");
    addFolder("animation", "Animation");
    addFolder("business", "Business");
    addFolder("auto", "Auto");
    addFolder("education", "Education");
  }

  if(currentFolder === "countries"){
    addFolder("HT", "Haiti");
    addFolder("FR", "France");
    addFolder("US", "USA");
  }

  if(currentFolder === "languages"){
    addFolder("FR", "French");
    addFolder("US", "English");
    addFolder("ES", "Spanish");
  }
}

function addFolder(code, label){
  const div = document.createElement("div");
  div.className = "item-card";
  div.innerHTML = `<div class="item-title">📁 ${label}</div>`;
  div.onclick = () => openFolder(code);
  listContent.appendChild(div);
}

/* =========================
   OPEN FOLDER
========================= */
function openFolder(code){

  if(currentFolder === "categories"){
    currentCategory = code;
    renderChannels();
    return;
  }

  if(currentFolder === "countries"){
    loadCountry(code);
    return;
  }

  if(currentFolder === "languages"){
    loadLanguage(code);
    return;
  }
}

/* =========================
   FILTER CHANNELS
========================= */
function matchCategory(ch){

  if(currentCategory === "all") return true;

  const name = ch.name.toLowerCase();
  const group = ch.group;

  return (
    group.includes(currentCategory) ||
    name.includes(currentCategory)
  );
}

/* =========================
   RENDER CHANNELS
========================= */
function renderChannels(){

  listContent.innerHTML = "";

  filteredChannels = allChannels.filter(matchCategory);

  if(filteredChannels.length === 0){
    listContent.innerHTML = "<p>No channels found</p>";
    window.mediaPlaylist = [];
    return;
  }

  // BUILD PLAYLIST
  window.mediaPlaylist = filteredChannels.map(ch => ch.url);
  window.currentIndex = 0;

  filteredChannels.forEach((ch, i) => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `<div class="item-title">📺 ${ch.name}</div>`;
    div.onclick = () => playChannel(ch, i);
    listContent.appendChild(div);
  });
}

/* =========================
   PLAY CHANNEL
========================= */
function playChannel(ch, index) {
    player.src = ch.url;
    player.play().catch(()=>{});

    window.currentIndex = index;
    nowPlaying.textContent = "Now Playing: " + ch.name;
}

/* =========================
   SEARCH ADVANCED
========================= */
searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  if(!q){
    suggestionsBox.style.display = "none";
    suggestionsBox.innerHTML = "";
    return;
  }

  const matches = allIndex.filter(it => it.lower.includes(q)).slice(0, 25);

  if(matches.length === 0){
    suggestionsBox.style.display = "none";
    return;
  }

  suggestionsBox.innerHTML = "";
  matches.forEach(m => {
    const div = document.createElement("div");
    div.textContent = m.name;
    div.onclick = () => {
      suggestionsBox.style.display = "none";
      searchInput.value = m.name;
      player.src = m.url;
      nowPlaying.textContent = "Now Playing: " + m.name;
      player.play().catch(()=>{});
    };
    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = "block";
});

/* =========================
   FOLDER SWITCH BUTTONS
========================= */
document.querySelectorAll(".nav-folder-btn").forEach(btn => {
  btn.onclick = () => {
    currentFolder = btn.dataset.folder;
    renderFolders();
  };
});

/* =========================
   INIT
========================= */
renderFolders();
loadMain();
