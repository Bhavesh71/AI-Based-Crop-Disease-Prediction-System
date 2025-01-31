"use strict";

const API = "YOUR_API_KEY_HERE";

const dayEl = document.querySelector(".default_day");
const dateEl = document.querySelector(".default_date");
const btnEl = document.querySelector(".btn_search");
const inputEl = document.querySelector(".input_field");

const iconsContainer = document.querySelector(".icons");
const dayInfoEl = document.querySelector(".day_info");
const listContentEl = document.querySelector(".list_content ul");

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Display the current day and date
const day = new Date();
const dayName = days[day.getDay()];
dayEl.textContent = dayName;

const month = day.toLocaleString("default", { month: "long" });
const date = day.getDate();
const year = day.getFullYear();
dateEl.textContent = `${date} ${month} ${year}`;

// Event listener for search button
btnEl.addEventListener("click", (e) => {
    e.preventDefault();
    if (inputEl.value.trim() !== "") {
        findLocation(inputEl.value.trim());
        inputEl.value = "";
    } else {
        console.log("Please enter a city or country name");
    }
});

async function findLocation(name) {
    iconsContainer.innerHTML = "";
    dayInfoEl.innerHTML = "";
    listContentEl.innerHTML = "";

    try {
        const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API}&units=metric`;
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.cod === 200) {
            iconsContainer.innerHTML = displayImageContent(data);
            iconsContainer.classList.add("fadeIn");
            dayInfoEl.innerHTML = displayRightSideContent(data);
            displayForeCast(data.coord.lat, data.coord.lon);
        } else {
            iconsContainer.innerHTML = `<h2 class="weather_temp">${data.cod}</h2>
                                         <h3 class="cloudtxt">${data.message}</h3>`;
        }
    } catch (error) {
        console.error("Error fetching the weather data:", error);
    }
}

function displayImageContent(data) {
    return `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="Weather Icon" />
            <h2 class="weather_temp">${Math.round(data.main.temp)}°C</h2>
            <h3 class="cloudtxt">${data.weather[0].description}</h3>`;
}

function displayRightSideContent(data) {
    return `<div class="content">
                <p class="title">NAME</p>
                <span class="value">${data.name}</span>
            </div>
            <div class="content">
                <p class="title">TEMP</p>
                <span class="value">${Math.round(data.main.temp)}°C</span>
            </div>
            <div class="content">
                <p class="title">HUMIDITY</p>
                <span class="value">${data.main.humidity}%</span>
            </div>
            <div class="content">
                <p class="title">WIND SPEED</p>
                <span class="value">${data.wind.speed} Km/h</span>
            </div>`;
}

async function displayForeCast(lat, lon) {
    const forecastAPI = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}&units=metric`;
    const response = await fetch(forecastAPI);
    const data = await response.json();

    const uniqueForecastDays = [];
    const dailyForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
            uniqueForecastDays.push(forecastDate);
            return true;
        }
        return false;
    });

    dailyForecast.slice(0, 4).forEach((forecast) => {
        listContentEl.innerHTML += createForecastElement(forecast);
    });
}

function createForecastElement(forecast) {
    const dayName = days[new Date(forecast.dt_txt).getDay()].slice(0, 3);
    return `<li>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="Weather Icon" />
                <span>${dayName}</span>
                <span class="day_temp">${Math.round(forecast.main.temp)}°C</span>
            </li>`;
}

document.addEventListener("DOMContentLoaded", function () {
    const dropdown = document.querySelector('.dropdown');
    const toggleButton = document.querySelector('.dropdown-toggle');

    // Toggle dropdown visibility on button click
    toggleButton.addEventListener('click', function () {
        dropdown.classList.toggle('show');
    });

    // Close dropdown if clicked outside
    window.addEventListener('click', function (event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});