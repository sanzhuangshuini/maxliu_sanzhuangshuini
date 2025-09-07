var blogPosts = [];
var dataReady = false;

// 解析 URL 参数。
const params = new URLSearchParams(window.location.search);
const paramCategory = params.get("category");     // 列表模式使用。
const paramSlug     = params.get("slug");         // 详情模式优先。
const paramUrl      = params.get("url");          // 详情模式（退化）。
const paramTitle    = params.get("title");        // 详情模式（兜底）。

// 列表模式下的分类（默认 all）。
var currentCategory = paramCategory || "all";

// 工具：将任何形态的数据统一为“真数组” 。
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  var keys = Object.keys(data);
  if (keys.length > 0) {
    return keys
      .sort(function(a, b){ return Number(a) - Number(b); })
      .map(function(k){ return data[k]; });
  }

  var out = [];
  var i = 0;
  while (data[i] !== undefined) { out.push(data[i]); i++; }
  return out;
}

// 工具：去掉 HTML 标签（用于做纯文本预览）。
function stripTags(htmlOrText) {
  if (!htmlOrText) return "";
  return String(htmlOrText).replace(/<[^>]*>/g, "");
}

// 工具：根据字符数截断到“词边界”，并补省略号。
function makePreview(text, maxChars) {
  const clean = stripTags(text).trim();
  if (clean.length <= maxChars) return clean;
  // 找到 maxChars 之前最近的空格，避免截断半个词。
  let cut = clean.lastIndexOf(" ", maxChars);
  if (cut < 0) cut = maxChars;
  return clean.slice(0, cut) + "…";
}

// 渲染“详情模式”（不用 p5 画全文，用 DOM 更合适）。
function renderDetail(post) {
  // 清空画布容器，改用 DOM 渲染
  const host = document.getElementById("canvas");
  host.innerHTML = "";
  // 可选：如果之前创建了 p5 画布，缩成 1 像素高度避免干扰滚动条。
  if (window._p5cnv) { try { window._p5cnv.resizeCanvas(window._p5cnv.width, 1); } catch(e){} }

  const wrap = document.createElement("article");
  wrap.style.maxWidth = "900px";
  wrap.style.margin = "80px auto";
  wrap.style.padding = "0 20px";
  wrap.style.lineHeight = "1.7";
  wrap.innerHTML = `
    <h1 style="margin:0 0 8px;">${post.title || ""}</h1>
    <div style="color:#666;margin-bottom:24px;">${post.date || ""}</div>
    ${post.imgPath ? `<img src="${post.imgPath}" style="max-width:100%;height:auto;margin:16px 0;" alt="">` : ""}
    <div>${post.contentHTML ? post.contentHTML : (post.content ? `<p>${post.content}</p>` : "")}</div>
  `;
  host.appendChild(wrap);
}

// p5：setup（列表模式需要画卡片；详情模式直接 DOM 渲染）。
function setup() {
  // 如果是“详情模式”，不必创建大画布
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);

  var canvasParent = document.getElementById("canvas");
  var cnv = createCanvas(window.screen.width * 0.8, isDetail ? 1 : window.screen.height);
  window._p5cnv = cnv; // 供 renderDetail 可选缩放。
  cnv.id("canvas_cnv");
  cnv.parent(canvasParent);

  if (!isDetail) {
    background(255);
    fill(60);
    textSize(14);
    text("Loading posts…", 20, 30);
  }

  loadJSON("blog_data.json",
    function onSuccess(raw) {
      var data = normalizeToArray(raw);

      // 详情模式：直接找到目标并渲染。
      if (isDetail) {
        // 支持 slug / url / title 的定位顺序。
        let post = null;
        if (paramSlug) post = data.find(p => p && p.slug === paramSlug);
        if (!post && paramUrl)   post = data.find(p => p && p.url  === paramUrl);
        if (!post && paramTitle) post = data.find(p => p && p.title === paramTitle);

        if (!post) {
          // 兜底：用当前路径最后一段匹配 url.endsWith。
          const path = location.pathname.replace(/^.*\//,'');
          post = data.find(p => p && p.url && p.url.endsWith(path));
        }

        if (post) {
          renderDetail(post);
          dataReady = true;
          return;
        } else {
          // 没找到：给出提示。
          const host = document.getElementById("canvas");
          host.innerHTML = `<p style="padding:40px;color:#900">Post not found.</p>`;
          console.error("✖ Detail: post not found.");
          dataReady = true;
          return;
        }
      }

      // 列表模式：按分类收集并生成预览。
      for (var i = 0; i < data.length; i++) {
        var post = data[i];
        if (!post) continue;

        var hit = Array.isArray(post.categories) && post.categories.includes(currentCategory);
        if (hit) {
          // 用全文生成“预览文本”。
          const preview = makePreview(post.contentHTML || post.content || "", 160);
          // 生成详情链接：优先 slug → 否则 url → 否则 title。
          const link = post.slug
            ? (`${location.pathname}?slug=${encodeURIComponent(post.slug)}`)
            : (post.url ? `${location.pathname}?url=${encodeURIComponent(post.url)}`
                        : `${location.pathname}?title=${encodeURIComponent(post.title || "")}`);

          blogPosts.push(new BlogBox(
            post.title, post.date, preview, post.imgPath, link
          ));
        }
      }

      // 动态调整画布高度（每条约 200 高，最小 800）。
      var neededH = Math.max(800, 40 + blogPosts.length * 200);
      resizeCanvas(width, neededH);

      dataReady = true;
    },
    function onError(err) {
      background(255, 230, 230);
      fill(160, 0, 0);
      text("Failed to load blog_data.json", 20, 30);
      console.error("✖ loadJSON 失败：", err);
      dataReady = true;
    }
  );
}

function draw() {
  // 详情模式下不需要用 p5 画东西。
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  background("#fff");

  if (!dataReady) {
    fill(80);
    text("Loading posts…", 20, 30);
    return;
  }

  const BOX_WIDTH_RATIO = 1;
  const H_MARGIN_RATIO  = 0.01;
  const V_MARGIN_RATIO  = 0.05;
  const GAP_RATIO       = 0.03;

  const marginX = Math.max(0, Math.floor(width * H_MARGIN_RATIO));
  const marginY = Math.max(12, Math.floor(width * V_MARGIN_RATIO));
  const gap     = Math.max(12, Math.floor(width * GAP_RATIO));

  let boxW = Math.floor(width * BOX_WIDTH_RATIO);
  const maxBoxW = width - marginX * 2;
  if (boxW > maxBoxW) boxW = maxBoxW;

  const boxH = Math.max(140, Math.min(320, Math.floor(width * 0.22)));

  const neededH = Math.max(400, marginY + (boxH + gap) * blogPosts.length);
  if (height !== neededH) resizeCanvas(width, neededH);

  const x = marginX;

  let y = marginY;
  for (let i = 0; i < blogPosts.length; i++) {
    blogPosts[i].display(x, y, boxW, boxH);
    y += boxH + gap;
  }

  if (blogPosts.length === 0) {
    fill(120);
    text("No posts for category: " + currentCategory, marginX || 12, marginY || 20);
  }
}

// 交互：悬停高亮 & 点击跳转（列表模式） 。
function mouseMoved(){
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  let over = blogPosts.some(b => b.contains && b.contains(mouseX, mouseY));
  cursor(over ? 'pointer' : 'default');
}

function mousePressed(){
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  for (let i = 0; i < blogPosts.length; i++){
    const b = blogPosts[i];
    if (b.contains && b.contains(mouseX, mouseY) && b.url){
      window.location.href = b.url; // 跳到同页 + 参数，进入详情模式。
      return;
    }
  }
}
