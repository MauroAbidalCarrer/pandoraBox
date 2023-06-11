export const darkGreyBackground = '\x1b[40m';
export const lightGreyBackground = '\x1b[47m';
export const bold = '\x1b[1m';
export const reset = '\x1b[0m';
export const cyan = '\u001b[36m';
export const codeBlockPadding = 50


export function mdToCLI(markdown: string): string {
  const lines = markdown.split('\n');
  let output = '';
  let inBold = false
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (inCodeBlock) { //end of code block
        output += '\n'; // Add extra line after code block
        inCodeBlock = false;
        output += "\t" + `└` + ''.padEnd(codeBlockPadding - 2, '─') + `┘\n`;
      } else { //start of code block
        let language = line.substring(3)
        output += "\t" + `┌─` + cyan + language + reset + ''.padEnd(codeBlockPadding - 3 - language.length, '─') + `┐\n`;
        output += '\n'
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      output += "\t" + "  " + cyan + line + reset;
      output += '\n' ;
    } else {
      output += line;
      output += '\n';
    }
  }

  return output;
}
