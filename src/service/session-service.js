const { getUserById } = require("./user-service");

const addMessageToSession = (ctx, messages) => {
    if (!ctx.session.history) {
        ctx.session.history = [];
    } 
    if (ctx.session.history.length >= 14) {
        ctx.session.history.shift();
    }
    ctx.session.history.push(...messages);
}

const initializeUserInSession = async (ctx) => {
    const userId = ctx.from.id;
    const user = await getUserById(userId);
    ctx.session.userData = user;
}

module.exports = {
    addMessageToSession,
    initializeUserInSession,
}