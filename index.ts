//setup cli-markdown
import { mdToCLI } from './mdToCLI';
import { conversation , saveConversation, loadConversation } from './conversation.js';
import { setupOpenAI } from './openaiAPIhandling.js';
import { getUserInput } from './userInput';
import { UserMsg, AssistantMsg } from './msgs';


async function main() {
    //intro
    console.log("Pandora hesitated, but curiosity prevailed.\nWith trembling hands, she opened the box\nIn an instant, darkness escaped, leaving hope trapped within.")
    console.log(mdToCLI("------------------"))
    //setup conversation
    loadConversation()
    //setup readline
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    //handle conversation 
    setupOpenAI()
    //if there is no conversation
    if (conversation.length == 0) {
        const userInput: string = await getUserInput("User: ", "Write, compile and execute a hello world in C.");
        const userMsg: UserMsg = new UserMsg(userInput);
        conversation.push(userMsg);
        saveConversation() 
    }
    console.log(conversation[conversation.length - 1])
    await conversation[conversation.length - 1].handle()
}

main()