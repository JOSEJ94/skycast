# SkyCast - Global Forecasts

SkyCast is a modern, responsive web application that provides real-time weather updates and detailed forecasts for cities worldwide. Built with vanilla technologies, it offers a premium user experience with a focus on aesthetics and usability.

<div align="center">

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

![Responsive](https://img.shields.io/badge/responsive-yes-brightgreen.svg?style=for-the-badge)
![Dark Mode](https://img.shields.io/badge/dark%20mode-supported-blueviolet.svg?style=for-the-badge)
![Local Storage](https://img.shields.io/badge/local%20storage-used-orange.svg?style=for-the-badge)

</div>

🔗 **Live Demo:** [https://josej94.github.io/skycast/](https://josej94.github.io/skycast/)

## Features

- **Real-Time Weather:** Get current temperature, weather conditions, humidity, wind speed/direction, and "feels like" temperature.
- **Global Search:** Search for any city in the world with intelligent autocomplete suggestions.
- **Hourly Forecast:** Scrollable 12-hour detailed forecast including temperature, precipitation probability, and wind.
- **Saved Cities:** Pin your favorite locations for quick access. Data is persisted locally.
- **Bilingual Support:** Instantly switch between English and Spanish.
- **Responsive Design:** Fully optimized for desktop, tablet, and mobile devices.
- **Dark Mode:** Elegant dark theme interface.

## Technologies

- **HTML5**: Semantic structure.
- **CSS3**: Custom properties (variables), Flexbox, Grid, and responsive media queries. No frameworks (Tailwind/Bootstrap removed) for pure, efficient styling.
- **JavaScript (ES6+)**: Modular architecture handling state management, API integration, and DOM manipulation without external libraries.
- **APIs**:
  - [Open-Meteo](https://open-meteo.com/): Weather forecast data.
  - [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api): City search and location data.

## Installation & Usage

Since SkyCast uses vanilla web technologies, no build process is required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/josej94/skycast.git
    ```
2.  **Open the project:**
    Navigate to the project folder and open `index.html` in your preferred web browser.

    *Note: For the best experience, use a local development server (like Live Server in VS Code) to ensure all assets load correctly.*

## Project Structure

```
weather/
├── assets/
│   ├── css/
│   │   └── styles.css      # Core application styling
│   ├── js/
│   │   └── app.js          # Application logic and API handling
│   └── img/                # Images and assets
├── designs/                # Reference designs
├── index.html              # Main application entry point
└── README.md               # Project documentation
```

## Credits

- Weather data provided by [Open-Meteo](https://open-meteo.com/).
- Icons by [Google Material Symbols](https://fonts.google.com/icons).
- Font: [Inter](https://fonts.google.com/specimen/Inter) by Google Fonts.

---
Developed by [JoseJ94](https://github.com/josej94)
