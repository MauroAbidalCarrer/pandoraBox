import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, CreateChatCompletionRequest } from "openai";
import { config } from 'dotenv'
import { contextConversation, conversation } from './conversation.js';
import { encode } from 'gpt-3-encoder'
import { red } from './colors.js'


let openai: OpenAIApi
let context: string

export function setupOpenAI()
{
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0)
    {
        console.error(red("Error: No OPENAI_API_KEY environement variable provided in shell environement or .env file in pandoraBox's directory."))
        process.exit(1)
    }
    const path = require('path');
    const dotenvPath = path.resolve(__dirname, '.env'); // Provide the path to .env file
    config({ path: dotenvPath })
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
    // console.log("Key: ", process.env.OPENAI_API_KEY)
    // context = fs.readFileSync(path.resolve(__dirname, 'context.json')).toString()
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
    const msgs: ChatCompletionRequestMessage[] = []
    let nbTokensUser = 0
    contextConversation.concat(conversation).forEach((msg) => {
        const openaiMsg = msg.toOpenAImsg()
        nbTokensUser += encode(openaiMsg.content).length
        if (nbTokensUser >= 4096) 
            throw new Error("token limit reached")
        msgs.push(openaiMsg)
    })
    console.log("nbTokensUser: ", nbTokensUser, ", remaining tokens: ", 16380 - nbTokensUser)
    // console.log("Msgs for openai:\n", msgs)
    return {
        model: "gpt-3.5-turbo-16k", //"gpt-3.5-turbo",
        messages: msgs,
        max_tokens: 16380 - nbTokensUser,
        n: 1,
        temperature: 0.7,
    }
}