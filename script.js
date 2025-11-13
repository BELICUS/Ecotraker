// Data Storage
const STORAGE_KEYS = {
    USERS: 'ecotracker_users',
    CURRENT_USER: 'ecotracker_current_user',
    MEALS: 'ecotracker_meals',
    TRIPS: 'ecotracker_trips'
};

// API toggle
const USE_API = true; // set to true to use the backend API at backend/server.js
const API_BASE = 'http://localhost:3000';

// API helper functions (used when USE_API === true)
async function apiRegister(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiLogin(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiGetMeals(userId) {
    const url = new URL(`${API_BASE}/meals`);
    if (userId) url.searchParams.set('userId', userId);
    const res = await fetch(url.href);
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiCreateMeal(payload) {
    const res = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiDeleteMeal(id) {
    const res = await fetch(`${API_BASE}/meals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiGetTrips(userId) {
    const url = new URL(`${API_BASE}/trips`);
    if (userId) url.searchParams.set('userId', userId);
    const res = await fetch(url.href);
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiCreateTrip(payload) {
    const res = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiDeleteTrip(id) {
    const res = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await res.json();
    return res.json();
}

async function apiGetUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw await res.json();
    return res.json();
}

// CO2 Emission Factors
const MEAL_EMISSIONS = {
    'carne-roja': { name: 'Carne Roja', co2: 3.3 },
    'pollo': { name: 'Pollo', co2: 0.9 },
    'pescado': { name: 'Pescado', co2: 1.2 },
    'vegetariana': { name: 'Vegetariana', co2: 0.4 },
    'vegana': { name: 'Vegana', co2: 0.3 }
};

const TRIP_EMISSIONS = {
    'coche': { name: 'Coche', co2PerKm: 0.12 },
    'bus': { name: 'Bus', co2PerKm: 0.05 },
    'metro': { name: 'Metro', co2PerKm: 0.03 },
    'bici': { name: 'Bicicleta', co2PerKm: 0 },
    'caminando': { name: 'Caminando', co2PerKm: 0 }
};

const TIPS = [
    { icon: '🚴', title: 'Usa la bicicleta', text: 'Cambia el coche por la bici en distancias cortas. Ahorrarás hasta 2.5 kg de CO2 por cada 10 km.' },
    { icon: '🥗', title: 'Come más vegetales', text: 'Reducir el consumo de carne roja puede ahorrar hasta 3 kg de CO2 por comida.' },
    { icon: '🚌', title: 'Transporte público', text: 'El bus emite 60% menos CO2 que un coche particular por pasajero.' },
    { icon: '♻️', title: 'Recicla y reutiliza', text: 'Reciclar reduce las emisiones de producción de nuevos materiales.' },
    { icon: '💡', title: 'Ahorra energía', text: 'Apaga luces y dispositivos cuando no los uses. Cada kWh ahorrado reduce 0.5 kg de CO2.' },
    { icon: '🌱', title: 'Compra local', text: 'Los productos locales tienen menor huella de transporte.' },
    { icon: '💧', title: 'Ahorra agua', text: 'Reducir el consumo de agua caliente ahorra energía y emisiones.' },
    { icon: '🛍️', title: 'Consume consciente', text: 'Compra solo lo necesario y elige productos con menos empaque.' }
];

// Current State
let currentUser = null;

// Utility Functions
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getWeekDates() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
}

function isDateInCurrentWeek(dateString) {
    const weekDates = getWeekDates();
    return weekDates.includes(dateString);
}

// Authentication
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (tab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Check if user is already logged in
    const savedUser = getFromStorage(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
        currentUser = savedUser;
        showApp();
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (USE_API) {
        apiLogin(email, password)
            .then(user => {
                currentUser = user;
                saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
                window.location.href = 'dashboard.html';
            })
            .catch(err => {
                alert(err.error || 'Email o contraseña incorrectos');
            });
        return;
    }

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        // Redirigir a dashboard.html
        window.location.href = 'dashboard.html';
    } else {
        alert('Email o contraseña incorrectos');
    }
}


function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (USE_API) {
        apiRegister(name, email, password)
            .then(user => {
                currentUser = user;
                saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
                // After register, go to index (or dashboard) -- original behavior returned to index
                window.location.href = 'index.html';
            })
            .catch(err => {
                alert(err.error || 'Error registrando usuario');
            });
        return;
    }

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];

    if (users.find(u => u.email === email)) {
        alert('Este email ya está registrado');
        return;
    }

    const newUser = {
        id: generateId(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);

    currentUser = newUser;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, newUser);

    // Redirigir a dashboard.html
    window.location.href = 'index.html';
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    window.location.href = 'index.html';

    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
}

function showApp() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');
    document.getElementById('user-name').textContent = currentUser.name;

    updateDashboard();
    renderTips();
    renderRanking();
}

// Navigation
function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;

            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${viewName}-view`).classList.add('active');

            if (viewName === 'dashboard') updateDashboard();
            if (viewName === 'meals') renderMealsList();
            if (viewName === 'trips') renderTripsList();
            if (viewName === 'ranking') renderRanking();
        });
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);
}

// Meals
function initMeals() {
    const mealForm = document.getElementById('meal-form');
    const mealDate = document.getElementById('meal-date');
    mealDate.valueAsDate = new Date();

    mealForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('meal-type').value;
        const date = document.getElementById('meal-date').value;

        const mealData = MEAL_EMISSIONS[type];

        if (USE_API) {
            apiCreateMeal({ userId: currentUser.id, type, name: mealData.name, co2: mealData.co2, date })
                .then(() => {
                    mealForm.reset();
                    mealDate.valueAsDate = new Date();
                    renderMealsList();
                    updateDashboard();
                    alert(`¡Comida registrada! Emisión: ${mealData.co2} kg CO2`);
                })
                .catch(err => alert(err.error || 'Error creando comida'));
            return;
        }

        const meals = getFromStorage(STORAGE_KEYS.MEALS) || [];
        const newMeal = {
            id: generateId(),
            userId: currentUser.id,
            type,
            name: mealData.name,
            co2: mealData.co2,
            date,
            createdAt: new Date().toISOString()
        };

        meals.push(newMeal);
        saveToStorage(STORAGE_KEYS.MEALS, meals);

        mealForm.reset();
        mealDate.valueAsDate = new Date();
        renderMealsList();
        updateDashboard();

        alert(`¡Comida registrada! Emisión: ${mealData.co2} kg CO2`);
    });
}

function renderMealsList() {
    const container = document.getElementById('meals-list');
    if (USE_API) {
        apiGetMeals(currentUser.id).then(meals => {
            const userMeals = meals.sort((a, b) => new Date(b.date) - new Date(a.date));
            if (userMeals.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay comidas registradas</div>';
                return;
            }

            container.innerHTML = userMeals.map(meal => `
                <div class="record-item">
                    <div class="record-info">
                        <h4>🍽️ ${meal.name}</h4>
                        <p>${formatDate(meal.date)}</p>
                    </div>
                    <span class="record-co2">${meal.co2} kg CO2</span>
                    <button class="btn btn-danger" onclick="deleteMeal('${meal.id}')">Eliminar</button>
                </div>
            `).join('');
        }).catch(err => { container.innerHTML = '<div class="empty-state">Error cargando comidas</div>' });
        return;
    }

    const meals = getFromStorage(STORAGE_KEYS.MEALS) || [];
    const userMeals = meals.filter(m => m.userId === currentUser.id).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    if (userMeals.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay comidas registradas</div>';
        return;
    }

    container.innerHTML = userMeals.map(meal => `
        <div class="record-item">
            <div class="record-info">
                <h4>🍽️ ${meal.name}</h4>
                <p>${formatDate(meal.date)}</p>
            </div>
            <span class="record-co2">${meal.co2} kg CO2</span>
            <button class="btn btn-danger" onclick="deleteMeal('${meal.id}')">Eliminar</button>
        </div>
    `).join('');
}

function deleteMeal(id) {
    if (!confirm('¿Eliminar esta comida?')) return;

    if (USE_API) {
        apiDeleteMeal(id).then(() => {
            renderMealsList();
            updateDashboard();
        }).catch(err => alert(err.error || 'Error al eliminar'));
        return;
    }

    const meals = getFromStorage(STORAGE_KEYS.MEALS) || [];
    const filtered = meals.filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MEALS, filtered);
    renderMealsList();
    updateDashboard();
}

// Trips
function initTrips() {
    const tripForm = document.getElementById('trip-form');
    const tripDate = document.getElementById('trip-date');
    tripDate.valueAsDate = new Date();

    tripForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('trip-type').value;
        const distance = parseFloat(document.getElementById('trip-distance').value);
        const date = document.getElementById('trip-date').value;

        const tripData = TRIP_EMISSIONS[type];
        const co2 = (tripData.co2PerKm * distance).toFixed(2);

        if (USE_API) {
            apiCreateTrip({ userId: currentUser.id, type, name: tripData.name, distance, co2: parseFloat(co2), date })
                .then(() => {
                    tripForm.reset();
                    tripDate.valueAsDate = new Date();
                    renderTripsList();
                    updateDashboard();
                    alert(`¡Viaje registrado! Emisión: ${co2} kg CO2`);
                })
                .catch(err => alert(err.error || 'Error creando viaje'));
            return;
        }

        const trips = getFromStorage(STORAGE_KEYS.TRIPS) || [];
        const newTrip = {
            id: generateId(),
            userId: currentUser.id,
            type,
            name: tripData.name,
            distance,
            co2: parseFloat(co2),
            date,
            createdAt: new Date().toISOString()
        };

        trips.push(newTrip);
        saveToStorage(STORAGE_KEYS.TRIPS, trips);

        tripForm.reset();
        tripDate.valueAsDate = new Date();
        renderTripsList();
        updateDashboard();

        alert(`¡Viaje registrado! Emisión: ${co2} kg CO2`);
    });
}

function renderTripsList() {
    const container = document.getElementById('trips-list');
    if (USE_API) {
        apiGetTrips(currentUser.id).then(trips => {
            const userTrips = trips.sort((a, b) => new Date(b.date) - new Date(a.date));
            if (userTrips.length === 0) {
                container.innerHTML = '<div class="empty-state">No hay viajes registrados</div>';
                return;
            }

            container.innerHTML = userTrips.map(trip => `
                <div class="record-item">
                    <div class="record-info">
                        <h4>🚗 ${trip.name}</h4>
                        <p>${formatDate(trip.date)} - ${trip.distance} km</p>
                    </div>
                    <span class="record-co2">${trip.co2} kg CO2</span>
                    <button class="btn btn-danger" onclick="deleteTrip('${trip.id}')">Eliminar</button>
                </div>
            `).join('');
        }).catch(err => { container.innerHTML = '<div class="empty-state">Error cargando viajes</div>' });
        return;
    }

    const trips = getFromStorage(STORAGE_KEYS.TRIPS) || [];
    const userTrips = trips.filter(t => t.userId === currentUser.id).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    if (userTrips.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay viajes registrados</div>';
        return;
    }

    container.innerHTML = userTrips.map(trip => `
        <div class="record-item">
            <div class="record-info">
                <h4>🚗 ${trip.name}</h4>
                <p>${formatDate(trip.date)} - ${trip.distance} km</p>
            </div>
            <span class="record-co2">${trip.co2} kg CO2</span>
            <button class="btn btn-danger" onclick="deleteTrip('${trip.id}')">Eliminar</button>
        </div>
    `).join('');
}

function deleteTrip(id) {
    if (!confirm('¿Eliminar este viaje?')) return;

    if (USE_API) {
        apiDeleteTrip(id).then(() => {
            renderTripsList();
            updateDashboard();
        }).catch(err => alert(err.error || 'Error al eliminar'));
        return;
    }

    const trips = getFromStorage(STORAGE_KEYS.TRIPS) || [];
    const filtered = trips.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TRIPS, filtered);
    renderTripsList();
    updateDashboard();
}

// Dashboard
function updateDashboard() {
    if (USE_API) {
        Promise.all([apiGetMeals(currentUser.id), apiGetTrips(currentUser.id)])
            .then(([meals, trips]) => {
                const userMeals = meals.filter(m => isDateInCurrentWeek(m.date));
                const userTrips = trips.filter(t => isDateInCurrentWeek(t.date));

                const mealsCO2 = userMeals.reduce((sum, m) => sum + m.co2, 0);
                const tripsCO2 = userTrips.reduce((sum, t) => sum + t.co2, 0);
                const totalCO2 = mealsCO2 + tripsCO2;
                const dailyAvg = (totalCO2 / 7).toFixed(2);

                document.getElementById('total-co2').textContent = `${totalCO2.toFixed(2)} kg`;
                document.getElementById('meals-co2').textContent = `${mealsCO2.toFixed(2)} kg`;
                document.getElementById('trips-co2').textContent = `${tripsCO2.toFixed(2)} kg`;
                document.getElementById('daily-avg').textContent = `${dailyAvg} kg`;

                renderWeeklyChart(userMeals, userTrips);
                renderRecentActivity(userMeals, userTrips);
            })
            .catch(err => console.error('Error updating dashboard', err));
        return;
    }

    const meals = getFromStorage(STORAGE_KEYS.MEALS) || [];
    const trips = getFromStorage(STORAGE_KEYS.TRIPS) || [];

    const userMeals = meals.filter(m => m.userId === currentUser.id && isDateInCurrentWeek(m.date));
    const userTrips = trips.filter(t => t.userId === currentUser.id && isDateInCurrentWeek(t.date));

    const mealsCO2 = userMeals.reduce((sum, m) => sum + m.co2, 0);
    const tripsCO2 = userTrips.reduce((sum, t) => sum + t.co2, 0);
    const totalCO2 = mealsCO2 + tripsCO2;
    const dailyAvg = (totalCO2 / 7).toFixed(2);

    document.getElementById('total-co2').textContent = `${totalCO2.toFixed(2)} kg`;
    document.getElementById('meals-co2').textContent = `${mealsCO2.toFixed(2)} kg`;
    document.getElementById('trips-co2').textContent = `${tripsCO2.toFixed(2)} kg`;
    document.getElementById('daily-avg').textContent = `${dailyAvg} kg`;

    renderWeeklyChart(userMeals, userTrips);
    renderRecentActivity(userMeals, userTrips);
}

function renderWeeklyChart(meals, trips) {
    const weekDates = getWeekDates();
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const dailyData = weekDates.map((date, index) => {
        const dayMeals = meals.filter(m => m.date === date);
        const dayTrips = trips.filter(t => t.date === date);
        const co2 = dayMeals.reduce((sum, m) => sum + m.co2, 0) +
            dayTrips.reduce((sum, t) => sum + t.co2, 0);
        return { date, day: dayNames[index], co2 };
    });

    const maxCO2 = Math.max(...dailyData.map(d => d.co2), 1);

    const chartHTML = dailyData.map(data => {
        const height = (data.co2 / maxCO2) * 100;
        return `
            <div class="chart-bar" style="height: ${height}%">
                <span class="chart-bar-value">${data.co2.toFixed(1)}</span>
                <span class="chart-bar-label">${data.day}</span>
            </div>
        `;
    }).join('');

    document.getElementById('weekly-chart').innerHTML = chartHTML;
}

function renderRecentActivity(meals, trips) {
    const allActivities = [
        ...meals.map(m => ({ ...m, type: 'meal', icon: '🍽️' })),
        ...trips.map(t => ({ ...t, type: 'trip', icon: '🚗' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const container = document.getElementById('recent-list');

    if (allActivities.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay actividad reciente</div>';
        return;
    }

    container.innerHTML = allActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-info">
                <span class="activity-icon">${activity.icon}</span>
                <div class="activity-details">
                    <h4>${activity.name}</h4>
                    <p>${formatDate(activity.date)}${activity.distance ? ` - ${activity.distance} km` : ''}</p>
                </div>
            </div>
            <span class="activity-co2">${activity.co2} kg CO2</span>
        </div>
    `).join('');
}

// Tips
function renderTips() {
    const container = document.getElementById('tips-container');
    container.innerHTML = TIPS.map(tip => `
        <div class="tip-card">
            <h3><span>${tip.icon}</span> ${tip.title}</h3>
            <p>${tip.text}</p>
        </div>
    `).join('');
}

// Ranking
function renderRanking() {
    const container = document.getElementById('ranking-list');

    if (USE_API) {
        Promise.all([apiGetUsers(), apiGetMeals(), apiGetTrips()])
            .then(([users, meals, trips]) => {
                const rankings = users.map(user => {
                    const userMeals = meals.filter(m => m.userId === user.id && isDateInCurrentWeek(m.date));
                    const userTrips = trips.filter(t => t.userId === user.id && isDateInCurrentWeek(t.date));
                    const totalCO2 = userMeals.reduce((sum, m) => sum + m.co2, 0) +
                        userTrips.reduce((sum, t) => sum + t.co2, 0);
                    return { ...user, totalCO2 };
                }).sort((a, b) => a.totalCO2 - b.totalCO2);

                if (rankings.length === 0) {
                    container.innerHTML = '<div class="empty-state">No hay usuarios registrados</div>';
                    return;
                }

                container.innerHTML = rankings.map((user, index) => {
                    const position = index + 1;
                    let positionClass = '';
                    let medal = '';

                    if (position === 1) {
                        positionClass = 'gold';
                        medal = '🥇';
                    } else if (position === 2) {
                        positionClass = 'silver';
                        medal = '🥈';
                    } else if (position === 3) {
                        positionClass = 'bronze';
                        medal = '🥉';
                    }

                    const isCurrentUser = user.id === currentUser.id;

                    return `
                        <div class="ranking-item" style="${isCurrentUser ? 'border: 2px solid var(--primary);' : ''}">
                            <span class="ranking-position ${positionClass}">${medal || position}</span>
                            <div class="ranking-info">
                                <h4>${user.name} ${isCurrentUser ? '(Tú)' : ''}</h4>
                                <p>Emisiones semanales</p>
                            </div>
                            <span class="ranking-co2">${user.totalCO2.toFixed(2)} kg CO2</span>
                        </div>
                    `;
                }).join('');
            })
            .catch(err => { container.innerHTML = '<div class="empty-state">Error cargando ranking</div>'; });
        return;
    }

    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const meals = getFromStorage(STORAGE_KEYS.MEALS) || [];
    const trips = getFromStorage(STORAGE_KEYS.TRIPS) || [];

    const rankings = users.map(user => {
        const userMeals = meals.filter(m => m.userId === user.id && isDateInCurrentWeek(m.date));
        const userTrips = trips.filter(t => t.userId === user.id && isDateInCurrentWeek(t.date));
        const totalCO2 = userMeals.reduce((sum, m) => sum + m.co2, 0) +
            userTrips.reduce((sum, t) => sum + t.co2, 0);
        return { ...user, totalCO2 };
    }).sort((a, b) => a.totalCO2 - b.totalCO2);

    if (rankings.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay usuarios registrados</div>';
        return;
    }

    container.innerHTML = rankings.map((user, index) => {
        const position = index + 1;
        let positionClass = '';
        let medal = '';

        if (position === 1) {
            positionClass = 'gold';
            medal = '🥇';
        } else if (position === 2) {
            positionClass = 'silver';
            medal = '🥈';
        } else if (position === 3) {
            positionClass = 'bronze';
            medal = '🥉';
        }

        const isCurrentUser = user.id === currentUser.id;

        return `
            <div class="ranking-item" style="${isCurrentUser ? 'border: 2px solid var(--primary);' : ''}">
                <span class="ranking-position ${positionClass}">${medal || position}</span>
                <div class="ranking-info">
                    <h4>${user.name} ${isCurrentUser ? '(Tú)' : ''}</h4>
                    <p>Emisiones semanales</p>
                </div>
                <span class="ranking-co2">${user.totalCO2.toFixed(2)} kg CO2</span>
            </div>
        `;
    }).join('');
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    const isDashboard = window.location.pathname.includes('dashboard.html');

    if (isDashboard) {
        // Verificar si hay un usuario autenticado
        const savedUser = getFromStorage(STORAGE_KEYS.CURRENT_USER);
        if (!savedUser) {
            // Si no hay sesión activa, volver al login
            window.location.href = 'index.html';
            return;
        }

        // Asignar el usuario actual
        currentUser = savedUser;

        // Inicializar componentes del dashboard (algunas funciones son async internamente)
        document.getElementById('user-name').textContent = currentUser.name;
        initNavigation();
        initMeals();
        initTrips();
        // updateDashboard y renderRanking manejan internamente si usan API
        updateDashboard();
        renderTips();
        renderRanking();

    } else {
        // Página principal (login/registro)
        initAuth();
    }
});

// Make delete functions global
window.deleteMeal = deleteMeal;
window.deleteTrip = deleteTrip;