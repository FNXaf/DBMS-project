// ===== Meowtopia — Common App Logic =====

// ===== Base path detection =====
const isSubPage = window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
const BASE = isSubPage ? '../' : './';

// ===== Navbar =====
function renderNavbar(activePage) {
    const user = getCurrentUser();
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
    const loginHref = `${BASE}pages/login.html?redirect=${returnTo}`;

    let authLinks = '';
    if (user) {
        let extraLinks = '';
        if (user.role === 'admin') {
            extraLinks = `<a href="${BASE}pages/admin.html" class="${activePage === 'admin' ? 'active' : ''}">🛠️ Admin</a>`;
        }
        authLinks = `
            ${extraLinks}
            <div class="navbar-user">
                <span class="user-greeting">Hi, ${user.full_name.split(' ')[0]}! 🐾</span>
                <button class="btn-logout" onclick="handleLogout()">Logout</button>
            </div>
        `;
    } else {
        authLinks = `
            <a href="${loginHref}" class="btn-nav-outline">Login</a>
            <a href="${BASE}pages/register.html" class="btn-nav">Sign Up</a>
        `;
    }

    nav.innerHTML = `
        <div class="container">
            <a href="${BASE}index.html" class="navbar-brand"><span>🐾</span> Meowtopia</a>
            <div class="navbar-links">
                <a href="${BASE}index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a>
                <a href="${BASE}pages/cats.html" class="${activePage === 'cats' ? 'active' : ''}">Browse Cats</a>
                ${authLinks}
            </div>
        </div>
    `;
}

// ===== Footer =====
function renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;
    footer.innerHTML = `
        <div class="footer-brand">🐾 Meowtopia</div>
        <p>Find your purrfect companion — one meow at a time.</p>
    `;
}

// ===== Logout =====
function handleLogout() {
    logoutUser();
    window.location.href = BASE + 'index.html';
}

// ===== Cat Image Helper =====
function getCatImageHTML(cat) {
    const grad = furColorGradient(cat.fur_color);
    const pos = cat.photo_position || 'center';
    const imageUrl = typeof cat.photo_url === 'string' ? cat.photo_url.trim() : '';
    if (!imageUrl) {
        return `
            <div class="cat-img-placeholder" style="background: ${grad};display:flex;">
                <span>🐱</span><span class="breed-label">${cat.breed}</span>
            </div>
        `;
    }
    return `
        <img src="${imageUrl}"
             alt="${cat.shelter_name || cat.breed}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
             style="width: 100%; height: 100%; object-fit: cover; object-position: ${pos};">
        <div class="cat-img-placeholder" style="display:none;background: ${grad};">
            <span>🐱</span><span class="breed-label">${cat.breed}</span>
        </div>
    `;
}

// ===== Cat Card (redesigned — shelter_name as title, clean attribute layout) =====
function createCatCard(cat, linkBase) {
    const badge = cat.is_available
        ? '<span class="cat-card-badge">Available</span>'
        : '<span class="cat-card-badge unavailable">Adopted</span>';

    const age = formatAge(cat.dob);

    return `
        <div class="cat-card" onclick="window.location.href='${linkBase}pages/cat-detail.html?id=${cat.catid}'">
            <div class="cat-card-image" style="background: ${furColorGradient(cat.fur_color)};">
                ${getCatImageHTML(cat)}
                ${badge}
            </div>
            <div class="cat-card-body">
                <div class="cat-card-name">${cat.shelter_name}</div>
                <div class="cat-card-breed">${cat.breed}</div>
                <div class="cat-card-attrs">
                    <div class="cat-attr"><span class="attr-icon">⏳</span> ${age}</div>
                    <div class="cat-attr"><span class="attr-icon">${cat.gender === 'Male' ? '♂' : '♀'}</span> ${cat.gender}</div>
                    <div class="cat-attr"><span class="attr-icon">😸</span> ${cat.cattitude}</div>
                </div>
                <div class="cat-card-footer">
                    <span class="btn btn-primary btn-sm">Meet Me →</span>
                </div>
            </div>
        </div>
    `;
}

// ===== URL Params =====
function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// ===== Format Date =====
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ===== Init footer on every page =====
document.addEventListener('DOMContentLoaded', () => {
    renderFooter();
    initBeautyEffects();
});

function initBeautyEffects() {
    const revealSelectors = [
        '.section',
        '.cat-card',
        '.cat-list-card',
        '.cat-slide-stage',
        '.product-card',
        '.sparkle-card',
        '.hiw-card',
        '.stat-block',
        '.form-card',
        '.adoption-card',
        '.order-card'
    ];

    const revealTargets = Array.from(document.querySelectorAll(revealSelectors.join(',')));
    if (revealTargets.length) {
        revealTargets.forEach(el => el.classList.add('reveal-item'));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealTargets.forEach(el => observer.observe(el));
    }

    const tiltTargets = Array.from(document.querySelectorAll('.cat-card, .product-card, .hiw-card, .stat-card'));
    if (window.matchMedia('(pointer:fine)').matches) {
        tiltTargets.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                el.style.transform = `perspective(700px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-2px)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    }
}

