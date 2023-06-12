
export function getUserInput(prompt: string, placeholder: string = ''): Promise<string> {
  // console.log("getUserInput called, stack: " + new Error().stack)
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.line = placeholder
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
  
export class UserInputException extends Error {
  constructor(public input: string) {
    super();
    this.name = 'UserInputException';
  }
}