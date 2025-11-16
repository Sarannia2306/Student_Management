// Activity Logs Page Module
const ActivityLogsPage = (function() {
    // Initialize the activity logs page
    async function init() {
        await loadActivityLogs();
        setupEventListeners();
    }

    // Load activity logs from Firebase
    async function loadActivityLogs(searchTerm = '') {
        let logs = [];
        try {
            if (window.FirebaseAPI?.listLogs) {
                logs = await window.FirebaseAPI.listLogs();
            }
        } catch (e) {
            console.error('Failed to load activity logs from Firebase', e);
        }
        
        // Filter logs if search term is provided
        let filteredLogs = [...logs];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredLogs = logs.filter(log => 
                (log.action && log.action.toLowerCase().includes(term)) ||
                (log.userEmail && log.userEmail.toLowerCase().includes(term)) ||
                (log.details && log.details.toLowerCase().includes(term))
            );
        }

        // Generate log rows
        const logRows = filteredLogs.map(log => `
            <tr>
                <td>${formatDateTime(log.timestamp)}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="symbol symbol-circle symbol-40px me-3">
                            <div class="symbol-label bg-light-${getLogTypeColor(log.type)} text-${getLogTypeColor(log.type)}">
                                <i class="fas ${getLogTypeIcon(log.type)}"></i>
                            </div>
                        </div>
                        <div>
                            <div class="fw-bold">${log.action || 'N/A'}</div>
                            <div class="text-muted small">${log.details || ''}</div>
                        </div>
                    </div>
                </td>
                <td>${log.userEmail || 'System'}</td>
                <td>
                    <span class="badge bg-light-${getLogTypeColor(log.type)} text-${getLogTypeColor(log.type)} px-3 py-2">
                        ${log.type || 'Info'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-light btn-icon view-log-details" data-log-id="${log.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Set the HTML content
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-0">Activity Logs</h2>
                        <nav aria-label="breadcrumb" class="d-none d-md-block mt-2">
                            <ol class="breadcrumb mb-0">
                                <li class="breadcrumb-item"><a href="#" data-page="dashboard">Dashboard</a></li>
                                <li class="breadcrumb-item active" aria-current="page">Activity Logs</li>
                            </ol>
                        </nav>
                    </div>
                    <div>
                        <button class="btn btn-outline-secondary me-2" id="exportLogsBtn">
                            <i class="fas fa-download me-1"></i> Export
                        </button>
                        <button class="btn btn-danger" id="clearLogsBtn">
                            <i class="fas fa-trash-alt me-1"></i> Clear Logs
                        </button>
                    </div>
                </div>
                
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent"><i class="fas fa-search"></i></span>
                                    <input type="text" class="form-control" id="searchLogs" 
                                           placeholder="Search logs..." value="${searchTerm}">
                                </div>
                            </div>
                            <div class="col-md-2">
                                <select class="form-select" id="filterLogType">
                                    <option value="">All Types</option>
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <input type="date" class="form-control" id="filterLogDate">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow-sm">
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 180px;">Time</th>
                                        <th>Activity</th>
                                        <th style="width: 200px;">User</th>
                                        <th style="width: 120px;">Type</th>
                                        <th style="width: 60px;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${logRows || `
                                        <tr>
                                            <td colspan="5" class="text-center py-5">
                                                <div class="text-muted">
                                                    <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                                                    <p class="mb-0">No activity logs found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                        
                        ${filteredLogs.length > 0 ? `
                            <div class="d-flex justify-content-between align-items-center p-4 border-top">
                                <div class="text-muted">
                                    Showing <span class="fw-bold">${filteredLogs.length}</span> of 
                                    <span class="fw-bold">${logs.length}</span> logs
                                </div>
                                <nav aria-label="Logs pagination">
                                    <ul class="pagination pagination-sm mb-0">
                                        <li class="page-item disabled">
                                            <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                                        </li>
                                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                                        <li class="page-item">
                                            <a class="page-link" href="#">Next</a>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        setupEventListeners();
    }
    
    // Show log details modal
    async function showLogDetails(logId) {
        let logs = [];
        try {
            if (window.FirebaseAPI?.listLogs) {
                logs = await window.FirebaseAPI.listLogs();
            }
        } catch (e) {
            console.error('Failed to load activity logs for details view', e);
        }
        const log = logs.find(l => l.id === logId);
        
        if (!log) {
            showAlert('Log entry not found', 'danger');
            return;
        }
        
        // Format additional details
        let detailsHtml = '';
        try {
            const details = JSON.parse(log.details || '{}');
            detailsHtml = Object.entries(details).map(([key, value]) => `
                <tr>
                    <td class="text-muted" style="width: 150px;">${key}</td>
                    <td>${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</td>
                </tr>
            `).join('');
        } catch (e) {
            detailsHtml = `
                <tr>
                    <td colspan="2">${log.details || 'No additional details available'}</td>
                </tr>
            `;
        }
        
        const modalHTML = `
            <div class="modal fade" id="logDetailsModal" tabindex="-1" aria-labelledby="logDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="logDetailsModalLabel">
                                <i class="fas ${getLogTypeIcon(log.type)} text-${getLogTypeColor(log.type)} me-2"></i>
                                ${log.action || 'Activity Details'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-4">
                                <div class="d-flex align-items-center mb-3">
                                    <div class="symbol symbol-50px symbol-circle me-4">
                                        <div class="symbol-label bg-light-${getLogTypeColor(log.type)} text-${getLogTypeColor(log.type)}">
                                            <i class="fas ${getLogTypeIcon(log.type)} fa-2x"></i>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 class="mb-1">${log.action || 'Activity'}</h4>
                                        <div class="text-muted">
                                            <i class="far fa-clock me-1"></i> ${formatDateTime(log.timestamp)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="separator my-4"></div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="symbol symbol-40px me-3">
                                                <div class="symbol-label bg-light-primary">
                                                    <i class="fas fa-user text-primary"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-muted small">User</div>
                                                <div class="fw-bold">${log.userEmail || 'System'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="symbol symbol-40px me-3">
                                                <div class="symbol-label bg-light-${getLogTypeColor(log.type)}">
                                                    <i class="fas ${getLogTypeIcon(log.type)} text-${getLogTypeColor(log.type)}"></i>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-muted small">Type</div>
                                                <div class="fw-bold">
                                                    <span class="badge bg-light-${getLogTypeColor(log.type)} text-${getLogTypeColor(log.type)} px-3 py-2">
                                                        ${log.type || 'Info'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <div class="bg-light p-3 rounded">
                                        ${log.details || 'No description available.'}
                                    </div>
                                </div>
                                
                                <div class="mb-0">
                                    <label class="form-label">Details</label>
                                    <div class="table-responsive">
                                        <table class="table table-bordered">
                                            <tbody>
                                                ${detailsHtml}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Close
                            </button>
                            <button type="button" class="btn btn-primary" onclick="printLogDetails('${log.id}')">
                                <i class="fas fa-print me-1"></i> Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize the modal
        const modal = new bootstrap.Modal(document.getElementById('logDetailsModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('logDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Export logs to CSV
    function exportLogs() {
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        
        if (logs.length === 0) {
            showAlert('No logs to export', 'warning');
            return;
        }
        
        // Convert logs to CSV
        const headers = ['Timestamp', 'Action', 'Type', 'User', 'Details'];
        const csvRows = [];
        
        // Add header row
        csvRows.push(headers.join(','));
        
        // Add data rows
        logs.forEach(log => {
            const row = [
                `"${formatDateTime(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}"`,
                `"${log.action || ''}"`,
                `"${log.type || ''}"`,
                `"${log.userEmail || 'System'}"`,
                `"${(log.details || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        // Create CSV content
        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        // Set download attributes
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('href', url);
        link.setAttribute('download', `activity-logs-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        
        // Append to body, click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showAlert('Logs exported successfully!', 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity('Exported activity logs', currentUser.email, 'success');
    }
    
    // Clear all logs
    async function clearLogs() {
        if (!confirm('Are you sure you want to clear all activity logs? This action cannot be undone.')) {
            return;
        }
        
        try {
            if (window.FirebaseAPI?.clearAllLogs) {
                await window.FirebaseAPI.clearAllLogs();
            }
        } catch (e) {
            console.error('Failed to clear activity logs in Firebase', e);
            showAlert('Failed to clear logs from the server', 'danger');
            return;
        }
        
        // Reload the logs
        await loadActivityLogs();
        
        // Show success message
        showAlert('All activity logs have been cleared', 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity('Cleared all activity logs', currentUser.email, 'warning');
    }
    
    // Get icon for log type
    function getLogTypeIcon(type = 'info') {
        switch (type.toLowerCase()) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            case 'security': return 'fa-shield-alt';
            default: return 'fa-info-circle';
        }
    }
    
    // Get color class for log type
    function getLogTypeColor(type = 'info') {
        switch (type.toLowerCase()) {
            case 'success': return 'success';
            case 'warning': return 'warning';
            case 'error': return 'danger';
            case 'security': return 'info';
            default: return 'primary';
        }
    }
    
    // Format date to display in a user-friendly way
    function formatDateTime(dateTimeString, format = '') {
        if (!dateTimeString) return 'N/A';
        
        const date = new Date(dateTimeString);
        
        if (format) {
            // Simple format replacement (for CSV export)
            return format
                .replace('yyyy', date.getFullYear())
                .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
                .replace('dd', String(date.getDate()).padStart(2, '0'))
                .replace('HH', String(date.getHours()).padStart(2, '0'))
                .replace('mm', String(date.getMinutes()).padStart(2, '0'))
                .replace('ss', String(date.getSeconds()).padStart(2, '0'));
        }
        
        // Default format for display
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        return date.toLocaleString('en-US', options);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search logs
        const searchInput = document.getElementById('searchLogs');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                loadActivityLogs(this.value);
            });
        }
        
        // Filter logs by type
        const filterType = document.getElementById('filterLogType');
        if (filterType) {
            filterType.addEventListener('change', function() {
                // Implement type filtering if needed
                // For now, just reload with search term
                loadActivityLogs(document.getElementById('searchLogs')?.value || '');
            });
        }
        
        // Filter logs by date
        const filterDate = document.getElementById('filterLogDate');
        if (filterDate) {
            filterDate.addEventListener('change', function() {
                // Implement date filtering if needed
                // For now, just reload with search term
                loadActivityLogs(document.getElementById('searchLogs')?.value || '');
            });
        }
        
        // Export logs button
        const exportBtn = document.getElementById('exportLogsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportLogs);
        }
        
        // Clear logs button
        const clearBtn = document.getElementById('clearLogsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearLogs);
        }
        
        // View log details
        document.addEventListener('click', function(e) {
            if (e.target.closest('.view-log-details')) {
                e.preventDefault();
                const logId = e.target.closest('.view-log-details').getAttribute('data-log-id');
                showLogDetails(logId);
            }
        });
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add alert to the page
        const container = document.querySelector('.container-fluid') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) alert.close();
        }, 5000);
    }
    
    // Public API
    return {
        init
    };
})();

// Global function for printing log details
function printLogDetails(logId) {
    // This function can be implemented to print the log details
    alert(`Printing log details for ID: ${logId}`);
}
