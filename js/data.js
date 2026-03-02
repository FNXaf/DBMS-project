// ===== Meowtopia Mock Data =====
// This file contains all mock data used to simulate the database.
// Data is seeded into localStorage on first visit.

const MOCK_CATS = [
    {
        catid: 1,
        name: null,
        breed: "Persian",
        fur_color: "White",
        age: "6 months",
        gender: "Female",
        intake_date: "2025-01-15",
        health_status: "Vaccinated",
        cattitude: "Chill",
        photo_url: "https://cdn2.thecatapi.com/images/ebv.jpg",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        is_available: true
    },
    {
        catid: 2,
        name: null,
        breed: "Siamese",
        fur_color: "Cream & Brown",
        age: "1 year",
        gender: "Male",
        intake_date: "2025-03-01",
        health_status: "Healthy",
        cattitude: "Sassy",
        photo_url: "https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        is_available: true
    },
    {
        catid: 3,
        name: null,
        breed: "Maine Coon",
        fur_color: "Tabby",
        age: "2 years",
        gender: "Male",
        intake_date: "2024-11-20",
        health_status: "Healthy",
        cattitude: "Playful",
        photo_url: "https://cdn2.thecatapi.com/images/OGTWqNNOt.jpg",
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        is_available: true
    },
    {
        catid: 4,
        name: null,
        breed: "Ragdoll",
        fur_color: "White & Gray",
        age: "4 months",
        gender: "Female",
        intake_date: "2025-05-10",
        health_status: "Vaccinated",
        cattitude: "Cuddly",
        photo_url: "https://cdn2.thecatapi.com/images/j5cVSqLer.jpg",
        gradient: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)",
        is_available: true
    },
    {
        catid: 5,
        name: null,
        breed: "British Shorthair",
        fur_color: "Gray",
        age: "3 years",
        gender: "Male",
        intake_date: "2024-08-05",
        health_status: "Healthy",
        cattitude: "Lazy",
        photo_url: "https://cdn2.thecatapi.com/images/s4wQHTcjM.jpg",
        gradient: "linear-gradient(135deg, #c1c1c1 0%, #e8e8e8 100%)",
        is_available: true
    },
    {
        catid: 6,
        name: null,
        breed: "Bengal",
        fur_color: "Spotted Brown",
        age: "8 months",
        gender: "Female",
        intake_date: "2025-02-28",
        health_status: "Under Treatment",
        cattitude: "Energetic",
        photo_url: "https://cdn2.thecatapi.com/images/IFXsxIreu.jpg",
        gradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
        is_available: true
    },
    {
        catid: 7,
        name: null,
        breed: "Scottish Fold",
        fur_color: "Orange",
        age: "1 year",
        gender: "Female",
        intake_date: "2025-04-12",
        health_status: "Healthy",
        cattitude: "Sweet",
        photo_url: "https://cdn2.thecatapi.com/images/ZJKzGLEbY.jpg",
        gradient: "linear-gradient(135deg, #fceabb 0%, #f8b500 100%)",
        is_available: true
    },
    {
        catid: 8,
        name: null,
        breed: "Sphynx",
        fur_color: "Pink",
        age: "2 years",
        gender: "Male",
        intake_date: "2025-01-30",
        health_status: "Vaccinated",
        cattitude: "Mischievous",
        photo_url: "https://cdn2.thecatapi.com/images/KJF8fB_20.jpg",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
        is_available: true
    },
    {
        catid: 9,
        name: null,
        breed: "Abyssinian",
        fur_color: "Tawny",
        age: "5 months",
        gender: "Male",
        intake_date: "2025-06-01",
        health_status: "Healthy",
        cattitude: "Curious",
        photo_url: "https://cdn2.thecatapi.com/images/pbuqsGBaa.jpg",
        gradient: "linear-gradient(135deg, #d4a574 0%, #c68642 100%)",
        is_available: true
    },
    {
        catid: 10,
        name: null,
        breed: "Russian Blue",
        fur_color: "Silver-Blue",
        age: "1.5 years",
        gender: "Female",
        intake_date: "2025-03-20",
        health_status: "Vaccinated",
        cattitude: "Gentle",
        photo_url: "https://cdn2.thecatapi.com/images/mOBxKGjMQ.jpg",
        gradient: "linear-gradient(135deg, #89ABE3 0%, #D4E8FF 100%)",
        is_available: true
    }
];

const MOCK_FOOD = [
    { foodid: 1, name: "Cat Milk", qty: 50, price: 120.00 },
    { foodid: 2, name: "Tuna Bites", qty: 30, price: 85.00 },
    { foodid: 3, name: "Dry Kibble", qty: 100, price: 200.00 },
    { foodid: 4, name: "Salmon Treats", qty: 40, price: 150.00 },
    { foodid: 5, name: "Chicken Pâté", qty: 25, price: 95.00 }
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
        userid: 1,
        full_name: "Admin Meow",
        email: "admin@meowtopia.com",
        password: "admin123",
        phone: "9876543210",
        address: "Meowtopia HQ",
        role: "admin",
        created_at: "2025-01-01T00:00:00"
    },
    {
        userid: 2,
        full_name: "Sam Johnson",
        email: "sam@example.com",
        password: "sam123",
        phone: "1234567890",
        address: "123 Cat Street, Mewville",
        role: "user",
        created_at: "2025-02-10T00:00:00"
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
        localStorage.setItem('meowtopia_next_cat_id', '11');
        localStorage.setItem('meowtopia_next_user_id', '3');
        localStorage.setItem('meowtopia_next_adoption_id', '1');
        localStorage.setItem('meowtopia_next_food_id', '6');
        localStorage.setItem('meowtopia_initialized', 'true');
    }
}

// ===== Data Access Functions =====
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

function getCatFoodPrefs(catid) {
    const prefs = JSON.parse(localStorage.getItem('meowtopia_cat_food_prefs')) || [];
    const foods = getFood();
    return prefs
        .filter(p => p.catid === parseInt(catid))
        .map(p => foods.find(f => f.foodid === p.foodid))
        .filter(Boolean);
}

function setCatFoodPrefs(catid, foodIds) {
    let prefs = JSON.parse(localStorage.getItem('meowtopia_cat_food_prefs')) || [];
    prefs = prefs.filter(p => p.catid !== parseInt(catid));
    foodIds.forEach(fid => {
        prefs.push({ catid: parseInt(catid), foodid: parseInt(fid) });
    });
    localStorage.setItem('meowtopia_cat_food_prefs', JSON.stringify(prefs));
}

function getUsers() {
    return JSON.parse(localStorage.getItem('meowtopia_users')) || [];
}

function getUserById(userid) {
    return getUsers().find(u => u.userid === parseInt(userid));
}

function getAdoptions() {
    return JSON.parse(localStorage.getItem('meowtopia_adoptions')) || [];
}

function getUserAdoptions(userid) {
    return getAdoptions().filter(a => a.userid === parseInt(userid));
}

function createAdoption(adoption) {
    const adoptions = getAdoptions();
    const nextId = parseInt(localStorage.getItem('meowtopia_next_adoption_id'));
    adoption.adoptionid = nextId;
    adoption.adoption_date = new Date().toISOString();
    adoption.status = 'Pending';
    adoptions.push(adoption);
    localStorage.setItem('meowtopia_adoptions', JSON.stringify(adoptions));
    localStorage.setItem('meowtopia_next_adoption_id', String(nextId + 1));

    // Mark cat as unavailable (simulating the trigger)
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

// ===== Auth Functions =====
function registerUser(userData) {
    const users = getUsers();
    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: "Email already registered!" };
    }
    const nextId = parseInt(localStorage.getItem('meowtopia_next_user_id'));
    const user = {
        userid: nextId,
        full_name: userData.full_name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || "",
        address: userData.address || "",
        role: "user",
        created_at: new Date().toISOString()
    };
    users.push(user);
    localStorage.setItem('meowtopia_users', JSON.stringify(users));
    localStorage.setItem('meowtopia_next_user_id', String(nextId + 1));
    return { success: true, user };
}

function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem('meowtopia_session', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
    }
    return { success: false, message: "Invalid email or password!" };
}

function logoutUser() {
    localStorage.removeItem('meowtopia_session');
}

function getCurrentUser() {
    const data = localStorage.getItem('meowtopia_session');
    return data ? JSON.parse(data) : null;
}

function isOwner(userid) {
    const adoptions = getUserAdoptions(userid);
    return adoptions.some(a => ['Approved', 'Completed', 'Pending'].includes(a.status));
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// ===== Initialize on Load =====
initializeData();
