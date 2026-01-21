import { EditorState } from "./state.js";

export class ToolManager {
  constructor(canvasEl) {
    this.canvas = canvasEl;
  }

  handleCanvasClick(e) {
    if (EditorState.activeTool === "cursor") {
      this.deselectAll();
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = "el_" + Date.now();
    const type = EditorState.activeTool;

    const newElement = {
      id,
      type,
      x,
      y,
      width: type === "text" ? 150 : EditorState.defaults.width,
      height: type === "text" ? "auto" : EditorState.defaults.height,
      backgroundColor: type === "text" ? "transparent" : "#cbd5e1",
      borderRadius: 0,
      rotation: 0,
      borderWidth: 0,
      borderColor: "#000000",
      content: type === "text" ? "Double click to edit" : "",
      fontSize: 16,
      fontFamily: "Outfit, sans-serif",
      color: "#000000",
      zIndex: EditorState.elements.length + 1,
    };

    EditorState.addElement(newElement);
    this.renderElementToDOM(newElement);
    this.selectElement(id);

    EditorState.setActiveTool("cursor");
    window.dispatchEvent(new CustomEvent("toolChange", { detail: "cursor" }));
  }

  selectElement(id) {
    if (EditorState.selectedId === id) return;
    this.deselectAll();
    EditorState.selectedId = id;

    const el = document.getElementById(id);
    if (el) {
      el.classList.add("selected");
      this.addResizeHandles(el);
      window.dispatchEvent(new CustomEvent("elementSelected", { detail: id }));
    }
  }

  deselectAll() {
    if (EditorState.selectedId) {
      const el = document.getElementById(EditorState.selectedId);
      if (el) {
        el.classList.remove("selected");
        el.querySelectorAll(".resize-handle").forEach((h) => h.remove());
        el.blur();
      }
      EditorState.selectedId = null;
      window.dispatchEvent(new CustomEvent("elementDeselected"));
    }
  }

  addResizeHandles(el) {
    ["tl", "tr", "bl", "br"].forEach((pos) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle handle-${pos}`;
      handle.dataset.handle = pos;
      el.appendChild(handle);
    });
  }

  renderElementToDOM(data) {
    let el = document.getElementById(data.id);

    if (!el) {
      el = document.createElement("div");
      el.id = data.id;
      this.canvas.appendChild(el);

      el.addEventListener("dblclick", (e) => {
        if (data.type === "text") {
          e.stopPropagation();
          el.contentEditable = "true";
          el.focus();
          el.classList.add("text-editing");
          document.execCommand("selectAll", false, null);
        }
      });

      el.addEventListener("blur", () => {
        el.contentEditable = "false";
        el.classList.remove("text-editing");
        EditorState.updateElement(data.id, {
          content: el.innerText,
          width: el.offsetWidth,
          height: el.offsetHeight,
        });
        window.dispatchEvent(
          new CustomEvent("elementSelected", { detail: data.id }),
        );
      });

      el.addEventListener("keypress", (e) => {
        if (e.key === "Enter") e.stopPropagation();
      });
    }

    el.className = `canvas-element ${data.type} ${EditorState.selectedId === data.id ? "selected" : ""}`;
    el.style.position = "absolute";
    el.style.left = `${data.x}px`;
    el.style.top = `${data.y}px`;
    el.style.zIndex = data.zIndex;
    el.style.transform = `rotate(${data.rotation || 0}deg)`;
    el.style.boxSizing = "border-box";

    el.style.backgroundColor = data.backgroundColor;
    el.style.borderRadius = `${data.borderRadius}px`;
    el.style.border = `${data.borderWidth}px solid ${data.borderColor}`;

    if (data.type === "text") {
      if (document.activeElement !== el) {
        el.innerText = data.content;
      }
      el.style.fontSize = `${data.fontSize}px`;
      el.style.fontFamily = data.fontFamily;
      el.style.color = data.color;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.minWidth = "20px";

      el.style.width =
        data.width && data.width !== "auto" ? `${data.width}px` : "auto";
      el.style.height =
        data.height && data.height !== "auto" ? `${data.height}px` : "auto";
      el.style.outline = "none";
    } else {
      el.style.width = `${data.width}px`;
      el.style.height = `${data.height}px`;
    }

    if (
      EditorState.selectedId === data.id &&
      el.querySelectorAll(".resize-handle").length === 0
    ) {
      this.addResizeHandles(el);
    }
  }

  renderAll() {
    this.canvas.innerHTML = "";
    EditorState.elements.forEach((el) => this.renderElementToDOM(el));
  }
}
