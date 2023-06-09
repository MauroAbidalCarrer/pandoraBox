import * as fs from 'fs';
import {conversation, ConversationElement, Conversation} from './pandoraBox'
const defaultFilename = "pandora-box-conversation.txt"
const filename: string = process.argv.length >= 3 ? process.argv[2] : defaultFilename

function isConversationType(line: string): boolean {
    const type = line.split(':')[0].trim();
    return ['USER', 'FOR_USER', 'SHELL_CMD', 'EXECUTED_SHELL_CMD', 'EXIT_STATUS', 'STDOUT', 'STDERR'].some(t => t === type);
  }
  
function createConversationElement(type: string, value: string): ConversationElement {
    return [type.trim(), value.trim()];
}
  
export function desirializeConversation(conversationString: string): Conversation {
  const conversation: Conversation = []
  const lines = conversationString.split('\n');
  let currentType: string | null = null;
  let currentValue = '';

  for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.length > 0) {
          if (isConversationType(trimmedLine)) {
              if (currentType && currentValue) {
              conversation.push(createConversationElement(currentType, currentValue));
              }
              const [type, ...rest] = trimmedLine.split(':');
              currentType = type.trim();
              currentValue = rest.join(':').trim();
          } else {
              currentValue += line + '\n';
          }
      }
  }

  if (currentType && currentValue)
      conversation.push(createConversationElement(currentType, currentValue));
  return conversation
}

export function parseConversationFromFile(): Conversation {
  const fileContent = fs.readFileSync(filename, { flag: 'a+' });
  return desirializeConversation(fileContent.toString());
}
  

export function serializeConversationToString(): string {
    let serializedConversation = '';
    for (const [type, value] of conversation)
        serializedConversation += `${type}:\n${value}\n\n`;
    return serializedConversation;
}

export function serializeConversationIntoFile(): void {
  // Serialize the conversation into a string
  const serializedConversation = serializeConversationToString();
  try {
    // Write the conversation string into the file
    fs.writeFileSync(filename, serializedConversation, 'utf8');
  } catch (err) {
    console.error('Error occurred while writing the conversation into the file:', err);
  }
}
  