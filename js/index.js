//Fetch the weather based on input url
async function weatherAPI(weatherURL) {
  try {
    const response = await fetch(weatherURL);

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ERROR", error);
  }
}

//Once the data is returned, display resulting blocks
async function getWeatherAndGenerate(
  weatherURL,
  unit,
  year,
  hiOrLow,
  latitude,
  longitude,
  filler,
  colorRangesFahrenheit,
  colorRangesCelsius
) {
  //Get the temperature data
  const weather = await weatherAPI(weatherURL);

  //Determine if it was high or low weather temperature selected and generate blocks
  if (hiOrLow === "max") {
    generateBlocks(
      weather.daily.temperature_2m_max,
      unit,
      year,
      hiOrLow,
      latitude,
      longitude,
      filler,
      colorRangesFahrenheit,
      colorRangesCelsius
    );
  } else {
    generateBlocks(
      weather.daily.temperature_2m_min,
      unit,
      year,
      hiOrLow,
      latitude,
      longitude,
      filler,
      colorRangesFahrenheit,
      colorRangesCelsius
    );
  }
}

//Divide the temperatures by months to add filler days
function divideDaysByMonths(daysArray, numMonthDays, fillerDaysIn) {
  const months = []; // Array to store divided months
  let startIndex = 0;

  console.log(daysArray);
  console.log(numMonthDays);

  numMonthDays.forEach((numMonthDays) => {
    const monthDays = daysArray.slice(startIndex, startIndex + numMonthDays);
    let fillerDays = numMonthDays;

    //Add in filler temperatures
    while (fillerDaysIn - fillerDays > 0) {
      monthDays.push(-99);
      fillerDays += 1;
    }

    months.push(monthDays);
    startIndex += numMonthDays;
  });

  return months;
}

//Generate resulting color blocks based on temperature range and color range - this relies on updating colors on default blocks
function generateBlocks(
  tempArray,
  unit,
  year,
  hiOrLow,
  latitude,
  longitude,
  filler,
  colorRangesFahrenheit,
  colorRangesCelsius
) {
  let fullPath = window.location.href;
  let directoryPath = fullPath.substring(0, fullPath.lastIndexOf("/") + 1);
  console.log(directoryPath);

  // Open a new window
  let newWindow = window.open("./generate.html", "_blank");
  if (newWindow === null) {
    newWindow = window.open("file://generate.html", "_blank");
  }
  console.log("newWindow", newWindow);

  // Wait for the new window to load its content
  newWindow.onload = function () {
    console.log("adding to new html");
    const newDoc = newWindow.document.getElementById("quiltsection");
    const quiltDiv = newWindow.document.createElement("div");
    quiltDiv.className = "quilt";

    // Create 184 divs dynamically in the new window
    for (let i = 1; i <= 384; i++) {
      const div = newWindow.document.createElement("div");
      div.className = "temp-block";
      div.style.setProperty("--temp-color", "#6f6866ff");
      div.title = "65°F";

      // Append the div to the body of the new window
      quiltDiv.appendChild(div);
    }

    // Append the quilt to the body or desired container
    newDoc.appendChild(quiltDiv);

    const tempBlocks = newWindow.document.querySelectorAll(".temp-block");
    console.log(tempBlocks);
    let degreeSymbol = "\u00B0";

    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const daysInMonthsLeapYear = [
      31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
    ];
    let dividedMonths = [];
    let yearTemps = [];

    if (filler === "yes") {
      let padDays = 32;
      //Divide temperature array into arrays by months
      if (year === "2020") {
        dividedMonths = divideDaysByMonths(
          tempArray,
          daysInMonthsLeapYear,
          padDays
        );
      } else {
        dividedMonths = divideDaysByMonths(tempArray, daysInMonths, padDays);
      }

      //Put months array back together with filler days added
      yearTemps = [
        ...dividedMonths[0],
        ...dividedMonths[1],
        ...dividedMonths[2],
        ...dividedMonths[3],
        ...dividedMonths[4],
        ...dividedMonths[5],
        ...dividedMonths[6],
        ...dividedMonths[7],
        ...dividedMonths[8],
        ...dividedMonths[9],
        ...dividedMonths[10],
        ...dividedMonths[11],
      ];
    } else {
      yearTemps = [...tempArray];
    }

    //console.log("yearTemps", yearTemps);
    let dayNumber = 1;

    //For each block, find matching temperature and set color plus title
    tempBlocks.forEach((block, index) => {
      let colorRangeIndex = 99;
      const temp = yearTemps[index];

      //Set color ranges based on farenheit or celsius range depending on user selection
      const colorRangesToCheck =
        unit === "fahrenheit" ? colorRangesFahrenheit : colorRangesCelsius;

      //Determine color based on temperature range
      for (let i = 0; i < colorRangesToCheck.length; i++) {
        if (temp > colorRangesToCheck[i].gt) {
          colorRangeIndex = i;
          break; // Exit the loop once the matching range is found
        }
      }

      // If no range matches, set the title attribute to "none"
      if (colorRangeIndex === 99) {
        block.setAttribute("title", "");
        block.style.setProperty("--temp-color", "#d0d0d0");
      } else {
        //Set the color
        block.style.setProperty(
          "--temp-color",
          `${colorRangesToCheck[colorRangeIndex].value}`
        );

        //Get the correct unit for the title
        let titleUnit = unit === "fahrenheit" ? "F" : "C";
        //Set the title

        block.setAttribute(
          "title",
          `#${dayNumber}\n${temp}${degreeSymbol}${titleUnit}\n${colorRangesToCheck[colorRangeIndex].name}`
        );
        dayNumber = ++dayNumber;
      }

      //Hide textcontent in case it was there from previous print
      block.textContent = "";
    });

    //Add a header for the quilt pattrn
    const quiltTitles = newWindow.document.getElementsByClassName("quiltTitle");
    console.log(quiltTitles);

    //Get the correct unit for the title
    let quiltUnit = unit === "fahrenheit" ? "Fahrenheit" : "Celsius";
    let quiltHighOrLow =
      hiOrLow === "max" ? "High Temperatures" : "Low Temperatures";

    Array.from(quiltTitles).forEach((quiltTitle) => {
      quiltTitle.textContent = `Quilt Pattern ${year} \n Location: ${latitude} ${longitude} \n ${quiltHighOrLow} \n ${quiltUnit}`;
    });

    const print = newWindow.document.getElementById("prtForm");
    print.addEventListener("submit", onPrtSubmit);
  };

  if (newWindow && !newWindow.closed) {
    console.log(newWindow.document.body.innerHTML);
  }
}
//Form Section
async function getLocation(event) {
  event.preventDefault(); // Prevent form reload

  const locationInput = document.getElementById("locationInput").value;
  const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    locationInput
  )}&count=10&language=en&format=json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch location data");

    const data = await response.json();
    displayResults(data.results || []);
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("resultsContainer").innerHTML =
      "<p>Could not retrieve locations. Please try again.</p>";
  }
}

function displayResults(locations) {
  const container = document.getElementById("resultsContainer");
  container.innerHTML = ""; // Clear previous results

  if (locations.length === 0) {
    container.innerHTML = "<p>No locations found.</p>";
    return;
  }

  locations.forEach((location) => {
    const div = document.createElement("div");
    div.className = "location-option";
    div.innerText = `${location.name}, ${location.admin1} ${location.country_code} (Lat: ${location.latitude}, Lon: ${location.longitude})`;
    div.addEventListener("click", () => selectLocation(location));
    container.appendChild(div);
  });
}

function selectLocation(location) {
  const selectedElement = document.getElementById("selectedLocation");
  //selectedElement.innerText = `Selected: ${location.name} (Lat: ${location.latitude}, Lon: ${location.longitude})`;
  const latitude = document.getElementById("latitude");
  latitude.value = location.latitude;
  const longitude = document.getElementById("longitude");
  longitude.value = location.longitude;
}

function createRangeDiv(range, unit) {
  const rangeDiv = document.createElement("div");
  rangeDiv.classList.add("range");

  const colorName = document.createElement("input");
  colorName.type = "text";
  colorName.value = range.name;
  colorName.maxLength = 15;
  colorName.size = 15;
  colorName.classList.add("color-name");
  rangeDiv.appendChild(colorName);

  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = range.value;
  rangeDiv.appendChild(colorPicker);

  const tempValue = document.createElement("span");
  tempValue.classList.add("temp-value");
  tempValue.textContent = `> ${range.gt}°${unit === "fahrenheit" ? "F" : "C"}`;
  rangeDiv.appendChild(tempValue);

  return rangeDiv;
}

function makeColorRangesForm() {
  const colorRanges = {
    fahrenheit: [
      { name: "Harvest Red", value: "#c04040", gt: 110 },
      { name: "Harvest Red", value: "#c04040", gt: 100 },
      { name: "Fuchsia", value: "#ff00ff", gt: 90 },
      { name: "Autumn Red", value: "#ff4500", gt: 80 },
      { name: "Mango", value: "#ffa500", gt: 70 },
      { name: "Sunshine", value: "#ffd700", gt: 60 },
      { name: "Soft Green", value: "#90ee90", gt: 50 },
      { name: "Cool Green", value: "#32cd32", gt: 40 },
      { name: "Blue Mint", value: "#87ceeb", gt: 30 },
      { name: "Purple", value: "#800080", gt: 20 },
      { name: "Purple", value: "#800080", gt: 10 },
      { name: "Purple", value: "#800080", gt: 0 },
      { name: "Purple", value: "#800080", gt: -40 },
    ],
    celsius: [
      { name: "Harvest Red", value: "#c04040", gt: 50 },
      { name: "Fuchsia", value: "#ff00ff", gt: 45 },
      { name: "Autumn Red", value: "#ff4500", gt: 35 },
      { name: "Mango", value: "#ffa500", gt: 20 },
      { name: "Sunshine", value: "#ffd700", gt: 15 },
      { name: "Soft Green", value: "#90ee90", gt: 10 },
      { name: "Cool Green", value: "#32cd32", gt: 5 },
      { name: "Blue Mint", value: "#87ceeb", gt: 0 },
      { name: "Purple", value: "#800080", gt: -5 },
      { name: "Purple", value: "#800080", gt: -40 },
    ],
  };

  Object.entries(colorRanges).forEach(([unit, ranges]) => {
    const container = document.getElementById(`${unit}-color-ranges`);

    let headerString = unit === "fahrenheit" ? "Fahrenheit" : "Celsius";
    const tempHeader = document.createElement("h3");
    tempHeader.innerHTML = headerString;
    container.appendChild(tempHeader);

    ranges.forEach((range) => {
      const rangeDiv = createRangeDiv(range, unit);
      container.appendChild(rangeDiv);
    });
  });
}

//Determine which radio button is selected given a button name
function getSelectedValue(buttonName) {
  const radioButtons = document.getElementsByName(`${buttonName}`);
  //console.log (radioButtons);
  let selectedValue = null;

  for (const radio of radioButtons) {
    console.log(radio.checked);

    if (radio.checked) {
      selectedValue = radio.value;
      return selectedValue;
    }
  }
}

function getColorRanges(containerId) {
  const colorRanges = [];
  const ranges = document.querySelectorAll(`${containerId} .range`);
  ranges.forEach((range) => {
    let value = range.querySelector('input[type="color"]').value;
    let name = range.querySelector('input[type="text"]').value;
    let gtString = range.querySelector(".temp-value").textContent.trim();
    let gt = parseInt(gtString.replace(/[^0-9\-]/g, ""), 10);

    colorRanges.push({
      name: name,
      value: value,
      gt: gt,
    });
  });
  return colorRanges;
}

//When form is submitted, get weather based on input and generate pattern
function onFormSubmit(event) {
  event.preventDefault();

  const data = new FormData(event.target);
  console.log(data);

  const latitude = data.get("latitude");
  const longitude = data.get("longitude");
  const year = data.get("year");

  let unit = "fahrenheit";
  const buttonVal = getSelectedValue("option"); //1 = Farenheit 2=Celcius
  if (buttonVal === "1") {
    unit = "fahrenheit";
  } else {
    unit = "celsius";
  }

  let hiOrLow = "max";
  const buttonVal1 = getSelectedValue("option1"); //1 = High 2=Low
  if (buttonVal1 === "1") {
    hiOrLow = "max";
  } else {
    hiOrLow = "min";
  }

  let filler = "yes";
  const buttonVal2 = getSelectedValue("option2"); //1 = Yes 2=No
  if (buttonVal2 === "1") {
    filler = "yes";
  } else {
    filler = "no";
  }

  console.log(longitude);
  console.log(latitude);
  console.log(year);
  console.log(buttonVal);
  console.log(unit);
  console.log(hiOrLow);
  console.log(filler);

  // Get Fahrenheit and Celsius color ranges
  const colorRangesFahrenheit = getColorRanges("#fahrenheit-color-ranges");
  const colorRangesCelsius = getColorRanges("#celsius-color-ranges");
  console.log("colorRangesFahrenheit", colorRangesFahrenheit);
  console.log("colorRangesCelsius", colorRangesCelsius);

  //Sample queries https://archive-api.open-meteo.com/v1/archive?latitude=39.2884&longitude=-77.2039&start_date=2024-01-01&end_date=2024-12-31&daily=apparent_temperature_max&temperature_unit=fahrenheit
  //https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=2021-01-01&end_date=2021-12-31&daily=temperature_2m_min&temperature_unit=fahrenheit

  let weatherURL = `https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_${hiOrLow}&temperature_unit=${unit}`;

  console.log(weatherURL);

  //Get the temperatures for the year and generate the quilt pattern
  getWeatherAndGenerate(
    weatherURL,
    unit,
    year,
    hiOrLow,
    latitude,
    longitude,
    filler,
    colorRangesFahrenheit,
    colorRangesCelsius
  );
}

//Print the quilt pattern
function onPrtSubmit(event) {
  event.preventDefault();

  let associatedDocument = event.target.ownerDocument;
  console.log(
    "Document where the button was clicked:",
    associatedDocument.title
  );

  // If needed, get the window context
  let associatedWindow = associatedDocument.defaultView;
  console.log("Window URL:", associatedWindow.location.href);

  // Select the temp-block element
  const tempBlocks = associatedWindow.document.querySelectorAll(".temp-block");
  console.log(tempBlocks);

  tempBlocks.forEach((block, index) => {
    // Get the title attribute value
    const title = block.getAttribute("title");
    // Add the title as content inside the temp-block
    block.textContent = title;
  });

  // Adding page numbers dynamically
  /*
  associatedWindow.addEventListener("beforeprint", () => {
    const pages = associatedWindow.document.querySelectorAll(".footer");
    const total = pages.length;
    pages.forEach((footer, index) => {
      footer.querySelector(".page-number").textContent = index + 1;
      footer.querySelector(".total-pages").textContent = total;
    });
  });*/

  //Print the quilt section (see media query in css)
  associatedWindow.print();
}

//Main - Setup

//Create the quilt form color ranges
makeColorRangesForm();

//Search for location
document.getElementById("locationForm").addEventListener("submit", getLocation);

//Find the quilt form and add the callback for submit to generate the quilt
const messageForm = document.getElementById("quiltForm");
console.log(messageForm);
messageForm.addEventListener("submit", onFormSubmit);
