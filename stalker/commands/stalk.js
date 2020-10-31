const { getUserFromMention, reply, respond } = require("../utils/utils");
const { default_debounce } = require("../config.json");

module.exports = {
  name: "stalk",
  description: "stalk user",
  usage: "`//stalk <user> <?timeout>`",
  args: true,
  execute(message, args) {
    let member = getUserFromMention(message, args[0]);
    if (!member) return reply(message, `Usage: ${this.usage}`);
    let debounce = Number.parseInt(args[1]);
    if (args[1] && (!debounce || debounce < default_debounce))
      return reply(
        message,
        `timeout should be a number, and can't be less than ${default_debounce} seconds`
      );
    let target = member.user;
    if (target.id == message.author.id)
      return reply(message, "You can't stalk yourself");
    var alreadyStalking = global.db
      .get("stalkers")
      .filter((s) => s.id == message.author.id && s.target == target.id)
      .value();
    if (alreadyStalking.length != 0) {
      reply(
        message,
        `You already stalk that person${
          message.guild.id != alreadyStalking[0].guildID
            ? " on another server"
            : ""
        }`
      );
      return;
    }
    let newStalker = {
      id: message.author.id,
      target: target.id,
      guildID: message.guild.id,
      last_notification: new Date(),
    };
    if (debounce) newStalker.debounce = debounce;
    global.db.get("stalkers").push(newStalker).write();
    respond(
      message,
      `${message.author.username} now stalks ${target.username}`
    );
  },
};