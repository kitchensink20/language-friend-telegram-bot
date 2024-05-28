const { Scenes } = require('telegraf');
const { configUser } = require('../service/user-service.js');
const { Pagination } =  require('telegraf-pagination');
const messages = require('../../messages.json');
const constants = require('../constants.js');
const dotenv = require('dotenv');

dotenv.config();

const languageList = constants.LANGUAGE_LIST;
const languageLevelList = constants.LANGUAGE_LEVEL_LIST;

const configScene = new Scenes.WizardScene(
    constants.Scenes.CONFIG_SCENE,
    async (ctx) => {
        ctx.session.data = {};
        const pagination = new Pagination({
            data: languageList,
            header: () => messages.chooseLanguage,
            isButtonsMode: true,
            isEnabledDeleteButton: false,
            onSelect: async (item) => {
                ctx.session.data.studying_language = item.value;
                await ctx.reply(`You chose ${item.displayName}`);
                const pagination = new Pagination({
                    data: languageLevelList,
                    header: () => messages.chooseLevel,
                    isButtonsMode: true,
                    isEnabledDeleteButton: false,
                    onSelect: async (item) => {
                        ctx.session.data.language_level = item.value;
                        ctx.reply(`You chose ${item.displayName}`);
                        const changedUserData = ctx.session.data;
                        const userId = ctx.from.id;
                        const updatedUser = await configUser(userId, changedUserData);
                        ctx.reply('Bot was successfully configured!');
                        ctx.session.userData = updatedUser;

                        return ctx.scene.leave();
                    },
                    buttonModeOptions: {
                        title: (item) => item.displayName,
                        payload: (item) => item.value,
                    },
                });

                pagination.handleActions(configScene);
                const text = await pagination.text();
                const keyboard = await pagination.keyboard();
                await ctx.reply(text, keyboard); 
            },
            buttonModeOptions: {
                title: (item) => item.displayName,
                payload: (item) => item.value,
            },
        });
        pagination.handleActions(configScene);
        const text = await pagination.text();
        const keyboard = await pagination.keyboard();
        ctx.reply(text, keyboard); 
    }, 
)

module.exports = configScene;