import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { conversation } from './pandoraBox'

let openai: OpenAIApi
let context: string
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";

export function setupOpenAI()
{
    require('dotenv').config()
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);

    context = fs.readFileSync("./context.txt").toString()
}

// export async function getCompletion(prompt: string) : Promise<string> {
//     try {
//     // Send a request to the OpenAI API to generate text
//         const response = await openai.createChatCompletion({
//             model: "gpt-3.5-turbo",
//             messages: [{role: "user", content: prompt}],
//             max_tokens: 100,
//             n: 1,
//             temperature: 0.8,
//         });
//         // console.log(`request cost: ${response.data.usage.total_tokens} tokens`);
//         // Return the text of the response
//         console.log("Answer: ", response.data.choices[0].message?.content)
//         if (typeof response.data.choices[0].message !== typeof undefined)
//             return response.data.choices[0].message?.content;
//         throw new Error("messages is null")
//     } catch (error) {
//         console.log("Caught unexpected error while getting completion: ", error)
//         throw error;
//     }
// }

export async function getCompletion() : Promise<string> {
    try {
    // Send a request to the OpenAI API to generate text
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: mkMessages(),
            max_tokens: 100,
            n: 1,
            temperature: 0.6,
        });
        // console.log(`request cost: ${response.data.usage.total_tokens} tokens`);
        // Return the text of the response
        // console.log("Answer: ", response.data.choices[0].message?.content)
        if (typeof response.data.choices[0].message !== typeof undefined)
            return response.data.choices[0].message?.content;
        throw new Error("messages is undefined, nanni?!!")
    } catch (error) {
        console.log(colorRed + "Caught unexpected error while getting completion: " + error.data.error + colorReset)
        throw error;
    }
}

function mkMessages(): ChatCompletionRequestMessage[]
{
    const messages: ChatCompletionRequestMessage[] = []
    messages.push({role: "user", content: context})
    conversation.forEach((el) => {
        if (el[0] == "USER" || el[0] == "EXECUTED_SHELL_CMD" || el[0] == "EXIT_STATUS" || el[0] == "STDOUT" || el[0] == "STDERR")
            messages.push({role: 'user', content: el[1]})
        else if (el[0] == "FOR_USER" || el[0] == "SHELL_CMD")
            messages.push({role: 'assistant', content: el[1]})
        else
            throw new Error('Unrecognized token type ' + el[0])
        }
    )
    return messages
}