const tempBlocks = document.querySelectorAll('.temp-block');
const temperatures = [25, 63, 25, 25, 52, 25,95]; // Example temperatures




tempBlocks.forEach((block, index) => {

  console.log("before",block);
  const temp = temperatures[index];
  console.log ("temp=",temp);
  block.style.setProperty('title', 'hello');

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
  } else {
    block.style.setProperty('--temp-color', 'var(--temp-color-0-31)');
  }
  console.log("after",block);
});


