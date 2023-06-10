import * as fs from 'fs';
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";

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

export async function getCompletion(prompt: string) : Promise<string> {
    try {
    // Send a request to the OpenAI API to generate text
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
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
