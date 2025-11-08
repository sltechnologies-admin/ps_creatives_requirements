// Grid Data Manager
class GridManager {
    constructor() {
        this.data = [];
        this.sortColumn = 'no';
        this.sortDirection = 'asc';
        this.apiUrl = 'https://localhost:7130/api/Client/hierarchy';
        this.isLoadingFromApi = false;
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderGrid();
        this.attachEventListeners();
        this.updateSummary();
    }

    // Load data from API first, fallback to localStorage
    async loadData() {
        // Try loading from localStorage first for offline capability
        const saved = localStorage.getItem('gridData');
        if (saved) {
            this.data = JSON.parse(saved);
            this.renderGrid();
            this.updateSummary();
        }

        // Then try to fetch from API
        try {
            this.isLoadingFromApi = true;
            this.showLoadingIndicator();
            
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiData = await response.json();
            
            // Transform API data to grid format
            this.data = this.transformApiData(apiData);
            
            // Save to localStorage for offline use
            this.saveData();
            
            // Re-render with fresh data
            this.renderGrid();
            this.updateSummary();
            
            this.showSuccessMessage('Data loaded from server successfully!');
            
        } catch (error) {
            console.error('Error loading data from API:', error);
            
            // If we have cached data, use it
            if (this.data.length > 0) {
                this.showWarningMessage('Using cached data. Server unavailable.');
            } else {
                // No cached data, initialize with empty array
                this.data = [];
                this.showErrorMessage('Failed to load data. You can start adding rows manually.');
            }
        } finally {
            this.isLoadingFromApi = false;
            this.hideLoadingIndicator();
        }
    }

    // Transform API response to grid data format
    transformApiData(apiResponse) {
        const gridData = [];
        
        // Iterate through clients and their projects
        apiResponse.forEach(client => {
            client.projects.forEach(project => {
                project.milestones.forEach(milestone => {
                    const gridRow = {
                        id: this.generateId(),
                        milestoneId: milestone.milestoneId,
                        no: milestone.no,
                        page: milestone.page || '',
                        childPage: milestone.childPage || '',
                        milestone: milestone.milestoneFeature || '',
                        description: milestone.description || '',
                        remarks: milestone.remarks || '',
                        demoDate: milestone.demoDate ? this.formatDate(milestone.demoDate) : '',
                        deploymentDate: milestone.deploymentDate ? this.formatDate(milestone.deploymentDate) : '',
                        percentCost: milestone.percentOfCost || 0,
                        amount: this.calculateAmount(milestone.percentOfCost || 0),
                        // Store additional metadata
                        clientId: client.clientId,
                        clientName: client.clientName,
                        projectId: project.projectId
                    };
                    gridData.push(gridRow);
                });
            });
        });
        
        return gridData;
    }

    // Format date from API (handle ISO format)
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    }

    // Calculate amount based on percent (you can modify the total budget)
    calculateAmount(percentCost) {
        const totalBudget = 100000; // Default total budget, can be configured
        return (percentCost / 100) * totalBudget;
    }

    // Show loading indicator
    showLoadingIndicator() {
        const tbody = document.getElementById('gridBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading data from server...</p>
                </td>
            </tr>
        `;
    }

    // Hide loading indicator
    hideLoadingIndicator() {
        // Will be replaced by actual data rendering
    }

    // Show success message
    showSuccessMessage(message) {
        this.showToast(message, 'success');
    }

    // Show warning message
    showWarningMessage(message) {
        this.showToast(message, 'warning');
    }

    // Show error message
    showErrorMessage(message) {
        this.showToast(message, 'danger');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} alert-dismissible fade show`;
        toast.role = 'alert';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    // Create toast container if it doesn't exist
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.maxWidth = '400px';
        document.body.appendChild(container);
        return container;
    }

    // Reload data from API
    async reloadFromApi() {
        if (confirm('Reload data from server? Any unsaved local changes will be overwritten.')) {
            await this.loadData();
        }
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('gridData', JSON.stringify(this.data));
        this.updateLastSaved();
        this.updateSummary();
    }

    // Generate unique ID
    generateId() {
        return 'row_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Render the entire grid
    renderGrid() {
        const tbody = document.getElementById('gridBody');
        tbody.innerHTML = '';

        // Apply search filter
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        
        let filteredData = this.data.filter(row => {
            const matchesSearch = !searchTerm || 
                row.page.toLowerCase().includes(searchTerm) || 
                row.milestone.toLowerCase().includes(searchTerm) ||
                row.childPage.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || this.getRowStatus(row) === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Apply sorting
        filteredData.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        filteredData.forEach(row => {
            tbody.appendChild(this.createRow(row));
        });
    }

    // Get row status based on dates
    getRowStatus(row) {
        const today = new Date().toISOString().split('T')[0];
        if (row.deploymentDate && row.deploymentDate <= today) {
            return 'deployed';
        } else if (row.demoDate && row.demoDate <= today) {
            return 'demo-done';
        }
        return 'pending';
    }

    // Create a single row element
    createRow(rowData) {
        const tr = document.createElement('tr');
        tr.dataset.rowId = rowData.id;
        
        // Apply status-based styling
        const status = this.getRowStatus(rowData);
        if (status === 'deployed') {
            tr.classList.add('table-success');
        } else if (status === 'demo-done') {
            tr.classList.add('table-warning');
        }

        tr.innerHTML = `
            <td class="text-center">${rowData.no}</td>
            <td class="editable" data-field="page" data-type="text">${this.escapeHtml(rowData.page)}</td>
            <td class="editable" data-field="childPage" data-type="text">${this.escapeHtml(rowData.childPage)}</td>
            <td class="editable" data-field="milestone" data-type="text">${this.escapeHtml(rowData.milestone)}</td>
            <td class="editable" data-field="description" data-type="textarea">${this.escapeHtml(rowData.description)}</td>
            <td class="editable" data-field="remarks" data-type="textarea">${this.escapeHtml(rowData.remarks)}</td>
            <td class="editable" data-field="demoDate" data-type="date">${rowData.demoDate || ''}</td>
            <td class="editable" data-field="deploymentDate" data-type="date">${rowData.deploymentDate || ''}</td>
            <td class="editable" data-field="percentCost" data-type="number">
                <div class="d-flex align-items-center">
                    <span class="me-2">${rowData.percentCost}%</span>
                    <div class="progress flex-grow-1" style="height: 8px; width: 50px;">
                        <div class="progress-bar" style="width: ${rowData.percentCost}%"></div>
                    </div>
                </div>
            </td>
            <td class="editable" data-field="amount" data-type="number">$${this.formatNumber(rowData.amount)}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-danger delete-btn" data-row-id="${rowData.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        return tr;
    }

    // Make cell editable on click
    makeEditable(cell) {
        if (cell.querySelector('input, textarea')) return; // Already editing

        const field = cell.dataset.field;
        const type = cell.dataset.type;
        const rowId = cell.closest('tr').dataset.rowId;
        const row = this.data.find(r => r.id === rowId);
        const currentValue = row[field];

        let input;
        
        if (type === 'textarea') {
            input = document.createElement('textarea');
            input.className = 'form-control form-control-sm';
            input.rows = 2;
        } else {
            input = document.createElement('input');
            input.className = 'form-control form-control-sm';
            input.type = type;
            
            if (type === 'number') {
                input.min = 0;
                if (field === 'percentCost') {
                    input.max = 100;
                    input.step = 1;
                }
            }
        }

        input.value = currentValue || '';
        
        // Save on blur
        input.addEventListener('blur', () => {
            this.saveCell(cell, input.value, rowId, field);
        });

        // Save on Enter (except for textarea)
        if (type !== 'textarea') {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
            });
        }

        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
    }

    // Save cell value
    saveCell(cell, value, rowId, field) {
        const row = this.data.find(r => r.id === rowId);
        
        // Validate and convert value
        if (field === 'percentCost' || field === 'amount') {
            value = parseFloat(value) || 0;
            if (field === 'percentCost') {
                value = Math.max(0, Math.min(100, value));
            }
        }
        
        row[field] = value;
        this.saveData();
        this.renderGrid();
    }

    // Add new row
    addRow() {
        const newRow = {
            id: this.generateId(),
            no: this.data.length + 1,
            page: 'New Page',
            childPage: '',
            milestone: '',
            description: '',
            remarks: '',
            demoDate: '',
            deploymentDate: '',
            percentCost: 0,
            amount: 0
        };
        
        this.data.push(newRow);
        this.saveData();
        this.renderGrid();
    }

    // Delete row
    deleteRow(rowId) {
        if (confirm('Are you sure you want to delete this row?')) {
            this.data = this.data.filter(r => r.id !== rowId);
            // Renumber rows
            this.data.forEach((row, index) => {
                row.no = index + 1;
            });
            this.saveData();
            this.renderGrid();
        }
    }

    // Export to JSON
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `project-scope-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Import from JSON
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    if (confirm('This will replace all existing data. Continue?')) {
                        this.data = imported;
                        this.saveData();
                        this.renderGrid();
                        alert('Data imported successfully!');
                    }
                } else {
                    alert('Invalid JSON format');
                }
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
            this.data = [];
            this.saveData();
            this.renderGrid();
        }
    }

    // Update summary statistics
    updateSummary() {
        const totalRows = this.data.length;
        const totalCost = this.data.reduce((sum, row) => sum + (row.amount || 0), 0);
        const avgProgress = totalRows > 0 
            ? this.data.reduce((sum, row) => sum + (row.percentCost || 0), 0) / totalRows 
            : 0;

        document.getElementById('totalRows').textContent = totalRows;
        document.getElementById('totalCost').textContent = '$' + this.formatNumber(totalCost);
        
        const progressBar = document.getElementById('progressBar');
        const avgProgressEl = document.getElementById('avgProgress');
        
        progressBar.style.width = avgProgress + '%';
        avgProgressEl.textContent = avgProgress.toFixed(1) + '%';
    }

    // Update last saved timestamp
    updateLastSaved() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        document.getElementById('lastSaved').textContent = timeStr;
    }

    // Attach event listeners
    attachEventListeners() {
        // Add row button
        document.getElementById('addRowBtn').addEventListener('click', () => {
            this.addRow();
        });

        // Reload from API button
        const reloadBtn = document.getElementById('reloadApiBtn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                this.reloadFromApi();
            });
        }

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Import button
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
                e.target.value = ''; // Reset file input
            }
        });

        // Clear data button
        document.getElementById('clearDataBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', () => {
            this.renderGrid();
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', () => {
            this.renderGrid();
        });

        // Editable cells - use event delegation
        document.getElementById('gridBody').addEventListener('click', (e) => {
            const cell = e.target.closest('.editable');
            if (cell) {
                this.makeEditable(cell);
            }

            // Delete button
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                const rowId = deleteBtn.dataset.rowId;
                this.deleteRow(rowId);
            }
        });

        // Column sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'asc';
                }
                this.renderGrid();
            });
        });
    }

    // Utility functions
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(num);
    }
}

// Initialize the grid manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gridManager = new GridManager();
});
