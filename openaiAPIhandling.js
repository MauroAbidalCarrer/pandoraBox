import * as fs from 'fs';
import { Configuration, OpenAIApi } from "openai";
import { config } from 'dotenv'
import { conversation } from './conversation.js';
import { type } from 'os';

let openai
let context
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";

export function setupOpenAI()
{
    config()
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);

    context = fs.readFileSync("./context.txt").toString()
}

export async function getCompletion() {
    try {
    // Send a request to the OpenAI API to generate text
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: mkMessagesFromConversation()}],
            max_tokens: 100,
            n: 1,
            temperature: 0.8,
        });
        // console.log(`request cost: ${response.data.usage.total_tokens} tokens`);
        // Return the text of the response
        console.log("Answer: ", response.data.choices[0].message?.content)
        if (typeof response.data.choices[0].message !== typeof undefined)
            return response.data.choices[0].message?.content;
        throw new Error("messages is null")
    } catch (error) {
        console.log("Caught unexpected error while getting completion: ", error)
        throw error;
    }
}

function mkMessagesFromConversation()
{
    console.log("conversation: ", conversation)
    console.log(typeof conversation)
    let messages = [ { role: 'user', content: context}]
    
    messages = messages.concat(conversation.map((msg) => {
        return {
            role: msg.role,
            content: Array.isArray(msg.content[0]) ? msg.content[0].map((token) => token.content).join(' ') : msg.content
          };
      
    }))
    console.log("messages openAI API: ", messages)
    return messages
}
