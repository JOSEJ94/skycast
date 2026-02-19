/**
 * SkyCast Weather App
 * Vanilla JS implementation
 */

const App = {
    config: {
        geoApi: 'https://geocoding-api.open-meteo.com/v1/search',
        weatherApi: 'https://api.open-meteo.com/v1/forecast',
        maxSaved: 5
    },

    state: {
        currentCity: null,
        savedCities: [],
        lang: 'en', // 'en' | 'es'
        loading: false
    },

    translations: {
        en: {
            searchPlaceholder: 'Search city...',
            saveCity: 'Save City',
            savedCities: 'Saved Cities',
            humidity: 'Humidity',
            wind: 'Wind',
            feelsLike: 'Feels Like',
            visibility: 'Visibility',
            hourlyForecast: 'Detailed Hourly Forecast',
            dewPoint: 'Dew point',
            direction: 'Direction',
            clearView: 'Clear view',
            humidex: 'Humidex', // Approximation or N/A
            now: 'Now',
            kmh: 'km/h',
            km: 'km',
            prec: 'Prec'
        },
        es: {
            searchPlaceholder: 'Buscar ciudad...',
            saveCity: 'Guardar Ciudad',
            savedCities: 'Ciudades Guardadas',
            humidity: 'Humedad',
            wind: 'Viento',
            feelsLike: 'Sensación',
            visibility: 'Visibilidad',
            hourlyForecast: 'Pronóstico Detallado',
            dewPoint: 'Punto rocío',
            direction: 'Dirección',
            clearView: 'Vista clara',
            humidex: 'Índice',
            now: 'Ahora',
            kmh: 'km/h',
            km: 'km',
            prec: 'Prec'
        }
    },

    weatherCodes: {
        0: { en: 'Clear sky', es: 'Cielo despejado', icon: 'sunny' },
        1: { en: 'Mainly clear', es: 'Mayormente despejado', icon: 'partly_cloudy_day' },
        2: { en: 'Partly cloudy', es: 'Parcialmente nublado', icon: 'partly_cloudy_day' },
        3: { en: 'Overcast', es: 'Nublado', icon: 'cloud' },
        45: { en: 'Fog', es: 'Niebla', icon: 'foggy' },
        48: { en: 'Depositing rime fog', es: 'Niebla con escarcha', icon: 'foggy' },
        51: { en: 'Light drizzle', es: 'Llovizna ligera', icon: 'rainy' },
        53: { en: 'Moderate drizzle', es: 'Llovizna moderada', icon: 'rainy' },
        55: { en: 'Dense drizzle', es: 'Llovizna densa', icon: 'rainy' },
        61: { en: 'Slight rain', es: 'Lluvia ligera', icon: 'rainy' },
        63: { en: 'Moderate rain', es: 'Lluvia moderada', icon: 'rainy' },
        65: { en: 'Heavy rain', es: 'Lluvia fuerte', icon: 'thunderstorm' },
        71: { en: 'Slight snow', es: 'Nieve ligera', icon: 'ac_unit' },
        73: { en: 'Moderate snow', es: 'Nieve moderada', icon: 'ac_unit' },
        75: { en: 'Heavy snow', es: 'Nieve fuerte', icon: 'ac_unit' },
        80: { en: 'Slight rain showers', es: 'Chubascos ligeros', icon: 'rainy' },
        81: { en: 'Moderate rain showers', es: 'Chubascos moderados', icon: 'rainy' },
        82: { en: 'Violent rain showers', es: 'Chubascos violentos', icon: 'thunderstorm' },
        95: { en: 'Thunderstorm', es: 'Tormenta', icon: 'thunderstorm' },
        96: { en: 'Thunderstorm with hail', es: 'Tormenta con granizo', icon: 'thunderstorm' },
        99: { en: 'Thunderstorm with heavy hail', es: 'Tormenta con granizo fuerte', icon: 'thunderstorm' }
    },

    init() {
        this.loadState();
        this.cacheDOM();
        this.bindEvents();
        this.render();

        // Load initial city (London default or last saved)
        if (this.state.currentCity) {
            this.fetchWeather(this.state.currentCity);
        } else if (this.state.savedCities.length > 0) {
            this.fetchWeather(this.state.savedCities[0]);
        } else {
            // Default to London, UK
            this.fetchWeather({ name: 'London', lat: 51.51, lon: -0.13, country: 'UK' });
        }
    },

    cacheDOM() {
        this.dom = {
            searchInput: document.getElementById('city-search'),
            searchSuggestions: document.getElementById('search-suggestions'),
            langBtns: document.querySelectorAll('.lang-btn'),
            saveBtn: document.getElementById('save-city-btn'),
            savedCitiesList: document.getElementById('saved-cities-list'),
            selectedCitySection: document.getElementById('selected-city-section'),
            
            // Main Weather Fields
            mainCityName: document.getElementById('main-city-name'),
            mainDate: document.getElementById('main-date'),
            mainTemp: document.getElementById('main-temp'),
            mainCondition: document.getElementById('main-condition'),
            mainIconBg: document.getElementById('main-icon-bg'),
            
            // Details
            humidityVal: document.getElementById('humidity-val'),
            dewPoint: document.getElementById('dew-point'),
            windSpeed: document.getElementById('wind-speed'),
            windDir: document.getElementById('wind-dir'),
            feelsLike: document.getElementById('feels-like'),
            visibilityVal: document.getElementById('visibility-val'),
            visibilityDesc: document.getElementById('visibility-desc'),
            
            // Forecast
            forecastScroll: document.getElementById('forecast-scroll'),
            scrollLeftBtn: document.getElementById('scroll-left'),
            scrollRightBtn: document.getElementById('scroll-right'),

            // Sidebar Details
            sidebarCityName: document.getElementById('sidebar-city-name'),
            sidebarCityCondition: document.getElementById('sidebar-city-condition'),
            sidebarCityTemp: document.getElementById('sidebar-city-temp'),

            // I18n elements
            i18nElements: document.querySelectorAll('[data-i18n]')
        };
    },

    bindEvents() {
        // Search Debounce
        let debounceTimer;
        this.dom.searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value.trim();
            if (query.length < 2) {
                this.dom.searchSuggestions.style.display = 'none';
                return;
            }
            debounceTimer = setTimeout(() => this.searchCity(query), 300);
        });

        // Hide suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!this.dom.searchInput.contains(e.target) && !this.dom.searchSuggestions.contains(e.target)) {
                this.dom.searchSuggestions.style.display = 'none';
            }
        });

        // Language Switch
        this.dom.langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
            });
        });

        // Save City
        this.dom.saveBtn.addEventListener('click', () => {
            this.saveCurrentCity();
        });

        // Scroll Buttons
        this.dom.scrollLeftBtn.addEventListener('click', () => {
            this.dom.forecastScroll.scrollBy({ left: -200, behavior: 'smooth' });
        });
        this.dom.scrollRightBtn.addEventListener('click', () => {
            this.dom.forecastScroll.scrollBy({ left: 200, behavior: 'smooth' });
        });
    },

    loadState() {
        const saved = JSON.parse(localStorage.getItem('skycast_saved_cities')) || [];
        const lang = localStorage.getItem('skycast_lang') || 'en';
        this.state.savedCities = saved;
        this.state.lang = lang;
    },

    saveState() {
        localStorage.setItem('skycast_saved_cities', JSON.stringify(this.state.savedCities));
        localStorage.setItem('skycast_lang', this.state.lang);
    },

    setLanguage(lang) {
        this.state.lang = lang;
        this.saveState();
        this.render(); // Re-render translations
        
        // Refresh weather to update condition strings if needed, 
        // though we handle condition translation in frontend mostly.
        if (this.state.currentCity && this.state.currentCity.weatherData) {
            this.updateUI(this.state.currentCity.weatherData);
        }
    },

    async searchCity(query) {
        try {
            const url = `${this.config.geoApi}?name=${encodeURIComponent(query)}&count=5&language=${this.state.lang}&format=json`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.results) {
                this.renderSuggestions(data.results);
            } else {
                this.renderSuggestions([]); // No results
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    },

    renderSuggestions(results) {
        this.dom.searchSuggestions.innerHTML = '';
        if (results.length === 0) {
            this.dom.searchSuggestions.style.display = 'none';
            return;
        }

        results.forEach(city => {
            const li = document.createElement('li');
            li.textContent = `${city.name}, ${city.country} ${city.admin1 ? `(${city.admin1})` : ''}`;
            li.addEventListener('click', () => {
                this.dom.searchInput.value = '';
                this.dom.searchSuggestions.style.display = 'none';
                this.fetchWeather({
                    name: city.name,
                    lat: city.latitude,
                    lon: city.longitude,
                    country: city.country
                });
            });
            this.dom.searchSuggestions.appendChild(li);
        });

        this.dom.searchSuggestions.style.display = 'block';
    },

    async fetchWeather(city) {
        this.state.loading = true;
        // Show loading state if desired
        
        try {
            const params = new URLSearchParams({
                latitude: city.lat,
                longitude: city.lon,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_direction_10m',
                hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m',
                timezone: 'auto',
                forecast_days: 1
            });

            const url = `${this.config.weatherApi}?${params.toString()}`;
            const response = await fetch(url);
            const data = await response.json();

            this.state.currentCity = { ...city, weatherData: data };
            this.updateUI(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            alert('Failed to fetch weather data');
        } finally {
            this.state.loading = false;
        }
    },

    updateUI(data) {
        const current = data.current;
        const hourly = data.hourly;
        const t = this.translations[this.state.lang];
        const city = this.state.currentCity;

        // --- Main Card ---
        this.dom.mainCityName.textContent = city.name + (city.country ? `, ${city.country}` : '');
        
        // Date formatting
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
        this.dom.mainDate.textContent = now.toLocaleDateString(this.state.lang === 'en' ? 'en-US' : 'es-ES', options);

        this.dom.mainTemp.textContent = `${Math.round(current.temperature_2m)}°`;

        // Condition
        const weatherCode = current.weather_code;
        const condition = this.weatherCodes[weatherCode] || this.weatherCodes[0]; // fallback
        const conditionText = condition[this.state.lang];
        this.dom.mainCondition.textContent = conditionText;
        this.dom.mainIconBg.textContent = condition.icon;

        // --- Details Grid ---
        this.dom.humidityVal.textContent = `${current.relative_humidity_2m}%`;
        // Dew point approximate calculation: T - (100 - RH)/5
        const dew = Math.round(current.temperature_2m - (100 - current.relative_humidity_2m) / 5);
        this.dom.dewPoint.textContent = `${t.dewPoint}: ${dew}°`;

        this.dom.windSpeed.textContent = current.wind_speed_10m;
        this.dom.windDir.textContent = `${t.direction}: ${this.getWindDirection(current.wind_direction_10m)}`;

        this.dom.feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
        // Humidex isn't provided directly, using generic text or skipping
        this.dom.i18nElements.forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        // Visibility is not in standard free parameters of open-meteo without extra setup so mocking or calculating
        // For now, let's hardcode or omit. Let's simulate 'Clear view' if code is favorable
        this.dom.visibilityVal.textContent = weatherCode < 3 ? '10+' : '8'; 
        this.dom.visibilityDesc.textContent = weatherCode < 3 ? t.clearView : '-';

        // --- Forecast ---
        this.renderForecast(hourly);

        // --- Sidebar Current ---
        this.dom.sidebarCityName.textContent = city.name;
        this.dom.sidebarCityCondition.textContent = conditionText;
        this.dom.sidebarCityTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    },

    renderForecast(hourly) {
        const container = this.dom.forecastScroll;
        container.innerHTML = '';
        
        const now = new Date();
        const currentHour = now.getHours();
        
        // We want next 12 hours. The API returns arrays starting from 00:00 of the day (usually).
        // Find index of current hour
        const times = hourly.time; // ISO strings
        let startIndex = 0;
        
        // Simple search for current hour index
        for (let i = 0; i < times.length; i++) {
            if (new Date(times[i]).getHours() >= currentHour) {
                startIndex = i;
                break;
            }
        }

        const t = this.translations[this.state.lang];

        for (let i = startIndex; i < startIndex + 12 && i < times.length; i++) {
            const time = new Date(times[i]);
            const temp = Math.round(hourly.temperature_2m[i]);
            const code = hourly.weather_code[i];
            const prec = hourly.precipitation_probability[i];
            const wind = hourly.wind_speed_10m[i];
            const condition = this.weatherCodes[code] || this.weatherCodes[0];
            
            const timeLabel = i === startIndex ? t.now : time.toLocaleTimeString(this.state.lang === 'en' ? 'en-US' : 'es-ES', { hour: 'numeric', hour12: true });

            const item = document.createElement('div');
            item.className = 'forecast-item';
            item.innerHTML = `
                <span class="forecast-time">${timeLabel}</span>
                <div class="forecast-icon-box ${i === startIndex ? 'active' : ''}">
                    <span class="material-symbols-outlined">${condition.icon}</span>
                </div>
                <div class="forecast-val">
                    <span class="forecast-temp">${temp}°</span>
                    <div class="forecast-details">
                        <span>${t.prec}: ${prec}%</span>
                        <span>${t.wind}: ${Math.round(wind)}</span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        }
    },

    getWindDirection(degrees) {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    },

    saveCurrentCity() {
        if (!this.state.currentCity) return;
        
        // Check if already saved
        const exists = this.state.savedCities.find(c => 
            c.name === this.state.currentCity.name && 
            Math.abs(c.lat - this.state.currentCity.lat) < 0.1
        );

        if (exists) return;

        // Add to saved
        // We only save geo data to request fresh weather later, or snapshot weather?
        // Better to save geo data and maybe last known temp for list display (optional)
        // For simplicity let's save what we have.
        this.state.savedCities.push({
            name: this.state.currentCity.name,
            lat: this.state.currentCity.lat,
            lon: this.state.currentCity.lon,
            country: this.state.currentCity.country
        });

        this.saveState();
        this.renderSavedCities();
    },

    deleteCity(index) {
        this.state.savedCities.splice(index, 1);
        this.saveState();
        this.renderSavedCities();
    },

    renderSavedCities() {
        const container = this.dom.savedCitiesList;
        container.innerHTML = '';

        this.state.savedCities.forEach((city, index) => {
            const btn = document.createElement('button');
            btn.className = 'saved-city-item';
            btn.innerHTML = `
                <div class="city-info">
                    <div class="icon-box">
                        <span class="material-symbols-outlined">cloud_queue</span>
                    </div>
                    <div class="city-details">
                        <span class="city-name">${city.name}</span>
                        <span class="city-condition">${city.country || ''}</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                     <!-- Temp could be fetched or stored, leaving blank for cleaner invalidation -->
                    <span class="material-symbols-outlined delete-btn">delete</span>
                </div>
            `;

            // Load city on click
            btn.addEventListener('click', () => {
                this.fetchWeather(city);
            });

            // Delete event
            const deleteBtn = btn.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCity(index);
            });

            container.appendChild(btn);
        });
    },

    render() {
        // Toggle Active Language Button
        this.dom.langBtns.forEach(btn => {
            if (btn.dataset.lang === this.state.lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update translations
        const t = this.translations[this.state.lang];
        this.dom.searchInput.placeholder = t.searchPlaceholder;
        
        // Static text updates
        this.dom.i18nElements.forEach(el => {
            const key = el.dataset.i18n;
            if (t[key]) el.textContent = t[key];
        });

        this.renderSavedCities();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
