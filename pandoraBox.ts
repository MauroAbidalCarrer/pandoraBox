import * as fs from 'fs';

type ConversationType = 'USER' | 'FOR_USER' | 'SHELL_CMD' | 'EXECUTED_SHELL_CMD' | 'EXIT_STATUS' | 'STDOUT' | 'STDERR';
type ConversationElement = [string, string];
type Conversation = ConversationElement[];

function isConversationType(line: string): boolean {
  const [type] = line.split(':');
  return (
    type.trim() === 'USER' ||
    type.trim() === 'FOR_USER' ||
    type.trim() === 'SHELL_CMD' ||
    type.trim() === 'EXECUTED_SHELL_CMD' ||
    type.trim() === 'EXIT_STATUS' ||
    type.trim() === 'STDOUT' ||
    type.trim() === 'STDERR'
  );
}

function createConversationElement(type: string, value: string): ConversationElement {
  return [type.trim(), value.trim()];
}

function parseConversationFromString(conversationString: string): Conversation {
  const conversation: Conversation = [];

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

  if (currentType && currentValue) {
    conversation.push(createConversationElement(currentType, currentValue));
  }

  return conversation;
}

function serializeConversationToString(conversation: Conversation): string {
  let serializedConversation = '';

  for (const [type, value] of conversation) {
    serializedConversation += `${type}:\n${value}\n`;
  }

  return serializedConversation;
}


// Function to read a file into a string
function readFileIntoString(fileName: string): string {
  try {
    // Check if the file exists
    if (!fs.existsSync(fileName)) {
      // If the file doesn't exist, create an empty file
      fs.writeFileSync(fileName, '');
      console.log(`Created empty file: ${fileName}`);
    }

    // Read the file into a string
    const data: string = fs.readFileSync(fileName, 'utf8');
    return data;
  } catch (error) {
    console.error('Error reading the file:', error);
    process.exit(1);
  }
}
// Check if the file path argument is provided
if (process.argv.length < 3) {
  console.error('Please provide the path to the conversation file as the first argument.');
  process.exit(1);
}

// Read the file asynchronously
fs.readFile(process.argv[2], 'utf8', (err, data) => {
  if (err) {
    // If the file doesn't exist, create an empty conversation
    console.error('File not found. Creating an empty conversation.');
    console.log('Parsed conversation:', []);
    return;
  }

  // Parse the conversation from the file data
  const conversation = parseConversationFromString(data);
  console.log('Parsed conversation:', conversation);
  console.log(`Reserialized conversation:\n`)
  console.log(serializeConversationToString(conversation))
});
