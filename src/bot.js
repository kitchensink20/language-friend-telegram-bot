const { connectDB } = require('./config/db.js'); 
const { createUserIfNotExist } = require('./service/user-service.js');
const { Telegraf, Scenes, session } = require('telegraf');
const messages = require('../messages');
const constants = require('./constants.js');
const dotenv = require('dotenv');
const configScene = require('./scenes/configScene.js');
const { initializeUserInSession, addMessageToSession, clearSessionHistory } = require('./service/session-service.js');
const { getReplyFromChatGpt } = require('./service/chatgpt-service.js');
const express = require('express');

dotenv.config();
connectDB();

const token = process.env.TELEGRAM_BOT_TOKEN; 
const app = express();
const port = 3000;

const stage = new Scenes.Stage([configScene], { ttl: 60 });
const bot = new Telegraf(token);
bot.use(session({ ttl: 1200 }));
bot.use(stage.middleware());

bot.command('start', async (ctx) => {
    const user = ctx.from;
    await createUserIfNotExist(user);
    await initializeUserInSession(ctx);
    bot.telegram.sendMessage(ctx.chat.id, messages.welcome);
});

bot.command('config', async (ctx) => {
    clearSessionHistory(ctx);
    ctx.scene.enter(constants.Scenes.CONFIG_SCENE);
});

bot.on('message', async (ctx) => {
    try {
        let currentUser = ctx.session.userData;
        if (!currentUser) {
            await initializeUserInSession(ctx);
            currentUser = ctx.session.userData;
        }

        const { studying_language: userLanguage, language_level: userLanguageLevel } = currentUser;
        if (!userLanguage || !userLanguageLevel) {
            return ctx.reply(messages.configRequest);
        }

        const { text, caption, photo } = ctx.message;
        const messageText = text || caption || null;
        let messagePhotoUrl = null;

        if (photo) {
            const fileLink = await ctx.telegram.getFileLink(photo[1].file_id);
            messagePhotoUrl = fileLink.href;
        }

        if (messageText || messagePhotoUrl) {
            const newMessage = { role: 'user', content: [] };
            if (messageText) {
                newMessage.content.push({ 'type': 'text', 'text': messageText });
            }
            if (messagePhotoUrl) {
                newMessage.content.push({ 'type': 'image_url', 'image_url': { 'url': messagePhotoUrl } });
            }

            const contextMessages = ctx.session.history ? [...ctx.session.history, newMessage] : [newMessage];
            const reply = await getReplyFromChatGpt(contextMessages, userLanguage, userLanguageLevel);
            
            addMessageToSession(ctx, [newMessage, reply]);
            ctx.reply(reply.content);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        ctx.reply('An error occurred while processing your message. Please try again.');
    }
    
});

bot.launch().then(() => {
    console.log('Bot is running.');
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
  });
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});