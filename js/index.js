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
  filler
) {
  //Get the temperature data
  const weather = await weatherAPI(weatherURL);

  //Determine if it was high or low weather temperature selected and generate blocks
  if (hiOrLow === "max") {
    generateBlocks(
      weather.daily.temperature_2m_max,
      unit,
      year,
      latitude,
      longitude,
      filler
    );
  } else {
    generateBlocks(
      weather.daily.temperature_2m_min,
      unit,
      year,
      latitude,
      longitude,
      filler
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

//Create a new page for generated pattern
function openPredefinedPage() {
  // Open a new window
  const newWindow = window.open("/generate.html", "_blank");
}

//Generate resulting color blocks based on temperature range and color range - this relies on updating colors on default blocks
//TODO: allow colorRanges to be input
function generateBlocks(tempArray, unit, year, latitude, longitude, filler) {
  const tempBlocks = document.querySelectorAll(".temp-block");
  console.log(tempBlocks);
  let degreeSymbol = "\u00B0";

  //openPredefinedPage();

  const colorRanges = [
    { name: "Harvest Red", value: "#c04040", gt: 95 },
    { name: "Fuchsia", value: "#ff00ff", gt: 89 },
    { name: "Autumn Red", value: "#ff4500", gt: 79 },
    { name: "Mango", value: "#ffa500", gt: 69 },
    { name: "Sunshine", value: "#ffd700", gt: 59 },
    { name: "Soft Green", value: "#90ee90", gt: 50 },
    { name: "Cool Green", value: "#32cd32", gt: 40 },
    { name: "Blue Mint", value: "#87ceeb", gt: 31 },
    { name: "Purple", value: "#800080", gt: -50 },
    { name: "Gray", value: "#d0d0d0", gt: -100 },
  ];

  const colorRangesCelsius = [
    { name: "Harvest Red", value: "#c04040", gt: 35 },
    { name: "Fuchsia", value: "#ff00ff", gt: 30 },
    { name: "Autumn Red", value: "#ff4500", gt: 25 },
    { name: "Mango", value: "#ffa500", gt: 20 },
    { name: "Sunshine", value: "#ffd700", gt: 17 },
    { name: "Soft Green", value: "#90ee90", gt: 15 },
    { name: "Cool Green", value: "#32cd32", gt: 10 },
    { name: "Blue Mint", value: "#87ceeb", gt: 0 },
    { name: "Purple", value: "#800080", gt: -20 },
    { name: "Gray", value: "#d0d0d0", gt: -100 },
  ];

  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonthsLeapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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
    let colorRangeIndex = 9;
    const temp = yearTemps[index];

    //Set color ranges based on farenheit or celsius range depending on user selection
    const colorRangesToCheck =
      unit === "fahrenheit" ? colorRanges : colorRangesCelsius;

    //Determine color based on temperature range
    for (let i = 0; i < colorRangesToCheck.length; i++) {
      if (temp > colorRangesToCheck[i].gt) {
        colorRangeIndex = i;
        break; // Exit the loop once the matching range is found
      }
    }

    // If no range matches, set the title attribute to "none"
    if (colorRangeIndex === 9) {
      block.setAttribute("title", "");
    }
console.log (`${colorRanges[colorRangeIndex].value}`);
    //Set the color
    block.style.setProperty(
      "--temp-color",
      `${colorRanges[colorRangeIndex].value}`
    );

    //Get the correct unit for the title
    let titleUnit = unit === "fahrenheit" ? "F" : "C";

    //Set the title
    if (colorRangeIndex < 9) {
      block.setAttribute(
        "title",
        `#${dayNumber}\n${temp}${degreeSymbol}${titleUnit}\n${colorRanges[colorRangeIndex].name}`
      );
      dayNumber = ++dayNumber;
    }

    //Hide textcontent in case it was there from previous print
    block.textContent = "";
  });

  //Add a header for the quilt pattrn
  const quiltTitle = document.getElementById("quiltTitle");
  console.log(quiltTitle);

  quiltTitle.textContent = `Quilt Pattern ${year} Location: ${latitude} ${longitude}`;
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

  //TODO allow low for the day to be selected
  //TDOD  ranges don't work well for celcius

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
    filler
  );
}

//Print the quilt pattern
function onPrtSubmit(event) {
  event.preventDefault();

  // Select the temp-block element
  const tempBlocks = document.querySelectorAll(".temp-block");

  tempBlocks.forEach((block, index) => {
    // Get the title attribute value
    const title = block.getAttribute("title");
    // Add the title as content inside the temp-block
    block.textContent = title;
  });

  //Print the quilt section (see media query in css)
  window.print();
}

//Main - Setup

//Find the quilt form and add the callback for submit
const messageForm = document.getElementById("quiltForm");
console.log(messageForm);

messageForm.addEventListener("submit", onFormSubmit);

const print = document.getElementById("prtForm");
print.addEventListener("submit", onPrtSubmit);
