
// ============================================
// NOTEBOOK VIEWER LOGIC
// ============================================

const NOTEBOOK_MODAL_ID = 'notebook-modal';
const NOTEBOOK_CONTENT_ID = 'notebook-render-area';
let pyodide = null;
let pyodideReadyPromise = null;

// Initialize Pyodide
async function loadPyodideRuntime() {
    if (pyodideReadyPromise) return pyodideReadyPromise;

    pyodideReadyPromise = (async () => {
        try {
            updateNotebookStatus('Initializing Python Runtime...', 'busy');
            // Load Pyodide script dynamically if not present
            if (!window.loadPyodide) {
                await loadScript('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
            }

            pyodide = await loadPyodide();

            // Pre-load common scientific stack
            await pyodide.loadPackage(['micropip', 'numpy', 'matplotlib', 'scikit-learn', 'pandas']);

            // Setup microsite mock for compatibility
            await pyodide.runPythonAsync(`
                import sys
                from js import console
                
                class MicrositeMock:
                    async def install(self, packages):
                        import micropip
                        await micropip.install(packages)
                        
                sys.modules['microsite'] = MicrositeMock()
            `);

            updateNotebookStatus('Python Ready', 'active');
            return pyodide;
        } catch (err) {
            console.error("Pyodide failed to load:", err);
            updateNotebookStatus('Python Init Failed', 'error');
            throw err;
        }
    })();

    return pyodideReadyPromise;
}

// Helper: Dynamically load a script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Main Entry Point: Open Notebook
async function openNotebook(source, title) {
    await initNotebookViewer();
    const modal = document.getElementById(NOTEBOOK_MODAL_ID);
    const contentArea = document.getElementById(NOTEBOOK_CONTENT_ID);
    const titleText = document.getElementById('notebook-title-text');

    // Show Modal
    modal.classList.remove('hidden');
    modal.classList.add('active'); // CSS class for visibility/animation

    // Reset Content
    titleText.textContent = title || 'Notebook';
    contentArea.innerHTML = '<div class="notebook-loading"><i class="fas fa-spinner fa-spin"></i> Loading Notebook...</div>';

    updateNotebookStatus('Loading...', 'not-ready');

    try {
        let notebookJson;

        if (typeof source === 'object') {
            // Direct data passed (bypass fetch for local file support)
            notebookJson = source;
        } else if (typeof source === 'string' && source.startsWith('global:')) {
            // Reference to global variable (for local file support)
            const varName = source.split(':')[1];
            if (window[varName]) {
                notebookJson = window[varName];
            } else {
                throw new Error(`Global notebook data '${varName}' not found`);
            }
        } else {
            // URL string passed
            const response = await fetch(source);
            if (!response.ok) throw new Error(`Failed to load notebook: ${response.statusText}`);
            notebookJson = await response.json();
        }

        renderNotebook(notebookJson, contentArea);
        updateNotebookStatus('Ready', 'not-ready');

        // Ensure Python is loading in background
        loadPyodideRuntime();

    } catch (err) {
        contentArea.innerHTML = `<div class="notebook-error">Error loading notebook: ${err.message}</div>`;
        updateNotebookStatus('Error', 'error');
    }
}

// Initialize Modal HTML
async function initNotebookViewer() {
    if (document.getElementById(NOTEBOOK_MODAL_ID)) return;

    // Add CSS dependencies dynamically if needed, or assume they are in notebook_style.css
    // Ensure marked.js and prism.js are available
    if (!window.marked) await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    if (!window.Prism) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js');
    }

    const modalHtml = `
        <div id="${NOTEBOOK_MODAL_ID}" class="notebook-modal hidden">
            <div class="notebook-modal-content">
                <div class="notebook-header">
                    <div class="notebook-top-bar">
                        <div class="notebook-title-container">
                             <h2 id="notebook-title-text"><i class="fas fa-book"></i> Notebook</h2>
                             <div class="status-badge" id="notebook-status-badge">
                                <span id="notebook-status-dot" class="status-dot"></span>
                                <span id="notebook-status">Idle</span>
                            </div>
                        </div>
                        <button id="close-notebook-modal" class="close-notebook-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="notebook-toolbar" id="notebook-action-toolbar">
                        <button class="toolbar-btn" onclick="openDocument('assets/DS Projects/MNIST Handwritten Digit Recognizer/MNIST Project Report.pdf', 'pdf')">
                            <i class="fas fa-file-pdf"></i> Report (PDF)
                        </button>
                        <div class="toolbar-separator"></div>
                        <button id="run-all-cells" class="toolbar-btn primary-action"><i class="fas fa-play"></i> Run all</button>
                    </div>
                    <!-- Back Toolbar (Hidden by default) -->
                    <div class="notebook-toolbar hidden" id="document-back-toolbar">
                         <button class="toolbar-btn" id="doc-back-btn"><i class="fas fa-arrow-left"></i> Back to Notebook</button>
                         <span class="toolbar-label" id="doc-viewer-title"></span>
                    </div>
                </div>
                <div class="notebook-body" id="notebook-main-body">
                     <div id="${NOTEBOOK_CONTENT_ID}" class="notebook-render-area"></div>
                </div>
                <!-- Document Viewer Area (Hidden by default) -->
                <div class="document-viewer-body hidden" id="document-viewer-body">
                    <embed id="doc-viewer-embed" src="" type="application/pdf" width="100%" height="100%"></embed>
                    <div id="doc-viewer-placeholder" class="hidden">
                        <i class="fas fa-file-download"></i>
                        <p id="doc-placeholder-text">This file type cannot be previewed directly here.</p>
                        <a id="doc-download-link" href="#" target="_blank">Download File</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Event Listeners
    const runAllBtn = document.getElementById('run-all-cells');
    if (runAllBtn) runAllBtn.addEventListener('click', runAllCells);

    document.getElementById('close-notebook-modal').addEventListener('click', closeNotebookModal);
    document.getElementById('doc-back-btn').addEventListener('click', closeDocument);

    const modal = document.getElementById(NOTEBOOK_MODAL_ID);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeNotebookModal();
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            if (!document.getElementById('document-viewer-body').classList.contains('hidden')) {
                closeDocument();
            } else {
                closeNotebookModal();
            }
        }
    });
}

function closeNotebookModal() {
    const modal = document.getElementById(NOTEBOOK_MODAL_ID);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
            // Reset to notebook view on close
            closeDocument();
        }, 300);
    }
}

async function openDocument(url, type) {
    const mainBody = document.getElementById('notebook-main-body');
    const docBody = document.getElementById('document-viewer-body');
    const actionToolbar = document.getElementById('notebook-action-toolbar');
    const backToolbar = document.getElementById('document-back-toolbar');
    const embedEl = document.getElementById('doc-viewer-embed');
    const placeholder = document.getElementById('doc-viewer-placeholder');
    const titleSpan = document.getElementById('doc-viewer-title');

    // Toggle Views
    mainBody.classList.add('hidden');
    actionToolbar.classList.add('hidden');
    docBody.classList.remove('hidden');
    backToolbar.classList.remove('hidden');

    titleSpan.textContent = url.split('/').pop();

    // Reset views
    embedEl.classList.add('hidden');
    placeholder.classList.add('hidden');
    embedEl.src = '';

    if (type === 'pdf') {
        embedEl.classList.remove('hidden');
        embedEl.src = url;
        embedEl.type = 'application/pdf';
    }
}

function closeDocument() {
    const mainBody = document.getElementById('notebook-main-body');
    const docBody = document.getElementById('document-viewer-body');
    const actionToolbar = document.getElementById('notebook-action-toolbar');
    const backToolbar = document.getElementById('document-back-toolbar');
    const embedEl = document.getElementById('doc-viewer-embed');
    const htmlContainer = document.getElementById('doc-viewer-html');

    // Toggle Views Back
    if (mainBody) mainBody.classList.remove('hidden');
    if (actionToolbar) actionToolbar.classList.remove('hidden');
    if (docBody) docBody.classList.add('hidden');
    if (backToolbar) backToolbar.classList.add('hidden');

    // Clear content
    if (embedEl) embedEl.src = '';
}

function updateNotebookStatus(text, type = 'neutral') {
    const statusEl = document.getElementById('notebook-status');
    const dotEl = document.getElementById('notebook-status-dot');
    if (statusEl && dotEl) {
        statusEl.textContent = text;
        // Reset classes
        dotEl.className = 'status-dot';
        dotEl.classList.add(type);
    }
}

// Render Notebook JSON to HTML
function renderNotebook(notebook, container) {
    container.innerHTML = '';

    if (!notebook.cells || !Array.isArray(notebook.cells)) {
        container.innerHTML = '<div class="notebook-error">Invalid notebook format</div>';
        return;
    }

    notebook.cells.forEach((cell, index) => {
        const cellEl = document.createElement('div');
        cellEl.className = `notebook-cell cell-${cell.cell_type}`;

        if (cell.cell_type === 'markdown') {
            const content = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
            cellEl.innerHTML = marked.parse(content);
        } else if (cell.cell_type === 'code') {
            renderCodeCell(cell, cellEl, index);
        }

        container.appendChild(cellEl);
    });

    // Trigger Prism highlight
    if (window.Prism) Prism.highlightAllUnder(container);
}

function renderCodeCell(cell, container, index) {
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source;

    const inputArea = document.createElement('div');
    inputArea.className = 'cell-input';

    // Code Editor/View
    const pre = document.createElement('pre');
    pre.className = 'line-numbers language-python';
    const code = document.createElement('code');
    code.textContent = source;
    pre.appendChild(code);

    // Run Button
    const runBtn = document.createElement('button');
    runBtn.className = 'cell-run-btn';
    runBtn.innerHTML = '<i class="fas fa-play"></i>';
    runBtn.title = 'Run Cell';
    const execFn = () => executeCell(source, outputArea, runBtn);
    runBtn.onclick = execFn;
    runBtn.executeFunction = execFn; // Store for Run All

    inputArea.appendChild(runBtn);
    inputArea.appendChild(pre);

    // Output Area
    const outputArea = document.createElement('div');
    outputArea.className = 'cell-output-container';

    // Pre-render existing outputs if any (static view)
    if (cell.outputs && cell.outputs.length > 0) {
        cell.outputs.forEach(output => {
            if (output.output_type === 'stream') {
                const text = Array.isArray(output.text) ? output.text.join('') : output.text;
                const outPre = document.createElement('pre');
                outPre.className = 'output-stream';
                outPre.textContent = text;
                outputArea.appendChild(outPre);
            } else if (output.output_type === 'display_data' || output.output_type === 'execute_result') {
                if (output.data && output.data['image/png']) {
                    const img = document.createElement('img');
                    img.src = 'data:image/png;base64,' + output.data['image/png'];
                    outputArea.appendChild(img);
                } else if (output.data && output.data['text/plain']) {
                    const outPre = document.createElement('pre');
                    outPre.className = 'output-result';
                    outPre.textContent = Array.isArray(output.data['text/plain']) ? output.data['text/plain'].join('') : output.data['text/plain'];
                    outputArea.appendChild(outPre);
                }
            } else if (output.output_type === 'error') {
                const errPre = document.createElement('pre');
                errPre.className = 'output-error';
                errPre.textContent = `${output.ename}: ${output.evalue}`;
                outputArea.appendChild(errPre);
            }
        });
    }

    container.appendChild(inputArea);
    container.appendChild(outputArea);
}

// Execute Python Code
async function executeCell(code, outputContainer, btn) {
    if (!pyodide) {
        const ready = await loadPyodideRuntime();
        if (!ready) {
            alert('Python runtime is still loading or failed. Please wait a moment.');
            return;
        }
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Clear previous dynamic outputs (optional: keep static? usually we allow overwrite)
    // outputContainer.innerHTML = ''; 
    // Append a separator if there's existing content
    if (outputContainer.children.length > 0) {
        const hr = document.createElement('hr');
        hr.className = 'output-separator';
        outputContainer.appendChild(hr);
    }

    try {
        // Capture stdout
        pyodide.setStdout({
            batched: (msg) => {
                const pre = document.createElement('pre');
                pre.className = 'output-stream';
                pre.textContent = msg;
                outputContainer.appendChild(pre);
            }
        });

        // Artificial delay for realism (~20s total for 7 cells -> ~2.8s per cell)
        // We vary it slightly to make it look natural
        const delay = 2000 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Run code
        // Ensure matplotlib works by using the inline backend shim if needed
        // For simple plots, we can fetch the current figure
        await pyodide.runPythonAsync(`
            import matplotlib.pyplot as plt
            plt.close('all') # Clear previous figures completely
            plt.show = lambda: None # Prevent show() from clearing/displaying so we can capture it
        `);

        let result = await pyodide.runPythonAsync(code);

        // Display Result (if not None)
        if (result !== undefined && result !== null) {
            const pre = document.createElement('pre');
            pre.className = 'output-result';
            pre.textContent = result.toString();
            outputContainer.appendChild(pre);
        }

        // Check for plots
        await pyodide.runPythonAsync(`
            import io, base64
            img_str = ""
            if plt.get_fignums():
                buf = io.BytesIO()
                plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0.1)
                buf.seek(0)
                img_str = base64.b64encode(buf.read()).decode('utf-8')
                plt.close('all') # Cleanup
        `);

        const imgStr = pyodide.globals.get('img_str');
        if (imgStr) {
            const img = document.createElement('img');
            img.src = 'data:image/png;base64,' + imgStr;
            outputContainer.appendChild(img);
        }

    } catch (err) {
        const pre = document.createElement('pre');
        pre.className = 'output-error';
        pre.textContent = err.toString();
        outputContainer.appendChild(pre);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Run All Cells Sequentially
async function runAllCells() {
    const runBtns = document.querySelectorAll('.cell-run-btn');
    if (runBtns.length === 0) return;

    const runAllBtn = document.getElementById('run-all-cells');
    runAllBtn.disabled = true;
    runAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';

    for (let btn of runBtns) {
        // Scroll cell into view
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Execute and wait
        // runBtn.onclick calls executeCell, but we need to wait for it.
        // We can extract the code processing logic or click and wait?
        // Limitation: onclick is not easily awaitable if it's not returning a promise to the caller of click()
        // But executeCell returns a promise.

        // Better approach: Re-implement logic here or ensuring executeCell is reachable?
        // executeCell is defined in this scope.

        // Get the parameters from the button's context? 
        // The button click handler is: () => executeCell(source, outputArea, runBtn)
        // We can't easily extract 'source' and 'outputArea' from the button element unless we stored them.

        // Let's modify renderCodeCell to store these reference on the button logic or simply click it?
        // If we click it, we can't await it.

        // FIX: Let's trigger the click, BUT we need to know when it finishes.
        // Hack: Check button disabled state? No, purely async.

        // Better: In renderCodeCell, let's attach the execution function to the DOM element for easy access
        if (btn.executeFunction) {
            await btn.executeFunction();
        }
    }

    runAllBtn.disabled = false;
    runAllBtn.innerHTML = '<i class="fas fa-play"></i> Run all';

    // Scroll to bottom after completion
    const mainBody = document.getElementById('notebook-main-body');
    if (mainBody) {
        mainBody.scrollTo({ top: mainBody.scrollHeight, behavior: 'smooth' });
    }
}
