# 🌤️ Skye Weather App

A beautiful, feature-rich weather application with real-time weather data, prayer times integration, and stunning glass-morphism UI.

## ✨ Features

- 🌦️ **Real-time Weather** - Temperature, feels like, humidity, wind speed, visibility, pressure
- 🕌 **Prayer Times** - Islamic prayer timings with current/next prayer indicators
- 📍 **Geolocation** - Auto-detect your current location
- 🌓 **Dark/Light Mode** - Saves your preference in localStorage
- 🌿 **Air Quality Index** - AQI with emoji indicators (Good → Very Poor)
- ⌨️ **Keyboard Shortcuts** 
  - `/` - Focus search instantly
  - `Esc` - Close prayer card or error popup
- ⏱️ **Smart Loading** - 10-second timeout for API calls
- 💾 **Persistent Storage** - Remembers your last searched city
- 📱 **Fully Responsive** - Works perfectly on all devices
- ✨ **Smooth Animations** - Glass-morphism, floating clouds, animated sun arc

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: 
  - [OpenWeatherMap](https://openweathermap.org) - Weather data + AQI
  - [AlAdhan](https://aladhan.com) - Prayer times
- **Design**: Glass-morphism, CSS Custom Properties, Flexbox, Grid
- **Fonts**: Google Fonts (Outfit)
- **Deployment**: GitHub Pages

## 🚀 Quick Setup

### 1. Get API Keys

#### OpenWeatherMap API (Free)
1. Go to [openweathermap.org](https://openweathermap.org)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Copy your API key

### 2. Add Your API Key

Open `script.js` and replace the API key:

```javascript
const API_KEY = "your_api_key_here";