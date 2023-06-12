import * as fs from 'fs';
import { AssistantMsg, UserMsg} from './msgs';


const fileName = process.argv.length >= 3 ? process.argv[2] : "pandora-box-conversation.json"
export let conversation: (AssistantMsg | UserMsg)[] = []


export function saveConversation(): void {
  console.log("Saving conversation")
// Convert the conversation object to JSON format
const conversationJSON = JSON.stringify(conversation, null, 2);

// Write the JSON data to a file
fs.writeFile(fileName, conversationJSON, 'utf8', (err) => {
    if (err) {
    console.error('Error saving conversation:', err);
    return;
    }
    console.log('Conversation saved successfully!');
});
}

export function loadConversation(): void {
    try {
      if (!fs.existsSync(fileName)) {
        conversation = []
        // Write the empty conversation to the file
        fs.writeFileSync(fileName, '[]', 'utf8');
      }
  
      // Read the JSON data from the file
      const conversationJSON = fs.readFileSync(fileName, 'utf8');
  
      // Parse the JSON data into a JavaScript object
      conversation = JSON.parse(conversationJSON);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  }
  
  