import { backend } from "../services/mockBackend.js";
import { EditorState } from "./state.js";
import { ToolManager } from "./tools.js";
import { PropertiesPanel } from "./properties.js";
import { LayersPanel } from "./layers.js";
import { ExportManager } from "./export.js";

const currentUser = backend.getCurrentUser();
if (!currentUser) window.location.href = "auth.html";
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");
if (!projectId) window.location.href = "dashboard.html";

const canvas = document.getElementById("canvas");
const tools = new ToolManager(canvas);
const propertiesPanel = new PropertiesPanel();
const layersPanel = new LayersPanel();
const exporter = new ExportManager();

async function initProject() {
  const projects = backend.getUserProjects(currentUser.id);
  const project = projects.find((p) => p.id === projectId);

  if (project && project.data) {
    document.getElementById("project-name").textContent = project.name;
    EditorState.elements = project.data;
    tools.renderAll();
    window.dispatchEvent(new CustomEvent("refreshLayers"));
  }
}
initProject();

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
}

const toolBtns = document.querySelectorAll(".tool-btn");
toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    toolBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    EditorState.setActiveTool(btn.dataset.tool);
    canvas.style.cursor =
      btn.dataset.tool === "cursor" ? "default" : "crosshair";
  });
});
window.addEventListener("toolChange", (e) => {
  const tool = e.detail;
  toolBtns.forEach((b) =>
    b.classList.toggle("active", b.dataset.tool === tool),
  );
  canvas.style.cursor = "default";
});

document.getElementById("export-btn").addEventListener("click", () => {
  openModal("export-modal");
});

const exportModal = document.getElementById("export-modal");
if (exportModal) {
  exportModal.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", () => closeModal("export-modal"));
  });
}

document.getElementById("export-json-btn").addEventListener("click", () => {
  const name = document.getElementById("project-name").textContent || "design";
  exporter.downloadJSON(name);
  closeModal("export-modal");
});

document.getElementById("export-html-btn").addEventListener("click", () => {
  const name = document.getElementById("project-name").textContent || "design";
  exporter.downloadHTML(name);
  closeModal("export-modal");
});

let isDragging = false;
let isResizing = false;
let activeHandle = null;
let startX, startY;
let initialElData = null;

canvas.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  if (e.target.classList.contains("resize-handle")) {
    isResizing = true;
    activeHandle = e.target.dataset.handle;
    startX = e.clientX;
    startY = e.clientY;
    initialElData = { ...EditorState.getElementById(EditorState.selectedId) };
    e.stopPropagation();
    return;
  }

  const clickedEl = e.target.closest(".canvas-element");
  if (clickedEl) {
    if (clickedEl.isContentEditable) return;

    const id = clickedEl.id;
    if (EditorState.activeTool === "cursor") {
      if (EditorState.selectedId !== id) {
        tools.selectElement(id);
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rawData = EditorState.getElementById(id);
      initialElData = {
        ...rawData,
        width: clickedEl.offsetWidth,
        height: clickedEl.offsetHeight,
      };
    }
    return;
  }

  if (e.target.id === "canvas") {
    tools.handleCanvasClick(e);
    window.dispatchEvent(new CustomEvent("refreshLayers"));
    backend.saveProject(projectId, EditorState.elements);
  }
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging && !isResizing) return;
  if (!isDragging) e.preventDefault();

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  if (isDragging && initialElData) {
    let newX = initialElData.x + dx;
    let newY = initialElData.y + dy;
    const canvasRect = canvas.getBoundingClientRect();
    newX = Math.max(0, Math.min(newX, canvasRect.width - initialElData.width));
    newY = Math.max(
      0,
      Math.min(newY, canvasRect.height - initialElData.height),
    );

    EditorState.updateElement(initialElData.id, { x: newX, y: newY });
    tools.renderElementToDOM(EditorState.getElementById(initialElData.id));
    window.dispatchEvent(
      new CustomEvent("elementUpdated", {
        detail: EditorState.getElementById(initialElData.id),
      }),
    );
  }

  if (isResizing && initialElData) {
    let { x, y, width, height } = initialElData;
    if (activeHandle.includes("r")) width += dx;
    if (activeHandle.includes("l")) {
      x += dx;
      width -= dx;
    }
    if (activeHandle.includes("b")) height += dy;
    if (activeHandle.includes("t")) {
      y += dy;
      height -= dy;
    }
    if (width < 20) width = 20;
    if (height < 20) height = 20;

    EditorState.updateElement(initialElData.id, { x, y, width, height });
    tools.renderElementToDOM(EditorState.getElementById(initialElData.id));
    window.dispatchEvent(
      new CustomEvent("elementUpdated", {
        detail: EditorState.getElementById(initialElData.id),
      }),
    );
  }
});

window.addEventListener("mouseup", () => {
  if (isDragging || isResizing) {
    isDragging = false;
    isResizing = false;
    initialElData = null;
    backend.saveProject(projectId, EditorState.elements);
  }
});

window.addEventListener("propertiesChanged", (e) => {
  const id = e.detail;
  const elData = EditorState.getElementById(id);
  if (elData) {
    tools.renderElementToDOM(elData);
    window.dispatchEvent(new CustomEvent("refreshLayers"));
    backend.saveProject(projectId, EditorState.elements);
  }
});

window.addEventListener("requestSelection", (e) => {
  tools.selectElement(e.detail);
});

window.addEventListener("canvasReorder", () => {
  tools.renderAll();
  window.dispatchEvent(new CustomEvent("refreshLayers"));
  backend.saveProject(projectId, EditorState.elements);
});

document.addEventListener("keydown", (e) => {
  if (
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA" ||
    e.target.isContentEditable
  )
    return;

  if (e.key === "Delete" || e.key === "Backspace") {
    if (EditorState.selectedId) {
      EditorState.elements = EditorState.elements.filter(
        (el) => el.id !== EditorState.selectedId,
      );
      tools.renderAll();
      tools.deselectAll();
      window.dispatchEvent(new CustomEvent("refreshLayers"));
      backend.saveProject(projectId, EditorState.elements);
    }
  }

  if (EditorState.selectedId) {
    const el = EditorState.getElementById(EditorState.selectedId);
    const domEl = document.getElementById(el.id);
    const currentW = domEl ? domEl.offsetWidth : el.width;
    const currentH = domEl ? domEl.offsetHeight : el.height;
    const step = 5;
    let newX = el.x,
      newY = el.y;

    if (e.key === "ArrowRight")
      newX = Math.min(el.x + step, canvas.offsetWidth - currentW);
    if (e.key === "ArrowLeft") newX = Math.max(0, el.x - step);
    if (e.key === "ArrowDown")
      newY = Math.min(el.y + step, canvas.offsetHeight - currentH);
    if (e.key === "ArrowUp") newY = Math.max(0, el.y - step);

    if (newX !== el.x || newY !== el.y) {
      e.preventDefault();
      EditorState.updateElement(el.id, { x: newX, y: newY });
      tools.renderElementToDOM(EditorState.getElementById(el.id));
      window.dispatchEvent(
        new CustomEvent("elementUpdated", {
          detail: EditorState.getElementById(el.id),
        }),
      );
      backend.saveProject(projectId, EditorState.elements);
    }
  }

  if (e.key === "r" || e.key === "R")
    document.querySelector('[data-tool="rectangle"]').click();
  if (e.key === "t" || e.key === "T")
    document.querySelector('[data-tool="text"]').click();
  if (e.key === "v" || e.key === "V")
    document.querySelector('[data-tool="cursor"]').click();
});
