// ===== Meowtopia — Common App Logic =====
// Handles navbar rendering, image fallback, utility functions

// ===== Determine base path (pages are one level deep) =====
const isSubPage = window.location.pathname.includes('/pages/');
const BASE = isSubPage ? '../' : './';

// ===== Render Navbar =====
function renderNavbar(activePage) {
    const user = getCurrentUser();
    const nav = document.getElementById('navbar');
    if (!nav) return;

    let authLinks = '';
    if (user) {
        const dashboardLink = user.role === 'admin'
            ? `<a href="${BASE}pages/admin.html" class="${activePage === 'admin' ? 'active' : ''}">🛠️ Admin</a>`
            : (isOwner(user.userid)
                ? `<a href="${BASE}pages/dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">🏡 My Cats</a>`
                : '');

        authLinks = `
            ${dashboardLink}
            <div class="navbar-user">
                <span class="user-greeting">Hi, ${user.full_name.split(' ')[0]}! 🐾</span>
                <button class="btn-logout" onclick="handleLogout()">Logout</button>
            </div>
        `;
    } else {
        authLinks = `
            <a href="${BASE}pages/login.html" class="btn-nav-outline">Login</a>
            <a href="${BASE}pages/register.html" class="btn-nav">Sign Up</a>
        `;
    }

    nav.innerHTML = `
        <div class="container">
            <a href="${BASE}index.html" class="navbar-brand">
                <span>🐾</span> Meowtopia
            </a>
            <div class="navbar-links">
                <a href="${BASE}index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
                <a href="${BASE}pages/cats.html" class="${activePage === 'cats' ? 'active' : ''}">Browse Cats</a>
                ${authLinks}
            </div>
        </div>
    `;
}

// ===== Render Footer =====
function renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    footer.innerHTML = `
        <div class="footer-brand">🐾 Meowtopia</div>
        <p>Find your purrfect companion — one meow at a time.</p>
        <p style="margin-top: 8px; font-size: 0.8rem;">Made with ❤️ as a DBMS Academic Project © 2025</p>
    `;
}

// ===== Logout Handler =====
function handleLogout() {
    logoutUser();
    window.location.href = BASE + 'index.html';
}

// ===== Cat Image Helper =====
function getCatImageHTML(cat, size = 'card') {
    const sizeClass = size === 'detail' ? 'style="font-size: 100px"' : '';
    return `
        <img src="${cat.photo_url}" 
             alt="${cat.breed}" 
             onerror="this.parentElement.innerHTML='<div class=\\'cat-img-placeholder\\' style=\\'background: ${cat.gradient}\\'><span>🐱</span><span class=\\'breed-label\\'>${cat.breed}</span></div>'"
             style="width: 100%; height: 100%; object-fit: cover;">
    `;
}

// ===== Generate Cat Card HTML =====
function createCatCard(cat, linkBase) {
    const badge = cat.is_available
        ? '<span class="cat-card-badge">Available</span>'
        : '<span class="cat-card-badge unavailable">Adopted</span>';

    const displayName = cat.name ? cat.name : 'Unnamed Kitty';

    return `
        <div class="cat-card" onclick="window.location.href='${linkBase}pages/cat-detail.html?id=${cat.catid}'">
            <div class="cat-card-image" style="background: ${cat.gradient};">
                ${getCatImageHTML(cat)}
                ${badge}
            </div>
            <div class="cat-card-body">
                <div class="cat-card-breed">${cat.breed}</div>
                <div class="cat-card-name">${displayName}</div>
                <div class="cat-card-details">
                    <span class="cat-tag">${cat.age}</span>
                    <span class="cat-tag">${cat.gender}</span>
                    <span class="cat-tag">${cat.fur_color}</span>
                    <span class="cat-tag cattitude">${cat.cattitude}</span>
                </div>
                <div class="cat-card-footer">
                    <span class="text-muted" style="font-size: 0.8rem;">${cat.health_status}</span>
                    <span class="btn btn-primary btn-sm">Meet Me →</span>
                </div>
            </div>
        </div>
    `;
}

// ===== URL Params Helper =====
function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// ===== Format Date =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== Reset All Data (useful for demo) =====
function resetAllData() {
    localStorage.clear();
    initializeData();
    window.location.reload();
}

// ===== Init common elements on every page =====
document.addEventListener('DOMContentLoaded', () => {
    renderFooter();
});
