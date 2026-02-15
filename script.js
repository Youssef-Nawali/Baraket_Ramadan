// Create loading screen stars
const loadingStarsContainer = document.getElementById('loadingStars');
for (let i = 0; i < 50; i++) {
    const star = document.createElement('div');
    star.className = 'loading-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    loadingStarsContainer.appendChild(star);
}

// Create enhanced stars
const starsContainer = document.getElementById('stars');
for (let i = 0; i < 200; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 3 + 's';
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    starsContainer.appendChild(star);
}

// Create shooting stars
setInterval(() => {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = Math.random() * 100 + '%';
    shootingStar.style.top = Math.random() * 50 + '%';
    shootingStar.style.width = (Math.random() * 100 + 50) + 'px';
    starsContainer.appendChild(shootingStar);
    
    setTimeout(() => {
        shootingStar.remove();
    }, 3000);
}, 4000);

// Create floating particles
const particlesContainer = document.getElementById('particles');
setInterval(() => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 8 + 3;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.bottom = '0';
    particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
    particle.style.animationDelay = Math.random() * 2 + 's';
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 10000);
}, 400);

// Create floating blessings
const container = document.querySelector('body');
const blessings = ['✨', '⭐', '💫', '🌙', '☪️'];

setInterval(() => {
    const blessing = document.createElement('div');
    blessing.className = 'blessing';
    blessing.textContent = blessings[Math.floor(Math.random() * blessings.length)];
    blessing.style.left = (Math.random() * 80 + 10) + '%';
    blessing.style.bottom = '0';
    blessing.style.animationDuration = (Math.random() * 3 + 5) + 's';
    container.appendChild(blessing);
    
    setTimeout(() => {
        blessing.remove();
    }, 8000);
}, 2000);

// Prayer Times Functionality
let currentDay = 1; // Current day of Ramadan (1-30)
const maxDays = 30;

// Prayer times data for 30 days (will be fetched from API)
const prayerTimesData = {};

// User location
let userLocation = {
    latitude: null,
    longitude: null,
    city: 'تونس',
    country: 'تونس'
};

// Get user's geolocation
async function getUserLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation.latitude = position.coords.latitude;
                    userLocation.longitude = position.coords.longitude;
                    resolve(true);
                },
                () => {
                    // Default to Tunisia if location access denied
                    userLocation.latitude = 36.8065;
                    userLocation.longitude = 10.1815;
                    resolve(false);
                }
            );
        } else {
            // Default to Tunisia
            userLocation.latitude = 36.8065;
            userLocation.longitude = 10.1815;
            resolve(false);
        }
    });
}

// Fetch prayer times from API
async function fetchPrayerTimes() {
    try {
        await getUserLocation();
        
        const ramadanStartDate = new Date('2026-02-19');
        
        // Fetch prayer times for all 30 days of Ramadan
        for (let day = 1; day <= 30; day++) {
            const currentDate = new Date(ramadanStartDate);
            currentDate.setDate(ramadanStartDate.getDate() + (day - 1));
            
            const timestamp = Math.floor(currentDate.getTime() / 1000);
            
            try {
                const response = await fetch(
                    `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&method=2`
                );
                const data = await response.json();
                
                if (data.code === 200) {
                    const timings = data.data.timings;
                    prayerTimesData[day] = {
                        imsak: timings.Imsak,
                        fajr: timings.Fajr,
                        sunrise: timings.Sunrise,
                        dhuhr: timings.Dhuhr,
                        asr: timings.Asr,
                        maghrib: timings.Maghrib,
                        isha: timings.Isha
                    };
                }
            } catch (error) {
                console.error(`Error fetching day ${day}:`, error);
                // Fallback times
                prayerTimesData[day] = {
                    imsak: `04:${20 + day % 15}`,
                    fajr: `04:${35 + day % 15}`,
                    sunrise: `06:${10 + day % 20}`,
                    dhuhr: `12:${25 + day % 20}`,
                    asr: `15:${40 + day % 20}`,
                    maghrib: `18:${15 + day % 15}`,
                    isha: `19:${40 + day % 15}`
                };
            }
        }
        
        // Update display after fetching
        updatePrayerTimes();
    } catch (error) {
        console.error('Error in fetchPrayerTimes:', error);
        // Use fallback times
        for (let i = 1; i <= 30; i++) {
            prayerTimesData[i] = {
                imsak: `04:${20 + i % 15}`,
                fajr: `04:${35 + i % 15}`,
                sunrise: `06:${10 + i % 20}`,
                dhuhr: `12:${25 + i % 20}`,
                asr: `15:${40 + i % 20}`,
                maghrib: `18:${15 + i % 15}`,
                isha: `19:${40 + i % 15}`
            };
        }
        updatePrayerTimes();
    }
}

// Hijri months
const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Get current date
const today = new Date();
const ramadanStartDate = new Date('2026-02-19'); // رمضان يبدأ يوم الخميس 19 فبراير 2026

// Calculate current Ramadan day
const daysDiff = Math.floor((today - ramadanStartDate) / (1000 * 60 * 60 * 24));
if (daysDiff >= 0 && daysDiff < 30) {
    currentDay = daysDiff + 1;
}

// Update prayer times display
function updatePrayerTimes() {
    const times = prayerTimesData[currentDay];
    if (times) {
        document.getElementById('imsakTime').textContent = times.imsak;
        document.getElementById('fajrTime').textContent = times.fajr;
        document.getElementById('sunriseTime').textContent = times.sunrise;
        document.getElementById('dhuhrTime').textContent = times.dhuhr;
        document.getElementById('asrTime').textContent = times.asr;
        document.getElementById('maghribTime').textContent = times.maghrib;
        document.getElementById('ishaTime').textContent = times.isha;
    }

    // Update date
    const currentDate = new Date(ramadanStartDate);
    currentDate.setDate(ramadanStartDate.getDate() + (currentDay - 1));
    const dayName = arabicDays[currentDate.getDay()];
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    document.getElementById('hijriDate').textContent = `${currentDay} رمضان 1447`;
    document.getElementById('gregorianDate').textContent = `${dayName} ${day}/${month}/${year}`;

    // Load checkboxes state
    loadCheckboxes();
}

// Save checkbox state
function saveCheckboxes() {
    const checkboxes = document.querySelectorAll('.prayer-checkbox');
    const state = {};
    checkboxes.forEach(checkbox => {
        state[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem(`ramadan_day_${currentDay}`, JSON.stringify(state));
}

// Load checkbox state
function loadCheckboxes() {
    const saved = localStorage.getItem(`ramadan_day_${currentDay}`);
    if (saved) {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = state[id];
            }
        });
    } else {
        // Clear all checkboxes if no saved state
        document.querySelectorAll('.prayer-checkbox').forEach(cb => cb.checked = false);
    }
}

// Navigation buttons
document.getElementById('prevDay').addEventListener('click', () => {
    if (currentDay > 1) {
        currentDay--;
        updatePrayerTimes();
    }
});

document.getElementById('nextDay').addEventListener('click', () => {
    if (currentDay < maxDays) {
        currentDay++;
        updatePrayerTimes();
    }
});

// Toggle prayer times card
const toggleBtn = document.getElementById('togglePrayer');
const prayerContainer = document.getElementById('prayerTimesContainer');
let isOpen = false;

toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
        prayerContainer.classList.add('active');
        document.getElementById('toggleText').textContent = 'إخفاء جدول الصلاة';
        document.getElementById('toggleIcon').textContent = '✕';
    } else {
        prayerContainer.classList.remove('active');
        document.getElementById('toggleText').textContent = 'إظهار جدول الصلاة';
        document.getElementById('toggleIcon').textContent = '📋';
    }
});

// Save checkbox state when changed
document.querySelectorAll('.prayer-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', saveCheckboxes);
});

// Initialize - Fetch prayer times from API
fetchPrayerTimes();
