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
  latitude,
  longitude,
  filler,
  colorRangesFahrenheit,
  colorRangesCelsius
) {
  // Open a new window
  const newWindow = window.open("/generate.html", "_blank");

  // Wait for the new window to load its content
  newWindow.onload = function () {
    console.log("adding to new html");

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
    newWindow.document.body.appendChild(quiltDiv);

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
    const quiltTitle = newWindow.document.getElementById("quiltTitle");
    console.log(quiltTitle);

    quiltTitle.textContent = `Quilt Pattern ${year} Location: ${latitude} ${longitude}`;

    const print = newWindow.document.getElementById("prtForm");
    print.addEventListener("submit", onPrtSubmit);
  };

  if (newWindow && !newWindow.closed) {
    console.log(newWindow.document.body.innerHTML);
  }
}
//Form Section
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
      { name: "Gray", value: "#d0d0d0", gt: -20 },
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
      { name: "Gray", value: "#d0d0d0", gt: -10 },
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

//When form is submitted, get weather based on input and generate pattern
function onFormSubmit(event) {
  /*const colorRangesFahrenheit = [
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
  ];*/

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

  //Get the color ranges
  const colorRangesFahrenheit = [];
  const fahrenheitRanges = document.querySelectorAll(
    "#fahrenheit-color-ranges .range"
  );
  fahrenheitRanges.forEach((range, index) => {
    let value = range.querySelector('input[type="color"]').value;
    let name = range.querySelector('input[type="text"]').value;
    let gtString = range.querySelector(".temp-value").textContent.trim();
    let gt = parseInt(gtString.replace(/[^0-9]/g, ""), 10); // Remove non-numeric characters
    colorRangesFahrenheit.push({
      name: `${name}`,
      value: `${value}`,
      gt: `${gt}`,
    });
  });

  console.log("colorRangesFahrenheits", colorRangesFahrenheit);

  // Celsius ranges
  const colorRangesCelsius = [];
  const celsiusRanges = document.querySelectorAll(
    "#celsius-color-ranges .range"
  );
  celsiusRanges.forEach((range, index) => {
    let value = range.querySelector('input[type="color"]').value;
    let name = range.querySelector('input[type="text"]').value;
    let gtString = range.querySelector(".temp-value").textContent.trim();
    let gt = parseInt(gtString.replace(/[^0-9]/g, ""), 10); // Remove non-numeric characters
    colorRangesCelsius.push({
      name: `${name}`,
      value: `${value}`,
      gt: `${gt}`,
    });
  });

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

  //Print the quilt section (see media query in css)
  associatedWindow.print();
}

//Main - Setup

//Create the quilt form color ranges
makeColorRangesForm();

//Find the quilt form and add the callback for submit
const messageForm = document.getElementById("quiltForm");
console.log(messageForm);

messageForm.addEventListener("submit", onFormSubmit);
