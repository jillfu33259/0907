const audio = document.querySelector('#audio');
const title = document.querySelector('#now-title');
const album = document.querySelector('#now-album');
const list = document.querySelector('#track-list');
const play = document.querySelector('#play');
const prev = document.querySelector('#previous');
const next = document.querySelector('#next');
const progress = document.querySelector('#progress-bar');
const time = document.querySelector('#time');
let tracks = [], current = 0;

function format(seconds) { const m = Math.floor(seconds / 60); const s = String(Math.floor(seconds % 60)).padStart(2, '0'); return `${String(m).padStart(2, '0')}:${s}`; }
function select(index, autoplay = false) {
  if (!tracks.length) return;
  current = (index + tracks.length) % tracks.length;
  const track = tracks[current];
  title.textContent = track.trackName;
  album.textContent = track.collectionName || '盧廣仲';
  audio.src = track.previewUrl;
  document.querySelectorAll('.track-list li').forEach((item, i) => item.classList.toggle('active', i === current));
  if (autoplay) audio.play().catch(() => {});
}
function render() {
  document.querySelector('#track-count').textContent = `${tracks.length} 首精選試聽`;
  list.innerHTML = tracks.map((track, i) => `<li class="${i === 0 ? 'active' : ''}" data-index="${i}"><b>${String(i + 1).padStart(2, '0')}</b><div><h3>${track.trackName}</h3><p>${track.collectionName || '盧廣仲'}</p></div><button aria-label="播放 ${track.trackName}">▶</button></li>`).join('');
  list.querySelectorAll('li').forEach(item => item.addEventListener('click', () => select(Number(item.dataset.index), true)));
  select(0);
}
async function loadTracks() {
  try {
    const response = await fetch('https://itunes.apple.com/search?term=%E7%9B%A7%E5%BB%A3%E4%BB%B2&entity=song&limit=12&country=TW');
    const data = await response.json();
    tracks = data.results.filter(track => track.previewUrl).slice(0, 8);
    if (!tracks.length) throw new Error('No previews');
    render();
  } catch (error) {
    document.querySelector('#track-count').textContent = '目前無法載入試聽';
    title.textContent = '請前往串流平台收聽';
    album.textContent = '重新整理後再試一次';
  }
}
play.addEventListener('click', () => { if (audio.paused) audio.play(); else audio.pause(); });
prev.addEventListener('click', () => select(current - 1, true));
next.addEventListener('click', () => select(current + 1, true));
audio.addEventListener('play', () => play.textContent = '❚❚');
audio.addEventListener('pause', () => play.textContent = '▶');
audio.addEventListener('ended', () => select(current + 1, true));
audio.addEventListener('timeupdate', () => { const duration = audio.duration || 30; progress.style.width = `${(audio.currentTime / duration) * 100}%`; time.textContent = `${format(audio.currentTime)} / ${format(duration)}`; });
loadTracks();
