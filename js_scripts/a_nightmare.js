/*
  A Nightmare 作品页：滚动叙事 + 实时网点（dither）画面
  - 一个固定的 <canvas id="world"> 把游戏画面（静帧 / 视频）实时抖动成网点
  - 页面按滚动进度分章：入口 → 登车 → 爬升 → 最高点/俯冲 → 夜 → 多感官 → 片尾
  - 声音默认关闭，点左下角开关才会播放
*/
(function () {
  'use strict';

  var BASE = '../images_videos/multimedia_storytelling/a_nightmare/';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t * t * (3 - 2 * t); }
  function pad(n, l) { n = String(Math.round(n)); while (n.length < l) n = '0' + n; return n; }

  /* ================= 抖动核心 ================= */
  var BAYER = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21
  ];
  var THR = new Float32Array(64);
  for (var bi = 0; bi < 64; bi++) THR[bi] = (BAYER[bi] + 0.5) / 64 - 0.5;

  function pack(hex) {
    var n = parseInt(hex.slice(1), 16);
    return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255);
  }
  // 只有一条灰绿色的调色板，红色是唯一的强调色
  var GRAY = ['#0a0d10', '#273036', '#56676e', '#8da2a5', '#c9e0d4'].map(pack);
  var REDS = ['#250705', '#871a14', '#d72920'].map(pack);

  function ditherPixels(src, out, w, h, gain, lift, useRed, amt) {
    var GN = GRAY.length - 1, RN = REDS.length - 1;
    for (var y = 0; y < h; y++) {
      var row = (y & 7) << 3;
      for (var x = 0; x < w; x++) {
        var i = (y * w + x) * 4;
        var r = src[i], g = src[i + 1], b = src[i + 2];
        var t = THR[row | (x & 7)] * amt;
        var idx;
        if (useRed && r > 110 && r - g > 55 && r - b > 55) {
          idx = Math.round(clamp(r / 255 * RN * 1.15 + t, 0, RN));
          out[y * w + x] = REDS[idx];
        } else {
          var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          idx = Math.round(clamp(Math.pow(lum, lift) * gain * GN + t, 0, GN));
          out[y * w + x] = GRAY[idx];
        }
      }
    }
  }

  /* 把图片 / 视频以 cover 方式画到离屏画布，再抖动到目标画布 */
  function makeDitherer(canvas) {
    var ctx = canvas.getContext('2d');
    var off = document.createElement('canvas');
    var octx = off.getContext('2d', { willReadFrequently: true });
    var imgData = null, out = null, w = 0, h = 0;

    return {
      resize: function (nw, nh) {
        w = nw; h = nh;
        canvas.width = w; canvas.height = h;
        off.width = w; off.height = h;
        imgData = ctx.createImageData(w, h);
        out = new Uint32Array(imgData.data.buffer);
      },
      size: function () { return [w, h]; },
      draw: function (el, sw, sh, o) {
        o = o || {};
        var zoom = o.zoom || 1;
        var s = Math.max(w / sw, h / sh) * zoom;
        var dw = sw * s, dh = sh * s;
        var dx = w * (o.cx == null ? 0.5 : o.cx) - (o.ax == null ? 0.5 : o.ax) * dw + (o.jx || 0);
        var dy = h * (o.cy == null ? 0.5 : o.cy) - (o.ay == null ? 0.5 : o.ay) * dh + (o.jy || 0);
        dx = clamp(dx, w - dw, 0);
        dy = clamp(dy, h - dh, 0);
        octx.drawImage(el, dx, dy, dw, dh);
        var id;
        try {
          id = octx.getImageData(0, 0, w, h);
        } catch (e) {
          // 本地 file:// 打开时画布会被浏览器标记为跨域，退回成不抖动的原图
          ctx.drawImage(off, 0, 0);
          return;
        }
        ditherPixels(id.data, out, w, h, o.gain || 1, o.lift || 1, o.red !== false, o.amt == null ? 1 : o.amt);
        ctx.putImageData(imgData, 0, 0);
      }
    };
  }

  /* ================= 世界画布 ================= */
  var world = $('#world');
  var worldD = makeDitherer(world);
  var video = $('#rideVideo');
  var heroImg = new Image();
  var heroReady = false;
  heroImg.onload = function () { heroReady = true; };
  heroImg.src = BASE + 'shot_01.jpg';

  var ps = 4;
  function sizeWorld(nps) {
    ps = nps;
    worldD.resize(Math.ceil(window.innerWidth / ps), Math.ceil(window.innerHeight / ps));
  }
  sizeWorld(4);

  /* ================= 章节 & 滚动进度 ================= */
  var S = {
    hero: $('#s-hero'), board: $('#s-board'), climb: $('#s-climb'),
    drop: $('#s-drop'), night: $('#s-night'), system: $('#s-system'), end: $('#s-end'),
    title: $('#s-title')
  };
  var ORDER = ['hero', 'board', 'climb', 'drop', 'night', 'system', 'end', 'title'];

  function prog(r) {
    var m = r.height - window.innerHeight;
    return m > 0 ? clamp(-r.top / m, 0, 1) : 0;
  }

  var CUT = 0.84;      // 俯冲到这个进度时硬切成夜
  var PLUNGE_AT = 0.42; // 最高点停留 → 开始俯冲
  var CLIMB_LOOP_END = 36;
  var PEAK_FRAME = 46;
  var PLUNGE_FROM = 51; // 俯冲段从 51 秒播到视频结尾（54.8 秒，落进雾里为止；再往后就是车内画面）

  var phase = '';
  var t0 = performance.now();

  // 开场自动编排：点击、滚动或按键就直接跳到完整状态
  var heroStage = $('.hero-stage');
  function skipIntro() { heroStage.classList.add('skip'); }
  if (window.scrollY > 40 || reduce) skipIntro();
  ['wheel', 'touchstart', 'keydown', 'pointerdown', 'scroll'].forEach(function (ev) {
    window.addEventListener(ev, skipIntro, { once: true, passive: true });
  });

  // 6MB 的视频不在第一屏加载，等访客开始往下滚再下载，避免和首屏抢带宽、抢解码
  var videoRequested = false;
  function requestVideo() {
    if (videoRequested) return;
    videoRequested = true;
    video.preload = 'auto';
    video.load();
  }
  function enterPhase(p) {
    try {
      if (p === 'climb') { video.currentTime = 0; video.play().catch(function () { }); }
      else if (p === 'peak') { video.pause(); video.currentTime = PEAK_FRAME; }
      else if (p === 'plunge') { video.currentTime = PLUNGE_FROM; video.play().catch(function () { }); }
      else { video.pause(); }
    } catch (e) { }
    phase = p;
  }

  /* ================= 声音（默认关闭） ================= */
  var SND = {
    park: { f: 'park.mp3', loop: true },
    climb: { f: 'climb.mp3', loop: true },
    alt: { f: 'altitude_wind.mp3', loop: true },
    pw: { f: 'plunge_wind.mp3', loop: true },
    pr: { f: 'plunge_rumble.mp3', loop: true },
    rain: { f: 'rain.mp3', loop: true },
    jolt: { f: 'jolt.mp3', loop: false },
    breath: { f: 'breath_shock.mp3', loop: false }
  };
  var soundOn = false, audioReady = false;
  var soundBtn = $('#soundBtn');

  function ensureAudio() {
    if (audioReady) return;
    for (var k in SND) {
      var a = new Audio(BASE + SND[k].f);
      a.loop = SND[k].loop;
      a.preload = 'auto';
      a.volume = 0;
      SND[k].a = a;
      SND[k].cur = 0;
      SND[k].tgt = 0;
    }
    audioReady = true;
  }

  function updateSoundBtn() {
    var mini = soundBtn.classList.contains('mini');
    soundBtn.textContent = mini
      ? (soundOn ? 'sound on' : 'sound off')
      : (soundOn ? "the sound is on. (turn it off?)" : 'turn the sound on?');
  }
  // 第一屏是一句问话，滚开之后缩成左下角的一小行字
  function setSoundMini(mini) {
    if (soundBtn.classList.contains('mini') === mini) return;
    soundBtn.classList.toggle('mini', mini);
    soundBtn.classList.toggle('invite', !mini);
    updateSoundBtn();
  }
  updateSoundBtn();

  soundBtn.addEventListener('click', function () {
    soundOn = !soundOn;
    updateSoundBtn();
    ensureAudio();
    for (var k in SND) {
      if (!SND[k].loop) continue;
      if (soundOn) SND[k].a.play().catch(function () { });
      else SND[k].a.pause();
    }
  });

  function setTargets(map) {
    if (!audioReady) return;
    for (var k in SND) SND[k].tgt = map[k] || 0;
  }
  function tickAudio() {
    if (!audioReady) return;
    for (var k in SND) {
      var s = SND[k];
      if (!s.loop) continue;
      s.cur += ((soundOn ? s.tgt : 0) - s.cur) * 0.06;
      s.a.volume = clamp(s.cur, 0, 1);
    }
  }
  function playOnce(key, vol) {
    if (!soundOn || !audioReady) return;
    var a = SND[key].a;
    try { a.currentTime = 0; a.volume = vol; a.play().catch(function () { }); } catch (e) { }
  }
  function stopOnce(key) {
    if (!audioReady) return;
    var a = SND[key].a;
    try { a.pause(); a.currentTime = 0; } catch (e) { }
  }

  /* ================= 各章的元素 ================= */
  var heroTag = $('.hero-tag');
  var finalTitle = $('#finalTitle');
  var rules = $$('.rules li'), lapbar = $('.lapbar');
  var climbRow = $('.climb-row');
  var dropStage = $('#dropStage'), peakText = $('#peakText'), fallText = $('#fallText');
  var logLines = $$('#log div'), nightBig = $('#nightBig');

  var locked = false;
  var cutPlayed = false;
  var titlePlaying = false;

  /* ---- 多感官：滚到哪一句，照片上就"画"出对应的红色笔迹 ---- */
  var notes = $$('#notes li');
  var sysMark = $('#sysMark'), sysNames = $$('#sysNames span');

  function updateSystem(p) {
    var idx = Math.floor(clamp(p * 3.999, 0, 3.999));
    for (var n = 0; n < notes.length; n++) notes[n].classList.toggle('on', n === idx);
    for (var m = 0; m < sysNames.length; m++) sysNames[m].classList.toggle('on', m === idx);
    sysMark.style.left = (p * 100).toFixed(1) + '%';
  }

  /* ================= 主循环 ================= */
  var lastDraw = 0;
  var cutY = 0;

  function frame(now) {
    window.requestAnimationFrame(frame);

    var vh = window.innerHeight;
    var rh = S.hero.getBoundingClientRect();
    var rb = S.board.getBoundingClientRect();
    var rc = S.climb.getBoundingClientRect();
    var rd = S.drop.getBoundingClientRect();
    var rn = S.night.getBoundingClientRect();
    var rs = S.system.getBoundingClientRect();
    var re = S.end.getBoundingClientRect();
    var rtl = S.title.getBoundingClientRect();

    var heroP = prog(rh), boardP = prog(rb), climbP = prog(rc), dropP = prog(rd);
    if (!videoRequested && heroP > 0.04) requestVideo();
    var nightP = prog(rn), sysP = prog(rs), titleP = prog(rtl);

    var isNight = dropP >= CUT;
    document.body.classList.toggle('night', isNight);

    /* --- 当前处于哪一章 --- */
    var cur = 'hero';
    var tops = { hero: rh.top, board: rb.top, climb: rc.top, drop: rd.top, night: rn.top, system: rs.top, end: re.top, title: rtl.top };
    for (var oi = 0; oi < ORDER.length; oi++) { if (tops[ORDER[oi]] <= vh * 0.5) cur = ORDER[oi]; }

    /* --- 阶段（决定画面来源和视频动作） --- */
    var np;
    if (isNight) np = 'night';
    else if (rd.top <= 0 && dropP >= PLUNGE_AT) np = 'plunge';
    else if (rd.top < vh * 0.9) np = 'peak';
    else if (rc.top < vh) np = 'climb';
    else np = 'still';
    if (np !== phase) enterPhase(np);

    if (phase === 'climb' && video.currentTime > CLIMB_LOOP_END) {
      try { video.currentTime = 0; } catch (e) { }
    }

    document.body.classList.toggle('tone-light', cur !== 'hero');

    /* --- 00 入口 --- */
    heroTag.style.opacity = 1 - clamp(heroP * 1.8, 0, 1);
    setSoundMini(heroP > 0.12);

    /* --- 片名定版：像预告片结尾，字距收拢、淡入 --- */
    // 片名自己播放：页面滚到它的时候开始（不跟着滚动走），滚远了就复位，回来会重播
    if (!titlePlaying && rtl.top < vh * 0.3) { titlePlaying = true; finalTitle.classList.add('play'); }
    else if (titlePlaying && rtl.top > vh * 0.95) { titlePlaying = false; finalTitle.classList.remove('play'); }

    /* --- 01 登车 --- */
    for (var ri = 0; ri < rules.length; ri++) rules[ri].classList.toggle('on', boardP > 0.1 + ri * 0.13);
    var barT = ease(clamp((boardP - 0.2) / 0.62, 0, 1));
    lapbar.style.top = lerp(-20, 78, barT).toFixed(2) + 'vh';
    var nowLocked = boardP >= 0.86;
    if (nowLocked && !locked) playOnce('jolt', 0.8);
    locked = nowLocked;
    lapbar.classList.toggle('locked', locked);

    /* --- 02 爬升 --- */
    climbRow.style.transform = 'translateX(' + (-climbP * 300).toFixed(2) + 'vw)';

    /* --- 03 最高点 / 俯冲 --- */
    peakText.classList.toggle('on', phase === 'peak' && rd.top <= 0);
    fallText.classList.toggle('on', phase === 'plunge');
    var shaking = phase === 'plunge' && !reduce;
    dropStage.classList.toggle('shake', shaking);

    /* --- 夜 --- */
    var shown = Math.floor(nightP * 7);
    for (var li = 0; li < logLines.length; li++) logLines[li].classList.toggle('on', shown > li || nightP > 0.5);
    nightBig.classList.toggle('on', nightP > 0.45);

    /* --- 04 多感官 --- */
    updateSystem(sysP, now);

    /* --- 硬切后的黑屏：一声受惊的喘息，只播一次；往回滚到切换之前就复位 --- */
    if (phase === 'night' && !cutPlayed) { cutPlayed = true; playOnce('breath', 0.95); }
    else if (phase !== 'night' && cutPlayed) { cutPlayed = false; stopOnce('breath'); }

    /* --- 声音目标 --- */
    var tg = {};
    if (cur === 'hero' || cur === 'board') tg = { park: 0.55 };
    else if (phase === 'climb' || cur === 'climb') tg = { climb: 0.6, alt: 0.25 };
    else if (phase === 'peak') tg = { alt: 0.4, climb: 0.1 };
    else if (phase === 'plunge') tg = { pw: 0.9, pr: 0.8 };
    else if (cur === 'end') tg = { rain: 0.25 };
    else if (cur === 'title') tg = { rain: 0.15 };
    else if (cur === 'drop') tg = {};
    else tg = { rain: 0.45 };
    setTargets(tg);
    tickAudio();

    /* --- 世界画布：只在需要时绘制，约 30 帧/秒 --- */
    if (isNight) return;
    if (now - lastDraw < 70) return; // 约 14 帧/秒：故意粗糙，像逐帧拍的
    lastDraw = now;

    var sourceReady = phase === 'still' ? heroReady : (video.readyState >= 2 && video.videoWidth > 0);
    if (!sourceReady) return;

    // 登车时画面逐渐变暗；爬升开始时从同样的暗度渐亮，避免白闪
    // 开场就是压暗的（0.45），让薄荷色的字浮出来；登车时继续变到最暗（1）
    var dark = 0.45 + 0.55 * ease(clamp(boardP / 0.75, 0, 1));
    var enter = ease(clamp(1 - rc.top / vh, 0, 1));

    var wantPs;
    if (phase === 'still') wantPs = Math.round(lerp(4, 6, Math.max(heroP, (dark - 0.45) / 0.55)));
    else if (phase === 'climb') wantPs = Math.round(lerp(4, 6, climbP));
    else if (phase === 'peak') wantPs = Math.round(lerp(6, 10, clamp(dropP / PLUNGE_AT, 0, 1)));
    else wantPs = 5;
    if (wantPs !== ps) sizeWorld(wantPs);

    var sz = worldD.size();
    if (phase === 'still') {
      // 画面自己慢慢向铁轨推近（不依赖滚动）：像过山车刚刚开始动，再加一点几乎看不见的手持抖动
      var elapsed = (now - t0) / 1000;
      var push = reduce ? 0 : 0.3 * (1 - Math.exp(-elapsed / 10));
      var tremor = reduce ? 0 : sz[0] * 0.005;
      worldD.draw(heroImg, heroImg.naturalWidth, heroImg.naturalHeight, {
        zoom: 1 + heroP * 1.1 + push, ax: 0.49, ay: 0.62, cx: 0.5, cy: 0.6,
        gain: lerp(1.05, 0.26, dark), lift: lerp(0.9, 1.5, dark),
        jx: (Math.random() - 0.5) * tremor, jy: (Math.random() - 0.5) * tremor
      });
    } else {
      var j = shaking ? sz[0] * 0.012 : 0;
      var mix = phase === 'climb' ? enter : 1;
      worldD.draw(video, video.videoWidth, video.videoHeight, {
        zoom: 1.02, gain: lerp(0.26, 1.35, mix), lift: lerp(1.5, 0.78, mix),
        jx: (Math.random() - 0.5) * j, jy: (Math.random() - 0.5) * j
      });
    }
  }
  window.requestAnimationFrame(frame);

  /* ================= 静态抖动图（设备照片、剧照） ================= */
  function ditherStatic(canvas, img, targetPx, gain, lift, red, amt) {
    var host = canvas.parentElement;
    var cw = host.clientWidth || 800;
    var ch = cw * img.naturalHeight / img.naturalWidth;
    var d = makeDitherer(canvas);
    d.resize(Math.ceil(cw / targetPx), Math.ceil(ch / targetPx));
    d.draw(img, img.naturalWidth, img.naturalHeight, { gain: gain, lift: lift, red: red, amt: amt });
  }

  function loadImage(src, cb) {
    var im = new Image();
    im.onload = function () { cb(im); };
    im.src = src;
  }

  var statics = [];
  function setupStatics() {
    loadImage(BASE + 'setup_02.jpg', function (im) {
      var c = $('#setupCanvas');
      // 设备照片：更细的网点 + 更轻的抖动，看得清楚
      statics.push(function () { ditherStatic(c, im, 2, 1.2, 0.8, false, 0.6); });
      ditherStatic(c, im, 2, 1.2, 0.8, false, 0.6);
    });
    $$('.still canvas').forEach(function (c) {
      loadImage(c.getAttribute('data-src'), function (im) {
        statics.push(function () { ditherStatic(c, im, 3, 1.05, 0.9); });
        ditherStatic(c, im, 3, 1.05, 0.9);
      });
    });
  }
  // 页面下方的照片和剧照不急着处理：首屏画完、浏览器空闲之后再做
  (window.requestIdleCallback || function (fn) { return window.setTimeout(fn, 1200); })(setupStatics, { timeout: 3000 });

  /* ---- 照片上的红点：悬浮时右边对应的那句话亮起 ---- */
  function highlightNote(pt) {
    var i = parseInt(pt.getAttribute('data-note'), 10);
    notes.forEach(function (li, n) { li.classList.toggle('hl', n === i); });
  }
  function clearNote() {
    notes.forEach(function (li) { li.classList.remove('hl'); });
  }
  $$('.pt').forEach(function (pt) {
    pt.addEventListener('pointerenter', function () { highlightNote(pt); });
    pt.addEventListener('pointerleave', clearNote);
    pt.addEventListener('focus', function () { highlightNote(pt); });
    pt.addEventListener('blur', clearNote);
  });

  /* ---- 片尾内容滚进视野时轻轻升起 ---- */
  if ('IntersectionObserver' in window && !reduce) {
    var revealEls = $$('.still, .credits .tag, .credits .about, .roll .row, .specs');
    revealEls.forEach(function (el) { el.classList.add('reveal'); });
    $$('.roll .row').forEach(function (el, i) { el.style.transitionDelay = (i * 0.08) + 's'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  var rt = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () {
      sizeWorld(ps);
      statics.forEach(function (fn) { fn(); });
    }, 150);
  });
})();
