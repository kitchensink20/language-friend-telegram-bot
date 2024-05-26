const { connectDB } = require('./config/db.js'); 
const { createUserIfNotExist, getUserById } = require('./service/user-service.js');
const { Telegraf, Scenes, session } = require('telegraf');
const messages = require('../messages');
const constants = require('./constants.js');
const dotenv = require('dotenv');
const configScene = require('./scenes/configScene.js');
const { openai, getSystemContentMessage } = require('./config/chatgpt.js')

dotenv.config();
connectDB();

const token = process.env.TELEGRAM_BOT_TOKEN; 

const stage = new Scenes.Stage([configScene], { ttl: 10 });
const bot = new Telegraf(token);
bot.use(session({ ttl: 600 }));
bot.use(stage.middleware());

bot.command('start', async (ctx) => {
    const user = ctx.from;
    ctx.session.userData = await createUserIfNotExist(user);
    ctx.session.history = [];
    bot.telegram.sendMessage(ctx.chat.id, messages.welcome);
});

bot.command('config', async (ctx) => {
    ctx.session.history = [];
    ctx.scene.enter(constants.Scenes.CONFIG_SCENE);
});

bot.on('message', async (ctx) => {
    let currentUser = ctx.session.userData;
    if (!currentUser) {
        const userId = ctx.from.id;
        const user = await getUserById(userId);
        ctx.session.userData = user;
        currentUser = ctx.session.userData;
    }

    if (!ctx.session.history) {
        ctx.session.history = [];
    }

    const userLanguage = currentUser.studying_language;
    const userLanguageLevel = currentUser.language_level;
    if (!userLanguage || !userLanguageLevel) {
        ctx.reply(messages.configRequest);
        return;
    }

    const userInput = ctx.message.text;

    console.log(ctx.session.history)

    if (userInput) {  
        const newUserMessage = { role: 'user', content: userInput };
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', 'content': getSystemContentMessage(userLanguage, userLanguageLevel) },
                ...ctx.session.history,
                { role: 'user', content: userInput },
            ],
        });
        ctx.session.history.push(newUserMessage, completion.choices[0].message)
        ctx.reply(completion.choices[0].message.content);
    }
});

bot.launch().then(() => {
    console.log('Bot is running.');
});
