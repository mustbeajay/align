import { EditorState } from './state.js';

export class ExportManager {
    
    
    downloadJSON(projectName) {
        const dataStr = JSON.stringify(EditorState.elements, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        this.triggerDownload(blob, `${projectName}.json`);
    }

    downloadHTML(projectName) {
        let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; }
        .canvas { position: relative; width: 800px; height: 600px; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); overflow: hidden; }
        .element { position: absolute; box-sizing: border-box; display: flex; align-items: center; overflow: hidden; }
    </style>
</head>
<body>
    <div class="canvas">
`;

        EditorState.elements.forEach(el => {
            const isText = el.type === 'text';
            const border = el.borderWidth > 0 ? `border: ${el.borderWidth}px solid ${el.borderColor};` : '';
            const bg = el.backgroundColor;
            
            
            const style = `
                left: ${el.x}px;
                top: ${el.y}px;
                width: ${isText ? 'auto' : el.width + 'px'};
                height: ${isText ? 'auto' : el.height + 'px'};
                z-index: ${el.zIndex};
                transform: rotate(${el.rotation || 0}deg);
                background-color: ${bg};
                border-radius: ${el.borderRadius || 0}px;
                ${border}
                ${isText ? `
                    font-size: ${el.fontSize}px;
                    font-family: ${el.fontFamily};
                    color: ${el.color};
                    white-space: nowrap;
                ` : ''}
            `;

            htmlContent += `        <div class="element" style="${style.replace(/\n/g, ' ')}">${isText ? el.content : ''}</div>\n`;
        });

        htmlContent += `    </div>\n</body>\n</html>`;

        const blob = new Blob([htmlContent], { type: "text/html" });
        this.triggerDownload(blob, `${projectName}.html`);
    }

    triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}