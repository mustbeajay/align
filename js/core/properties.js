import { EditorState } from "./state.js";

export class PropertiesPanel {
  constructor() {
    this.container = document.getElementById("properties-panel");
    this.init();
  }

  init() {
    window.addEventListener("elementSelected", (e) => {
      const el = EditorState.getElementById(e.detail);
      if (el) this.render(el);
    });
    window.addEventListener("elementDeselected", () => this.clear());
    window.addEventListener("elementUpdated", (e) => {
      if (EditorState.selectedId === e.detail.id)
        this.updateInputValues(e.detail);
    });
  }

  clear() {
    this.container.innerHTML = `<div class="empty-selection"><p>Select an element to edit</p></div>`;
  }

  render(data) {
    let html = `
            <div class="prop-section">
                <label class="section-title">Layout</label>
                <div class="prop-grid">
                    <div class="input-group"><span class="input-icon">X</span><input type="number" id="prop-x" value="${Math.round(data.x || 0)}"></div>
                    <div class="input-group"><span class="input-icon">Y</span><input type="number" id="prop-y" value="${Math.round(data.y || 0)}"></div>
                    <div class="input-group"><span class="input-icon">W</span><input type="number" id="prop-w" value="${Math.round(data.width || 0)}"></div>
                    <div class="input-group"><span class="input-icon">H</span><input type="number" id="prop-h" value="${Math.round(data.height || 0)}"></div>
                    <div class="input-group"><span class="input-icon">R°</span><input type="number" id="prop-rotation" value="${data.rotation || 0}"></div>
                </div>
            </div>
            <div class="prop-divider"></div>
            <div class="prop-section">
                <label class="section-title">Appearance</label>
                <div class="prop-row">
                    <label>Fill</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="prop-bg" value="${this.ensureHex(data.backgroundColor)}">
                        <span class="color-value">${data.backgroundColor}</span>
                    </div>
                </div>
                ${
                  data.type !== "text"
                    ? `
                <div class="prop-row">
                    <label>Radius</label>
                    <div class="range-wrapper">
                        <input type="range" id="prop-radius" min="0" max="100" value="${data.borderRadius || 0}">
                        <span class="range-val">${data.borderRadius || 0}</span>
                    </div>
                </div>
                <div class="prop-row">
                    <label>Border</label>
                    <div class="color-input-wrapper">
                        <input type="color" id="prop-border-color" value="${this.ensureHex(data.borderColor)}">
                    </div>
                    <input type="number" id="prop-border-width" value="${data.borderWidth || 0}" style="width: 40px; text-align: right; border: 1px solid #eee; border-radius: 4px;">
                </div>
                `
                    : ""
                }
            </div>
        `;

    if (data.type === "text") {
      html += `
                <div class="prop-divider"></div>
                <div class="prop-section">
                    <label class="section-title">Typography</label>
                    <div class="prop-row vertical">
                        <label>Content</label>
                        <textarea id="prop-content" rows="2">${data.content}</textarea>
                    </div>
                    <div class="prop-row">
                        <label>Color</label>
                        <input type="color" id="prop-color" value="${this.ensureHex(data.color)}">
                    </div>
                    <div class="prop-row">
                        <label>Size</label>
                        <input type="number" id="prop-size" value="${data.fontSize || 16}">
                    </div>
                    <div class="prop-row">
                        <label>Font</label>
                        <select id="prop-font">
                            <option value="Outfit, sans-serif" ${data.fontFamily.includes("Outfit") ? "selected" : ""}>Outfit</option>
                            <option value="Inter, sans-serif" ${data.fontFamily.includes("Inter") ? "selected" : ""}>Inter</option>
                            <option value="'Courier New', monospace" ${data.fontFamily.includes("Courier") ? "selected" : ""}>Monospace</option>
                            <option value="'Times New Roman', serif" ${data.fontFamily.includes("Times") ? "selected" : ""}>Serif</option>
                            <option value="'Brush Script MT', cursive" ${data.fontFamily.includes("Brush") ? "selected" : ""}>Cursive</option>
                        </select>
                    </div>
                </div>
            `;
    }

    this.container.innerHTML = html;
    this.attachListeners(data.id);
  }

  attachListeners(id) {
    const update = (changes) => {
      EditorState.updateElement(id, changes);
      window.dispatchEvent(
        new CustomEvent("propertiesChanged", { detail: id }),
      );
    };

    ["x", "y", "w", "h", "rotation"].forEach((key) => {
      const el = document.getElementById(`prop-${key}`);
      if (el)
        el.addEventListener("input", (e) =>
          update({
            [key === "w" ? "width" : key === "h" ? "height" : key]:
              parseInt(e.target.value) || 0,
          }),
        );
    });

    const bgInput = document.getElementById("prop-bg");
    if (bgInput)
      bgInput.addEventListener("input", (e) => {
        update({ backgroundColor: e.target.value });
        bgInput.nextElementSibling.innerText = e.target.value;
      });

    const radiusInput = document.getElementById("prop-radius");
    if (radiusInput)
      radiusInput.addEventListener("input", (e) => {
        update({ borderRadius: parseInt(e.target.value) });
        radiusInput.nextElementSibling.innerText = e.target.value;
      });

    const borderWidth = document.getElementById("prop-border-width");
    if (borderWidth)
      borderWidth.addEventListener("input", (e) =>
        update({ borderWidth: parseInt(e.target.value) }),
      );

    const borderColor = document.getElementById("prop-border-color");
    if (borderColor)
      borderColor.addEventListener("input", (e) =>
        update({ borderColor: e.target.value }),
      );

    const contentInput = document.getElementById("prop-content");
    if (contentInput) {
      contentInput.addEventListener("input", (e) =>
        update({ content: e.target.value }),
      );
      document
        .getElementById("prop-color")
        .addEventListener("input", (e) => update({ color: e.target.value }));
      document
        .getElementById("prop-size")
        .addEventListener("input", (e) =>
          update({ fontSize: parseInt(e.target.value) }),
        );
      document
        .getElementById("prop-font")
        .addEventListener("change", (e) =>
          update({ fontFamily: e.target.value }),
        );
    }
  }
  updateInputValues(data) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && document.activeElement !== el) {
        const safeVal =
          val === undefined || val === null || isNaN(val) ? 0 : val;
        el.value = Math.round(safeVal);
      }
    };
    setVal("prop-x", data.x);
    setVal("prop-y", data.y);
    setVal("prop-w", data.width);
    setVal("prop-h", data.height);
    setVal("prop-rotation", data.rotation);
  }

  ensureHex(color) {
    if (!color || color === "transparent") return "#ffffff";
    if (color.startsWith("#")) return color;
    return "#000000";
  }
}
