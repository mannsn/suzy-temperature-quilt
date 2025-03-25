//Get the weather
// Fetch Weather
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

async function getWeather() {
  let weatherURL =
    "https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&start_date=2024-01-01&end_date=2024-12-31&daily=temperature_2m_max&temperature_unit=fahrenheit";

  const weather = await weatherAPI(weatherURL);
  console.log(weather.daily.temperature_2m_max);
  displayBlocks(weather.daily.temperature_2m_max);
}

function displayBlocks(tempArray) {
  const tempBlocks = document.querySelectorAll(".temp-block");
  //const temperatures = [25, 63, 25, 25, 52, 25, 95, 100, 102, 103, 104]; // Example temperatures
  let degreeSymbol = "\u00B0";

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
    { name: "Gray", value: "#d0d0d0", gt: -999 },
  ];

  const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonthsLeapYear = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  tempBlocks.forEach((block, index) => {
    let colorRangeIndex = 9;
    const temp = tempArray[index];
    //console.log("temp=", temp);

    if (temp > colorRanges[0].gt) {
      block.style.setProperty("--temp-color", "var(`${colorRanges[0].value}`)");
      colorRangeIndex = 0;
    } else if (temp > colorRanges[1].gt) {
      colorRangeIndex = 1;
    } else if (temp > colorRanges[2].gt) {
      colorRangeIndex = 2;
    } else if (temp > colorRanges[3].gt) {
      colorRangeIndex = 3;
    } else if (temp > colorRanges[4].gt) {
      colorRangeIndex = 4;
    } else if (temp > colorRanges[5].gt) {
      colorRangeIndex = 5;
    } else if (temp > colorRanges[6].gt) {
      colorRangeIndex = 6;
    } else if (temp > colorRanges[7].gt) {
      colorRangeIndex = 7;
    } else if (temp > colorRanges[8].gt) {
      colorRangeIndex = 8;
    } else {
      block.setAttribute("title", `none`);
    }

    block.style.setProperty(
      "--temp-color",
      `${colorRanges[colorRangeIndex].value}`
    );
    block.setAttribute(
      "title",
      `${temp}${degreeSymbol}F ${colorRanges[colorRangeIndex].name}`
    );
    //console.log(colorRangeIndex);
    //console.log(colorRanges[colorRangeIndex].name);
    //console.log(colorRanges[colorRangeIndex].value);
    //console.log(block);
  });
}

//Main
getWeather();
