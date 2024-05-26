const { Configuration, OpenAIApi } = require('openai');
console.log(Configuration, OpenAIApi)
require('dotenv').config();

const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;

const configuration = new Configuration({
    organization: ORGANIZATION_ID,
    apiKey: CHATGPT_API_KEY,
}); 

const openai = new OpenAIApi(configuration);

const completion = await openai.createChatCompletetion({
    model: 'gpt-3.5-turbo',
    messages: [
        { role: 'user', content: 'hello world' }
    ]
})