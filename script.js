(() => {
  const emojis = ['🎉','🎂','🎈','🥳','✨','🎁','🕯️','🍰'];
  const stage = document.getElementById('emoji-stage');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function spawnEmoji(){
    if(prefersReduced) return;
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];

    const size = Math.random()*36 + 18; // px
    el.style.fontSize = size + 'px';

    const left = Math.random()*100; // vw percent
    el.style.left = left + 'vw';

    const duration = Math.random()*7 + 6; // seconds
    el.style.animationDuration = duration + 's, ' + (Math.random()*3 + 3) + 's';

    stage.appendChild(el);

    // Remove after animation
    setTimeout(()=>{ el.remove(); }, (duration+1)*1000);
  }

  // Spawn more frequently on wider screens, less on small
  function startSpawning(){
    const interval = window.innerWidth < 480 ? 600 : 350;
    return setInterval(spawnEmoji, interval);
  }

  let timer = startSpawning();

  // Restart when resized to adapt interval
  let resizeTO;
  window.addEventListener('resize', ()=>{
    clearTimeout(resizeTO);
    resizeTO = setTimeout(()=>{
      clearInterval(timer);
      timer = startSpawning();
    },200);
  });

  // Make sure stage covers dynamic viewport on mobile
  function fitStage(){
    stage.style.height = window.innerHeight + 'px';
  }
  fitStage();
  window.addEventListener('resize', fitStage);
})();

// Unlock / landing logic
(function(){
  const correctCode = 'bestie'; // change this value to whatever unlock code you want
  const landing = document.getElementById('landing');
  const mainCard = document.getElementById('main-card');
  const input = document.getElementById('code-input');
  const btn = document.getElementById('unlock-btn');

  function unlock(){
    const val = (input.value||'').trim().toLowerCase();
    if(!val) return;
    if(val === correctCode){
      landing.classList.add('hidden');
      mainCard.classList.remove('hidden');
      // small celebratory burst
      for(let i=0;i<18;i++) setTimeout(()=>spawnTempConfetti(), i*40);
      // try to play music now that user has interacted (unlock click)
      tryPlayOnUnlock();
    } else {
      input.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
    }
  }

  btn.addEventListener('click', unlock);
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') unlock(); });

  function spawnTempConfetti(){
    const el = document.createElement('div');
    el.textContent = '✨';
    el.className = 'floating-emoji';
    el.style.left = (40 + Math.random()*20) + 'vw';
    el.style.fontSize = (12+Math.random()*18) + 'px';
    el.style.animationDuration = (1+Math.random()*1.2)+'s, 2s';
    stage.appendChild(el);
    setTimeout(()=>el.remove(),2000);
  }
})();

// YouTube background music player
let ytPlayer = null;
const YT_VIDEO_ID = 'M-5UZ_YJjM4';
const queuedAction = { play: false };

function onYouTubeIframeAPIReady(){
  ytPlayer = new YT.Player('yt-player', {
    height: '0', width: '0', videoId: YT_VIDEO_ID,
    playerVars: { controls: 0, loop: 1, playlist: YT_VIDEO_ID, rel: 0, modestbranding: 1 },
    events: {
      onReady: function(){
        // If user tried to play before API ready
        if(queuedAction.play){
          try{ ytPlayer.unMute(); ytPlayer.playVideo(); }catch(e){}
          queuedAction.play = false;
        }
      }
    }
  });
}

const musicBtn = document.getElementById('music-btn');
function playMusic(){
  if(!ytPlayer){ queuedAction.play = true; musicBtn.classList.add('active'); return; }
  try{ ytPlayer.unMute(); ytPlayer.setVolume && ytPlayer.setVolume(100); ytPlayer.playVideo(); }catch(e){}
  musicBtn.classList.add('active'); musicBtn.setAttribute('aria-pressed','true');
}

function pauseMusic(){
  if(!ytPlayer) { queuedAction.play = false; musicBtn.classList.remove('active'); musicBtn.setAttribute('aria-pressed','false'); return; }
  try{ ytPlayer.pauseVideo(); }catch(e){}
  musicBtn.classList.remove('active'); musicBtn.setAttribute('aria-pressed','false');
}

if(musicBtn){
  // start muted/off by default
  musicBtn.classList.remove('active');
  musicBtn.setAttribute('aria-pressed','false');

  musicBtn.addEventListener('click', ()=>{
    // toggle
    const isActive = musicBtn.classList.contains('active');
    if(isActive) pauseMusic(); else playMusic();
  });
}

// When unlocking, attempt to start music immediately (user interaction via unlock click)
function tryPlayOnUnlock(){
  if(musicBtn && !musicBtn.classList.contains('active')){
    playMusic();
  }
}
