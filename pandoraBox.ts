type USER = string;
type FOR_USER = string;
type SHELL_CMD = string;
type EXECUTED_SHELL_CMD = string;
type EXIT_STATUS = number;
type STDOUT = string;
type STDERR = string;
type ConversationType = USER | FOR_USER | SHELL_CMD | EXECUTED_SHELL_CMD | EXIT_STATUS | STDOUT | STDERR;
type Conversation = ConversationType[];

function parseConversationFromString(conversationString: string): Conversation {
  const conversation: Conversation = [];

  const lines = conversationString.split('\n');
  let currentType: string | null = null;
  let currentValue = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    console.log(`line: \"${trimmedLine}, currentType: ${currentType}, currentValue: ${currentValue}`)

    if (trimmedLine.length > 0) {
      if (isConversationType(trimmedLine)) {
        console.log()
        if (currentType && currentValue) {
          conversation.push(createConversationElement(currentType, currentValue));
        }

        const [type] = trimmedLine.split(':');
        currentType = type.trim();
        currentValue = '';
      } else {
        console.log("adding line to current value")
        currentValue += line + '\n';
      }
    }
  }

  if (currentType && currentValue) {
    conversation.push(createConversationElement(currentType, currentValue));
  }

  return conversation;
}



function isConversationType(line: string): boolean {
  const [type] = line.split(':');
  console.log(`type: ${type}, ${typeof type}`)
  return ['USER', 'FOR_USER', 'SHELL_CMD', 'EXECUTED_SHELL_CMD', 'EXIT_STATUS', 'STDOUT', 'STDERR'].some((el) => {
  console.log(`el: ${el}, el == type: ${el == type}, typeof type`)
   return el == type.toString()
  });
}

function createConversationElement(type: string, value: string): ConversationType {
  console.log(`Creating conversation element, type: ${type}, value: ${value}`)
  const trimmedValue = value.trim();
  switch (type) {
    case 'USER':
    case 'FOR_USER':
    case 'SHELL_CMD':
    case 'EXECUTED_SHELL_CMD':
    case 'STDOUT':
    case 'STDERR':
      return trimmedValue;
    case 'EXIT_STATUS':
      return parseInt(trimmedValue, 10);
    default:
      throw new Error(`Invalid conversation type: ${type}`);
  }
}


// Example conversation string
const conversationString = `
USER:
Hello
FOR_USER:
Hi there!
USER:
Can you show me the files?
U hjhsdbfgsdfgkjbhg
FOR_USER:
Sure, executing "ls -l"
EXECUTED_SHELL_CMD:
ls -l
EXIT_STATUS:
0
STDOUT:
file1.txt
file2.txt
STDERR: 
`;

// Usage example
const conversation = parseConversationFromString(conversationString);
console.log('Parsed conversation:', conversation);