import { SubtitleManager } from './subtitle-loader.js';
import { metrics } from './metrics.js';

const video = document.getElementById('v');
const choice = document.getElementById('choice');
const notice = document.getElementById('notice');
const loading = document.getElementById('loading');
const controls = document.getElementById('controls');
const subtitleBox = document.getElementById('subtitle');
const startOverlay = document.getElementById('startOverlay');
const btnStart = document.getElementById('btnStart');

const FILES = {
  intro: 'assets/video/intro.mp4',
  polar: 'assets/video/branch_polar.mp4',
  tiger: 'assets/video/branch_tiger.mp4',
  outro: 'assets/video/outro.mp4'
};

const SUBS = {
  intro: 'assets/subtitles/common_intro.srt',
  polar: 'assets/subtitles/branch_polar.srt',
  tiger: 'assets/subtitles/branch_tiger.srt',
  outro: 'assets/subtitles/outro.srt'
};

let stage = 'intro';
let picked = null;
let introChoiceTime = 19;
let showingChoice = false;
const subs = new SubtitleManager(video, subtitleBox);
let started = false;

async function startExperience(){
  if(started) return; started = true;
  startOverlay.classList.add('hide');
  metrics.event('user_start');
  await init();
  try { await video.play(); } catch { /* ignore */ }
}

btnStart.addEventListener('click', startExperience);

async function init() {
  showLoading(true);
  stage = 'intro';
  picked = null;
  showingChoice = false;
  notice.textContent = '';
  await loadSegment('intro');
  await subs.load(SUBS.intro);
  // 解除静音以便用户手动控制声音（用户已点击）
  video.muted = false;
  await safePlay();
  showLoading(false);
  metrics.event('app_init');
}

async function safePlay(){
  try { await video.play(); }
  catch(e){ console.log('Play blocked', e); }
}

function showLoading(flag) {
  loading.style.display = flag ? 'flex' : 'none';
}

function loadSegment(name) {
  return new Promise(res=>{
    video.src = FILES[name];
    video.load();
    video.onloadeddata = ()=>res();
  });
}

video.addEventListener('timeupdate', ()=>{
  if(stage==='intro' && !showingChoice && video.currentTime >= introChoiceTime) {
    showingChoice = true;
    notice.textContent = '下一站去哪？';
    choice.style.display='flex';
    metrics.event('choice_display');
  }
});

choice.addEventListener('click', async e=>{
  const branch = e.target.dataset.branch;
  if(!branch) return;
  picked = branch;
  metrics.event('choice_pick', { branch });
  choice.style.display='none';
  notice.textContent = branch==='polar' ? '极地线' : '猛虎线';
  stage = branch;
  showLoading(true);
  await loadSegment(branch);
  await subs.load(SUBS[branch]);
  await safePlay();
  showLoading(false);
});

video.addEventListener('ended', async ()=>{
  if(stage==='polar' || stage==='tiger') {
    stage = 'outro';
    metrics.event('branch_end', { picked });
    showLoading(true);
    await loadSegment('outro');
    await subs.load(SUBS.outro);
    await safePlay();
    showLoading(false);
    notice.textContent='';
  } else if(stage==='outro') {
    notice.textContent = '四季龙江 · 再选另一条？';
    controls.style.display='flex';
    metrics.event('outro_end',{ picked });
  }
});

controls.addEventListener('click', e=>{
  const action = e.target.dataset.action;
  if(!action) return;
  controls.style.display='none';
  if(action==='replay') {
    metrics.event('replay',{ picked });
    init();
  } else if(action==='switch') {
    metrics.event('switch_branch',{ from:picked });
    init();
  }
});

// 如果用户 3 秒未点击，提示点击开始
setTimeout(()=>{
  if(!started) {
    startOverlay.querySelector('.hint').textContent = '轻触按钮以开始体验 (可能需开启声音)';
  }
},3000);
