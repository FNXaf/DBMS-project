// ===== Meowtopia Mock Data Layer =====
// All mock data used to simulate the database via localStorage.
// *** This entire file is removable when the real backend is connected. ***

const MOCK_CATS = [
    {
        catid: 1, shelter_name: "Snowball", name: null,
        breed: "Persian", fur_color: "White",
        dob: "2024-07-15", gender: "Female",
        intake_date: "2025-01-15", health_status: "Vaccinated",
        cattitude: "Chill",
        photo_url: "https://cdn2.thecatapi.com/images/ebv.jpg",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        is_available: true
    },
    {
        catid: 2, shelter_name: "Whiskers", name: null,
        breed: "Siamese", fur_color: "Cream & Brown",
        dob: "2024-03-01", gender: "Male",
        intake_date: "2025-03-01", health_status: "Healthy",
        cattitude: "Sassy",
        photo_url: "https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        is_available: true
    },
    {
        catid: 3, shelter_name: "Mittens", name: null,
        breed: "Maine Coon", fur_color: "Tabby",
        dob: "2023-11-20", gender: "Male",
        intake_date: "2024-11-20", health_status: "Healthy",
        cattitude: "Playful",
        photo_url: "https://cdn2.thecatapi.com/images/OGTWqNNOt.jpg",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        is_available: true
    },
    {
        catid: 4, shelter_name: "Pudding", name: null,
        breed: "Ragdoll", fur_color: "White & Gray",
        dob: "2025-06-10", gender: "Female",
        intake_date: "2025-05-10", health_status: "Vaccinated",
        cattitude: "Cuddly",
        photo_url: "https://cdn2.thecatapi.com/images/j5cVSqLer.jpg",
        gradient: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
        is_available: true
    },
    {
        catid: 5, shelter_name: "Shadow", name: null,
        breed: "British Shorthair", fur_color: "Gray",
        dob: "2023-01-05", gender: "Male",
        intake_date: "2024-08-05", health_status: "Healthy",
        cattitude: "Lazy",
        photo_url: "https://cdn2.thecatapi.com/images/s4wQHTcjM.jpg",
        gradient: "linear-gradient(135deg, #c1c1c1 0%, #e8e8e8 100%)",
        is_available: true
    },
    {
        catid: 6, shelter_name: "Tigress", name: null,
        breed: "Bengal", fur_color: "Spotted Brown",
        dob: "2025-02-28", gender: "Female",
        intake_date: "2025-02-28", health_status: "Under Treatment",
        cattitude: "Energetic",
        photo_url: "https://cdn2.thecatapi.com/images/IFXsxIreu.jpg",
        gradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
        is_available: true
    },
    {
        catid: 7, shelter_name: "Ginger", name: null,
        breed: "Scottish Fold", fur_color: "Orange",
        dob: "2024-08-12", gender: "Female",
        intake_date: "2025-04-12", health_status: "Healthy",
        cattitude: "Sweet",
        photo_url: "https://cdn2.thecatapi.com/images/ZJKzGLEbY.jpg",
        gradient: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
        is_available: true
    },
    {
        catid: 8, shelter_name: "Sphinx", name: null,
        breed: "Sphynx", fur_color: "Pink",
        dob: "2024-01-30", gender: "Male",
        intake_date: "2025-01-30", health_status: "Vaccinated",
        cattitude: "Mischievous",
        photo_url: "https://cdn2.thecatapi.com/images/KJF8fB_20.jpg",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
        is_available: true
    },
    {
        catid: 9, shelter_name: "Caramel", name: null,
        breed: "Abyssinian", fur_color: "Tawny",
        dob: "2025-06-01", gender: "Male",
        intake_date: "2025-06-01", health_status: "Healthy",
        cattitude: "Curious",
        photo_url: "https://cdn2.thecatapi.com/images/pbuqsGBaa.jpg",
        gradient: "linear-gradient(135deg, #d4a574 0%, #c68642 100%)",
        is_available: true
    },
    {
        catid: 10, shelter_name: "Duchess", name: null,
        breed: "Russian Blue", fur_color: "Silver-Blue",
        dob: "2024-09-20", gender: "Female",
        intake_date: "2025-03-20", health_status: "Vaccinated",
        cattitude: "Gentle",
        photo_url: "https://cdn2.thecatapi.com/images/mOBxKGjMQ.jpg",
        gradient: "linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)",
        is_available: true
    }
];

const MOCK_FOOD = [
    { foodid: 1, name: "Cat Milk", qty: 50, price: 120.00, image_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop", emoji: "🥛" },
    { foodid: 2, name: "Tuna Bites", qty: 30, price: 85.00, image_url: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=300&h=300&fit=crop", emoji: "🐟" },
    { foodid: 3, name: "Dry Kibble", qty: 100, price: 200.00, image_url: "https://images.unsplash.com/photo-1589924749359-e47042052207?w=300&h=300&fit=crop", emoji: "🍖" },
    { foodid: 4, name: "Salmon Treats", qty: 40, price: 150.00, image_url: "https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=300&h=300&fit=crop", emoji: "🍣" },
    { foodid: 5, name: "Chicken Pâté", qty: 25, price: 95.00, image_url: "https://images.unsplash.com/photo-1589924749359-e47042052207?w=300&h=300&fit=crop", emoji: "🍗" },
    { foodid: 6, name: "Catnip", qty: 60, price: 45.00, image_url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=300&h=300&fit=crop", emoji: "🌿" }
];

const MOCK_CAT_FOOD_PREFS = [
    { catid: 1, foodid: 1 }, { catid: 1, foodid: 4 },
    { catid: 2, foodid: 2 }, { catid: 2, foodid: 5 },
    { catid: 3, foodid: 3 }, { catid: 3, foodid: 2 },
    { catid: 4, foodid: 1 }, { catid: 4, foodid: 5 },
    { catid: 5, foodid: 3 }, { catid: 5, foodid: 4 },
    { catid: 6, foodid: 2 }, { catid: 6, foodid: 3 },
    { catid: 7, foodid: 1 }, { catid: 7, foodid: 2 },
    { catid: 8, foodid: 4 }, { catid: 8, foodid: 5 },
    { catid: 9, foodid: 2 }, { catid: 9, foodid: 4 },
    { catid: 10, foodid: 1 }, { catid: 10, foodid: 3 }
];

const MOCK_USERS = [
    {
        userid: 1, full_name: "Admin Meow", email: "admin@meowtopia.com",
        password: "admin123", phone: "9876543210", address: "Meowtopia HQ",
        role: "admin", created_at: "2025-01-01T00:00:00"
    },
    {
        userid: 2, full_name: "Sam Johnson", email: "sam@example.com",
        password: "sam123", phone: "1234567890", address: "123 Cat Street, Mewville",
        role: "user", created_at: "2025-02-10T00:00:00"
    }
];

// ===== LocalStorage Database Layer =====
function initializeData() {
    if (!localStorage.getItem('meowtopia_initialized')) {
        localStorage.setItem('meowtopia_cats', JSON.stringify(MOCK_CATS));
        localStorage.setItem('meowtopia_food', JSON.stringify(MOCK_FOOD));
        localStorage.setItem('meowtopia_cat_food_prefs', JSON.stringify(MOCK_CAT_FOOD_PREFS));
        localStorage.setItem('meowtopia_users', JSON.stringify(MOCK_USERS));
        localStorage.setItem('meowtopia_adoptions', JSON.stringify([]));
        localStorage.setItem('meowtopia_cart', JSON.stringify([]));
        localStorage.setItem('meowtopia_purchases', JSON.stringify([]));
        localStorage.setItem('meowtopia_next_cat_id', '11');
        localStorage.setItem('meowtopia_next_user_id', '3');
        localStorage.setItem('meowtopia_next_adoption_id', '1');
        localStorage.setItem('meowtopia_next_food_id', '7');
        localStorage.setItem('meowtopia_next_cart_id', '1');
        localStorage.setItem('meowtopia_next_purchase_id', '1');
        localStorage.setItem('meowtopia_initialized', 'true');
    }
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

// ===== Fur-Color → Gradient (for image placeholders) =====
function furColorGradient(furColor) {
    const lc = (furColor || '').toLowerCase();
    const map = [
        ['white',   'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)'],
        ['black',   'linear-gradient(135deg, #434343 0%, #1a1a2e 100%)'],
        ['orange',  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'],
        ['ginger',  'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)'],
        ['gray',    'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 100%)'],
        ['tabby',   'linear-gradient(135deg, #c68642 0%, #d4a574 100%)'],
        ['cream',   'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'],
        ['brown',   'linear-gradient(135deg, #8B6914 0%, #c68642 100%)'],
        ['spotted', 'linear-gradient(135deg, #f5af19 0%, #d4a574 100%)'],
        ['tawny',   'linear-gradient(135deg, #d4a574 0%, #c68642 100%)'],
        ['silver',  'linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)'],
        ['blue',    'linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)'],
        ['pink',    'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)'],
    ];
    for (const [key, grad] of map) {
        if (lc.includes(key)) return grad;
    }
    return 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
}

// ===== Cat CRUD =====
function getCats() {
    return JSON.parse(localStorage.getItem('meowtopia_cats')) || [];
}
function getAvailableCats() {
    return getCats().filter(c => c.is_available);
}
function getCatById(catid) {
    return getCats().find(c => c.catid === parseInt(catid));
}
function addCat(cat) {
    const cats = getCats();
    if (cats.find(c => c.shelter_name.toLowerCase() === cat.shelter_name.toLowerCase())) {
        return { error: 'Shelter name already exists!' };
    }
    const nextId = parseInt(localStorage.getItem('meowtopia_next_cat_id'));
    cat.catid = nextId;
    cat.is_available = true;
    cats.push(cat);
    localStorage.setItem('meowtopia_cats', JSON.stringify(cats));
    localStorage.setItem('meowtopia_next_cat_id', String(nextId + 1));
    return cat;
}
function updateCat(catid, updates) {
    const cats = getCats();
    const idx = cats.findIndex(c => c.catid === parseInt(catid));
    if (idx !== -1) {
        if (updates.shelter_name) {
            const dup = cats.find(c => c.catid !== parseInt(catid) && c.shelter_name.toLowerCase() === updates.shelter_name.toLowerCase());
            if (dup) return { error: 'Shelter name already exists!' };
        }
        cats[idx] = { ...cats[idx], ...updates };
        localStorage.setItem('meowtopia_cats', JSON.stringify(cats));
        return cats[idx];
    }
    return null;
}
function deleteCat(catid) {
    let cats = getCats();
    cats = cats.filter(c => c.catid !== parseInt(catid));
    localStorage.setItem('meowtopia_cats', JSON.stringify(cats));
}

// ===== Food Name Standardization =====
function standardizeFoodName(name) {
    return name.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ===== Food CRUD =====
function getFood() {
    return JSON.parse(localStorage.getItem('meowtopia_food')) || [];
}
function getFoodById(foodid) {
    return getFood().find(f => f.foodid === parseInt(foodid));
}
function addFood(food) {
    const foods = getFood();
    const nextId = parseInt(localStorage.getItem('meowtopia_next_food_id'));
    food.foodid = nextId;
    foods.push(food);
    localStorage.setItem('meowtopia_food', JSON.stringify(foods));
    localStorage.setItem('meowtopia_next_food_id', String(nextId + 1));
    return food;
}
function updateFood(foodid, updates) {
    const foods = getFood();
    const idx = foods.findIndex(f => f.foodid === parseInt(foodid));
    if (idx !== -1) {
        foods[idx] = { ...foods[idx], ...updates };
        localStorage.setItem('meowtopia_food', JSON.stringify(foods));
        return foods[idx];
    }
    return null;
}
function deleteFood(foodid) {
    let foods = getFood();
    foods = foods.filter(f => f.foodid !== parseInt(foodid));
    localStorage.setItem('meowtopia_food', JSON.stringify(foods));
}

// ===== Food Preferences =====
function getCatFoodPrefs(catid) {
    const prefs = JSON.parse(localStorage.getItem('meowtopia_cat_food_prefs')) || [];
    const foods = getFood();
    return prefs.filter(p => p.catid === parseInt(catid)).map(p => foods.find(f => f.foodid === p.foodid)).filter(Boolean);
}
function setCatFoodPrefs(catid, foodIds) {
    let prefs = JSON.parse(localStorage.getItem('meowtopia_cat_food_prefs')) || [];
    prefs = prefs.filter(p => p.catid !== parseInt(catid));
    foodIds.forEach(fid => prefs.push({ catid: parseInt(catid), foodid: parseInt(fid) }));
    localStorage.setItem('meowtopia_cat_food_prefs', JSON.stringify(prefs));
}

// ===== Users =====
function getUsers() { return JSON.parse(localStorage.getItem('meowtopia_users')) || []; }
function getUserById(userid) { return getUsers().find(u => u.userid === parseInt(userid)); }

// ===== Adoptions =====
function getAdoptions() { return JSON.parse(localStorage.getItem('meowtopia_adoptions')) || []; }
function getUserAdoptions(userid) { return getAdoptions().filter(a => a.userid === parseInt(userid)); }

function createAdoption(adoption) {
    const adoptions = getAdoptions();
    const nextId = parseInt(localStorage.getItem('meowtopia_next_adoption_id'));
    adoption.adoptionid = nextId;
    adoption.adoption_date = new Date().toISOString();
    adoption.status = 'Pending';
    adoptions.push(adoption);
    localStorage.setItem('meowtopia_adoptions', JSON.stringify(adoptions));
    localStorage.setItem('meowtopia_next_adoption_id', String(nextId + 1));
    updateCat(adoption.catid, { is_available: false, name: adoption.cat_name_given });
    return adoption;
}

function updateAdoptionStatus(adoptionid, status) {
    const adoptions = getAdoptions();
    const idx = adoptions.findIndex(a => a.adoptionid === parseInt(adoptionid));
    if (idx !== -1) {
        adoptions[idx].status = status;
        localStorage.setItem('meowtopia_adoptions', JSON.stringify(adoptions));
        return adoptions[idx];
    }
    return null;
}

// ===== Cart (Food Store) =====
function getCart(userid) {
    const cart = JSON.parse(localStorage.getItem('meowtopia_cart')) || [];
    return cart.filter(c => c.userid === parseInt(userid));
}
function addToCart(userid, foodid, quantity) {
    const cart = JSON.parse(localStorage.getItem('meowtopia_cart')) || [];
    const existing = cart.find(c => c.userid === parseInt(userid) && c.foodid === parseInt(foodid));
    if (existing) { existing.quantity += quantity; }
    else {
        const nextId = parseInt(localStorage.getItem('meowtopia_next_cart_id'));
        cart.push({ cartid: nextId, userid: parseInt(userid), foodid: parseInt(foodid), quantity });
        localStorage.setItem('meowtopia_next_cart_id', String(nextId + 1));
    }
    localStorage.setItem('meowtopia_cart', JSON.stringify(cart));
}
function updateCartItem(cartid, quantity) {
    const cart = JSON.parse(localStorage.getItem('meowtopia_cart')) || [];
    const idx = cart.findIndex(c => c.cartid === parseInt(cartid));
    if (idx !== -1) {
        if (quantity <= 0) cart.splice(idx, 1);
        else cart[idx].quantity = quantity;
        localStorage.setItem('meowtopia_cart', JSON.stringify(cart));
    }
}
function removeFromCart(cartid) {
    let cart = JSON.parse(localStorage.getItem('meowtopia_cart')) || [];
    cart = cart.filter(c => c.cartid !== parseInt(cartid));
    localStorage.setItem('meowtopia_cart', JSON.stringify(cart));
}
function clearCart(userid) {
    let cart = JSON.parse(localStorage.getItem('meowtopia_cart')) || [];
    cart = cart.filter(c => c.userid !== parseInt(userid));
    localStorage.setItem('meowtopia_cart', JSON.stringify(cart));
}
function checkout(userid) {
    const cartItems = getCart(userid);
    if (cartItems.length === 0) return { error: 'Cart is empty!' };
    const foods = getFood();
    let total = 0;
    const lineItems = [];
    for (const item of cartItems) {
        const food = foods.find(f => f.foodid === item.foodid);
        if (!food) return { error: 'Food item not found.' };
        if (food.qty < item.quantity) return { error: 'Not enough stock for ' + food.name + '. Available: ' + food.qty };
        total += food.price * item.quantity;
        lineItems.push({ foodid: item.foodid, quantity: item.quantity, unit_price: food.price, name: food.name });
    }
    for (const item of lineItems) {
        const food = foods.find(f => f.foodid === item.foodid);
        food.qty -= item.quantity;
    }
    localStorage.setItem('meowtopia_food', JSON.stringify(foods));
    const purchases = JSON.parse(localStorage.getItem('meowtopia_purchases')) || [];
    const nextId = parseInt(localStorage.getItem('meowtopia_next_purchase_id'));
    const purchase = { purchaseid: nextId, userid: parseInt(userid), total_amount: total, purchase_date: new Date().toISOString(), items: lineItems };
    purchases.push(purchase);
    localStorage.setItem('meowtopia_purchases', JSON.stringify(purchases));
    localStorage.setItem('meowtopia_next_purchase_id', String(nextId + 1));
    clearCart(userid);
    return { success: true, purchase };
}

// ===== Suggested Products =====
function getSuggestedFoods(userid) {
    const adoptions = getUserAdoptions(userid).filter(a => ['Pending', 'Approved', 'Completed'].includes(a.status));
    const prefs = JSON.parse(localStorage.getItem('meowtopia_cat_food_prefs')) || [];
    const catIds = adoptions.map(a => a.catid);
    const foodIds = [...new Set(prefs.filter(p => catIds.includes(p.catid)).map(p => p.foodid))];
    return getFood().filter(f => foodIds.includes(f.foodid));
}

// ===== Auth =====
function registerUser(userData) {
    const users = getUsers();
    if (users.find(u => u.email === userData.email)) return { success: false, message: "Email already registered!" };
    const nextId = parseInt(localStorage.getItem('meowtopia_next_user_id'));
    const user = { userid: nextId, full_name: userData.full_name, email: userData.email, password: userData.password, phone: userData.phone || "", address: userData.address || "", role: "user", created_at: new Date().toISOString() };
    users.push(user);
    localStorage.setItem('meowtopia_users', JSON.stringify(users));
    localStorage.setItem('meowtopia_next_user_id', String(nextId + 1));
    return { success: true, user };
}
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const sessionUser = { ...user }; delete sessionUser.password;
        localStorage.setItem('meowtopia_session', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
    }
    return { success: false, message: "Invalid email or password!" };
}
function logoutUser() { localStorage.removeItem('meowtopia_session'); }
function getCurrentUser() { const d = localStorage.getItem('meowtopia_session'); return d ? JSON.parse(d) : null; }
function isOwner(userid) { return getUserAdoptions(userid).some(a => ['Approved', 'Completed', 'Pending'].includes(a.status)); }
function isAdmin() { const u = getCurrentUser(); return u && u.role === 'admin'; }

// ===== RESET — Remove this + the button when backend is connected =====
function resetAllData() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('meowtopia_')) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
    initializeData();
    window.location.reload();
}

// ===== Initialize =====
initializeData();

