type ConversationType = 'USER' | 'FOR_USER' | 'SHELL_CMD' | 'EXECUTED_SHELL_CMD' | 'EXIT_STATUS' | 'STDOUT' | 'STDERR';
type Conversation = Array<string | number>;

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

function createConversationElement(type: ConversationType, value: string): string | number {
  switch (type) {
    case 'USER':
    case 'FOR_USER':
    case 'SHELL_CMD':
    case 'EXECUTED_SHELL_CMD':
    case 'STDOUT':
    case 'STDERR':
      return value.trim();
    case 'EXIT_STATUS':
      return parseInt(value.trim(), 10);
    default:
      throw new Error(`Invalid conversation type: ${type}`);
  }
}

function parseConversationFromString(conversationString: string): Conversation {
  const conversation: Conversation = [];

  const lines = conversationString.split('\n');
  let currentType: ConversationType | null = null;
  let currentValue = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.length > 0) {
      if (isConversationType(trimmedLine)) {
        if (currentType && currentValue) {
          conversation.push(createConversationElement(currentType, currentValue));
        }

        const [type, ...rest] = trimmedLine.split(':');
        currentType = type.trim() as ConversationType;
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

// Example usage:
const conversationString = `USER: This is a user message
FOR_USER: This is a message for the user
SHELL_CMD: echo "Hello, World!"
EXECUTED_SHELL_CMD: echo "Hello, World!"
STDOUT: Hello, World!
STDERR: Error: Something went wrong
EXIT_STATUS: 0`;

const conversation = parseConversationFromString(conversationString);
console.log('Parsed conversation:', conversation);