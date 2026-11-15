const APP_VERSION = "1.0.7";
console.log(
  `%c InstaTracker 🚀 v${APP_VERSION} initialized `,
  "background: #4f46e5; color: #fff; border-radius: 4px; padding: 4px;",
);

////////////////////////////////////////////////////////////////////////////
//// PWA & iOS Installation Logic
let deferredPrompt;
const installBtn = document.getElementById("installAppBtn");
const iosInstallModal = document.getElementById("iosInstallModal");
const closeIosModalBtn = document.getElementById("closeIosModalBtn");
const closeIosModalBottomBtn = document.getElementById(
  "closeIosModalBottomBtn",
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("SW registration failed: ", err);
    });
  });
}

if (iosInstallModal) {
  const closeIosModal = () => {
    iosInstallModal.classList.add("hidden");
  };

  if (closeIosModalBtn) {
    closeIosModalBtn.addEventListener("click", closeIosModal);
  }

  if (closeIosModalBottomBtn) {
    closeIosModalBottomBtn.addEventListener("click", closeIosModal);
  }

  iosInstallModal.addEventListener("click", (e) => {
    if (e.target === iosInstallModal) closeIosModal();
  });
}

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isInStandaloneMode =
  window.navigator.standalone ||
  window.matchMedia("(display-mode: standalone)").matches;

if (isIOS && !isInStandaloneMode) {
  if (installBtn) {
    installBtn.classList.remove("hidden");
    installBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (iosInstallModal) {
        iosInstallModal.classList.remove("hidden");
      }
    });
  }
} else {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.classList.remove("hidden");
    }
  });

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installBtn.classList.add("hidden");
      }
      deferredPrompt = null;
    });
  }
}

////////////////////////////////////////////////////////////////////////////
//// Followers Comparison Logic
let oldUsernames = null;
let newUsernames = null;
let gainedUsers = [];
let lostUsers = [];

const oldFileInput = document.getElementById("oldFileInput");
const newFileInput = document.getElementById("newFileInput");
const oldFileLabel = document.getElementById("oldFileLabel");
const newFileLabel = document.getElementById("newFileLabel");
const oldFileName = document.getElementById("oldFileName");
const newFileName = document.getElementById("newFileName");
const compareBtn = document.getElementById("compareBtn");
const resultsSection = document.getElementById("results");

function checkReady() {
  if (compareBtn) {
    compareBtn.disabled = !(oldUsernames && newUsernames);
  }
}

////////////////////////////////////////////////////////////////////////////
//// Extract Usernames from Content (HTML or JSON)
function extractUsernames(content) {
  const users = new Set();
  const trimmed = content.trim();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      function walk(obj) {
        if (!obj) return;
        if (Array.isArray(obj)) {
          obj.forEach(walk);
        } else if (typeof obj === "object") {
          if (obj.string_list_data && Array.isArray(obj.string_list_data)) {
            obj.string_list_data.forEach((item) => {
              if (item.value) users.add(item.value.trim().toLowerCase());
            });
          }
          if (
            obj.value &&
            typeof obj.value === "string" &&
            !obj.value.includes(" ") &&
            !obj.value.includes("/")
          ) {
            users.add(obj.value.trim().toLowerCase());
          }
          for (const k in obj) walk(obj[k]);
        }
      }
      walk(parsed);
      if (users.size > 0) return users;
    } catch (err) {
      console.warn("JSON parse fallback to regex", err);
    }
  }

  const regexPatterns = [
    /instagram\.com\/([a-zA-Z0-9._]+)/gi,
    /<a[^>]*href="[^"]*instagram\.com\/([a-zA-Z0-9._]+)"[^>]*>/gi,
  ];

  const ignoredWords = new Set([
    "p",
    "reel",
    "reels",
    "stories",
    "explore",
    "direct",
    "accounts",
    "legal",
    "about",
    "developer",
    "help",
  ]);

  for (const rx of regexPatterns) {
    let match;
    while ((match = rx.exec(content)) !== null) {
      const u = match[1].trim().toLowerCase();
      if (!ignoredWords.has(u)) {
        users.add(u);
      }
    }
  }

  return users;
}

////////////////////////////////////////////////////////////////////////////
//// Process Uploaded File (ZIP or Plain Text)
async function processUploadedFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".zip")) {
    if (typeof JSZip === "undefined") {
      throw new Error("The JSZip library failed to load.");
    }

    const zip = await JSZip.loadAsync(file);
    const combinedUsers = new Set();
    const filePromises = [];

    zip.forEach((relativePath, zipEntry) => {
      const lower = relativePath.toLowerCase();
      const baseName = lower.split("/").pop();

      const isFollowerFile =
        baseName.startsWith("followers_") &&
        (baseName.endsWith(".html") ||
          baseName.endsWith(".htm") ||
          baseName.endsWith(".json"));

      if (isFollowerFile) {
        const p = zipEntry.async("string").then((content) => {
          const extracted = extractUsernames(content);
          extracted.forEach((u) => combinedUsers.add(u));
        });
        filePromises.push(p);
      }
    });

    await Promise.all(filePromises);

    if (combinedUsers.size === 0) {
      throw new Error("No followers file was found in the ZIP archive.");
    }

    return combinedUsers;
  }

  const content = await file.text();
  const usernames = extractUsernames(content);

  if (usernames.size === 0) {
    throw new Error("No usernames were found in the file.");
  }

  return usernames;
}

function setupFileInput(inputEl, labelEl, nameEl, isOld) {
  if (!inputEl || !labelEl) return;

  async function handleFile(file) {
    if (!file) return;

    nameEl.textContent = "⏳ Reading and extracting...";
    nameEl.classList.remove("hidden", "text-rose-400", "text-emerald-400");
    nameEl.classList.add("text-amber-400");

    try {
      const usernamesSet = await processUploadedFile(file);

      if (isOld) {
        oldUsernames = usernamesSet;
      } else {
        newUsernames = usernamesSet;
      }

      nameEl.textContent = `✓ ${file.name} (${usernamesSet.size.toLocaleString("en-US")} followers)`;

      nameEl.classList.remove("text-amber-400");
      nameEl.classList.add("text-emerald-400");

      labelEl.classList.remove("border-indigo-400", "bg-indigo-500/10");
      labelEl.classList.add("border-emerald-500/70", "bg-emerald-950/20");

      checkReady();
    } catch (err) {
      console.error(err);

      nameEl.textContent = `❌ Error: ${err.message || "Invalid file"}`;

      nameEl.classList.remove("text-amber-400");
      nameEl.classList.add("text-rose-400");

      labelEl.classList.remove("border-emerald-500/70", "bg-emerald-950/20");

      if (isOld) {
        oldUsernames = null;
      } else {
        newUsernames = null;
      }

      checkReady();
    }
  }

  inputEl.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    labelEl.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  labelEl.addEventListener("dragenter", () => {
    labelEl.classList.add("border-indigo-400", "bg-indigo-500/10");
  });

  labelEl.addEventListener("dragover", () => {
    labelEl.classList.add("border-indigo-400", "bg-indigo-500/10");
  });

  labelEl.addEventListener("dragleave", (e) => {
    if (!labelEl.contains(e.relatedTarget)) {
      labelEl.classList.remove("border-indigo-400", "bg-indigo-500/10");
    }
  });

  labelEl.addEventListener("drop", (e) => {
    labelEl.classList.remove("border-indigo-400", "bg-indigo-500/10");

    const file = e.dataTransfer.files[0];

    if (!file) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputEl.files = dataTransfer.files;

    handleFile(file);
  });
}

setupFileInput(oldFileInput, oldFileLabel, oldFileName, true);
setupFileInput(newFileInput, newFileLabel, newFileName, false);

////////////////////////////////////////////////////////////////////////////
//// Compare Button Logic
if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    if (!oldUsernames || !newUsernames) return;

    gainedUsers = [...newUsernames].filter((x) => !oldUsernames.has(x)).sort();

    lostUsers = [...oldUsernames].filter((x) => !newUsernames.has(x)).sort();

    document.getElementById("oldTotalCount").textContent =
      oldUsernames.size.toLocaleString("en-US");
    document.getElementById("newTotalCount").textContent =
      newUsernames.size.toLocaleString("en-US");
    document.getElementById("gainedCount").textContent =
      gainedUsers.length.toLocaleString("en-US");
    document.getElementById("lostCount").textContent =
      lostUsers.length.toLocaleString("en-US");

    renderList("newFollowersList", gainedUsers, "emerald");
    renderList("lostFollowersList", lostUsers, "rose");

    if (resultsSection) {
      resultsSection.classList.remove("hidden");
      resultsSection.scrollIntoView({ behavior: "smooth" });
    }
  });
}

function renderList(elementId, list, colorTheme) {
  const container = document.getElementById(elementId);
  if (!container) return;

  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<li class="text-slate-500 py-4 text-center">No results found.</li>`;
    return;
  }

  list.forEach((username) => {
    const li = document.createElement("li");
    li.className = `flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-${colorTheme}-500/20`;
    li.innerHTML = `
      <a href="https://instagram.com/${username}" target="_blank" rel="noreferrer" class="text-slate-200 hover:text-${colorTheme}-400 font-mono flex items-center gap-1.5 transition">
        <span>@${username}</span>
      </a>
      <button onclick="copySingleText('${username}', this)" class="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition">
        Copy
      </button>
    `;
    container.appendChild(li);
  });
}

window.copySingleText = function (text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const originalText = btnElement.textContent;
    btnElement.textContent = "Copied!";
    btnElement.classList.add("text-emerald-400");
    setTimeout(() => {
      btnElement.textContent = originalText;
      btnElement.classList.remove("text-emerald-400");
    }, 1500);
  });
};

window.copyList = function (listType) {
  const targetList = listType === "newFollowersList" ? gainedUsers : lostUsers;
  if (!targetList || targetList.length === 0) return;

  navigator.clipboard.writeText(targetList.join("\n")).then(() => {
    alert(
      `${targetList.length.toLocaleString("en-US")} usernames copied successfully.`,
    );
  });
};

////////////////////////////////////////////////////////////////////////////
//// Guide Modal Logic
const guideModal = document.getElementById("guideModal");
const openGuideBtn = document.getElementById("openGuideBtn");
const closeGuideBtn = document.getElementById("closeGuideBtn");
const closeGuideBottomBtn = document.getElementById("closeGuideBottomBtn");

if (openGuideBtn && guideModal) {
  openGuideBtn.addEventListener("click", () =>
    guideModal.classList.remove("hidden"),
  );

  const closeModal = () => guideModal.classList.add("hidden");
  if (closeGuideBtn) closeGuideBtn.addEventListener("click", closeModal);
  if (closeGuideBottomBtn)
    closeGuideBottomBtn.addEventListener("click", closeModal);

  guideModal.addEventListener("click", (e) => {
    if (e.target === guideModal) closeModal();
  });
}
