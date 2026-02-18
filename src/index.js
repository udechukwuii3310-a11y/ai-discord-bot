require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= READY =================
client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ================= BAD WORD FILTER =================
const bannedWords = ["badword1", "badword2"]; // add real ones if you want

// ================= MESSAGE HANDLER =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  // 🔹 Moderation Filter
  if (bannedWords.some(word => content.includes(word))) {
    await message.delete();
    return message.channel.send(`${message.author}, watch your language.`);
  }

  // 🔹 Commands
  if (content === "!ping") {
    return message.reply("Pong 🏓");
  }

  if (content === "!help") {
    return message.reply(`
**Commands:**
!ping → Pong response
!help → Show commands
!kick @user → Kick a member
Talk normally → AI response
    `);
  }

  // 🔹 Kick Command (Moderation)
  if (content.startsWith("!kick")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("You don't have permission to kick members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("Please mention a user to kick.");

    await member.kick();
    return message.channel.send(`${member.user.tag} has been kicked.`);
  }

  // 🔹 Basic AI-style response (temporary)
  if (!content.startsWith("!")) {
    return message.reply(`You said: "${message.content}"`);
  }
});

client.login(process.env.DISCORD_TOKEN);
