// ===== BlogBox.js (fixed-size thumbnail with cover crop) =====
function BlogBox (title, date, previewText, thumbUrl, url) {
  this.title = title;
  this.date = date;
  this.content = previewText;        // 预览文本
  this.thumbUrl = thumbUrl || null;  // 缩略图 URL（从详情第一张图抽取/或兜底）
  this.url = url || null;

  this.img = null;
  this._bounds = {x:0,y:0,w:0,h:0};

  if (this.thumbUrl) {
    this.img = loadImage(this.thumbUrl);
  }

  // 在固定展示区域内，以 cover 方式裁剪绘制图片
  this._drawImageCover = function(img, dx, dy, dw, dh) {
    // 图片/容器宽高比
    const ir = img.width / img.height;
    const dr = dw / dh;

    let sx, sy, sw, sh;
    if (ir > dr) {
      // 图比容器更“宽”，裁掉两侧
      sh = img.height;
      sw = sh * dr;
      sx = (img.width - sw) / 2;
      sy = 0;
    } else {
      // 图比容器更“高”，裁掉上下
      sw = img.width;
      sh = sw / dr;
      sx = 0;
      sy = (img.height - sh) / 2;
    }
    image(img, dx, dy, dw, dh, sx, sy, sw, sh);
  };

  this.display = function (x, y, boxW, boxH) {
    const w = (boxW === undefined) ? width * 0.9 : boxW;
    const h = (boxH === undefined) ? height * 0.2 : boxH;
    this._bounds = {x, y, w, h};

    // 外框
    noStroke();
    fill(255);
    rect(x, y, w, h);

    // 右侧固定缩略图区域（固定尺寸，cover）
    const pad = 12;
    const thumbW = Math.floor(w * 0.18);              // 右侧占 18% 宽
    const thumbH = Math.max(96, Math.floor(h - 40));  // 留出上下内边距
    const thumbX = x + w - pad - thumbW;
    const thumbY = y + 20;

    // 左侧文字区域宽度（避开缩略图）
    const textRightLimit = thumbX - pad;

    // 标题
    noStroke();
    fill(0);
    textSize(width * 0.015);
    textStyle(BOLD);
    text(this.title, x + 10, y + 30);

    // 日期
    textSize(width * 0.01);
    textStyle(NORMAL);
    fill(100);
    text(this.date, x + 10, y + 50);

    // 预览内容
    textSize(width * 0.012);
    fill(50);
    textWrap(WORD);
    const previewMaxW = Math.max(60, textRightLimit - (x + 10));
    text(this.content, x + 10, y + 70, previewMaxW);

    // 缩略图（cover 裁剪绘制）
    if (this.img) {
      noStroke();
      // 可选：背景框，增强统一感
      fill(240);
      rect(thumbX, thumbY, thumbW, thumbH);
      this._drawImageCover(this.img, thumbX, thumbY, thumbW, thumbH);
    }
  };

  this.contains = function(mx, my){
    const b = this._bounds;
    return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  };
}
