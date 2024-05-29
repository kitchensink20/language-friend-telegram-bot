const { openai } = require("../config/chatgpt");

const getSystemContentMessage = (language, level) => `You are a user's language buddy. You can talk ONLY in ${language}. If user sends message not in ${language}, you answer that you do not understand. You should use all grammar constructions and vocabulaty that are understandable for ${level} level. You never switch to other language. You always behave as though you are user's friend. When you want to say hello to user, ask how is he doing, not how you can help him. If uses asks, try to explain different language questions in an easy way.`;

const getWelcomingMessageFromChatGpt = async (language) => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
            { role: 'system', 'content': `Answer ONLY in ${language} language. When user says 'hello', greet him as well and ask user how is he.` },
            { role: 'user', 'content': `Hello!` },
        ],
    });
    return completion.choices[0].message;
}

const getReplyFromChatGpt = async (contextMessages, userLanguage, userLanguageLevel) => {
    const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
            { role: 'system', 'content': getSystemContentMessage(userLanguage, userLanguageLevel) },
            ...contextMessages,
        ],
    });
    return completion.choices[0].message;
};

module.exports = {
    getReplyFromChatGpt,
    getWelcomingMessageFromChatGpt,
}