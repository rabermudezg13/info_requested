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

// Form submission
document.addEventListener('DOMContentLoaded', function() {
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
                createdAt: new Date().toISOString(),
                daysPassed: calculateDaysPassed(document.getElementById('infoRequestDate').value)
            };
            
            console.log('Saving info request:', infoRequest);
            
            const docRef = await window.addDoc(window.collection(window.db, 'infoRequests'), infoRequest);
            console.log('Document written with ID: ', docRef.id);
            
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = '<i class="mdi mdi-check-circle"></i> Info request added successfully';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
            
            this.reset();
            showDataframe();
        } catch (error) {
            console.error('Error:', error);
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
                updatedAt: new Date().toISOString(),
                daysPassed: calculateDaysPassed(document.getElementById('editInfoRequestDate').value)
            };

            const docRef = window.doc(window.db, 'infoRequests', id);
            await window.updateDoc(docRef, updatedRequest);
            
            closeModal();
            updateDataframe();
            
            const notification = document.createElement('div');
            notification.className = 'notification success';
            notification.innerHTML = '<i class="mdi mdi-check-circle"></i> Info request updated successfully';
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        } catch (error) {
            console.error('Error:', error);
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
        const querySnapshot = await window.getDocs(window.collection(window.db, 'infoRequests'));
        const requests = [];
        
        querySnapshot.forEach(doc => {
            const request = doc.data();
            if
