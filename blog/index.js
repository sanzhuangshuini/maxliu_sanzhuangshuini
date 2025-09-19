// ===== index.js (extract first image + fixed thumbnail cover) =====
var blogPosts = [];
var dataReady = false;

const params = new URLSearchParams(window.location.search);
const paramCategory = params.get("category");
const paramSlug     = params.get("slug");
const paramUrl      = params.get("url");
const paramTitle    = params.get("title");
var currentCategory = paramCategory || "all";

// ---------- Utils ----------
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const keys = Object.keys(data);
  if (keys.length > 0) {
    return keys.sort((a,b)=>Number(a)-Number(b)).map(k=>data[k]);
  }
  const out=[]; let i=0; while (data[i] !== undefined) { out.push(data[i]); i++; }
  return out;
}
function stripTags(htmlOrText){ return String(htmlOrText || "").replace(/<[^>]*>/g, ""); }

function makePreview(text, maxChars) {
  // 1. 把段落和换行标签替换成 \n
  text = text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '');

  // 2. 去掉所有其他 HTML 标签
  let clean = text.replace(/<[^>]+>/g, '').trim();

  // 3. 合并连续换行，多余的空格也压缩
  clean = clean.replace(/\n\s*\n+/g, '\n'); // 连续空行只留一个
  clean = clean.replace(/[ \t]+/g, ' ');    // 压缩多余空格

  // 4. 截断处理
  if (clean.length <= maxChars) return clean;

  let cut = clean.lastIndexOf(" ", maxChars);
  if (cut < 0) cut = maxChars;
  return clean.slice(0, cut) + "…";
}


async function fetchText(url){
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error("Fetch failed: " + url);
  return await r.text();
}
// 从 HTML 中提取第一张图片（返回绝对 URL）
function extractFirstImageSrc(html, baseHref){
  if (!html) return null;
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const img = doc.querySelector("img");
  if (!img || !img.getAttribute("src")) return null;
  try { return new URL(img.getAttribute("src"), baseHref).href; }
  catch(e){ return img.getAttribute("src"); }
}

// ---------- Detail render (不强插头图) ----------
async function renderDetail(post) {
  const host = document.getElementById("canvas");
  host.innerHTML = "";
  if (window._p5cnv) { try { window._p5cnv.resizeCanvas(window._p5cnv.width, 1); } catch(e){} }

  let bodyHTML = "";
  if (post.contentHTML) {
    bodyHTML = post.contentHTML;
  } else if (post.contentFile) {
    try { bodyHTML = await fetchText(post.contentFile); }
    catch (e) {
      console.error(e);
      bodyHTML = `<p style="color:#900">Failed to load content file: ${post.contentFile}</p>`;
    }
  } else if (post.content) {
    bodyHTML = String(post.content).replace(/\n/g, "<br>");
  }

  const wrap = document.createElement("article");
  wrap.style.maxWidth = "100%";
  wrap.style.margin = "80px auto";
  wrap.style.padding = "0 20px";
  wrap.style.lineHeight = "1.7";
  wrap.innerHTML = `
    <h1 style="margin:0 0 8px;">${post.title || ""}</h1>
    <div style="color:#666;margin-bottom:24px;">${post.date || ""}</div>
    <div id="post-body">${bodyHTML}</div>
  `;
  host.appendChild(wrap);
}

// ---------- p5 setup ----------
function setup() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  var canvasParent = document.getElementById("canvas");
  var cnv = createCanvas(window.screen.width * 0.8, isDetail ? 1 : window.screen.height);
  window._p5cnv = cnv;
  cnv.id("canvas_cnv");
  cnv.parent(canvasParent);

  if (!isDetail) {
    background(200); fill(60); textSize(14); text("Loading posts…", 20, 30);
  }

  loadJSON("blog_data.json",
    async function onSuccess(raw) {
      const data = normalizeToArray(raw);

      // ---- 详情模式 ----
      if (isDetail) {
        let post = null;
        if (paramSlug)  post = data.find(p => p && p.slug  === paramSlug);
        if (!post && paramUrl)   post = data.find(p => p && p.url   === paramUrl);
        if (!post && paramTitle) post = data.find(p => p && p.title === paramTitle);
        if (!post) {
          const path = location.pathname.replace(/^.*\//,'');
          post = data.find(p => p && p.url && p.url.endsWith(path));
        }
        if (post) {
          await renderDetail(post);
          dataReady = true;
          return;
        } else {
          document.getElementById("canvas").innerHTML =
            `<p style="padding:40px;color:#900">Post not found.</p>`;
          console.error("✖ Detail: post not found.");
          dataReady = true;
          return;
        }
      }

      // ---- 列表模式 ----
      // 预取 contentFile 用于预览文本和抽缩略图
      const fileHTMLMap = {};
      await Promise.all(
        data.filter(p => p && p.contentFile).map(async p => {
          try { fileHTMLMap[p.slug] = await fetchText(p.contentFile); }
          catch(e){ console.warn("Fetch contentFile failed:", p.contentFile, e); fileHTMLMap[p.slug] = ""; }
        })
      );

      for (let i = data.length - 1; i >= 0; i--) {
        const post = data[i];
        if (!post) continue;
        const hit = Array.isArray(post.categories) && post.categories.includes(currentCategory);
        if (!hit) continue;

        // 预览文本
        let srcTextOrHTML = "";
        if (post.contentHTML) srcTextOrHTML = post.contentHTML;
        else if (post.contentFile) srcTextOrHTML = fileHTMLMap[post.slug] || "";
        else if (post.content) srcTextOrHTML = post.content;
        const preview = makePreview(srcTextOrHTML, 220);

        // 缩略图：从详情第一张图抽取（无则可留空或兜底 imgPath）
        let thumb = null;
        if (post.contentHTML) thumb = extractFirstImageSrc(post.contentHTML, location.href);
        else if (post.contentFile) {
          const base = location.href;
          thumb = extractFirstImageSrc(fileHTMLMap[post.slug] || "", base);

        }
        if (!thumb && post.imgPath) thumb = new URL(post.imgPath, location.href).href;

        const link = post.slug
          ? (`${location.pathname}?slug=${encodeURIComponent(post.slug)}`)
          : (post.url ? `${location.pathname}?url=${encodeURIComponent(post.url)}`
                      : `${location.pathname}?title=${encodeURIComponent(post.title || "")}`);

        blogPosts.push(new BlogBox(post.title, post.date, preview, thumb, link));
      }

      var neededH = Math.max(800, 40 + blogPosts.length * 200);
      resizeCanvas(width, neededH);
      dataReady = true;
    },
    function onError(err) {
      background(255,230,230); fill(160,0,0); text("Failed to load blog_data.json", 20, 30);
      console.error("✖ loadJSON 失败：", err);
      dataReady = true;
    }
  );
}

// ---------- p5 draw (list mode) ----------
function draw() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  background(255);
  if (!dataReady) { fill(80); text("Loading posts…", 20, 30); return; }

  const BOX_WIDTH_RATIO = 1, H_MARGIN_RATIO = 0.01, V_MARGIN_RATIO = 0.05, GAP_RATIO = 0.03;
  const marginX = Math.max(0, Math.floor(width * H_MARGIN_RATIO));
  const marginY = Math.max(12, Math.floor(width * V_MARGIN_RATIO));
  const gap     = Math.max(12, Math.floor(width * GAP_RATIO));
  let boxW = Math.floor(width * BOX_WIDTH_RATIO);
  const maxBoxW = width - marginX * 2; if (boxW > maxBoxW) boxW = maxBoxW;
  const boxH = Math.max(160, Math.min(340, Math.floor(width * 0.22)));
  const neededH = Math.max(400, marginY + (boxH + gap) * blogPosts.length);
  if (height !== neededH) resizeCanvas(width, neededH);

  const x = marginX;
  let y = marginY;
  for (let i=0; i<blogPosts.length; i++) { blogPosts[i].display(x, y, boxW, boxH); y += boxH + gap; }

  if (blogPosts.length === 0) {
    fill(120); text("No posts for category: " + currentCategory, marginX || 12, marginY || 20);
  }
}

// ---------- interactions (list mode) ----------
function mouseMoved(){
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;
  let over = blogPosts.some(b => b.contains && b.contains(mouseX, mouseY));
  cursor(over ? 'pointer' : 'default');
}
function mousePressed(){
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;
  for (let i=0; i<blogPosts.length; i++){
    const b = blogPosts[i];
    if (b.contains && b.contains(mouseX, mouseY) && b.url){
      window.location.href = b.url;
      return;
    }
  }
}


