import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { config } from 'dotenv'
import { conversation } from './conversation.js';


let openai: OpenAIApi
let context: string

export function setupOpenAI()
{
    if (!fs.existsSync('.env')) {
        console.log("Could not find .env, I sure hope you've exported your OPENAI_API_KEY...")
      }
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
        if ( response.data.choices[0]?.message?.content && typeof response.data.choices[0]?.message?.content === "string") {
            return response.data.choices[0].message.content;
        } else {
        throw new Error("Invalid response from OpenAI API");
        }
    }
     catch (error) 
     {
        console.log("OpenAI api error: ", error.message)
        const errorJSON = JSON.stringify(error, null, 2);

        // Write the JSON data to a file
        fs.writeFile("openAI-error", errorJSON, 'utf8', (err) => {
            if (err) {
            console.error('Error saving conversation OpenAIerror....(Well, that\'s annoying)\n', err);
            return;
            }
            console.log('Invalid response from OpenAI API, Error saved in openAI-error file.');
        });
        throw error;
    }
}

function mkMessagesFromConversation(): ChatCompletionRequestMessage[] {
    const msgs: ChatCompletionRequestMessage[] = [{role: 'user', content: context}]
    conversation.forEach(msg => msgs.push(msg.toOpenAImsg()))
    return msgs
}