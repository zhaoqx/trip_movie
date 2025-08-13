export class SubtitleManager {
  constructor(videoEl, boxEl) {
    this.video = videoEl;
    this.box = boxEl;
    this.cues = [];
    this.activeIndex = -1;
    this.boundUpdate = this.update.bind(this);
    this.video.addEventListener('timeupdate', this.boundUpdate);
  }
  async load(url) {
    this.cues = [];
    this.activeIndex = -1;
    this.box.textContent = '';
    if(!url) return;
    try {
      const txt = await (await fetch(url)).text();
      this.cues = this.parseSRT(txt);
    } catch(e) {
      console.warn('Subtitle load fail', e);
    }
  }
  parseSRT(data) {
    const blocks = data.replace(/\r/g,'').trim().split(/\n\n+/);
    const cues = [];
    for(const b of blocks) {
      const lines = b.split('\n').filter(Boolean);
      if(lines.length >= 2) {
        let idxLine = 0;
        if(/^\d+$/.test(lines[0].trim())) idxLine = 1;
        const timeLine = lines[idxLine];
        const m = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if(!m) continue;
        const start = this.toSec(m[1]);
        const end = this.toSec(m[2]);
        const text = lines.slice(idxLine+1).join('\n');
        cues.push({ start, end, text });
      }
    }
    return cues;
  }
  toSec(ts) {
    const [h,m,sMs] = ts.split(':');
    const [s,ms] = sMs.split(',');
    return (+h)*3600 + (+m)*60 + (+s) + (+ms)/1000;
  }
  update() {
    if(!this.cues.length) return;
    const t = this.video.currentTime;
    const current = this.activeIndex >=0 ? this.cues[this.activeIndex] : null;
    if(current && t >= current.start && t <= current.end) return;
    if(current && t > current.end) {
      for(let j=this.activeIndex+1;j<this.cues.length;j++){
        const c = this.cues[j];
        if(t >= c.start && t <= c.end) { this.activeIndex=j; return this.render(c.text); }
      }
    }
    if(!current || t < current.start || t > current.end) {
      for(let k=0;k<this.cues.length;k++){
        const c = this.cues[k];
        if(t >= c.start && t <= c.end) { this.activeIndex=k; return this.render(c.text); }
      }
      if(this.activeIndex!==-1){ this.activeIndex=-1; this.render(''); }
    }
  }
  render(text){ this.box.innerHTML = text.replace(/\n/g,'<br>'); }
}
