import { spawn } from 'child_process';
import { mdToCLI } from './mdToCLI'
import { getUserInput, UserInputException } from './userInput';
import { saveConversation } from './conversation'
import * as col from './colors'

export class ShellCommand {
    content: string;
    ranOrSkipped: boolean = false;
    stdout: string = '';
    stderr: string = '';
    exitCode: number = 0;

    constructor(command: string) {
      this.content = command
    }
  
    async handle(): Promise<void> {
      console.log(mdToCLI("```shell\n" + this.content + "\n```"));
  
      while (true) {
        const input = await getUserInput(col.cyan('e') + 'dit/' + col.cyan('r') + 'un/' + col.cyan('s') + 'kip/' + col.cyan("Write") + " a comment that will be sent to the assistant: ");
        const option = input.trim().toLowerCase();
        
        if (option === 'e') {
          this.content = await getUserInput('edit: \n', this.content);
          saveConversation()
        } else if (option === 'r') {
          await this.executeCommand();
          saveConversation()
  
          if (this.stdout) {
            console.log('stdout:\n', this.stdout);
          }
  
          if (this.stderr) {
            console.log('stderr:\n', '\x1b[31m' + this.stderr + '\x1b[0m');
          }
  
          if (this.exitCode !== 0) {
            console.log('Exit code:', '\x1b[31m' + this.exitCode + '\x1b[0m');
            const userInput = await getUserInput('Enter to send error to assistant/write comment for assistant then Enter/s to ignore: ');
  
            if (userInput.trim() === 's') {
            this.ranOrSkipped = true;
            return;
            } else {
              throw new UserInputException(userInput);
            }
          }
  
          this.ranOrSkipped = true;
          return;
        } else if (option === 's') {
          this.ranOrSkipped = true;
          return;
        }
        else if (input.length != 0) {
          throw new UserInputException(input)
        }
      }
    }
  
    executeCommand(): Promise<number> {
      return new Promise((resolve, reject) => {
        const childProcess = spawn(this.content, [], {
          shell: true,
          stdio: ['inherit', 'pipe', 'pipe'], // Capture stdout and stderr
        });
    
        let stdout = '';
        let stderr = '';
    
        childProcess.stdout.on('data', (data) => {
          const output = data.toString();
          stdout += output;
          process.stdout.write(output); // Print to console
        });
    
        childProcess.stderr.on('data', (data) => {
          const errorOutput = data.toString();
          stderr += errorOutput;
          process.stderr.write(errorOutput); // Print to console
        });
    
        childProcess.on('close', (code) => {
          this.exitCode = code !== null ? code : 0; //
          this.ranOrSkipped = true;
          this.stdout = stdout.trim();
          this.stderr = stderr.trim();
          resolve(this.exitCode);
        });
    
        childProcess.on('error', (error) => {
          this.ranOrSkipped = true;
          reject(error);
        });
      });
    }
    

    toString(): string {
      return "```shell\n" + this.content + "\n```"
    }

    toUserMsg(): string{
      let str: string = 'executed command:\n'
      str += "```shell\n"
      str += this.content
      if (this.stdout)
        str += 'stdout:\n' + this.stdout
      if (this.stderr)
        str += 'stderr:\n' + this.stderr
      str += 'exit code: ' + this.exitCode
      str += "\n```\n\n"
      return str
    }
  }
  
    