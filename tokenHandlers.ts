import {conversation, ConversationElement, Conversation} from './pandoraBox'
import { Configuration, OpenAIApi } from "openai";
import { serializeConversationToString,serializeConversationIntoFile, desirializeConversation  } from './serialization';
import { getCompletion } from './openaiAPIhandling';
import {blue, red, green, orangeFaint, cyan} from './colors'

export function handleUserPrompt(): void {
  getUserPrompt((answer) => {
    if (answer == 'conv') {
      console.log('Every conversation starts by some context given to the assistant which has been omited here.')
      console.log(serializeConversationToString())
    }
      else{
      conversation.push(['USER', answer])
      getAndHandleAssitantAnswer()
    }
    }
  )
}

export function getAndHandleAssitantAnswer() : void {
  getCompletion().then(answer => handleAssistantAnswer(answer))
}

function handleAssistantAnswer(assistantAnswer: string): void {
  //print answer
  console.log(orangeFaint(assistantAnswer) + '\n')
  let tokenizedAnswer = desirializeConversation(assistantAnswer)
  // console.log(tokenizedAnswer)
  tokenizedAnswer.forEach((token) => {
    if (token[0] == 'FOR_USER') {
      console.log(green(token[1]))
      conversation.push(token)
    }
    else if (token[0] == 'SHELL_CMD') {
      conversation.push(token)
      console.log(blue(token[1]))
    }
    // else
    //   console.log(colorRed + "Unrecognized token type: " + token[0] + ", token: " + token[1] + colorReset)
    })
    //handle shell cmds
    let shellCmds = tokenizedAnswer.filter(token => token[0] == 'SHELL_CMD')
    if (shellCmds.length != 0)
    {
      console.log('shellCmds: ' + shellCmds)
      handleShellCmds(shellCmds)
    }
    else
      handleUserPrompt()
}

function handleShellCmds(shellCmds: Conversation): void
{
  function runCmd(): void {
    const { exec } = require('child_process');
    exec(shellCmds[0][1], (err: string, stdout: string, stderr: string) => {
      conversation.push(['EXECUTED_SHELL_CMD', shellCmds[0][1]])
      if (stdout)
      {
        conversation.push(['STDOUT', stdout])
        console.log(blue('stdout:\n' + stdout))
      }
      if (stderr)
        handleCmdError(stderr, shellCmds)
      else if (err)
        handleCmdError(err, shellCmds)
      else if (shellCmds.length > 1)
          handleShellCmds(shellCmds.slice(1))
    })
  }

  // console.log('shellCmds.length: ', shellCmds.length)
  getUserPrompt((userAnswer) => {
    userAnswer = userAnswer.toLowerCase()
    if (userAnswer.length == 0) 
      runCmd()
    else if (userAnswer == 's')
      if (shellCmds.length > 1)
      handleShellCmds(shellCmds.slice(1))
      else
        handleUserPrompt()
    if (userAnswer == 'e') {
      getUserPrompt((newCmd) => {
      shellCmds[0][1] = newCmd
      runCmd()
      },
      'EDIT: ',
      shellCmds[0][1])
    }
  }, "CMD: '" + blue(shellCmds[0][1]) + "'(" + cyan("s") + "kip/" + cyan("e") + "edit/" + cyan("Enter") + " to run): ")
}

function handleCmdError(error: string, shellCmds: Conversation)
{
  conversation.push(['STDERR', error])
  console.log(red('stderr:\n' + error))
  getUserPrompt((prompt) => {
    if (prompt.length != 0 && prompt.toLowerCase() != 'y')
      conversation.push(['USER', prompt])
    if (prompt.length != 0) {
      getCompletion().then((assistantAnswer) => {
        shellCmds.length = 0
        handleAssistantAnswer(assistantAnswer)
      })
    }
  }, 'Send error to assistant? (' + cyan("Enter") + ' to send it/' + cyan('s') + 'kip/ type a message to send in addition to the error)\n')
}
  
export function getUserPrompt(onPrompted: (arg: string) => void, prompt: string = 'User Input: ', prefill: string = ''): void {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  console.log('prefill: ', prefill)
  rl.question(prompt, {defaultInput: prefill}, (answer: string) => {
    rl.close();
    onPrompted(answer)
  });
}
  

export async function handleLastConversationToken() {

    const [type, value] = conversation[conversation.length - 1];
    if (type == "USER")//handle
      getAndHandleAssitantAnswer()
    // if (type == "FOR_USER" || type == "SHELL_CMD")//handle assistant tokens 
      //go back to the first assistant token after the last user msg
      //handle asistant tokens
    // if (type == "EXECUTED_SHELL_CMD" || type == "EXIT_STATUS" || type == "STDOUT" || type == "STDERR")//Handle
      //go to first EXECUTED_SHELL_CMD token after last assistant token
      //handle 
    else
      throw Error(`Unrecognized token: ${type}`)
  }