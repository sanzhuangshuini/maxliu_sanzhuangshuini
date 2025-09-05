var blogPosts = [];
var blogData;

function preload() {
  // 一定要用字符串
  blogData = loadJSON("blog_data.json");
}

function setup() {
  var canvasParent = document.getElementById("canvas");
  var cnv = createCanvas(800, 800);
  cnv.parent(canvasParent);

  for (let post of blogData) {
    if (post.categories.includes("all")) {
      blogPosts.push(new BlogBox(
        post.title,
        post.date,
        post.content,
        post.imgPath
      ));
    }
  }
}

function draw() {
  background(255);

  var yOffset = 20;
  for (var post of blogPosts) {
    post.display(20, yOffset, 760, 180);
    yOffset += 200;
  }
}
