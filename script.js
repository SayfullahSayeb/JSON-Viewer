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


    // Reset file input to allow re-uploading the same file
    function resetFileInput() {
        fileInput.value = '';
    }


    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });


    // Show Error Function
    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.add('visible', 'shake');
        formattedOutput.textContent = '';
        treeView.innerHTML = '';


        setTimeout(() => {
            errorMessage.classList.remove('shake');
        }, 500);
    }


    // Clear Error Message
    function clearError() {
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';
    }


    // Update Output Function
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


    // Format JSON Button
    formatBtn.addEventListener('click', () => {
        const input = jsonInput.value.trim();


        if (!input) {
            showError('Please enter JSON data');
            return;
        }


        try {
            parsedJSON = JSON.parse(input);
            // Validate that parsed JSON is an object or array
            if (parsedJSON === null || (typeof parsedJSON !== 'object' && !Array.isArray(parsedJSON))) {
                throw new Error('Invalid JSON structure');
            }


            jsonInput.value = '';
            clearError();
            updateOutput();
        } catch (err) {
            showError(err.message);
            parsedJSON = null;
            treeView.innerHTML = '';
            formattedOutput.textContent = '';
        }
    });


    // File Upload
    uploadBtn.addEventListener('click', () => {
        resetFileInput();
        fileInput.click();
    });


    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];


        if (!file) {
            showError('No file selected');
            return;
        }


        if (!file.name.toLowerCase().endsWith('.json')) {
            showError('Please upload a valid JSON file (.json)');
            resetFileInput();
            return;
        }


        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showError('File size too large. Maximum size is 5MB');
            resetFileInput();
            return;
        }


        const reader = new FileReader();


        reader.onload = (e) => {
            const content = e.target.result;
            try {
                parsedJSON = JSON.parse(content);
                clearError(); // Clear error message when a valid file is uploaded
                updateOutput();
            } catch (err) {
                showError('Invalid JSON in file');
                parsedJSON = null; // Reset parsedJSON on error
            }
        };


        reader.onerror = () => {
            showError('Error reading file');
        };


        reader.readAsText(file);
    });


    // Clear Button
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
        clearError(); // Clear any error messages
        parsedJSON = null;
        resetFileInput();
    });


    // View Toggle
    viewToggle.addEventListener('click', () => {
        if (!parsedJSON) return;
        currentView = currentView === 'tree' ? 'formatted' : 'tree';
        updateOutput();
    });


    // Copy Button
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


    // Download Button
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


    // Create Tree View Function
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
