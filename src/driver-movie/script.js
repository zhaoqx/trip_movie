// 简化状态和步骤定义
const state = {
  step: 0,
  auto: false,
  timer: null,

  // 座椅参数
  seatX: 0,     // 前后
  seatY: 0,     // 高低（-上 +下）
  backDeg: -5,  // 靠背角度（负：更直）
  headY: 0,     // 头枕高度

  // 方向盘与后视镜
  wheelTilt: 0,
  insideMirrorRot: 0,
  sideMirrorRot: 0,

  // 手臂状态：false 放松；true 抓9&3
  handsOnWheel: false
};

const steps = [
  {
    name: "调整座椅前后",
    title: "步骤 1：调整座椅前后",
    desc: "脚踩刹车时膝盖微屈；确保踏板踩到底脚跟还能自然着地，且大腿不顶方向盘。",
    highlight: ["gSeat", "brake"],
    apply: () => {
      state.seatX = 20; // 前移一些
      state.seatY = 0;
      state.handsOnWheel = false;
    }
  },
  {
    name: "调整座椅高度",
    title: "步骤 2：调整座椅高度",
    desc: "坐姿应保证视野开阔但不过高；目光平视时，上沿能看到仪表和前方路况。",
    highlight: ["seatCushion"],
    apply: () => {
      state.seatY = -10; // 略升高
    }
  },
  {
    name: "调整靠背角度",
    title: "步骤 3：调整靠背角度",
    desc: "靠背角度约100-110°，脊背尽量贴靠背；避免过度后仰导致肩部离靠背。",
    highlight: ["backRotate"],
    apply: () => {
      state.backDeg = -8; // 更直一点
    }
  },
  {
    name: "调整头枕高度",
    title: "步骤 4：调整头枕高度",
    desc: "头枕顶端与头顶齐平，头后距头枕约一个拳头；可有效减少颈部伤害风险。",
    highlight: ["headrest"],
    apply: () => {
      state.headY = -10; // 头枕上提
    }
  },
  {
    name: "调整方向盘位置",
    title: "步骤 5：调整方向盘位置",
    desc: "方向盘不遮挡仪表；双手到9点与3点时，手肘自然弯曲，胸前留有余量。",
    highlight: ["gWheel","wheel"],
    apply: () => {
      state.wheelTilt = -6; // 轻微上扬
    }
  },
  {
    name: "调整后视镜",
    title: "步骤 6：调整后视镜",
    desc: "内后视镜覆盖后窗，外后视镜外扩到刚好看见车身一小条边，尽量减少盲区。",
    highlight: ["insideMirror","leftMirror","rightMirror"],
    apply: () => {
      state.insideMirrorRot = -5;
      state.sideMirrorRot = 6;
    }
  },
  {
    name: "最终检查",
    title: "步骤 7：最终检查",
    desc: "双手9点/3点，膝盖与肘部略弯；头枕齐平；坐姿舒适可控，长途不易疲劳。",
    highlight: ["gSeat","gWheel","gMirrors"],
    apply: () => {
      state.handsOnWheel = true;
      // 略微微调成“完成态”
      state.seatX = 16;
      state.seatY = -8;
      state.backDeg = -7;
      state.headY = -10;
      state.wheelTilt = -4;
      state.insideMirrorRot = -3;
      state.sideMirrorRot = 4;
    }
  }
];

const $ = (id) => document.getElementById(id);
const gSeat = $("gSeat");
const backRotate = $("backRotate");
const headrest = $("headrest");
const gWheel = $("gWheel");
const wheel = $("wheel");
const insideMirror = $("insideMirror");
const leftMirror = $("leftMirror");
const rightMirror = $("rightMirror");
const armLeft = $("armLeft");
const armRight = $("armRight");
const head = $("head");
const torso = $("torso");
const thigh = $("thigh");
const calf = $("calf");
const foot = $("foot");

const captionTitle = $("captionTitle");
const captionBody = $("captionBody");
const stepIndex = $("stepIndex");
const stepName = $("stepName");
const btnPrev = $("btnPrev");
const btnNext = $("btnNext");
const btnPlay = $("btnPlay");

function applyTransforms(){
  // 座椅整体前后/高低
  gSeat.setAttribute("transform", `translate(${state.seatX}, ${state.seatY})`);

  // 靠背角度（绕seatBack铰点旋转）
  backRotate.setAttribute("transform", `rotate(${state.backDeg})`);

  // 头枕高度
  headrest.setAttribute("transform", `translate(${380 + state.seatX},${180 + state.seatY + state.headY})`);

  // 方向盘倾角（围绕自身中心轻微旋转）
  gWheel.setAttribute("transform", `translate(560,260) rotate(${state.wheelTilt})`);

  // 后视镜旋转
  insideMirror.setAttribute("transform", `rotate(${state.insideMirrorRot},400,98)`);
  leftMirror.setAttribute("transform", `rotate(${-state.sideMirrorRot},101,177)`);
  rightMirror.setAttribute("transform", `rotate(${state.sideMirrorRot},699,177)`);

  // 手臂：若“抓9与3”，连接手到方向盘左右标记；否则放松
  if(state.handsOnWheel){
    const seatOffsetX = state.seatX;
    const seatOffsetY = state.seatY;

    // 肩部坐标（随座椅）
    const shoulderL = { x: 318 + seatOffsetX, y: 258 + seatOffsetY };
    const shoulderR = { x: 342 + seatOffsetX, y: 258 + seatOffsetY };

    // 方向盘9/3点（方向盘中心固定于(560,260)，忽略倾角影响以简化）
    const handL = { x: 560 - 60, y: 260 };
    const handR = { x: 560 + 60, y: 260 };

    armLeft.setAttribute("x1", shoulderL.x);
    armLeft.setAttribute("y1", shoulderL.y);
    armLeft.setAttribute("x2", handL.x);
    armLeft.setAttribute("y2", handL.y);

    armRight.setAttribute("x1", shoulderR.x);
    armRight.setAttribute("y1", shoulderR.y);
    armRight.setAttribute("x2", handR.x);
    armRight.setAttribute("y2", handR.y);
  } else {
    // 放松下垂
    const seatOffsetX = state.seatX;
    const seatOffsetY = state.seatY;
    armLeft.setAttribute("x1", 318 + seatOffsetX);
    armLeft.setAttribute("y1", 258 + seatOffsetY);
    armLeft.setAttribute("x2", 300 + seatOffsetX);
    armLeft.setAttribute("y2", 280 + seatOffsetY);

    armRight.setAttribute("x1", 342 + seatOffsetX);
    armRight.setAttribute("y1", 258 + seatOffsetY);
    armRight.setAttribute("x2", 360 + seatOffsetX);
    armRight.setAttribute("y2", 280 + seatOffsetY);
  }
}

function setHighlight(ids){
  // 清除
  document.querySelectorAll(".highlight").forEach(el=>el.classList.remove("highlight"));
  ids.forEach(id=>{
    const el = document.getElementById(id);
    if(el){
      el.classList.add("highlight");
    }
  });
}

function setCaption(title, body, idx){
  captionTitle.textContent = title;
  captionBody.textContent = body;
  stepIndex.textContent = `${idx+1} / ${steps.length}`;
  stepName.textContent = steps[idx].name;
}

function gotoStep(idx){
  state.step = Math.max(0, Math.min(steps.length-1, idx));
  const s = steps[state.step];
  s.apply();
  applyTransforms();
  setHighlight(s.highlight || []);
  setCaption(s.title, s.desc, state.step);
  btnPrev.disabled = state.step === 0;
  btnNext.disabled = state.step === steps.length - 1;
}

function playAuto(){
  if(state.auto){
    // 停止
    state.auto = false;
    btnPlay.textContent = "自动播放";
    if(state.timer) clearInterval(state.timer);
    return;
  }
  // 开始
  state.auto = true;
  btnPlay.textContent = "暂停";
  state.timer = setInterval(()=>{
    if(state.step < steps.length - 1){
      gotoStep(state.step + 1);
    } else {
      // 循环回到第一步，给1秒停顿
      clearInterval(state.timer);
      setTimeout(()=>{
        if(state.auto){
          gotoStep(0);
          state.timer = setInterval(()=>{
            if(state.step < steps.length - 1){
              gotoStep(state.step + 1);
            } else {
              clearInterval(state.timer);
            }
          }, 2000);
        }
      }, 1000);
    }
  }, 2000);
}

btnPrev.addEventListener("click", ()=>gotoStep(state.step - 1));
btnNext.addEventListener("click", ()=>gotoStep(state.step + 1));
btnPlay.addEventListener("click", playAuto);

// 初始化
gotoStep(0);