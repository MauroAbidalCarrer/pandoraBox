import { exec } from 'child_process';
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
  
    private executeCommand(): Promise<void> {
      return new Promise((resolve) => {
        exec(this.content, (error, stdout, stderr) => {
          this.stdout = stdout || '';
          this.stderr = stderr || '';
          this.exitCode = error ? error.code || 1 : 0;
          resolve();
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
  
    