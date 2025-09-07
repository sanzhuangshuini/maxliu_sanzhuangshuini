function BlogBox (title, date, previewText, imgPath, url) {
  this.title = title;
  this.date = date;
  this.content = previewText;   // 这里传入的就是“预览文本”。
  this.imgPath = imgPath;
  this.url = url || null;

  this.img = null;
  this._bounds = {x:0,y:0,w:0,h:0};

  if (this.imgPath) {
    this.img = loadImage(this.imgPath);
  }

  this.display = function (x, y, boxW, boxH) {
    const w = (boxW === undefined) ? width * 0.9 : boxW;
    const h = (boxH === undefined) ? height * 0.2 : boxH;
    this._bounds = {x, y, w, h};

    // 外框
    stroke(200);
    fill(250);
    rect(x, y, w, h);

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
    text(this.content, x + 10, y + 70, w - 20);

    // 图片（如果有，保持固定比例缩放）
    if (this.img) {
      let imgW = w * 0.15;
      let imgH = imgW * (this.img.height / this.img.width);
      image(this.img, x + w - imgW, y + 20, imgW, imgH);
    }
  };

  this.contains = function(mx, my){
    const b = this._bounds;
    return mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;
  };
}
