# Align | Figma Clone
Align is a lightweight, browser-based graphics editor and prototyping tool designed to mimic the core functionalities of Figma. 

## 🚀 Getting Started
It is built using vanilla HTML, CSS, and JavaScript.

1. **Clone the repository**
    ```bash
    git clone https://github.com/mustbeajay/align.git
    ```

2. **Open the application**
    Navigate to the `Align` folder and open `index.html` in your preferred web browser.

    > **Note**: For the best experience, use a local server (like Live Server in VS Code)

## 🛠️ Technology Stack

- **HTML5**: Semantic structure for the editor interface.
- **CSS3**: Custom styling using CSS Variables and Flexbox/Grid for layout.
- **JavaScript (ES6+)**: Vanilla JS for application logic, state management, and canvas manipulation.

## 📂 Project Structure

```text
/
├── Figma Style Design Tool.pdf
└── Align/
    ├── about.html
    ├── auth.html
    ├── dashboard.html
    ├── editor.html
    ├── features.html
    ├── index.html
    ├── css/
    │   ├── auth.css
    │   ├── dashboard.css
    │   ├── editor.css
    │   ├── global.css
    │   └── landing.css
    └── js/
        ├── auth.js
        ├── dashboard.js
        ├── editor.js
        ├── landing.js
        ├── core/
        │   ├── editor.js
        │   ├── export.js
        │   ├── layers.js
        │   ├── properties.js
        │   ├── state.js
        │   └── tools.js
        ├── services/
        │   └── mockBackend.js
        └── utils/
            └── toast.js