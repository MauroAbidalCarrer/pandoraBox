let readlineSync = require('readline-sync');

let name = readlineSync.question('What is your name? ', {
  defaultInput: 'Joe'
});

console.log(`Your name is ${name}!`);