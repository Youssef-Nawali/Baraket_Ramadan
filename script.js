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

// Shooting stars
setInterval(() => {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = Math.random() * 100 + '%';
    shootingStar.style.top = Math.random() * 50 + '%';
    shootingStar.style.width = (Math.random() * 100 + 50) + 'px';
    starsContainer.appendChild(shootingStar);
    setTimeout(() => shootingStar.remove(), 3000);
}, 4000);

// Floating particles
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
    setTimeout(() => particle.remove(), 10000);
}, 400);

// Floating blessings
const bodyEl = document.querySelector('body');
const blessings = ['✨', '⭐', '💫', '🌙', '☪️'];
setInterval(() => {
    const blessing = document.createElement('div');
    blessing.className = 'blessing';
    blessing.textContent = blessings[Math.floor(Math.random() * blessings.length)];
    blessing.style.left = (Math.random() * 80 + 10) + '%';
    blessing.style.bottom = '0';
    blessing.style.animationDuration = (Math.random() * 3 + 5) + 's';
    bodyEl.appendChild(blessing);
    setTimeout(() => blessing.remove(), 8000);
}, 2000);

// =============================================
// PRAYER DATA
// =============================================
let currentDay = 1;
const maxDays = 30;
const prayerTimesData = {};

const prayerIds = ['imsak', 'fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
const prayerNames = {
    imsak: 'الإمساك', fajr: 'الفجر', sunrise: 'الشروق',
    dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء'
};

const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ramadanStartDate = new Date('2026-02-19');

// Set currentDay based on today
const today = new Date();
const daysDiff = Math.floor((today - ramadanStartDate) / (1000 * 60 * 60 * 24));
if (daysDiff >= 0 && daysDiff < 30) {
    currentDay = daysDiff + 1;
}

// =============================================
// ALARM SYSTEM
// =============================================
let alarmSettings = JSON.parse(localStorage.getItem('alarmSettings') || '{}');
prayerIds.forEach(k => { if (alarmSettings[k] === undefined) alarmSettings[k] = true; });
let alarmFired = {};

function playAdhanSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const notes = [
            { freq: 440, time: 0,   dur: 0.5 },
            { freq: 494, time: 0.5, dur: 0.5 },
            { freq: 523, time: 1.0, dur: 0.8 },
            { freq: 494, time: 1.8, dur: 0.5 },
            { freq: 440, time: 2.3, dur: 0.8 },
            { freq: 392, time: 3.1, dur: 0.5 },
            { freq: 440, time: 3.6, dur: 1.2 },
        ];
        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = note.freq;
            gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + note.time + 0.05);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + note.time + note.dur);
            osc.start(ctx.currentTime + note.time);
            osc.stop(ctx.currentTime + note.time + note.dur + 0.1);
        });
    } catch(e) { console.log('Audio error:', e); }
}

function showAlarmNotification(prayerId) {
    const name = prayerNames[prayerId];
    const existing = document.querySelector('.alarm-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'alarm-notification';
    notif.innerHTML = `
        <button class="notif-close" onclick="this.parentElement.remove()">✕</button>
        <span class="notif-icon">🔔</span>
        <div class="notif-title">حان وقت ${name}</div>
        <div class="notif-subtitle">الله أكبر • حي على الصلاة</div>
    `;
    document.body.appendChild(notif);
    requestAnimationFrame(() => requestAnimationFrame(() => notif.classList.add('show')));
    setTimeout(() => { notif.classList.remove('show'); setTimeout(() => notif.remove(), 500); }, 10000);
    playAdhanSound();

    if (Notification.permission === 'granted') {
        new Notification(`🌙 حان وقت ${name}`, { body: 'الله أكبر • حي على الصلاة' });
    }
}

function setupAlarmButtons() {
    prayerIds.forEach(id => {
        const btn = document.getElementById(`alarm-${id}`);
        if (!btn) return;
        btn.classList.toggle('active', !!alarmSettings[id]);
        btn.addEventListener('click', () => {
            alarmSettings[id] = !alarmSettings[id];
            btn.classList.toggle('active', alarmSettings[id]);
            if (alarmSettings[id]) {
                btn.style.animation = 'none';
                requestAnimationFrame(() => { btn.style.animation = 'bellRing 0.5s ease'; });
            }
            localStorage.setItem('alarmSettings', JSON.stringify(alarmSettings));
        });
    });
}

if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// =============================================
// COUNTDOWN TIMERS
// =============================================
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return null;
    // Strip any extra characters (API sometimes returns "HH:MM (timezone)")
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return parseInt(match[1]) * 3600 + parseInt(match[2]) * 60;
}

function formatCountdown(totalSeconds) {
    if (totalSeconds <= 0) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
        return `${h}س ${String(m).padStart(2,'0')}د ${String(s).padStart(2,'0')}ث`;
    }
    return `${m}د ${String(s).padStart(2,'0')}ث`;
}

function getCurrentDayRamadan() {
    const now = new Date();
    const diff = Math.floor((now - ramadanStartDate) / (1000 * 60 * 60 * 24));
    return (diff >= 0 && diff < 30) ? diff + 1 : null;
}

function updateCountdowns() {
    const times = prayerTimesData[currentDay];
    if (!times) return; // data not loaded yet

    const now = new Date();
    const todayRamadanDay = getCurrentDayRamadan();
    const isToday = (todayRamadanDay === currentDay);

    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // For non-today days, compute "seconds from now until that day's prayer"
    // by calculating how many days away the viewed day is
    const todayActualDay = todayRamadanDay || 1;
    const dayOffset = (currentDay - todayActualDay); // negative = past, 0 = today, positive = future
    const dayOffsetSeconds = dayOffset * 86400;

    // Remove all next-prayer highlights
    prayerIds.forEach(id => {
        const item = document.getElementById(`item-${id}`);
        if (item) item.classList.remove('next-prayer');
    });

    let nextPrayerId = null;
    let nextPrayerDiff = Infinity;

    const timeMap = {
        imsak: times.imsak, fajr: times.fajr, sunrise: times.sunrise,
        dhuhr: times.dhuhr, asr: times.asr, maghrib: times.maghrib, isha: times.isha
    };

    prayerIds.forEach(id => {
        const countdownEl = document.getElementById(`${id}Countdown`);
        if (!countdownEl) return;

        const prayerSeconds = parseTimeToSeconds(timeMap[id]);
        if (prayerSeconds === null) {
            countdownEl.textContent = '';
            return;
        }

        // diffSeconds: how many seconds until this prayer (positive = future, negative = past)
        let diffSeconds = (prayerSeconds + dayOffsetSeconds) - nowSeconds;

        if (isToday) {
            // Check alarm trigger (within 5 seconds window)
            if (diffSeconds >= 0 && diffSeconds <= 5 && alarmSettings[id] && !alarmFired[id]) {
                alarmFired[id] = true;
                showAlarmNotification(id);
            }
            // Reset alarmFired after 2 min past
            if (diffSeconds < -120) alarmFired[id] = false;
        }

        if (diffSeconds < -60) {
            countdownEl.textContent = 'مضى';
            countdownEl.className = 'prayer-countdown passed';
        } else if (diffSeconds >= -60 && diffSeconds <= 60) {
            countdownEl.textContent = '🕌 حان الآن';
            countdownEl.className = 'prayer-countdown now';
            const item = document.getElementById(`item-${id}`);
            if (item) item.classList.add('next-prayer');
        } else {
            const formatted = formatCountdown(diffSeconds);
            countdownEl.textContent = formatted || '';
            countdownEl.className = 'prayer-countdown' + (diffSeconds <= 900 ? ' urgent' : '');
            if (diffSeconds < nextPrayerDiff) {
                nextPrayerDiff = diffSeconds;
                nextPrayerId = id;
            }
        }
    });

    // Highlight the next upcoming prayer
    if (nextPrayerId) {
        const item = document.getElementById(`item-${nextPrayerId}`);
        if (item) item.classList.add('next-prayer');
    }
}

// Tick every second
setInterval(updateCountdowns, 1000);

// =============================================
// FETCH PRAYER TIMES
// =============================================
let userLocation = { latitude: 36.8065, longitude: 10.1815 };

async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation.latitude = pos.coords.latitude;
                userLocation.longitude = pos.coords.longitude;
                resolve(true);
            },
            () => resolve(false)
        );
    });
}

async function fetchPrayerTimes() {
    await getUserLocation();
    
    for (let day = 1; day <= 30; day++) {
        const date = new Date(ramadanStartDate);
        date.setDate(ramadanStartDate.getDate() + (day - 1));
        const timestamp = Math.floor(date.getTime() / 1000);
        
        try {
            const response = await fetch(
                `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&method=2`
            );
            const data = await response.json();
            if (data.code === 200) {
                const t = data.data.timings;
                prayerTimesData[day] = {
                    imsak: t.Imsak, fajr: t.Fajr, sunrise: t.Sunrise,
                    dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha
                };
            } else { setFallbackDay(day); }
        } catch (e) { setFallbackDay(day); }

        // Update display as soon as current day is loaded
        if (day === currentDay) updatePrayerDisplay();
    }
}

function setFallbackDay(day) {
    prayerTimesData[day] = {
        imsak:   `04:${String((20 + day) % 60).padStart(2,'0')}`,
        fajr:    `04:${String((35 + day) % 60).padStart(2,'0')}`,
        sunrise: `06:${String((10 + day) % 60).padStart(2,'0')}`,
        dhuhr:   `12:${String((25 + day) % 60).padStart(2,'0')}`,
        asr:     `15:${String((40 + day) % 60).padStart(2,'0')}`,
        maghrib: `18:${String((15 + day) % 60).padStart(2,'0')}`,
        isha:    `19:${String((40 + day) % 60).padStart(2,'0')}`
    };
}

function updatePrayerDisplay() {
    const times = prayerTimesData[currentDay];
    if (!times) return;

    document.getElementById('imsakTime').textContent   = times.imsak;
    document.getElementById('fajrTime').textContent    = times.fajr;
    document.getElementById('sunriseTime').textContent = times.sunrise;
    document.getElementById('dhuhrTime').textContent   = times.dhuhr;
    document.getElementById('asrTime').textContent     = times.asr;
    document.getElementById('maghribTime').textContent = times.maghrib;
    document.getElementById('ishaTime').textContent    = times.isha;

    const date = new Date(ramadanStartDate);
    date.setDate(ramadanStartDate.getDate() + (currentDay - 1));
    document.getElementById('hijriDate').textContent    = `${currentDay} رمضان 1447`;
    document.getElementById('gregorianDate').textContent = `${arabicDays[date.getDay()]} ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;

    loadCheckboxes();
    alarmFired = {};
    updateCountdowns(); // immediate update
}

function saveCheckboxes() {
    const state = {};
    document.querySelectorAll('.prayer-checkbox').forEach(cb => { state[cb.id] = cb.checked; });
    localStorage.setItem(`ramadan_day_${currentDay}`, JSON.stringify(state));
}

function loadCheckboxes() {
    const saved = localStorage.getItem(`ramadan_day_${currentDay}`);
    if (saved) {
        const state = JSON.parse(saved);
        Object.keys(state).forEach(id => {
            const cb = document.getElementById(id);
            if (cb) cb.checked = state[id];
        });
    } else {
        document.querySelectorAll('.prayer-checkbox').forEach(cb => cb.checked = false);
    }
}

document.getElementById('prevDay').addEventListener('click', () => {
    if (currentDay > 1) { currentDay--; updatePrayerDisplay(); }
});
document.getElementById('nextDay').addEventListener('click', () => {
    if (currentDay < maxDays) { currentDay++; updatePrayerDisplay(); }
});

const toggleBtn = document.getElementById('togglePrayer');
const prayerContainer = document.getElementById('prayerTimesContainer');
let isOpen = false;
toggleBtn.addEventListener('click', () => {
    isOpen = !isOpen;
    prayerContainer.classList.toggle('active', isOpen);
    document.getElementById('toggleText').textContent = isOpen ? 'إخفاء جدول الصلاة' : 'إظهار جدول الصلاة';
    document.getElementById('toggleIcon').textContent = isOpen ? '✕' : '📋';
});

document.querySelectorAll('.prayer-checkbox').forEach(cb => cb.addEventListener('change', saveCheckboxes));

// Init
setupAlarmButtons();
fetchPrayerTimes();