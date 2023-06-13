import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionRequest } from "openai";
import { config } from 'dotenv'
import { conversation } from './conversation.js';
import { encode } from 'gpt-3-encoder'


let openai: OpenAIApi
// let context: string

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

    // context = fs.readFileSync("./context.txt").toString()
}

export async function getCompletion(): Promise<string> {
    try {
    // Send a request to the OpenAI API to generate text
        const response = await openai.createChatCompletion(mkMessagesFromConversation());
        // console.log(`request cost: ${response.data.usage.total_tokens} tokens`);
        // Return the text of the response
        // console.log("Answer: ", response.data.choices[0].message?.content)
        if ( response.data.choices[0]?.message?.content && typeof response.data.choices[0]?.message?.content === "string") {
            return response.data.choices[0].message.content;
        } else {
        throw new Error("Invalid response from OpenAI API");
        }
    }
     catch (error) 
     {
        console.log("OpenAI api error: ", error.message)
        throw error;
    }
}

function mkMessagesFromConversation(): CreateChatCompletionRequest {
    const msgs: ChatCompletionRequestMessage[] = []//[{role: 'user', content: context}]
    let nbTokens = 4097// - encode(context).length
    conversation.forEach((msg) => {
        const openaiMsg = msg.toOpenAImsg()
        nbTokens -= encode(openaiMsg.content).length
        msgs.push(openaiMsg)
    })
    // console.log("Msgs for openai:\n", msgs)
    return {
        model: "gpt-3.5-turbo",
        messages: msgs,
        max_tokens: nbTokens,
        n: 1,
        temperature: 1.5,
    }
}