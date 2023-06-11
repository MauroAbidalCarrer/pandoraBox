//setup cli-markdown
import cliMd from 'cli-markdown';
console.log(cliMd("Pandora hesitated, but curiosity prevailed.  \nWith trembling hands, she opened the box  \nIn an instant, darkness escaped, leaving hope trapped within."))
console.log(cliMd("------------------"))

//setup conversation
import { conversation , saveConversation, loadConversation } from './conversation.js';
loadConversation()

//setup readline
import readline from 'readline'
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

//handle conversation 
import { setupOpenAI, getCompletion } from './openaiAPIhandling.js';
setupOpenAI()

//if there is no conversation
if (conversation.length == 0) {
  rl.question("User: ", (answer) => {
    rl.close();
    // console.log(answer)
    conversation.push({role: 'user', tokens: [ {type: 'text', content: answer}]})
    saveConversation()
    getCompletion()
  });
}
else {
    let lastMsg = conversation[conversation.length - 1]
    console.log(conversation)
    console.log(lastMsg)
    if (lastMsg.role == 'user') {
        // if (lastMsg.content.some(el => el.type === 'cmd' || el.type === 'file')) 
        let msgWasfinished = true
        for (let i = 0; i < lastMsg.tokens.length; i++) {
            if (lastMsg.tokens[i].type == 'command' && lastMsg.tokens[i].executed == false)
            {
                handleCmd(lastMsg.tokens[i], () => handleAssistantMsg(lastMsg, i + 1))
                msgWasfinished = false
                break
            }
            if (lastMsg.tokens[i].type == 'file' && lastMsg.tokens[i].written == false)
            {
                handleFile(lastMsg.tokens[i], () => handleAssistantMsg(lastMsg, i + 1))
                msgWasfinished = false
                break
            }
        }
        if (msgWasfinished == true) {
            console.log('sending to assistant')
            await getCompletion()
        }
    }
    else
        handleAssistantMsg(lastMsg)
}