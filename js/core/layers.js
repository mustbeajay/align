import { EditorState } from "./state.js";

export class LayersPanel {
  constructor() {
    this.container = document.getElementById("layers-list");
    this.init();
  }

  init() {
    ["elementSelected", "elementDeselected", "refreshLayers"].forEach((evt) => {
      window.addEventListener(evt, () => this.render());
    });
  }

  render() {
    this.container.innerHTML = "";

    if (EditorState.elements.length === 0) {
      this.container.innerHTML = `<div class="empty-layers">No elements</div>`;
      return;
    }

    const layers = [...EditorState.elements].reverse();

    layers.forEach((el) => {
      const item = document.createElement("div");
      const isSelected = EditorState.selectedId === el.id;
      item.className = `layer-item ${isSelected ? "selected" : ""}`;

      const icon = el.type === "text" ? "ri-text" : "ri-shape-line";
      const rawName = el.type === "text" ? el.content : "Rectangle";
      const name =
        rawName.length > 18 ? rawName.substring(0, 18) + "..." : rawName;

      item.innerHTML = `
                <div class="layer-info">
                    <i class="${icon}"></i>
                    <span>${name}</span>
                </div>
                ${
                  isSelected
                    ? `
                <div class="layer-actions">
                    <button class="layer-btn up" title="Bring Forward"><i class="ri-arrow-up-s-line"></i></button>
                    <button class="layer-btn down" title="Send Backward"><i class="ri-arrow-down-s-line"></i></button>
                </div>
                `
                    : ""
                }
            `;

      item.addEventListener("click", (e) => {
        if (e.target.closest(".layer-btn")) return;
        if (EditorState.selectedId !== el.id) {
          window.dispatchEvent(
            new CustomEvent("requestSelection", { detail: el.id }),
          );
        }
      });

      if (isSelected) {
        const upBtn = item.querySelector(".up");
        const downBtn = item.querySelector(".down");
        upBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleReorder(el.id, "up");
        });
        downBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.handleReorder(el.id, "down");
        });
      }

      this.container.appendChild(item);
    });
  }

  handleReorder(id, direction) {
    const changed = EditorState.reorderElement(id, direction);
    if (changed) {
      window.dispatchEvent(new CustomEvent("canvasReorder"));
      this.render();
    }
  }
}
