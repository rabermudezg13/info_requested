// Loading indicator functions
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Navigation functions
function showForm() {
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    document.getElementById('formSection').style.display = 'block';
}

function showSearch() {
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    document.getElementById('searchSection').style.display = 'block';
}

function showDataframe() {
    document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
    document.getElementById('dataframeSection').style.display = 'block';
    updateDataframe();
}

// Calculate days passed
function calculateDaysPassed(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get status badge class
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Info Request Sent':
            return 'status-sent';
        case 'Docs Submitted':
            return 'status-submitted';
        case 'Review':
            return 'status-review';
        default:
            return '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Form submission
    const infoRequestForm = document.getElementById('infoRequestForm');
    
    infoRequestForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        showLoading();
        
        try {
            const infoRequest = {
                name: document.getElementById('name').value,
                id: document.getElementById('id').value,
                infoRequestDate: document.getElementById('infoRequestDate').value,
                status: document.getElementById('status').value,
                createdAt: new Date().toISOString()
            };
            
            await db.collection('infoRequests').add(infoRequest);
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = '<i class="mdi mdi-check-circle"></i> Info request added successfully';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            
            this.reset();
            showDataframe();
        } catch (error) {
            console.error('Error:', error);
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.innerHTML = `<i class="mdi mdi-alert"></i> Error: ${error.message}`;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } finally {
            hideLoading();
        }
    });

    // Edit form submission
    const editForm = document.getElementById('editForm');
    editForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        showLoading();

        try {
            const id = document.getElementById('editId').value;
            const updatedRequest = {
                name: document.getElementById('editName').value,
                id: document.getElementById('editIdNumber').value,
                infoRequestDate: document.getElementById('editInfoRequestDate').value,
                status: document.getElementById('editStatus').value,
                updatedAt: new Date().toISOString()
            };

            await db.collection('infoRequests').doc(id).update(updatedRequest);
            closeModal();
            updateDataframe();
            
            // Show success notification
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = '<i class="mdi mdi-check-circle"></i> Info request updated successfully';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } catch (error) {
            console.error('Error:', error);
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'notification error';
            notification.innerHTML = `<i class="mdi mdi-alert"></i> Error: ${error.message}`;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } finally {
            hideLoading();
        }
    });

    // Modal close handlers
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    window.onclick = function(event) {
        if (event.target == document.getElementById('editModal')) {
            closeModal();
        }
    }

    // Search input handler
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRequests();
        }
    });

    // Initial load
    showForm();
});

// Search function
async function searchRequests() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    showLoading();

    try {
        const snapshot = await db.collection('infoRequests').get();
        const requests = [];
        
        snapshot.forEach(doc => {
            const request = doc.data();
            if (request.name.toLowerCase().includes(searchTerm) || 
                request.id.toLowerCase().includes(searchTerm)) {
                requests.push({ id: doc.id, ...request });
            }
        });

        if (requests.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results"><i class="mdi mdi-alert"></i> No results found</div>';
            return;
        }

        requests.forEach(request => {
            const daysPassed = calculateDaysPassed(request.infoRequestDate);
            const card = document.createElement('div');
            card.className = 'result-card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${request.name}</h3>
                    <span class="status-badge ${getStatusBadgeClass(request.status)}">
                        ${request.status}
                    </span>
                </div>
                <div class="card-body">
                    <p><i class="mdi mdi-card-account-details"></i> ID: ${request.id}</p>
                    <p><i class="mdi mdi-calendar"></i> Request Date: ${request.infoRequestDate}</p>
                    <p><i class="mdi mdi-clock-outline"></i> Days Passed: ${daysPassed}</p>
                </div>
                <div class="card-actions">
                    <button onclick="editRequest('${request.id}')" class="edit-btn">
                        <i class="mdi mdi-pencil"></i> Edit
                    </button>
                    <button onclick="deleteRequest('${request.id}')" class="delete-btn">
                        <i class="mdi mdi-delete"></i> Delete
                    </button>
                </div>
            `;
            resultsDiv.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<div class="error-message"><i class="mdi mdi-alert"></i> Error searching info requests</div>';
    } finally {
        hideLoading();
    }
}

// Modal and edit functions
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function editRequest(id) {
    showLoading();
    try {
        const doc = await db.collection('infoRequests').doc(id).get();
        if (doc.exists) {
            const request = doc.data();
            
            document.getElementById('editId').value = id;
            document.getElementById('edit
