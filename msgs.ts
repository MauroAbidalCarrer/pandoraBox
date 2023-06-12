import { ChatCompletionRequestMessage } from "openai";
import { ShellCommand } from './shellCommand'
import { getUserInput, UserInputException } from './userInput';
import { getCompletion } from './openaiAPIhandling'
import { conversation, saveConversation } from './conversation'

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

      console.log(this.tokens)
    }
  
    async handle(): Promise<void> {
      try {
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
      } catch (error) {
        if (error instanceof UserInputException) {
          conversation.push(new UserMsg(this.MkUserMsgStr() + "\n\nUser: " + error.input))
          saveConversation()
        } else {
          console.error('An error occurred while handling AssistantMsg: ', error);
        }
      }
    }

    toString(): string {
        let str: string = 'Assitant:\n'
        this.tokens.forEach(token => str += token.toString() + "\n")
        return str
    }
    toOpenAImsg(): ChatCompletionRequestMessage {
      return {role: 'assistant', content: this.toString()}
    }

    MkUserMsgStr(): string {
        let str: string = ''
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
    const assistantResponse = await getCompletion()
    conversation.push(new AssistantMsg(assistantResponse))
    saveConversation()
  }

  toOpenAImsg(): ChatCompletionRequestMessage {
    return {role: 'user', content: this.content}
  }
  toString(): string {
    return "User:\n" + this.content
  }
}