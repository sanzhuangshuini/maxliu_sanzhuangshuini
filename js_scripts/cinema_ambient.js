/*
  Cinema 内嵌视频区的氛围背景（毛玻璃/氛围光效果）
  做法：把视频画面画到一个很小的 <canvas> 上，再用 CSS 拉伸铺满黑块，
  小图放大天然就是模糊的，所以不需要再叠加 CSS blur，开销很低。
  样式在 css_styles/style.css 的 .cinema-ambient 里统一管理。
*/
(function () {
  var section = document.querySelector('.cinema-section');
  var video = section && section.querySelector('video');
  if (!video) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'cinema-ambient';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = 256;
  canvas.height = 144;
  section.insertBefore(canvas, section.firstChild);

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var INTERVAL = 66; // 毫秒，≈15 帧/秒
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // 封面图：视频还没出画面时先用 poster 垫底
  var posterImg = null;
  if (video.poster) {
    posterImg = new Image();
    posterImg.onload = drawFrame;
    posterImg.src = video.poster;
  }

  function drawFrame() {
    if (video.readyState >= 2 && video.videoWidth) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else if (posterImg && posterImg.complete && posterImg.naturalWidth) {
      ctx.drawImage(posterImg, 0, 0, canvas.width, canvas.height);
    }
  }

  var rafId = 0;
  var lastDraw = 0;
  var inView = true;

  function loop(now) {
    rafId = 0;
    if (video.paused || video.ended || !inView || document.hidden) return;
    if (now - lastDraw >= INTERVAL) {
      lastDraw = now;
      drawFrame();
    }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion.matches) return;
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  video.addEventListener('play', start);
  video.addEventListener('playing', start);
  video.addEventListener('pause', drawFrame);
  video.addEventListener('ended', drawFrame);
  video.addEventListener('seeked', drawFrame);
  video.addEventListener('loadeddata', drawFrame);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !video.paused) start();
  });

  // 滑出屏幕时暂停刷新
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView && !video.paused) start();
    }).observe(section);
  }

  drawFrame();
})();
