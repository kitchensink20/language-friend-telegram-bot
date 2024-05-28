const { OpenAI } = require('openai');
require('dotenv').config();

const ORGANIZATION_ID = process.env.ORGANIZATION_ID;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;

const openai = new OpenAI({
    organization: ORGANIZATION_ID,
    apiKey: CHATGPT_API_KEY,
}); 

module.exports = { openai };