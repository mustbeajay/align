export const EditorState = {
  elements: [],
  selectedId: null,
  activeTool: "cursor",

  defaults: {
    fill: "#d1d5db",
    stroke: "transparent",
    width: 100,
    height: 100,
    text: "Double click to edit",
    rotation: 0,
    borderWidth: 0,
    borderColor: "#000000",
  },

  addElement(element) {
    this.elements.push(element);
  },

  updateElement(id, updates) {
    const index = this.elements.findIndex((el) => el.id === id);
    if (index !== -1) {
      this.elements[index] = { ...this.elements[index], ...updates };
    }
  },

  reorderElement(id, direction) {
    const index = this.elements.findIndex((el) => el.id === id);
    if (index === -1) return false;

    if (direction === "up" && index < this.elements.length - 1) {
      [this.elements[index], this.elements[index + 1]] = [
        this.elements[index + 1],
        this.elements[index],
      ];
    } else if (direction === "down" && index > 0) {
      [this.elements[index], this.elements[index - 1]] = [
        this.elements[index - 1],
        this.elements[index],
      ];
    } else {
      return false;
    }

    this.elements.forEach((el, i) => {
      el.zIndex = i + 1;
    });

    return true;
  },

  getElementById(id) {
    return this.elements.find((el) => el.id === id);
  },

  setActiveTool(toolName) {
    this.activeTool = toolName;
  },
};
