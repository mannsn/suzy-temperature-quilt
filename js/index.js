const tempBlocks = document.querySelectorAll('.temp-block');
const temperatures = [25, 63, 25, 25, 52, 25,95,100,102,103,104]; // Example temperatures
let degreeSymbol = '\u00B0';



tempBlocks.forEach((block, index) => {


  const temp = temperatures[index];
  console.log ("temp=",temp);
  block.setAttribute('title',`${temp}${degreeSymbol}F`);


  if (temp > 95) {
    block.style.setProperty('--temp-color', 'var(--temp-color-95plus)');   
  } else if (temp > 89) {
    block.style.setProperty('--temp-color', 'var(--temp-color-90-95)');
  } else if (temp > 79) {
    block.style.setProperty('--temp-color', 'var(--temp-color-80-89)');
  } else if (temp > 69) {
    block.style.setProperty('--temp-color', 'var(--temp-color-70-79)');
  } else if (temp > 59) {
    block.style.setProperty('--temp-color', 'var(--temp-color-60-69)');
  } else if (temp > 50) {
    block.style.setProperty('--temp-color', 'var(--temp-color-50-59)');
  } else if (temp > 40) {
    block.style.setProperty('--temp-color', 'var(--temp-color-41-50)');
  } else if (temp > 31) {
    block.style.setProperty('--temp-color', 'var(--temp-color-32-40)');
  } else if (temp >-50) {
    block.style.setProperty('--temp-color', 'var(--temp-color-0-31)');
  }
  else{
    block.style.setProperty('--temp-color', 'var(--temp-color-none)');
    block.setAttribute('title',`none`);
  }
 
});


