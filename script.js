var cityVar = $("#city");
var displayWeatherEl = $("#display");
var displayForecastEl = $("#display-forecast");
var searchHistoryEl = $("#search-history");
var recentCity = (localStorage.getItem("city-names") === null) ? [] : JSON.parse(localStorage.getItem("city-names"));


var getWeather = function(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=215a1e26e83a7b9647815da47c97b9d2";

    return fetch(queryURL)
    .then(function (response) {
        if (response.ok) {
            response.json()
            .then(function (data) {
              return displayWeather(data);  
            }).then(function (WeatherResults) {
                let {
                    lat,
                    lon,
                } = WeatherResults;
                getUVIndex(lat, lon);
            });
        } else {
            alert("Error: " + response.statusText);
        }
    })
    .catch(function (error) {
        alert("Not able to gather weather data.")
    });
};

var displayWeather = function(data) {
    var currentDate = moment.unix(data.dt).format("MM/DD/YYYY");

    var iconID = data.weather[0].icon;

    var weatherDiv = $("<div>").addClass("remover list-item flex-row justify-space-between align-center");

    var cityDay = $("<h2>").text(`${data.name} ${currentDate}`);

    cityDay.append(getIcon(iconID));
    weatherDiv.append(cityDay);

    var tempDiv = $("<div>").text ("Temp: " + (Math.round(data.main.temp)) + " F");

    weatherDiv.append(tempDiv);

    var humidDiv = $("<div>").text("Humidity: " + (data.main.humidity));

    weatherDiv.append(humidDiv);

    var windDiv = $("<div>").text ("Wind Speed: " + (+Math.round(data.wind.speed)));

    weatherDiv.append(windDiv);

    var uvIndexDiv = $("<div>").addClass("list-item flex-row justify-space-between col-sm").attr("id", "uv-index");

    weatherDiv.append(uvIndexDiv);

    displayWeatherEl.append(weatherDiv);

    return {
        lat: data.coord.lat,
        lon: data.coord.lon,
    };
};


var getForecast = function(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&APPID=215a1e26e83a7b9647815da47c97b9d2";

    fetch(queryURL)
    .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayForecast(data);
            });
        } else {
            alert("Error: " + response.statusText)
        }
    })
    .catch(function (error) {
        alert("Not able to gather weather data.")
    });

};

var displayForecast = function(data) {
    for (let i = 0; i < data.list.length; i = i + 8) {
        var icon = data.list[i].weather[0].icon;
        var currentDay = moment.unix(data.list[i].dt).format("MM/DD/YYYY");
        var forecastDiv = $("<div>").css('margin-left',2).addClass("remover bg-primary forecast-border list-item flex-row justify-space-between align-center");
        var dateDiv = $("<div>").addClass("list-item flex-row justify-space-between col-sm text-light bold").text(currentDay);
        forecastDiv.append(dateDiv);
        dateDiv.append(getIcon(icon));
        var tempDiv = $("<div>").addClass("list-item flex-row justify-space-between col-sm text-light").text ("Temp: " + (Math.round(data.list[i].main.temp)) + " F");
        forecastDiv.append(tempDiv);
        var humidDiv = $("<div>").addClass("list-item flex-row justify-space-between col-sm text-light").text("Humidity: " + (data.list[i].main.humidity));
        forecastDiv.append(humidDiv);
        displayForecastEl.append(forecastDiv);
    }

};

var citySearch = function(city) {
    $(".remover").empty();
    if (city) {
        getWeather(city);
        getForecast(city);
    } else {
        return;
    }
    saveSearch(city);
};





var getIcon = function (iconID) {
    var iconUrl = "https://openweathermap.org/img/wn/" + iconID + "@2x.png";
    var iconEl = $("<img>").attr("alt", "Weather icon").attr("src", iconUrl);
    return iconEl;
};


var getUVIndex = function (latitude, longitude) {
    var APIKEY = "215a1e26e83a7b9647815da47c97b9d2";
    var apiUrl = "https://api.openweathermap.org/data/2.5/uvi?";
    var queryParams = {};
    queryParams.appid = APIKEY;
    queryParams.lat = latitude;
    queryParams.lon = longitude;

    apiUrl = apiUrl + $.param(queryParams);

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    $("#uv-index").html(`UV Index ${data.value}`);

                    if (data.value > 8) {
                        $("#uv-index").addClass("badge badge-danger");
                    } else if (data.value > 5) {
                        $("#uv-index").addClass("badge badge-warning");
                    } else {
                        $("#uv-index").addClass("badge badge-success");
                    }

                });

            } else {
                alert("Error: " + response.statusText);
            }
        })
        .catch(function (error) {
            alert("Unable to getUVIndex data!");
        });
};

var saveSearch = function (city) {
    cityVar.empty();
    searchHistoryEl.empty();

    if(city === ""){
        alert("Enter City Name!");
        return;
    }
   
    if (recentCity.indexOf(city) === -1) {
        recentCity.push(city);
    }
   
    if (recentCity.length > 0) {
        searchHistoryEl.show();
        var searchCity = $("<h4>").append("Recent Cities").addClass("remover");
        searchHistoryEl.append(searchCity);
        for (var i = 0; i < recentCity.length; i++){
            var btn = $("<btn>").css('margin',10).addClass("btn btn-secondary remover").attr("data-topic-index", i).text(recentCity[i]);
            searchHistoryEl.append(btn);  
        }
    } else {
        searchHistoryEl.hide();
    }
    localStorage.setItem("city-names", JSON.stringify(recentCity));
};


$(function () {

$("#submit-weather").on("click", function(){
    var city = cityVar.val().trim();
    citySearch(city);
});
searchHistoryEl.on("click", '.btn-secondary', function(){
    var city = $(this).text();
    city = (city !== undefined) ? city.trim() : "";
    citySearch(city);
});

});


