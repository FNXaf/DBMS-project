// ===== Meowtopia API Data Layer =====
// Replaces localStorage mock database with backend REST API calls.

const API_BASE = window.MEOWTOPIA_API_BASE || 'http://localhost:5000/api';

function getAuthToken() {
    return localStorage.getItem('meowtopia_token') || '';
}

function setAuthSession(token, user) {
    if (token) {
        localStorage.setItem('meowtopia_token', token);
    }
    if (user) {
        localStorage.setItem('meowtopia_session', JSON.stringify(user));
    }
}

async function apiRequest(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const requestOptions = {
        method: options.method || 'GET',
        headers,
        body: options.body
    };

    // Browser sets multipart boundaries automatically.
    if (!(requestOptions.body instanceof FormData) && requestOptions.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, requestOptions);
    const payload = await res.json().catch(() => ({ success: false, message: 'Invalid server response' }));

    if (!res.ok || !payload.success) {
        const message = payload && payload.message ? payload.message : `Request failed (${res.status})`;
        throw new Error(message);
    }

    return payload.data;
}

function normalizeHealthStatus(status) {
    if (status === 'Needs Care') return 'Under Treatment';
    return status;
}

function denormalizeHealthStatus(status) {
    if (status === 'Under Treatment') return 'Needs Care';
    return status;
}

function mapCatFromApi(cat) {
    return {
        ...cat,
        health_status: denormalizeHealthStatus(cat.health_status)
    };
}

function mapCatToApi(cat) {
    return {
        ...cat,
        health_status: normalizeHealthStatus(cat.health_status)
    };
}

// ===== Age Helpers (derive from DOB) =====
function getAgeMonths(dob) {
    if (!dob) return 0;
    const birth = new Date(dob);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function formatAge(dob) {
    const months = getAgeMonths(dob);
    if (months < 1) return 'Under 1 month';
    if (months < 12) return months + ' month' + (months !== 1 ? 's' : '');
    const years = Math.floor(months / 12);
    const rem = months % 12;
    if (rem === 0) return years + ' year' + (years !== 1 ? 's' : '');
    return years + ' yr' + (years !== 1 ? 's' : '') + ', ' + rem + ' mo';
}

// ===== Fur-Color to Gradient =====
function furColorGradient(furColor) {
    const lc = (furColor || '').toLowerCase();
    const map = [
        ['white', 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)'],
        ['black', 'linear-gradient(135deg, #434343 0%, #1a1a2e 100%)'],
        ['orange', 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'],
        ['ginger', 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)'],
        ['gray', 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'],
        ['tabby', 'linear-gradient(135deg, #c68642 0%, #d4a574 100%)'],
        ['cream', 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'],
        ['brown', 'linear-gradient(135deg, #8B6914 0%, #c68642 100%)'],
        ['spotted', 'linear-gradient(135deg, #f5af19 0%, #d4a574 100%)'],
        ['tawny', 'linear-gradient(135deg, #d4a574 0%, #c68642 100%)'],
        ['silver', 'linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)'],
        ['blue', 'linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)'],
        ['pink', 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)']
    ];
    for (const [key, grad] of map) {
        if (lc.includes(key)) return grad;
    }
    return 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
}

// ===== Cat CRUD =====
async function getCats(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v) !== '') {
            params.set(k, v);
        }
    });

    const data = await apiRequest(`/cats${params.toString() ? `?${params.toString()}` : ''}`);
    return data.map(mapCatFromApi);
}

async function getAvailableCats() {
    const cats = await getCats();
    return cats.filter((c) => c.is_available);
}

async function getCatById(catid) {
    const cat = await apiRequest(`/cats/${catid}`);
    return mapCatFromApi(cat);
}

function buildCatFormData(catInput) {
    const formData = new FormData();
    const cat = mapCatToApi(catInput || {});
    const file = cat.photo_file || cat.photoFile || null;

    Object.entries(cat).forEach(([key, value]) => {
        if (value === undefined || value === null || key === 'photo_file' || key === 'photoFile') return;
        formData.append(key, value);
    });

    if (file instanceof File) {
        formData.append('photo', file);
    }

    return formData;
}

async function addCat(cat) {
    const data = await apiRequest('/cats', {
        method: 'POST',
        body: buildCatFormData(cat)
    });
    return mapCatFromApi(data);
}

async function updateCat(catid, updates) {
    const data = await apiRequest(`/cats/${catid}`, {
        method: 'PUT',
        body: buildCatFormData(updates)
    });
    return mapCatFromApi(data);
}

async function deleteCat(catid) {
    await apiRequest(`/cats/${catid}`, { method: 'DELETE' });
}

// ===== Users =====
function getCurrentUser() {
    const data = localStorage.getItem('meowtopia_session');
    return data ? JSON.parse(data) : null;
}

async function refreshCurrentUser() {
    try {
        const user = await apiRequest('/auth/me');
        localStorage.setItem('meowtopia_session', JSON.stringify(user));
        return user;
    } catch (_) {
        return null;
    }
}

function isAdmin() {
    const u = getCurrentUser();
    return !!(u && u.role === 'admin');
}

// ===== Adoptions =====
async function getAdoptions() {
    return apiRequest('/adoptions');
}

async function getUserAdoptions(userid) {
    const user = getCurrentUser();
    if (!user || Number(user.userid) !== Number(userid)) return [];
    const rows = await apiRequest('/adoptions/my');
    return rows.map((a) => ({
        ...a,
        health_status: denormalizeHealthStatus(a.health_status)
    }));
}

async function createAdoption(adoption) {
    return apiRequest('/adoptions', {
        method: 'POST',
        body: JSON.stringify(adoption)
    });
}

async function updateAdoptionStatus(adoptionid, status) {
    return apiRequest(`/adoptions/${adoptionid}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
    });
}

// ===== Auth =====
async function registerUser(userData) {
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        return { success: true, data };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

async function loginUser(email, password) {
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        setAuthSession(data.token, data.user);
        return { success: true, user: data.user };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

function logoutUser() {
    localStorage.removeItem('meowtopia_token');
    localStorage.removeItem('meowtopia_session');
}

async function isOwner(userid) {
    const rows = await getUserAdoptions(userid);
    return rows.some((a) => ['Approved', 'Completed', 'Pending'].includes(a.status));
}

// Dashboard references this from old store feature. Keep as a safe no-op.
function getCatFoodPrefs() {
    return [];
}

// ===== Legacy Food Store Compatibility (adoption-only scope) =====
function getFood() {
    return [];
}

function getFoodById() {
    return null;
}

function getSuggestedFoods() {
    return [];
}

function getCatsThatPreferFood() {
    return [];
}

function getCart() {
    return [];
}

function addToCart() {
    return { success: false, message: 'Food store is not enabled in this build.' };
}

function updateCartItem() {
    return { success: false, message: 'Food store is not enabled in this build.' };
}

function removeFromCart() {
    return { success: false, message: 'Food store is not enabled in this build.' };
}

function checkout() {
    return { success: false, error: 'Food store is not enabled in this build.' };
}

// Legacy hook kept for compatibility with old home reset button.
function resetAllData() {
    logoutUser();
}

// ===== Helper: Get color brightness (for contrast) =====
function getColorBrightness(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return 128;
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return 128;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}
