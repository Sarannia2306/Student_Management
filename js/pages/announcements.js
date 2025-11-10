// Announcements Page Module
const AnnouncementsPage = (function() {
    function init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        renderPage(currentUser);
        bindEvents(currentUser);
    }

    function getAnnouncements() {
        return JSON.parse(localStorage.getItem('announcements') || '[]');
    }

    function saveAnnouncements(list) {
        localStorage.setItem('announcements', JSON.stringify(list));
    }

    function renderPage(currentUser) {
        const isAdmin = currentUser.role === 'admin';
        const list = getAnnouncements();

        const formHTML = isAdmin ? `
            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Create Announcement</h5>
                </div>
                <div class="card-body">
                    <form id="announcementForm">
                        <div class="mb-3">
                            <label class="form-label" for="announcementTitle">Title</label>
                            <input type="text" id="announcementTitle" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label" for="announcementBody">Message</label>
                            <textarea id="announcementBody" class="form-control" rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-bullhorn me-1"></i> Publish
                        </button>
                    </form>
                </div>
            </div>
        ` : '';

        const listHTML = list.length ? list.map(a => `
            <div class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${a.title}</h5>
                    <small class="text-muted">${new Date(a.createdAt).toLocaleString()}</small>
                </div>
                <p class="mb-1">${a.body}</p>
                <small class="text-muted">By: ${a.createdBy || 'Admin'}</small>
                ${isAdmin ? `
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-danger" data-action="delete-ann" data-id="${a.id}">
                            <i class="fas fa-trash me-1"></i> Delete
                        </button>
                    </div>` : ''}
            </div>
        `).join('') : '<p class="text-muted">No announcements yet.</p>';

        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="mb-0"><i class="fas fa-bullhorn me-2"></i>Announcements</h2>
                </div>
                ${formHTML}
                <div class="card">
                    <div class="card-header bg-light">
                        <h5 class="mb-0">Latest</h5>
                    </div>
                    <div class="list-group list-group-flush" id="annList">
                        ${listHTML}
                    </div>
                </div>
            </div>
        `;
    }

    function bindEvents(currentUser) {
        const isAdmin = currentUser.role === 'admin';
        if (isAdmin) {
            const form = document.getElementById('announcementForm');
            if (form) {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const title = document.getElementById('announcementTitle').value.trim();
                    const body = document.getElementById('announcementBody').value.trim();
                    if (!title || !body) return;

                    const list = getAnnouncements();
                    const item = {
                        id: 'ANN' + Date.now(),
                        title,
                        body,
                        createdAt: new Date().toISOString(),
                        createdBy: currentUser.email,
                        audience: 'all'
                    };
                    list.unshift(item);
                    saveAnnouncements(list);

                    App.logActivity('Created announcement', currentUser.email);

                    // Re-render
                    renderPage(currentUser);
                    bindEvents(currentUser);
                });
            }

            document.addEventListener('click', function onClick(e) {
                const btn = e.target.closest('[data-action="delete-ann"]');
                if (!btn) return;
                const id = btn.getAttribute('data-id');
                let list = getAnnouncements();
                list = list.filter(a => a.id !== id);
                saveAnnouncements(list);
                App.logActivity('Deleted announcement', currentUser.email);
                renderPage(currentUser);
                bindEvents(currentUser);
            }, { once: true });
        }
    }

    // expose
    return { init };
})();
