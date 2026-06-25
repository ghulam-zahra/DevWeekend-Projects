// app.js - Smart weather with condition correction

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityNameEl = document.getElementById('cityName');
const countryTag = document.getElementById('countryTag');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const conditionText = document.getElementById('conditionText');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const errorMsg = document.getElementById('errorMessage');
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');

// Update clock
function updateClock() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
    currentDateEl.textContent = now.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}
updateClock();
setInterval(updateClock, 1000);

// --- SMART CONDITION CORRECTION ---
function getCorrectedCondition(temp, originalCondition) {
    const cond = originalCondition.toLowerCase();
    
    // Agar temperature 35°C se zyada hai
    if (temp >= 35) {
        // Agar condition cloudy hai toh sunny karo
        if (cond.includes('cloud') || cond.includes('scatter') || cond.includes('overcast')) {
            return 'Sunny';
        }
        // Agar rain hai toh bhi sunny karo (extreme heat mein rain nahi hoti)
        if (cond.includes('rain') || cond.includes('drizzle')) {
            return 'Sunny';
        }
    }
    
    // Agar temperature 30-35°C hai
    if (temp >= 30 && temp < 35) {
        if (cond.includes('cloud') && !cond.includes('partly')) {
            return 'Partly Cloudy';
        }
    }
    
    // Agar temperature 25-30°C hai
    if (temp >= 25 && temp < 30) {
        if (cond.includes('rain') || cond.includes('drizzle')) {
            return 'Light Rain';
        }
    }
    
    // Agar temperature 10°C se kam hai
    if (temp < 10) {
        if (cond.includes('cloud') || cond.includes('rain')) {
            return 'Cold';
        }
    }
    
    // Original condition ko capitalize karein
    return originalCondition.charAt(0).toUpperCase() + originalCondition.slice(1);
}

// --- Get weather icon based on corrected condition ---
function getWeatherIconData(condition, temp) {
    const cond = condition.toLowerCase();
    
    // Extreme heat (35°C+)
    if (temp >= 35) {
        return { 
            icon: '<i class="fas fa-sun" style="color: #ff6b35;"></i>', 
            label: 'Extreme Heat' 
        };
    }
    
    // Hot (30-35°C)
    if (temp >= 30 && temp < 35) {
        return { 
            icon: '<i class="fas fa-sun" style="color: #fad974;"></i>', 
            label: 'Hot & Sunny' 
        };
    }
    
    // Normal sunny
    if (cond.includes('sunny') || cond.includes('clear')) {
        return { icon: '<i class="fas fa-sun" style="color: #fad974;"></i>', label: 'Sunny' };
    }
    
    // Cloudy
    if (cond.includes('cloudy') || cond.includes('overcast')) {
        return { icon: '<i class="fas fa-cloud" style="color: #c0d0e0;"></i>', label: 'Cloudy' };
    }
    
    // Partly cloudy
    if (cond.includes('partly cloudy') || cond.includes('scattered clouds')) {
        return { icon: '<i class="fas fa-cloud-sun" style="color: #f5d98f;"></i>', label: 'Partly Cloudy' };
    }
    
    // Rain
    if (cond.includes('rain') || cond.includes('drizzle')) {
        return { icon: '<i class="fas fa-cloud-rain" style="color: #7ba9d4;"></i>', label: 'Rainy' };
    }
    
    // Thunderstorm
    if (cond.includes('thunder') || cond.includes('storm')) {
        return { icon: '<i class="fas fa-cloud-bolt" style="color: #e0b04a;"></i>', label: 'Thunderstorm' };
    }
    
    // Snow
    if (cond.includes('snow')) {
        return { icon: '<i class="fas fa-snowflake" style="color: #b0e0ff;"></i>', label: 'Snow' };
    }
    
    // Default
    return { icon: '<i class="fas fa-sun" style="color: #fad974;"></i>', label: 'Sunny' };
}

// --- Fetch real weather from OpenWeatherMap ---
async function fetchRealWeather(city) {
    const cityName = city.trim();
    if (!cityName) {
        throw new Error('Please enter a city name.');
    }

    const apiKey = CONFIG.API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'YOUR_API_KEY') {
        throw new Error('⚠️ API key not set. Please add your OpenWeatherMap API key in config.js');
    }

    const url = `${CONFIG.API_BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=${CONFIG.UNITS}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.message || '';
            
            if (response.status === 401) {
                throw new Error('❌ Invalid API key. Please check your key at: https://home.openweathermap.org/api_keys');
            } else if (response.status === 404) {
                throw new Error(`❌ City "${cityName}" not found. Please check spelling.`);
            } else {
                throw new Error(`❌ ${errorMessage || response.statusText}`);
            }
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('❌ Network error. Please check your internet connection.');
        }
        throw error;
    }
}

// --- Update UI with SMART corrections ---
function updateUI(data) {
    const city = data.name;
    const country = data.sys.country || '--';
    const temp = Math.round(data.main.temp);
    const hum = data.main.humidity;
    const wind = (data.wind.speed * 3.6).toFixed(1);
    const originalCondition = data.weather[0].description;

    // 🔥 SMART CORRECTION: Temperature ke hisaab se condition fix karein
    const correctedCondition = getCorrectedCondition(temp, originalCondition);
    
    // Icon bhi temperature ke hisaab se
    const iconData = getWeatherIconData(correctedCondition, temp);

    cityNameEl.innerHTML = `${city} <i class="fas fa-location-dot"></i>`;
    countryTag.textContent = country;
    weatherIcon.innerHTML = iconData.icon;
    conditionText.textContent = iconData.label;
    temperature.innerHTML = `${temp}<sup>°C</sup>`;
    humidity.textContent = `${hum}%`;
    windSpeed.textContent = `${wind} km/h`;
    errorMsg.style.display = 'none';
}

function showError(message) {
    errorMsg.textContent = message || 'Something went wrong. Try again.';
    errorMsg.style.display = 'block';
}

// --- Search handler ---
async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    // Loading state
    cityNameEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Searching...`;
    weatherIcon.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    temperature.innerHTML = '--<sup>°C</sup>';
    conditionText.textContent = 'Loading...';
    humidity.textContent = '--%';
    windSpeed.textContent = '-- km/h';
    countryTag.textContent = '--';
    errorMsg.style.display = 'none';

    try {
        const data = await fetchRealWeather(city);
        updateUI(data);
    } catch (err) {
        showError(err.message);
        cityNameEl.innerHTML = `${city} <i class="fas fa-location-dot"></i>`;
        weatherIcon.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #ffb4a2;"></i>';
        temperature.innerHTML = '--<sup>°C</sup>';
        conditionText.textContent = 'Error';
        humidity.textContent = '--%';
        windSpeed.textContent = '-- km/h';
        countryTag.textContent = '--';
    }
}

// --- Event listeners ---
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
    }
});

// --- Auto-load default city ---
window.addEventListener('load', () => {
    if (!CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        cityNameEl.innerHTML = '🔑 API Key Required';
        weatherIcon.innerHTML = '<i class="fas fa-key"></i>';
        temperature.innerHTML = '--<sup>°C</sup>';
        conditionText.textContent = 'Add API key in config.js';
        humidity.textContent = '--%';
        windSpeed.textContent = '-- km/h';
        countryTag.textContent = '--';
        errorMsg.style.display = 'block';
        errorMsg.textContent = '⚠️ Please add your OpenWeatherMap API key in config.js';
    } else {
        cityInput.value = CONFIG.DEFAULT_CITY || 'Bangalore';
        handleSearch();
    }
});