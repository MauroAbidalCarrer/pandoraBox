//setup cli-markdown
import * as fs from 'fs';
import { mdToCLI } from './mdToCLI';
import { conversation , saveConversation, setupConversation } from './conversation.js';
import { setupOpenAI } from './openaiAPIhandling.js';
import { getUserInput } from './userInput';
import { UserMsg, AssistantMsg } from './msgs';
import { blue, red } from './colors'


async function main() {
    //intro
    console.log("Pandora hesitated, but curiosity prevailed.\nWith trembling hands, she opened the box\nIn an instant, darkness escaped, leaving hope trapped within.")
    console.log(mdToCLI("------------------"))
    //setup conversation
    setupConversation()
    //setup readline
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    //handle conversation 
    setupOpenAI()
    try {

    //if there is no conversation
    if (conversation.length == 0) {
        const userInput: string = await getUserInput(blue("User: "), "Write, compile and execute a hello world in C.");
        const userMsg: UserMsg = new UserMsg(userInput);
        conversation.push(userMsg);
        saveConversation() 
    }
    conversation.forEach(msg => console.log(mdToCLI(msg.toString())))
    await conversation[conversation.length - 1].handle()
    }
    catch (error) {
        process.stderr.write(red("Error: Caught unexpected error, saving it to pandora-error.json ..."))
        const errorJSON = JSON.stringify(error, null, 2);

        // Write the JSON data to a file
        fs.writeFile("pandora-error.json", errorJSON, 'utf8', (err) => {
            if (err) {
                console.error('Error saving conversation pandora-error.json....(Well, that\'s annoying)\n', err);
            }
            else
                console.log(red("saved"))
            process.exit(1);
        });
    }
}

main()