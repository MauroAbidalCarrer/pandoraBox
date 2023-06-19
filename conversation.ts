import * as fs from 'fs';
import { AssistantMsg, UserMsg} from './msgs';
import { ShellCommand } from './shellCommand';


const conversationFileName = process.argv.length >= 3 ? process.argv[2] : "pandora-box-conversation.json"
type Conversation = (AssistantMsg | UserMsg)[]
export let contextConversation: Conversation = []
export let conversation: Conversation = []

export function saveConversation(): void {
  // console.log("Saving conversation");
  
  // Convert the conversation object to JSON format
  const serializedConversation = conversation.map((message) => {
    if (message instanceof UserMsg) {
      return {
        type: "UserMsg",
        content: message.content,
      };
    } else if (message instanceof AssistantMsg) {
      return {
        type: "AssistantMsg",
        tokens: message.tokens.map((token) => {
          if (token instanceof ShellCommand) {
            return {
              type: "ShellCommand",
              content: token.content,
              ranOrSkipped: token.ranOrSkipped,
              stdout: token.stdout,
              stderr: token.stderr,
              exitCode: token.exitCode,
            };
          } else {
            return token.toString()
          }
        }),
        lastHandledTokenIndex: message.lastHandledTokenIndex,
      };
    } else {
      throw new Error("Invalid message type in conversation");
    }
  });

  const conversationJSON = JSON.stringify(serializedConversation, null, 2);

  // Write the JSON data to a file
  fs.writeFile(conversationFileName, conversationJSON, 'utf8', (err) => {
    if (err) {
      console.error('Error saving conversation:', err);
      return;
    }
    // console.log(`Conversation saved successfully to ${conversationFileName}!`);
  });
}

export function setupConversation(): void {
  conversation = loadConversation(conversationFileName)
  const path = require('path');
  contextConversation = loadConversation(path.resolve(__dirname, 'context.json'))
}

function loadConversation(conversationFileName: string): Conversation {
  try {
    // let conversation: Conversation = []
    if (!fs.existsSync(conversationFileName)) {
      fs.writeFileSync(conversationFileName, '[]', 'utf8');
    }

    const conversationJSON = fs.readFileSync(conversationFileName, 'utf8');
    const serializedConversation = JSON.parse(conversationJSON);

    const conversation = serializedConversation.map((serializedMessage: any) => {
      if (serializedMessage.type === "UserMsg") {
        return new UserMsg(serializedMessage.content);
      } else if (serializedMessage.type === "AssistantMsg") {
        const assistantMsg = new AssistantMsg("");
        assistantMsg.tokens = serializedMessage.tokens.map((serializedToken: any) => {
          if (serializedToken.type === "ShellCommand") {
            const shellCommand = new ShellCommand(serializedToken.content);
            shellCommand.ranOrSkipped = serializedToken.ranOrSkipped;
            shellCommand.stdout = serializedToken.stdout;
            shellCommand.stderr = serializedToken.stderr;
            shellCommand.exitCode = serializedToken.exitCode;
            return shellCommand;
          } else {
            return serializedToken
          }
        });
        assistantMsg.lastHandledTokenIndex = serializedMessage.lastHandledTokenIndex;
        return assistantMsg;
      } else {
        throw new Error("Invalid message type in conversation");
      }
    });
    return conversation
  } catch (err) {
    console.error('Error loading conversation:', err);
    throw err
  }
}