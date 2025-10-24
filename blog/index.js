// =========================================================
// index.js — 抽取第一张图片 + 固定尺寸缩略图封面
// =========================================================


// =========================================================
// 全局变量定义
// =========================================================
let blogPosts = [];   // 用于存储所有 BlogBox 对象
let dataReady = false; // 标记数据是否加载完毕


// =========================================================
// 读取 URL 参数
// =========================================================
const params = new URLSearchParams(window.location.search);
const paramCategory = params.get("category"); // 当前分类
const paramSlug     = params.get("slug");     // 当前文章 slug
const paramUrl      = params.get("url");      // 当前文章 url
const paramTitle    = params.get("title");    // 当前文章标题
let currentCategory = paramCategory || "all"; // 默认为 all


// =========================================================
// 工具函数（数据与字符串处理）
// =========================================================

/**
 * 将 JSON 数据格式化为数组
 * 可处理对象键值型数据或数组型数据
 */
function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const keys = Object.keys(data);
  if (keys.length > 0) {
    return keys.sort((a, b) => Number(a) - Number(b)).map(k => data[k]);
  }

  const out = [];
  let i = 0;
  while (data[i] !== undefined) {
    out.push(data[i]);
    i++;
  }
  return out;
}

/**
 * 去除字符串中的所有 HTML 标签
 */
function stripTags(htmlOrText) {
  return String(htmlOrText || "").replace(/<[^>]*>/g, "");
}

/**
 * 生成文章预览文本（从 HTML 中提取纯文字）
 */
function makePreview(text, maxChars) {
  // 1. 把段落和 <br> 标签转成换行符
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "");

  // 2. 去掉所有剩余的 HTML 标签
  let clean = text.replace(/<[^>]+>/g, "").trim();

  // 3. 合并多余的空行与空格
  clean = clean.replace(/\n\s*\n+/g, "\n"); // 多个空行 → 一个
  clean = clean.replace(/[ \t]+/g, " ");    // 多个空格 → 一个

  // 4. 截断到设定长度
  if (clean.length <= maxChars) return clean;
  let cut = clean.lastIndexOf(" ", maxChars);
  if (cut < 0) cut = maxChars;
  return clean.slice(0, cut) + "…";
}

/**
 * 异步读取指定 URL 的文本内容（禁用缓存）
 */
async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("读取失败：" + url);
  return await res.text();
}

/**
 * 从 HTML 内容中提取第一张图片的 src（返回绝对路径）
 */
function extractFirstImageSrc(html, baseHref) {
  if (!html) return null;
  const doc = new DOMParser().parseFromString(String(html), "text/html");
  const img = doc.querySelector("img");
  if (!img || !img.getAttribute("src")) return null;

  try {
    return new URL(img.getAttribute("src"), baseHref).href;
  } catch {
    return img.getAttribute("src");
  }
}


// =========================================================
// 详情页渲染函数
// =========================================================
async function renderDetail(post) {
  const host = document.getElementById("canvas");
  host.innerHTML = "";

  // 如果已存在 p5 画布，则将其高度压缩到最小（仅保留结构）
  if (window._p5cnv) {
    try { window._p5cnv.resizeCanvas(window._p5cnv.width, 1); } catch {}
  }

  // --- 获取文章 HTML 内容 ---
  let bodyHTML = "";
  if (post.contentHTML) {
    bodyHTML = post.contentHTML;
  } else if (post.contentFile) {
    try {
      bodyHTML = await fetchText(post.contentFile);
    } catch (e) {
      console.error(e);
      bodyHTML = `<p style="color:#900">加载内容失败: ${post.contentFile}</p>`;
    }
  } else if (post.content) {
    bodyHTML = String(post.content).replace(/\n/g, "<br>");
  }

  // --- 创建文章容器 ---
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

  // --- 对齐 BlogBox 的左右边距（保持对称） ---
  const canvasW = (window._p5cnv && window._p5cnv.width)
    ? window._p5cnv.width
    : Math.floor(window.innerWidth * 0.8); // 与 setup() 中保持一致
  const H_MARGIN_RATIO = 0.01;
  const marginX = Math.max(0, Math.floor(canvasW * H_MARGIN_RATIO));

  wrap.style.maxWidth = "none";
  wrap.style.padding = "0";
  wrap.style.width = (canvasW - marginX * 2) + "px";
  wrap.style.margin = `80px ${marginX}px`;

  // 注意：多媒体（image-row / video / audio）仍保留左缩进 40px，由 CSS 控制
}


// =========================================================
// p5.js 初始化函数
// =========================================================
function setup() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  const canvasParent = document.getElementById("canvas");

  // 创建主画布
  const cnv = createCanvas(window.screen.width * 0.8, isDetail ? 1 : window.screen.height);
  window._p5cnv = cnv;
  cnv.id("canvas_cnv");
  cnv.parent(canvasParent);

  // 让BlogBox在post很多的情况下一九保持清晰度
  pixelDensity(window.devicePixelRatio || 1);

  // 如果是列表模式，显示加载提示
  if (!isDetail) {
    background(255);
    fill(60);
    textSize(14);
    text("Loading…", 20, 30);
  }

  // 读取 blog_data.json
  loadJSON(
    "blog_data.json",
    async function onSuccess(raw) {
      const posts = normalizeToArray(raw);

      // --------------------------------------------
      // 详情模式
      // --------------------------------------------
      if (isDetail) {
        let post = null;
        if (paramSlug)  post = posts.find(p => p && p.slug  === paramSlug);
        if (!post && paramUrl)   post = posts.find(p => p && p.url   === paramUrl);
        if (!post && paramTitle) post = posts.find(p => p && p.title === paramTitle);

        // 回退：通过路径文件名匹配
        if (!post) {
          const path = location.pathname.replace(/^.*\//, "");
          post = posts.find(p => p && p.url && p.url.endsWith(path));
        }

        if (post) {
          await renderDetail(post);
        } else {
          document.getElementById("canvas").innerHTML =
            `<p style="padding:40px;color:#900">No corresponding post found.</p>`;
          console.error("✖ Detail: 未找到文章。");
        }

        dataReady = true;
        return;
      }

      // --------------------------------------------
      // 列表模式
      // --------------------------------------------

      // 预加载所有 contentFile，用于生成预览与缩略图
      const fileHTMLMap = {};
      await Promise.all(
        posts.filter(p => p && p.contentFile).map(async p => {
          try {
            fileHTMLMap[p.slug] = await fetchText(p.contentFile);
          } catch (e) {
            console.warn("加载 contentFile 失败:", p.contentFile, e);
            fileHTMLMap[p.slug] = "";
          }
        })
      );

      // 生成 BlogBox 实例
      for (let i = posts.length - 1; i >= 0; i--) {
        const post = posts[i];
        if (!post) continue;

        const matchesCategory = Array.isArray(post.categories)
          && post.categories.includes(currentCategory);
        if (!matchesCategory) continue;

        // --- 生成预览文本 ---
        let src = "";
        if (post.contentHTML) src = post.contentHTML;
        else if (post.contentFile) src = fileHTMLMap[post.slug] || "";
        else if (post.content) src = post.content;
        const preview = makePreview(src, 220);

        // --- 缩略图（首图或备用） ---
        let thumb = null;
        if (post.contentHTML)
          thumb = extractFirstImageSrc(post.contentHTML, location.href);
        else if (post.contentFile)
          thumb = extractFirstImageSrc(fileHTMLMap[post.slug] || "", location.href);
        if (!thumb && post.imgPath)
          thumb = new URL(post.imgPath, location.href).href;

        // --- 链接地址 ---
        const link = post.slug
          ? `${location.pathname}?slug=${encodeURIComponent(post.slug)}`
          : (post.url
              ? `${location.pathname}?url=${encodeURIComponent(post.url)}`
              : `${location.pathname}?title=${encodeURIComponent(post.title || "")}`);

        // 存入 blogPosts 数组
        blogPosts.push(new BlogBox(post.title, post.date, preview, thumb, link));
      }

      // 调整画布高度以容纳所有 BlogBox
      const neededH = Math.max(800, 40 + blogPosts.length * 200);
      resizeCanvas(width, neededH);
      dataReady = true;
    },

    // --------------------------------------------
    // 读取失败时的错误处理
    // --------------------------------------------
    function onError(err) {
      background(255, 230, 230);
      fill(160, 0, 0);
      text("Fail to load blog_data.json", 20, 30);
      console.error("✖ loadJSON 错误：", err);
      dataReady = true;
    }
  );
}


// =========================================================
// p5.js 绘制循环（仅列表模式）
// =========================================================
function draw() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  background(255);

  // 数据未加载完时的提示
  if (!dataReady) {
    fill(80);
    text("Loading…", 20, 30);
    return;
  }

  // --- 布局常量 ---
  const BOX_WIDTH_RATIO = 1;
  const H_MARGIN_RATIO  = 0.01;
  const V_MARGIN_RATIO  = 0.05;
  const GAP_RATIO       = 0.03;

  const marginX = Math.max(0, Math.floor(width * H_MARGIN_RATIO));
  const marginY = Math.max(12, Math.floor(width * V_MARGIN_RATIO));
  const gap     = Math.max(12, Math.floor(width * GAP_RATIO));

  // --- 计算 BlogBox 尺寸 ---
  let boxW = Math.floor(width * BOX_WIDTH_RATIO);
  const maxBoxW = width - marginX * 2;
  if (boxW > maxBoxW) boxW = maxBoxW;

  const boxH = Math.max(160, Math.min(340, Math.floor(width * 0.22)));
  const neededH = Math.max(400, marginY + (boxH + gap) * blogPosts.length);
  if (height !== neededH) resizeCanvas(width, neededH);

  // --- 绘制所有 BlogBox ---
  let x = marginX;
  let y = marginY;
  for (const box of blogPosts) {
    box.display(x, y, boxW, boxH);
    y += boxH + gap;
  }

  // --- 没有文章时的提示 ---
  if (blogPosts.length === 0) {
    fill(120);
    text(`No post in this category yet: ${currentCategory}`, marginX || 12, marginY || 20);
  }
}


// =========================================================
// p5.js 交互逻辑（仅列表模式）
// =========================================================
function mouseMoved() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  const hovering = blogPosts.some(b => b.contains && b.contains(mouseX, mouseY));
  cursor(hovering ? "pointer" : "default");
}

function mousePressed() {
  const isDetail = Boolean(paramSlug || paramUrl || paramTitle);
  if (isDetail) return;

  for (const box of blogPosts) {
    if (box.contains && box.contains(mouseX, mouseY) && box.url) {
      window.location.href = box.url;
      return;
    }
  }
}
