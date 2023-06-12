import { ChatCompletionRequestMessage } from "openai";
import { ShellCommand } from './shellCommand'
import { getUserInput, UserInputException } from './userInput';
import { getCompletion } from './openaiAPIhandling'
import { conversation, saveConversation } from './conversation'
import { blue, green } from './colors'

export class AssistantMsg {
    tokens: (string | ShellCommand)[] = [];
    lastHandledTokenIndex: number = 0;

    constructor(input: string) {
      const codeBlockRegex = /```shell([\s\S]*?)```/g;
      let lastIndex = 0;
      let match;
  
      while ((match = codeBlockRegex.exec(input)) !== null) {
        const codeBlockStartIndex = match.index;
        const codeBlockEndIndex = match.index + match[0].length;
  
        if (codeBlockStartIndex > lastIndex) {
          const textBeforeCodeBlock = input.substring(lastIndex, codeBlockStartIndex).trim();
          if (textBeforeCodeBlock.length > 0) {
            this.tokens.push(textBeforeCodeBlock);
          }
        }
  
        const shellCommandText = match[1].trim();
        if (shellCommandText.length > 0) {
          const shellCommand = new ShellCommand(shellCommandText);
          this.tokens.push(shellCommand);
        }
  
        lastIndex = codeBlockEndIndex;
      }
  
      if (lastIndex < input.length) {
        const textAfterCodeBlocks = input.substring(lastIndex).trim();
        if (textAfterCodeBlocks.length > 0) {
          this.tokens.push(textAfterCodeBlocks);
        }
      }
    }
  
    async handle(): Promise<void> {
      try {
        // console.log("this.lastHandledTokenIndex: ", this.lastHandledTokenIndex, ", this.tokens.length: ", this.tokens.length)
        while (this.lastHandledTokenIndex < this.tokens.length) {
          const token = this.tokens[this.lastHandledTokenIndex];
    
            if (typeof token === 'string') {
              console.log('\x1b[32m' + token + '\x1b[0m \n');  
            } else if (token instanceof ShellCommand) {
              await token.handle();
            }
            this.lastHandledTokenIndex++;
            saveConversation()
          }
          //get user input for the next message
          const userInput = await getUserInput("User: ")
          const userMsg = new UserMsg(userInput)
          conversation.push(userMsg)
          userMsg.handle()
      } catch (error) {
        console.log("error.input !== undefined: ", error.input !== undefined)
        console.log("error instanceof UserInputException: ", error instanceof UserInputException)
        if (error.input !== undefined) {
          const newUserMsg = new UserMsg(this.MkUserMsgStr() + "\n\nUser: " + error.input)
          conversation.push(newUserMsg)
          saveConversation()
          newUserMsg.handle()
        } else {
          console.error('An error occurred while handling AssistantMsg: ', error);
        }
      }
    }

    toString(): string {
        let str: string = green('Assitant:\n')
        this.tokens.forEach(token => str += token.toString() + "\n")
        return str
    }
    toOpenAImsg(): ChatCompletionRequestMessage {
      return {role: 'assistant', content: this.toString()}
    }

    MkUserMsgStr(userInput: string = ''): string {
        let userMsg: string = ''
        this.tokens.forEach((token) => {
            if (token instanceof ShellCommand)
                token.toUserMsg()
        })
        return str
    }
  } 


export class UserMsg {
  content: string

  constructor(content: string) {
    this.content = content
  }

  async handle(): Promise<void> {
    console.log("Awaiting for assistant answer...")
    const assistantResponse: string = await getCompletion()
    // console.log("assistant answer: " , assistantResponse)
    const assistantMsg = new AssistantMsg(assistantResponse)
    conversation.push(assistantMsg)
    saveConversation()
    await assistantMsg.handle()
  }

  toOpenAImsg(): ChatCompletionRequestMessage {
    return {role: 'user', content: this.content}
  }
  toString(): string {
    return blue("User:\n") + this.content
  }
}