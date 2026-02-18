require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const bannedWords = ["badword1", "badword2"];

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

  if (content.startsWith("!kick")) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("You don't have permission to kick members.");
    }

    const member = message.mentions.members.first();
    if (!member) return message.reply("Please mention a user to kick.");

    await member.kick();
    return message.channel.send(`${member.user.tag} has been kicked.`);
  }

  // 🔹 AI Response
  if (!content.startsWith("!")) {
    try {
      await message.channel.sendTyping();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful and friendly Discord AI assistant." },
          { role: "user", content: message.content }
        ],
      });

      const reply = completion.choices[0].message.content;
      return message.reply(reply);

    } catch (error) {
      console.error(error);
      return message.reply("⚠️ AI error occurred.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
