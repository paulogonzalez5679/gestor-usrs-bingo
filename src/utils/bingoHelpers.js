export const generateBingoCard = () => {  
  const numbers = [];  
  const columns = [1, 2, 3, 4, 5]; // B, I, N, G, O  
  for (let col = 0; col < 5; col++) {  
    const colNumbers = [];  
    const min = col * 15 + 1;  
    const max = (col + 1) * 15;  
    for (let row = 0; row < 5; row++) {  
      if (col === 2 && row === 2) {  
        colNumbers.push('FREE');  
      } else {  
        let num;  
        do {  
          num = Math.floor(Math.random() * 15) + min;  
        } while (colNumbers.includes(num));  
        colNumbers.push(num);  
      }  
    }  
    numbers.push(colNumbers.sort((a, b) => a - b));  
  }  
  return numbers;  
};  

export const checkBingo = (card, marked) => {  
  // Check rows  
  for (let row = 0; row < 5; row++) {  
    if (card[row].every(num => marked.has(num) || num === 'FREE')) {  
      return 'row';  
    }  
  }  
  // Check columns  
  for (let col = 0; col < 5; col++) {  
    if (card.every(row => row[col] === 'FREE' || marked.has(row[col]))) {  
      return 'column';  
    }  
  }  
  // Check diagonals  
  if (card.every((row, i) => row[i] === 'FREE' || marked.has(row[i]))) {  
    return 'diagonal1';  
  }  
  if (card.every((row, i) => row[4 - i] === 'FREE' || marked.has(row[4 - i]))) {  
    return 'diagonal2';  
  }  
  return null;  
};  

export const generateUniqueId = () => {  
  return Date.now().toString(36) + Math.random().toString(36).substr(2);  
};