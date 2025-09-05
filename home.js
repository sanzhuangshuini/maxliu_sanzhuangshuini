function setup() {
  var cavs = createCanvas(window.screen.width * 0.8, window.screen.height); //默认值分辨率。
  cavs.id("canvas"); //调用id使用css中设置的“canvas”style。
  cavs.parent(document.body); //把canvas挂载到html文件的body上。
}

function draw() { //只影响画布内。
  background(200);
  var box = new WorkBox(100, 100, 300, 200, "images/work1.png", "work1.html");
  box.display();
}

//停止的点：理解构造函数的应用。让图片/gif显示在home页面上。
//可以在一个文件里打包好构造函数，确保html文件先于其他文件引用构造函数文件即可。
