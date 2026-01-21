/* js/dashboard.js */
import { backend } from "./services/mockBackend.js";
import { Toast } from "./utils/toast.js";

const currentUser = backend.getCurrentUser();
if (!currentUser) window.location.href = "index.html";

const avatarColors = {
  "av-1": { bg: "#e0f2fe", icon: "ri-user-smile-line", color: "#0284c7" },
  "av-2": { bg: "#fce7f3", icon: "ri-emotion-happy-line", color: "#db2777" },
  "av-3": { bg: "#dcfce7", icon: "ri-bear-smile-line", color: "#16a34a" },
  "av-4": { bg: "#fef3c7", icon: "ri-mickey-line", color: "#d97706" },
};

initDashboard();

function initDashboard() {
  updateUserDisplay();
  applyUserPreferences();
  loadProjects();
  setupEventListeners();
}

function setupEventListeners() {
  document
    .querySelector(".user-menu")
    .addEventListener("click", openSettingsModal);

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => backend.logout());

  document
    .getElementById("new-project-btn")
    .addEventListener("click", () => openModal("new-project-modal"));
  const emptyBtn = document.getElementById("empty-new-btn");
  if (emptyBtn)
    emptyBtn.addEventListener("click", () => openModal("new-project-modal"));
  document
    .getElementById("confirm-create-project")
    .addEventListener("click", createNewProject);

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", (e) =>
      closeModal(e.target.closest(".modal-overlay").id),
    );
  });
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  document.querySelectorAll(".settings-tabs .tab-btn").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".settings-tabs .tab-btn")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".settings-content")
        .forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });

  document.querySelectorAll(".color-opt").forEach((opt) => {
    opt.addEventListener("click", () => {
      document
        .querySelectorAll(".color-opt")
        .forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
    });
  });

  document
    .querySelectorAll(".settings-avatars .avatar-option")
    .forEach((opt) => {
      opt.addEventListener("click", () => {
        document
          .querySelectorAll(".settings-avatars .avatar-option")
          .forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");
      });
    });

  document
    .getElementById("save-settings")
    .addEventListener("click", saveSettings);

  document
    .getElementById("delete-account-btn")
    .addEventListener("click", () => {
      closeModal("settings-modal");
      openModal("delete-account-modal");
    });

  document
    .getElementById("confirm-delete-account")
    .addEventListener("click", async () => {
      const btn = document.getElementById("confirm-delete-account");
      btn.innerText = "Deleting...";
      await backend.deleteUser(currentUser.id);
    });
}

function updateUserDisplay() {
  const user = backend.getCurrentUser();
  document.getElementById("user-name").textContent = user.name;
  const avConfig = avatarColors[user.avatarId] || avatarColors["av-1"];
  const avatarEl = document.getElementById("user-avatar");
  if (avatarEl) {
    avatarEl.style.backgroundColor = avConfig.bg;
    avatarEl.innerHTML = `<i class="${avConfig.icon}" style="color: ${avConfig.color}"></i>`;
  }
}

function applyUserPreferences() {
  const user = backend.getCurrentUser();
  const prefs = user.preferences || {};
  if (prefs.theme === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  if (prefs.accent)
    document.documentElement.style.setProperty("--primary", prefs.accent);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".error-msg").forEach((e) => (e.textContent = ""));
}

async function createNewProject() {
  const nameInput = document.getElementById("new-project-name");
  const name = nameInput.value.trim();
  if (!name) {
    document.getElementById("new-project-error").textContent = "Required";
    return;
  }

  if (!backend.isProjectNameUnique(currentUser.id, name)) {
    document.getElementById("new-project-error").textContent = "Must be unique";
    return;
  }
  await backend.createProject(currentUser.id, name);
  nameInput.value = "";
  closeModal("new-project-modal");
  Toast.success(`Project "${name}" created!`);
  loadProjects();
}

let projectToDeleteId = null;
function confirmDeleteProject(id, name) {
  projectToDeleteId = id;
  document.getElementById("delete-project-name").textContent = name;
  openModal("delete-modal");
}
document
  .getElementById("confirm-delete-project")
  .addEventListener("click", async () => {
    if (projectToDeleteId) {
      await backend.deleteProject(projectToDeleteId);
      projectToDeleteId = null;
      closeModal("delete-modal");
      Toast.success("Project deleted.");
      loadProjects();
    }
  });

function loadProjects() {
  const grid = document.getElementById("projects-grid");
  const emptyState = document.getElementById("empty-state");
  grid.innerHTML = "";
  const projects = backend.getUserProjects(currentUser.id);
  if (projects.length === 0) {
    grid.style.display = "none";
    emptyState.classList.remove("hidden");
    return;
  }
  grid.style.display = "grid";
  emptyState.classList.add("hidden");
  projects.forEach((project) => {
    const date = new Date(project.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
            <div class="card-preview"><i class="ri-layout-masonry-line"></i></div>
            <div class="card-info"><h3>${project.name}</h3><p>Edited ${date}</p></div>
            <div class="card-actions"><button class="action-btn delete-btn" title="Delete"><i class="ri-delete-bin-line"></i></button></div>
        `;
    card.addEventListener("click", (e) => {
      if (!e.target.closest(".delete-btn"))
        window.location.href = `editor.html?id=${project.id}`;
    });
    card.querySelector(".delete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      confirmDeleteProject(project.id, project.name);
    });
    grid.appendChild(card);
  });
}

function openSettingsModal() {
  const user = backend.getCurrentUser();
  document.getElementById("settings-name").value = user.name;
  document.getElementById("settings-email").value = user.email;
  document.getElementById("settings-password").value = "";
  document.getElementById("current-password").value = "";

  if (user.preferences?.theme)
    document.getElementById("settings-theme").value = user.preferences.theme;

  const currentAccent = user.preferences?.accent || "#0284c7";
  document.querySelectorAll(".color-opt").forEach((opt) => {
    opt.classList.toggle("selected", opt.dataset.color === currentAccent);
  });

  const currentAvatar = user.avatarId || "av-1";
  document
    .querySelectorAll(".settings-avatars .avatar-option")
    .forEach((opt) => {
      opt.classList.toggle("selected", opt.dataset.id === currentAvatar);
    });

  openModal("settings-modal");
}

async function saveSettings() {
  const btn = document.getElementById("save-settings");
  const name = document.getElementById("settings-name").value;
  const email = document.getElementById("settings-email").value;
  const newPassword = document.getElementById("settings-password").value;
  const currentPassword = document.getElementById("current-password").value;

  const theme = document.getElementById("settings-theme").value;
  const accentEl = document.querySelector(".color-opt.selected");
  const accent = accentEl ? accentEl.dataset.color : null;

  const avatarEl = document.querySelector(
    ".settings-avatars .avatar-option.selected",
  );
  const avatarId = avatarEl ? avatarEl.dataset.id : "av-1";

  const user = backend.getCurrentUser();
  const isSensitiveChange = email !== user.email || newPassword.length > 0;

  if (isSensitiveChange && !currentPassword) {
    Toast.error("Current password required to change sensitive info.");
    document.getElementById("current-password").focus();
    return;
  }

  const updates = { name, email, avatarId, preferences: { theme, accent } };
  if (newPassword) updates.password = newPassword;

  btn.innerText = "Saving...";
  const result = await backend.updateUser(
    currentUser.id,
    updates,
    currentPassword,
  );
  btn.innerText = "Save Changes";

  if (result.success) {
    Toast.success("Settings saved!");
    closeModal("settings-modal");
    updateUserDisplay();
    applyUserPreferences();
  } else {
    Toast.error(result.error);
  }
}
