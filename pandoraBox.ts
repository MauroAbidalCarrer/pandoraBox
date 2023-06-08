
// Declare conversation type
const ConversationTypeTokens: (string)[] = ['USER', 'FOR_USER', 'SHELL_CMD', 'EXECUTED_SHELL_CMD', 'EXIT_STATUS', 'STDOUT', 'STDERR'];
export type ConversationElement = [string, string];
export type Conversation = ConversationElement[];
import * as handlers from './tokenHandlers'

//create conversation
import { parseConversationFromFile, serializeConversationIntoFile, serializeConversationToString} from './serialization'
export let conversation : Conversation = parseConversationFromFile()

//handle sigint
process.once('SIGINT', function (code) {
  console.log('SIGINT received, saving conversation before quitting.');
  serializeConversationIntoFile()
  exit(0)
});

//intialize conversation with openAI API
import * as api from './openaiAPIhandling'
import { exit } from 'process';
api.setupOpenAI()
// handlers.getUserPrompt(prompt => api.getCompletion(prompt))

//handle conversation
try {
  if (conversation.length === 0) 
    handlers.handleUserPrompt()
  else
    handlers.handleLastConversationToken()
} catch (err){
  console.log('Caught unexpected erorr, saving conversation...')
  serializeConversationIntoFile()
  throw err
}