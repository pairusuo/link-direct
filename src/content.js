function extractUrl() {
  // Try to find URL in text content
  const textContent = document.body.innerText || document.body.textContent;
  const match = textContent.match(
    /https?:\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=%]+/,
  );
  if (match) {
    return match[0];
  }
  return null;
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

  // Try to insert after the description paragraph (.weui-msg__desc) for best placement
  const descElems = document.querySelectorAll(".weui-msg__desc, p");
  let inserted = false;

  for (const elem of descElems) {
    if (elem.innerText && elem.innerText.includes(targetUrl)) {
      elem.parentNode.insertBefore(container, elem.nextSibling);
      inserted = true;
      break;
    }
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
