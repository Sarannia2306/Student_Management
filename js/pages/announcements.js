// Announcements Page Module
const AnnouncementsPage = (function() {
    async function init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        await renderPage(currentUser);
        bindEvents(currentUser);
    }

    async function getAnnouncements() {
        try {
            if (window.FirebaseAPI?.listAnnouncements) {
                const list = await window.FirebaseAPI.listAnnouncements();
                localStorage.setItem('announcements', JSON.stringify(list));
                return list;
            }
        } catch (e) {
            console.error('Failed to load announcements from Firebase', e);
        }
        return JSON.parse(localStorage.getItem('announcements') || '[]');
    }

    async function saveAnnouncements(list) {
        localStorage.setItem('announcements', JSON.stringify(list));
        try {
            if (window.FirebaseAPI?.saveAnnouncement) {
                // Save each announcement; in practice we'll usually append one
                for (const a of list) {
                    if (a && a.id) {
                        await window.FirebaseAPI.saveAnnouncement(a);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to sync announcements to Firebase', e);
        }
    }

    async function renderPage(currentUser) {
        const isAdmin = currentUser.role === 'admin';
        const list = await getAnnouncements();

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
                form.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const title = document.getElementById('announcementTitle').value.trim();
                    const body = document.getElementById('announcementBody').value.trim();
                    if (!title || !body) return;

                    const item = {
                        id: 'ANN' + Date.now(),
                        title,
                        body,
                        createdAt: new Date().toISOString(),
                        createdBy: currentUser.email,
                        audience: 'all'
                    };

                    // Save to Firebase (if available)
                    try {
                        if (window.FirebaseAPI?.saveAnnouncement) {
                            await window.FirebaseAPI.saveAnnouncement(item);
                        }
                    } catch (e) {
                        console.error('Failed to save announcement to Firebase', e);
                    }

                    // Update local cache for immediate UI
                    const list = JSON.parse(localStorage.getItem('announcements') || '[]');
                    list.unshift(item);
                    localStorage.setItem('announcements', JSON.stringify(list));

                    App.logActivity('Created announcement', currentUser.email, 'success', {
                        id: item.id,
                        title: item.title,
                        audience: item.audience
                    });

                    // Re-render
                    renderPage(currentUser);
                });
            }

            document.addEventListener('click', async function onClick(e) {
                const btn = e.target.closest('[data-action="delete-ann"]');
                if (!btn) return;
                const id = btn.getAttribute('data-id');
                let list = await getAnnouncements();
                list = list.filter(a => a.id !== id);
                localStorage.setItem('announcements', JSON.stringify(list));
                try {
                    if (window.FirebaseAPI?.deleteAnnouncement) {
                        await window.FirebaseAPI.deleteAnnouncement(id);
                    }
                } catch (e) {
                    console.error('Failed to delete announcement from Firebase', e);
                }
                App.logActivity('Deleted announcement', currentUser.email, 'warning', { id });
                renderPage(currentUser);
            }, { once: true });
        }
    }

    // expose
    return { init };
})();
