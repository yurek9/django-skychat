// ----------------------
// CSRF
// ----------------------
function getCSRFToken() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

// ----------------------
// GLOBAL FETCH WRAPPER (401/403 + 5xx + offline)
// ----------------------
const originalFetch = window.fetch;

window.fetch = function (...args) {
  return originalFetch(...args)
    .then((response) => {
      // Sesja wygasła
      if (response.status === 401 || response.status === 403) {
        window.showSessionBanner();
      }

      // Błąd serwera / brak połączenia
      if (!response.ok && response.status >= 500) {
        showConnectionError();
      } else {
        hideConnectionError();
      }

      return response;
    })
    .catch((err) => {
      showConnectionError();
      throw err;
    });
};

// ----------------------
// SESSION BANNER
// ----------------------
let sessionBannerTimeout;

window.showSessionBanner = function () {
  const banner = document.getElementById("session-expired-banner");
  if (!banner) return;

  banner.classList.add("show");
  clearTimeout(sessionBannerTimeout);

  sessionBannerTimeout = setTimeout(() => {
    banner.classList.remove("show");
  }, 18000);
};

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("session-expired-banner");
  const closeBtn = document.getElementById("close-session-banner");

  if (closeBtn && banner) {
    closeBtn.addEventListener("click", () => {
      clearTimeout(sessionBannerTimeout);
      banner.classList.remove("show");
    });
  }
});

// ----------------------
// CONNECTION ERROR BANNER
// ----------------------
let connectionLost = false;

function showConnectionError() {
  const banner = document.getElementById("connection-error");
  if (banner && !connectionLost) {
    connectionLost = true;
    banner.classList.remove("hidden");
  }
}

function hideConnectionError() {
  const banner = document.getElementById("connection-error");
  if (banner && connectionLost) {
    connectionLost = false;
    banner.classList.add("hidden");
  }
}

document.body.addEventListener("htmx:sendError", showConnectionError);
document.body.addEventListener("htmx:responseError", (event) => {
  if (event.detail.xhr.status >= 500) showConnectionError();
  else hideConnectionError();
});

function checkConnection() {
  fetch("/", { method: "HEAD" })
    .then(() => hideConnectionError())
    .catch(() => showConnectionError());
}

document.addEventListener("DOMContentLoaded", () => {
  setInterval(checkConnection, 25000);
});

// ----------------------
// CHAT INPUT + BUTTON
// ----------------------
const textarea = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const chatForm = document.getElementById("chat-form");

if (textarea && sendButton && chatForm) {
  function toggleButton() {
    sendButton.disabled = textarea.value.trim().length === 0;
  }

  textarea.addEventListener("input", toggleButton);

  chatForm.addEventListener("submit", (e) => {
    if (textarea.value.trim().length === 0) e.preventDefault();
  });
}

// ----------------------
// AUTO RESIZE
// ----------------------
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function resetChatInput() {
  const el = document.getElementById("chat-input");
  if (el) el.style.height = "auto";
}

// ----------------------
// CHARACTER COUNTER
// ----------------------
function updateCharCount(input) {
  const countSpan = document.getElementById("char-count");
  if (!countSpan) return;

  const len = input.value.length;
  countSpan.innerText = len;

  countSpan.classList.toggle("text-red-500", len >= 450);
  countSpan.classList.toggle("text-gray-400", len < 450);
}

// ----------------------
// ENTER = SEND
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  scrollToBottom();

  if (textarea) {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = textarea.closest("form");
        if (form) htmx.trigger(form, "submit");
      }
    });
  }
});

// ----------------------
// AUTO SCROLL
// ----------------------
document.body.addEventListener("htmx:afterSwap", (evt) => {
  if (evt.detail.target.id === "chat-messages") scrollToBottom();
});

function scrollToBottom() {
  const container = document.getElementById("chat-messages");
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }
}

// ----------------------
// ONLINE COUNT
// ----------------------
function updateUsersCount() {
  fetch("/chats/online-count/", {
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((r) => r.json())
    .then((data) => {
      const el = document.getElementById("users-count");
      if (el) el.textContent = data.count;
    })
    .catch(() => {});
}

// ----------------------
// PING ONLINE
// ----------------------
function pingOnline() {
  fetch("/chats/ping-online/", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCSRFToken(),
      "X-Requested-With": "XMLHttpRequest",
    },
  });
}

// ----------------------
// TYPING
// ----------------------
let typingTimeout;

function sendTyping() {
  fetch("/chats/typing/", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "X-CSRFToken": getCSRFToken(),
      "X-Requested-With": "XMLHttpRequest",
    },
  });
}

function sendTypingWithThrottle() {
  if (typingTimeout) return;
  sendTyping();
  typingTimeout = setTimeout(() => (typingTimeout = null), 3000);
}

document.addEventListener("input", (e) => {
  if (e.target.id === "chat-input") sendTypingWithThrottle();
});

function checkTyping() {
  fetch("/chats/check-typing/", {
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((r) => r.json())
    .then((data) => {
      const box = document.getElementById("typing-indicator");
      const name = document.getElementById("typing-username");

      if (!box || !name) return;

      if (data.typing) {
        name.textContent = data.username;
        box.classList.remove("hidden");
      } else {
        box.classList.add("hidden");
      }
    })
    .catch(() => {});
}

// ----------------------
// STATUSY
// ----------------------
function refreshStatuses() {
  fetch("/chats/statuses/", {
    credentials: "same-origin",
    headers: { "X-Requested-With": "XMLHttpRequest" },
  })
    .then((r) => r.json())
    .then((data) => {
      for (const [username, info] of Object.entries(data)) {
        const dot = document.querySelector(
          `.status-dot[data-user="${username}"]`,
        );
        if (dot) dot.className = "status-dot status-" + info.status;
      }
    });
}

// ----------------------
// ONLINE USERS LIST
// ----------------------
function loadOnlineUsers() {
  fetch("/chats/get-online-users/")
    .then((r) => r.json())
    .then((users) => {
      const list = document.getElementById("online-users");
      if (!list) return;

      list.innerHTML = "";

      if (users.length === 0) {
        list.innerHTML = "<li>Nikt nie jest online</li>";
        return;
      }

      users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.username} — ${user.status} — ${new Date(
          user.last_seen,
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        list.appendChild(li);
      });
    })
    .catch(() => {});
}

// ----------------------
// DARK MODE
// ----------------------
const themeToggleBtn = document.getElementById("theme-toggle");
const darkIcon = document.getElementById("theme-toggle-dark-icon");
const lightIcon = document.getElementById("theme-toggle-light-icon");

function updateIcons() {
  if (document.documentElement.classList.contains("dark")) {
    darkIcon?.classList.add("hidden");
    lightIcon?.classList.remove("hidden");
  } else {
    darkIcon?.classList.remove("hidden");
    lightIcon?.classList.add("hidden");
  }
}

updateIcons();

themeToggleBtn?.addEventListener("click", () => {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("color-theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("color-theme", "dark");
  }
  updateIcons();
});

// ----------------------
// TOASTY
// ----------------------
window.removeToast = function (el) {
  if (!el) return;
  el.classList.add("opacity-0", "translate-x-full");
  setTimeout(() => el.remove(), 500);
};

const initToastAnimation = (el) => {
  el.classList.add("opacity-0", "translate-x-full");

  requestAnimationFrame(() => {
    setTimeout(() => {
      el.classList.remove("opacity-0", "translate-x-full");
      el.classList.add("opacity-100", "translate-x-0");
    }, 100);
  });

  setTimeout(() => window.removeToast(el), 5000);
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("#toast-container .toast")
    .forEach(initToastAnimation);
});

window.showToast = function (message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");

  const baseClasses =
    "toast flex items-center justify-between min-w-72 p-4 rounded-xl shadow-2xl border transition-all duration-500 transform";
  const typeClasses =
    type === "error"
      ? "bg-red-100 border-red-300 text-red-900 dark:bg-red-900 dark:border-red-700 dark:text-white"
      : "bg-green-100 border-green-300 text-green-900 dark:bg-green-900 dark:border-green-700 dark:text-white";

  toast.className = `${baseClasses} ${typeClasses}`;
  toast.setAttribute("role", "alert");

  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-xl">${type === "error" ? "⚠️" : "✅"}</span>
      <p class="font-medium text-sm m-0">${message}</p>
    </div>
    <button onclick="window.removeToast(this.closest('.toast'))"
      class="ml-4 opacity-50 hover:opacity-100 transition-opacity p-1 cursor-pointer"
      aria-label="Zamknij">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;

  container.appendChild(toast);
  initToastAnimation(toast);
};

// ----------------------
// BACK TO TOP
// ----------------------
const backToTopBtn = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.classList.remove("translate-y-20", "opacity-0");
    backToTopBtn.classList.add("translate-y-0", "opacity-100");
  } else {
    backToTopBtn.classList.add("translate-y-20", "opacity-0");
    backToTopBtn.classList.remove("translate-y-0", "opacity-100");
  }
});

// ----------------------
// START INTERVALS
// ----------------------
if (window.USER_IS_LOGGED_IN) {
  //updateUsersCount();
  //setInterval(updateUsersCount, 5000);

  pingOnline();
  setInterval(pingOnline, 15000);

  checkTyping();
  setInterval(checkTyping, 1000);

  refreshStatuses();
  setInterval(refreshStatuses, 10000);

  loadOnlineUsers();
  setInterval(loadOnlineUsers, 15000);
}
// Licznik online – wersja bezpieczna
// (rekurencyjny timeout zamiast setInterval, żeby uniknąć nakładania się wywołań):
// jeśli poprzednie jeszcze się nie zakończyło (np. przy wolnym połączeniu):
function loop() {
  updateUsersCount();
  setTimeout(loop, 5000);
}
loop();
console.log("chat.js załadowany poprawnie");
