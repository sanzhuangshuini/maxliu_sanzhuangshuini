let images = [];
let currentScene = "scene1"; // 初始场景
let affection = 0; // 好感度分数

function preload() {
  // 依次加载 7 张图片
  for (let i = 1; i <= 7; i++) {
    images[i] = loadImage("img" + i + ".png");
  }
}

function setup() {
  createCanvas(800, 600);
  textAlign(CENTER, CENTER);
  textSize(24);
  noStroke();
}

function draw() {
  background(220);

  // 显示右上角的好感度
  fill(0);
  textAlign(RIGHT, TOP);
  text("好感度: " + affection, width - 20, 20);

  // 根据场景显示内容
  textAlign(CENTER, CENTER);
  if (currentScene === "scene1") {
    image(images[1], 0, 0, width, height);
    text("你要怎么做？", width / 2, height - 150);
    drawChoice("选择 A", width / 2, height - 100);
    drawChoice("选择 B", width / 2, height - 60);
  } else if (currentScene === "scene2") {
    image(images[2], 0, 0, width, height);
    text("你会怎么选择？", width / 2, height - 150);
    drawChoice("选择 C", width / 2, height - 100);
    drawChoice("选择 D", width / 2, height - 60);
  } else if (currentScene === "scene3") {
    image(images[5], 0, 0, width, height);
    text("接下来呢？", width / 2, height - 150);
    drawChoice("选择 E", width / 2, height - 100);
    drawChoice("选择 F", width / 2, height - 60);
  } else if (currentScene === "ending1") {
    image(images[3], 0, 0, width, height);
    text("结局 1：这是你的命运。", width / 2, height - 100);
  } else if (currentScene === "ending2") {
    image(images[4], 0, 0, width, height);
    text("结局 2：另一条道路。", width / 2, height - 100);
  } else if (currentScene === "ending3") {
    image(images[6], 0, 0, width, height);
    text("结局 3：新的开始。", width / 2, height - 100);
  } else if (currentScene === "ending4") {
    image(images[7], 0, 0, width, height);
    text("结局 4：未知的旅程。", width / 2, height - 100);
  }
}

// 绘制选项文字（但检测区域更大）
function drawChoice(label, x, y) {
  fill(0);
  text(label, x, y);
}

// 鼠标点击检测
function mousePressed() {
  if (currentScene === "scene1") {
    if (isHover(width / 2, height - 100)) {
      currentScene = "scene2";
      affection += 6; // A
    } else if (isHover(width / 2, height - 60)) {
      currentScene = "scene3";
      affection += 6; // B
    }
  } else if (currentScene === "scene2") {
    if (isHover(width / 2, height - 100)) {
      currentScene = "ending1";
      affection += 4; // C
    } else if (isHover(width / 2, height - 60)) {
      currentScene = "ending2";
      affection += 2; // D
    }
  } else if (currentScene === "scene3") {
    if (isHover(width / 2, height - 100)) {
      currentScene = "ending3";
      affection += 2; // E
    } else if (isHover(width / 2, height - 60)) {
      currentScene = "ending4";
      affection += 6; // F
    }
  }
}

// 检测鼠标是否点击到文字附近（隐形范围）
function isHover(x, y) {
  let rangeX = 100;
  let rangeY = 20;
  return mouseX > x - rangeX && mouseX < x + rangeX &&
         mouseY > y - rangeY && mouseY < y + rangeY;
}
