document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const urlInput = document.getElementById('urlInput');
    const jsonInput = document.getElementById('jsonInput');
    const fetchUrlBtn = document.getElementById('fetchUrlBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const formattedOutput = document.getElementById('formattedOutput');
    const treeView = document.getElementById('treeView');
    const errorMessage = document.getElementById('errorMessage');
    const viewToggle = document.getElementById('viewToggle');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const themeToggle = document.getElementById('themeToggle');
    const clearBtn = document.getElementById('clearBtn');
    const body = document.body;


    // State Variables
    let currentJSON = null;
    let currentView = 'tree'; // Default to tree view first

    // Theme Toggle Functionality
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.remove('light-mode');
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        }
    });
    
        // Check saved theme on page load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

    // Clear Button Functionality
    clearBtn.addEventListener('click', () => {
        // Reset all inputs
        fileInput.value = '';
        urlInput.value = '';
        jsonInput.value = '';


        // Clear outputs
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';


        // Reset state
        currentJSON = null;
        currentView = 'tree';
    });


    // Improved Tree View Renderer
    function renderTreeView(data, container) {
        container.innerHTML = ''; // Clear previous content


        function createDetailedTreeElement(obj, depth = 0) {
            if (typeof obj !== 'object' || obj === null) {
                return document.createTextNode(String(obj));
            }


            const treeContainer = document.createElement('div');
            treeContainer.className = 'json-tree';


            Object.entries(obj).forEach(([key, value]) => {
                const itemWrapper = document.createElement('div');
                itemWrapper.className = 'tree-item';
                itemWrapper.style.paddingLeft = `${depth * 20}px`;


                const keyElement = document.createElement('span');
                keyElement.className = 'tree-key';
                keyElement.textContent = key;


                const valueElement = document.createElement('span');
                valueElement.className = 'tree-value';


                if (typeof value === 'object' && value !== null) {
                    const detailsEl = document.createElement('details');
                    const summaryEl = document.createElement('summary');
                    summaryEl.appendChild(keyElement);
                    summaryEl.innerHTML += Array.isArray(value) 
                        ? ` <span class="type">[${value.length} items]</span>` 
                        : ` <span class="type">{${Object.keys(value).length} props}</span>`;
                    detailsEl.appendChild(summaryEl);
                    const nestedContent = createDetailedTreeElement(value, depth + 1);
                    detailsEl.appendChild(nestedContent);
                    itemWrapper.appendChild(detailsEl);
                } else {
                    itemWrapper.appendChild(keyElement);
                    const separator = document.createElement('span');
                    separator.textContent = ': ';
                    separator.className = 'separator';
                    itemWrapper.appendChild(separator);
                    valueElement.textContent = JSON.stringify(value);
                    itemWrapper.appendChild(valueElement);
                }


                treeContainer.appendChild(itemWrapper);
            });


            return treeContainer;
        }


        container.appendChild(createDetailedTreeElement(data));
    }


    // Update View Function
    function updateView() {
        if (!currentJSON) return;


        formattedOutput.style.display = 'none';
        treeView.style.display = 'none';


        if (currentView === 'tree') {
            treeView.style.display = 'block';
            renderTreeView(currentJSON, treeView);
        } else {
            formattedOutput.style.display = 'block';
            formattedOutput.textContent = JSON.stringify(currentJSON, null, 2);
        }
    }


    // View Toggle
    viewToggle.addEventListener('click', () => {
        currentView = currentView === 'tree' ? 'formatted' : 'tree';
        updateView();
    });


    // File Upload Handler
    function handleFileUpload(file) {
        if (!file) {
            showError('No file selected');
            return;
        }


        if (!file.name.toLowerCase().endsWith('.json')) {
            showError('Please upload a valid JSON file');
            return;
        }


        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                currentJSON = JSON.parse(e.target.result);
                urlInput.value = '';
                jsonInput.value = '';
                clearError();
                currentView = 'tree'; // Default to tree view
                updateView();
            } catch (error) {
                showError(`JSON Parsing Error: ${error.message}`);
            }
        };
        reader.onerror = () => {
            showError('Error reading file');
        };
        reader.readAsText(file);
    }


// File Input Event
fileInput.addEventListener('click', (e) => {
    // Reset the input to allow selecting the same file again
    e.target.value = '';
});


fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
});


// File Upload Handler
function handleFileUpload(file) {
    if (!file) {
        showError('No file selected');
        return;
    }


    // Check file extension (case-insensitive)
    if (!file.name.toLowerCase().endsWith('.json')) {
        showError('Please upload a valid JSON file');
        fileInput.value = ''; // Clear the input
        clearFileName(); // Clear the displayed file name
        return;
    }


    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            // Parse the file content
            const fileContent = e.target.result;


            // Attempt to parse JSON
            currentJSON = JSON.parse(fileContent);


            // Clear other input fields
            urlInput.value = '';
            jsonInput.value = '';


            // Clear any previous errors
            clearError();


            // Set default view to tree
            currentView = 'tree';


            // Display the file name
            displayFileName(file.name);

            // Show the file name display
            const fileNameDisplay = document.getElementById('fileNameDisplay');
            fileNameDisplay.classList.add('visible'); 


            // Update the view
            updateView();
        } catch (error) {
            // Show parsing error with the file name
            showError(`JSON Parsing Error in file "${file.name}": ${error.message}`);


            // Clear URL and JSON textarea if there is an error
            urlInput.value = '';
            jsonInput.value = '';
            clearFileName(); // Clear the displayed file name
        }
    };


    reader.onerror = () => {
        showError(`Error reading file "${file.name}"`);
        clearFileName(); // Clear the displayed file name
    };


    // Read the file as text
    reader.readAsText(file);
}


// Function to display the file name
function displayFileName(fileName) {
    const fileNameDisplay = document.getElementById('fileNameDisplay'); // Assuming you have an element with this ID
    fileNameDisplay.textContent = `Loaded File: ${fileName}`; // Update the display
}


// Function to clear the displayed file name
function clearFileName() {
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    fileNameDisplay.textContent = ''; // Clear the display
}


// Function to handle data from URL or JSON input
function handleDataFromInput() {
    // Assuming you have logic here to handle data from URL or JSON input
    // After processing the data, clear the file name
    clearFileName();
}


// Function to display the file name
function displayFileName(fileName) {
    const fileNameDisplay = document.getElementById('fileNameDisplay'); // Assuming you have an element with this ID
    fileNameDisplay.textContent = `Loaded File: ${fileName}`; // Update the display
}


    // Upload Button Event
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });


    // URL Fetch Handler
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


            const jsonData = await response.json();
            currentJSON = jsonData;
            jsonInput.value = '';
            fileInput.value = '';
            clearError();
            currentView = 'tree'; // Default to tree view
            updateView();
        } catch (error) {
            showError(`URL Fetch Error: ${error.message}`);
        }
    });


    // JSON Input (Textarea) Event
    jsonInput.addEventListener('input', () => {
        const jsonText = jsonInput.value.trim();
        
        if (!jsonText) {
            currentJSON = null;
            formattedOutput.textContent = '';
            treeView.innerHTML = '';
            return;
        }


        try {
            currentJSON = JSON.parse(jsonText);
            urlInput.value = '';
            fileInput.value = '';
            clearError();
            currentView = 'tree'; // Default to tree view
            updateView();
        } catch (error) {
            showError(`JSON Parsing Error: ${error.message}`);
        }
    });


    // Error Handling Functions
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        formattedOutput.textContent = '';
        treeView.innerHTML = '';
    }


    function clearError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }


    // Initialize theme on load (Optional)
    // function initializeTheme() { /* theme initialization logic */ }
    // initializeTheme();
});
