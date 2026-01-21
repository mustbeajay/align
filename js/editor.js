import { backend } from "./services/mockBackend.js";

const currentUser = backend.getCurrentUser();
if (!currentUser) {
  window.location.href = "auth.html";
}

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");

if (!projectId) {
  alert("No Project ID found. Redirecting to Dashboard.");
  window.location.href = "dashboard.html";
}

const projects = backend.getUserProjects(currentUser.id);
const project = projects.find((p) => p.id === projectId);

if (!project) {
  alert("Project not found or access denied.");
  window.location.href = "dashboard.html";
}

document.getElementById("project-name").textContent = project.name;

console.log("Editor Initialized for:", project.name);

if (window.innerWidth < 1024) {
  console.warn("Mobile device detected. Overlay should be visible.");
}
