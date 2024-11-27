// script.js
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const jsonInput = document.getElementById('jsonInput');
    const formatBtn = document.getElementById('formatBtn');
    const errorMessage = document.getElementById('errorMessage');
    const viewToggle = document.getElementById('viewToggle');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const formattedOutput = document.getElementById('formattedOutput');
    const treeView = document.getElementById('treeView');

    let currentView = 'tree';
    let parsedJSON = null;

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });

    // File Upload with Validation
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        // Check if a file was selected
        if (!file) {
            showError('No file selected');
            return;
        }

        // Validate file extension
        if (!file.name.toLowerCase().endsWith('.json')) {
            showError('Please upload a valid JSON file (.json)');
            fileInput.value = ''; // Clear the file input
            return;
        }

        // Validate file size (optional, set to 5MB here)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showError('File size too large. Maximum size is 5MB');
            fileInput.value = '';
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                // Try to parse the JSON to validate its structure
                parsedJSON = JSON.parse(content);
                
                // Check if the parsed result is null or not an object
                if (!parsedJSON || typeof parsedJSON !== 'object') {
                    throw new Error('Invalid JSON structure');
                }

                jsonInput.value = '';
                errorMessage.classList.remove('visible');
                updateOutput();
            } catch (err) {
                showError('Invalid JSON format in file. Please check the file contents.');
                parsedJSON = null;
                treeView.innerHTML = '';
                formattedOutput.textContent = '';
            }
        };

        reader.onerror = () => {
            showError('Error reading file');
        };

        reader.readAsText(file);
    });

    // Format JSON with better validation
    formatBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        
        if (!input) {
            showError('Please enter JSON data');
            return;
        }

        try {
            parsedJSON = JSON.parse(input);
            
            // Validate that parsed JSON is an object or array
            if (parsedJSON === null || typeof parsedJSON !== 'object') {
                throw new Error('Invalid JSON structure. Must be an object or array.');
            }

            jsonInput.value = '';
            errorMessage.classList.remove('visible');
            updateOutput();
        } catch (err) {
            showError(err.message);
            parsedJSON = null;
            treeView.innerHTML = '';
            formattedOutput.textContent = '';
        }
    });

    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.add('visible');
        // Add shake animation to error message
        errorMessage.classList.add('shake');
        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }
    // Clear
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
        errorMessage.classList.remove('visible');
        parsedJSON = null;
    });

    // Format JSON
    formatBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();
        try {
            if (!input) throw new Error('Please enter JSON data');
            parsedJSON = JSON.parse(input);
            jsonInput.value = '';
            errorMessage.classList.remove('visible');
            updateOutput();
        } catch (err) {
            showError(err.message);
        }
    });

    // View Toggle
    viewToggle.addEventListener('click', () => {
        if (!parsedJSON) return;
        currentView = currentView === 'tree' ? 'formatted' : 'tree';
        updateOutput();
    });

    // Copy
    copyBtn.addEventListener('click', () => {
        if (!parsedJSON) return;
        const textToCopy = JSON.stringify(parsedJSON, null, 2);
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                const oldText = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = oldText;
                }, 2000);
            });
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        if (!parsedJSON) return;
        const blob = new Blob([JSON.stringify(parsedJSON, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.add('visible');
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
    }

    function updateOutput() {
        if (!parsedJSON) return;

        if (currentView === 'formatted') {
            formattedOutput.style.display = 'block';
            treeView.style.display = 'none';
            formattedOutput.textContent = JSON.stringify(parsedJSON, null, 2);
        } else {
            formattedOutput.style.display = 'none';
            treeView.style.display = 'block';
            treeView.innerHTML = '';
            createTreeView(parsedJSON, treeView);
        }
    }

    function createTreeView(data, parent) {
        if (typeof data === 'object' && data !== null) {
            Object.entries(data).forEach(([key, value]) => {
                const item = document.createElement('div');
                item.className = 'tree-item';

                const keySpan = document.createElement('span');
                keySpan.className = 'key';
                keySpan.textContent = `${key}`;

                if (typeof value === 'object' && value !== null) {
                    const collapsible = document.createElement('div');
                    collapsible.className = 'collapsible';
                    
                    const expander = document.createElement('span');
                    expander.className = 'expander';
                    expander.textContent = '▶';
                    
                    const content = document.createElement('div');
                    content.className = 'collapsed-content';
                    content.style.display = 'none';
                    
                    collapsible.appendChild(expander);
                    collapsible.appendChild(keySpan);
                    collapsible.appendChild(document.createTextNode(': ' + (Array.isArray(value) ? '[' : '{')));
                    
                    item.appendChild(collapsible);
                    item.appendChild(content);
                    
                    createTreeView(value, content);
                    
                    const closingBrace = document.createElement('div');
                    closingBrace.className = 'closing-brace';
                    closingBrace.style.paddingLeft = '20px';
                    closingBrace.textContent = Array.isArray(value) ? ']' : '}';
                    item.appendChild(closingBrace);
                    
                    collapsible.addEventListener('click', (e) => {
                        e.stopPropagation();
                        expander.textContent = content.style.display === 'none' ? '▼' : '▶';
                        content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    });
                } else {
                    const valueSpan = document.createElement('span');
                    valueSpan.className = `value ${typeof value}`;
                    valueSpan.textContent = JSON.stringify(value);
                    
                    item.appendChild(keySpan);
                    item.appendChild(document.createTextNode(': '));
                    item.appendChild(valueSpan);
                }
                
                parent.appendChild(item);
            });
        }
    }
});