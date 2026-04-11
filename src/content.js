function isHttpUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function extractUrlFromCgiData() {
  for (const script of document.scripts) {
    const content = script.textContent || "";
    const match = content.match(/var\s+cgiData\s*=\s*(\{[\s\S]*?\});/);
    if (!match) continue;

    try {
      const cgiData = JSON.parse(match[1]);
      const candidateLinks = Array.isArray(cgiData.links) ? cgiData.links : [];

      for (const link of candidateLinks) {
        if (typeof link?.url !== "string") continue;

        const parsedLink = new URL(link.url, window.location.href);
        const encodedTarget = parsedLink.searchParams.get("url");
        if (!encodedTarget) continue;

        const decodedTarget = atob(encodedTarget);
        if (isHttpUrl(decodedTarget)) {
          return decodedTarget;
        }
      }
    } catch (error) {
      console.error("Failed to parse cgiData", error);
    }
  }

  return null;
}

function extractUrlFromText() {
  const textContent = document.body.innerText || document.body.textContent || "";
  const match = textContent.match(
    /https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+/,
  );

  return match ? match[0] : null;
}

function extractUrl() {
  return extractUrlFromCgiData() || extractUrlFromText();
}

function initWeChatSkipper() {
  const targetUrl = extractUrl();
  if (!targetUrl) return;

  // Check if we already injected
  if (document.getElementById("wechat-skipper-container")) return;

  // Create UI container
  const container = document.createElement("div");
  container.id = "wechat-skipper-container";
  container.className = "wechat-skipper-container";

  // Create Copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "wechat-skipper-btn wechat-skipper-btn-secondary";
  copyBtn.innerText = "复制链接";
  copyBtn.onclick = () => {
    navigator.clipboard
      .writeText(targetUrl)
      .then(() => {
        copyBtn.innerText = "已复制！";
        copyBtn.style.backgroundColor = "#e8f5e9";
        setTimeout(() => {
          copyBtn.innerText = "复制链接";
          copyBtn.style.backgroundColor = "";
        }, 2000);
      })
      .catch((err) => {
        console.error("Copy failed", err);
        alert("复制失败，请重试");
      });
  };

  // Create Redirect button
  const goBtn = document.createElement("button");
  goBtn.className = "wechat-skipper-btn wechat-skipper-btn-primary";
  goBtn.innerText = "一键访问";
  goBtn.onclick = () => {
    window.location.href = targetUrl;
  };

  container.appendChild(copyBtn);
  container.appendChild(goBtn);

  // Prefer the main description block even when the page does not print the URL.
  const descElem = document.querySelector(".weui-msg__desc, p");
  let inserted = false;

  if (descElem?.parentNode) {
    descElem.parentNode.insertBefore(container, descElem.nextSibling);
    inserted = true;
  }

  if (!inserted) {
    // Fallback: append to body, centered
    container.style.position = "fixed";
    container.style.bottom = "100px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
    container.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
    container.style.backgroundColor = "white";
    container.style.borderRadius = "12px";
    document.body.appendChild(container);
  }
}

// Give DOM time to render, and try multiple times just in case.
setTimeout(initWeChatSkipper, 500);
setTimeout(initWeChatSkipper, 1500);
