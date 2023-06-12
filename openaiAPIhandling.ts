import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { config } from 'dotenv'
import { conversation } from './conversation.js';

let openai: OpenAIApi
let context: string

export function setupOpenAI()
{
    config()
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);

    context = fs.readFileSync("./context.txt").toString()
}

export async function getCompletion(): Promise<string> {
    try {
    // Send a request to the OpenAI API to generate text
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: mkMessagesFromConversation(),
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

function mkMessagesFromConversation(): ChatCompletionRequestMessage[] {
    const msgs: ChatCompletionRequestMessage[] = [{role: 'user', content: context}]
    conversation.forEach(msg => msgs.push(msg.toOpenAImsg()))
    return msgs
}