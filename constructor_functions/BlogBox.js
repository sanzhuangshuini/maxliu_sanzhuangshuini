class BlogBox {
  constructor(title, date, content, imgPath) {
    this.title = title;
    this.date = date;
    this.content = content;
    this.imgPath = imgPath;
    this.img = null;

    // 如果有图片，先加载
    if (this.imgPath) {
      this.img = loadImage(this.imgPath);
    }
  }

  display(x, y, w, h) {
    // 外框
    stroke(200);
    fill(250);
    rect(x, y, w, h);

    // 标题
    noStroke();
    fill(0);
    textSize(18);
    textStyle(BOLD);
    text(this.title, x + 10, y + 30);

    // 日期
    textSize(12);
    textStyle(NORMAL);
    fill(100);
    text(this.date, x + 10, y + 50);

    // 内容
    textSize(14);
    fill(50);
    text(this.content, x + 10, y + 70, w - 20);

    // 图片（如果有）
    if (this.img) {
      image(this.img, x + w - 150, y + 30, 130, 100);
    }
  }
}
