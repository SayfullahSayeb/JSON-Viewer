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
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const urlInput = document.getElementById('urlInput');
    const fetchUrlBtn = document.getElementById('fetchUrlBtn');


    let currentView = 'tree';
    let parsedJSON = null;


    // Reset file input to allow re-uploading the same file
    function resetFileInput() {
        fileInput.value = '';
    }


    // Clear Error Message
    function clearError() {
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';
    }


    // Show Error Function
    function showError(message) {
        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.add('visible', 'shake');
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
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


    // Fetch JSON from URL
    fetchUrlBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();


        if (!url) {
            showError('Please enter a URL');
            return;
        }


        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }


            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('URL does not point to valid JSON data');
            }


            const data = await response.json();
            parsedJSON = data; // Store the parsed JSON
            clearError(); // Clear previous error messages
            updateOutput(); // Update the output with the fetched JSON
            urlInput.value = ''; // Clear the URL input box
        } catch (error) {
            showError(error.message); // Show error message for fetching
            parsedJSON = null; // Reset parsedJSON on error
            formattedOutput.textContent = '';
            treeView.innerHTML = '';
        }
    });


    // File Upload
    uploadBtn.addEventListener('click', () => {
        resetFileInput();
        fileInput.click();
    });


    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];


        // Clear JSON input box and filename display when file is selected
        jsonInput.value = '';
        fileNameDisplay.textContent = ''; // Clear previous filename


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
                fileNameDisplay.textContent = `Loaded: ${file.name}`;
                clearError();
                updateOutput();
            } catch (err) {
                showError('Invalid JSON file');
                fileNameDisplay.textContent = ''; // Clear filename on error
                parsedJSON = null;
                formattedOutput.textContent = '';
                treeView.innerHTML = '';
            }
        };


        reader.onerror = () => {
            showError('Error reading file');
            fileNameDisplay.textContent = ''; // Clear filename on error
            parsedJSON = null;
            formattedOutput.textContent = '';
            treeView.innerHTML = '';
        };


        reader.readAsText(file);
    });


    // Clear Button
    clearBtn.addEventListener('click', () => {
        jsonInput.value = '';
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
        fileNameDisplay.textContent = ''; // Clear filename
        clearError();
        parsedJSON = null;
        resetFileInput();
        urlInput.value = ''; // Clear the URL input box
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
