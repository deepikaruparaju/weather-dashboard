const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const API_KEY = '2909fb0e6e7e830543aa4ac998edd7d5'; // Replace with your own API key

const searchInput = document.getElementById('search');
const weatherInfo = document.getElementById('weather-info');
const modeToggle = document.getElementById('mode-toggle');
const locateBtn = document.getElementById('locate-btn');
const autocompleteBox = document.getElementById('autocomplete-box');

// Show weather info
function displayWeather(data) {
  const countryCode = data.sys.country.toLowerCase();
  const flagUrl = `https://flagcdn.com/32x24/${countryCode}.png`;
  const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  weatherInfo.innerHTML = `
    <img src="${flagUrl}" alt="Flag" style="vertical-align:middle;"> 
    <strong>${data.name}, ${data.sys.country}</strong><br>
    <img src="${iconUrl}" alt="Weather Icon" width="50"><br>
    🌡 Temp: ${data.main.temp} °C<br>
    🌥 Weather: ${data.weather[0].main}<br>
    💧 Humidity: ${data.main.humidity}%<br>
    🌬 Wind: ${data.wind.speed} m/s
  `;
  weatherInfo.classList.remove('hidden');
}

// Fetch weather by coordinates
function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    .then(res => res.json())
    .then(displayWeather)
    .catch(() => {
      weatherInfo.innerHTML = 'Weather info not found!';
      weatherInfo.classList.remove('hidden');
    });
}

// On map click
map.on('click', (e) => {
  const { lat, lng } = e.latlng;
  getWeather(lat, lng);
});

// Search suggestions
searchInput.addEventListener('input', function () {
  const query = this.value.trim();
  if (query.length < 2) {
    autocompleteBox.classList.add('hidden');
    return;
  }

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`)
    .then(res => res.json())
    .then(locations => {
      if (locations.length === 0) {
        autocompleteBox.classList.add('hidden');
        return;
      }

      autocompleteBox.innerHTML = '';
      locations.forEach(loc => {
        const div = document.createElement('div');
        div.textContent = `${loc.name}, ${loc.country}`;
        div.addEventListener('click', () => {
          searchInput.value = div.textContent;
          map.setView([loc.lat, loc.lon], 8);
          getWeather(loc.lat, loc.lon);
          autocompleteBox.classList.add('hidden');
        });
        autocompleteBox.appendChild(div);
      });

      autocompleteBox.classList.remove('hidden');
    });
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !autocompleteBox.contains(e.target)) {
    autocompleteBox.classList.add('hidden');
  }
});

// Locate user
locateBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      map.setView([latitude, longitude], 10);
      getWeather(latitude, longitude);
    },
    () => alert('Location access denied.')
  );
});

// Dark/Light Mode Toggle
modeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  modeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});
