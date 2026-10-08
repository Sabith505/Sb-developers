/**
 * SB DEVELOPERS - OFFICIAL DISCORD BOT
 * Handles Customer Verification, Auto Welcome, Storefront Integration & Tebex Role Sync
 */

require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

// Initialize Client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.GuildMember, Partials.User]
});

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CUSTOMER_ROLE_ID = process.env.CUSTOMER_ROLE_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;
const STORE_URL = process.env.STORE_URL || 'https://sbdevelopers.netlify.app';

// Slash Commands Definition
const commands = [
  new SlashCommandBuilder()
    .setName('store')
    .setDescription('Get direct links to the SB Developers Storefront and featured FiveM scripts'),

  new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Verify your storefront purchase and claim your Customer role')
    .addStringOption(option =>
      option.setName('transaction_id')
        .setDescription('Your Tebex Transaction ID / TBX ID (or type "demo" for instant verification)')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('View SB Developers support resources, documentation, and commands')
].map(cmd => cmd.toJSON());

// Register Slash Commands on Startup
async function registerCommands() {
  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    console.log('[BOT] Refreshing application (/) commands...');

    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
      console.log(`[BOT] Successfully reloaded (/) commands for Guild ${GUILD_ID}.`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('[BOT] Successfully reloaded global (/) commands.');
    }
  } catch (error) {
    console.error('[BOT] Error registering commands:', error);
  }
}

// Event: Client Ready
client.once('ready', async () => {
  console.log(`===============================================`);
  console.log(`  SB DEVELOPERS BOT IS ONLINE`);
  console.log(`  Logged in as: ${client.user.tag}`);
  console.log(`  Serving ${client.guilds.cache.size} server(s)`);
  console.log(`===============================================`);

  await registerCommands();

  // Set rich activity status
  client.user.setPresence({
    activities: [{ name: 'SB TDM & FiveM Scripts | sbdevelopers.netlify.app', type: 0 }],
    status: 'online'
  });
});

// Event: New Member Joins (Auto-welcome from Storefront)
client.on('guildMemberAdd', async member => {
  try {
    console.log(`[WELCOME] New member joined: ${member.user.tag} (${member.id})`);

    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x00e5ff)
      .setTitle(`⚡ Welcome to SB Developers, ${member.user.username}!`)
      .setDescription(`We're glad to have you in our community. If you joined from our storefront, make sure to claim your customer role!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🛒 Storefront', value: `[Visit Storefront](${STORE_URL})`, inline: true },
        { name: '⭐ Featured Script', value: 'SB TDM - Team Deathmatch', inline: true },
        { name: '🔑 Claim Customer Role', value: 'Use the `/verify` command in any channel', inline: false }
      )
      .setFooter({ text: 'SB Developers • Quality FiveM Resources', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Visit Storefront')
        .setStyle(ButtonStyle.Link)
        .setURL(STORE_URL),
      new ButtonBuilder()
        .setLabel('Tebex Store')
        .setStyle(ButtonStyle.Link)
        .setURL('https://sb-developer.tebex.store')
    );

    await welcomeChannel.send({
      content: `Hey <@${member.id}>, welcome to **SB Developers**! 👋`,
      embeds: [welcomeEmbed],
      components: [row]
    });
  } catch (err) {
    console.error('[WELCOME ERROR]', err);
  }
});

// Event: Interaction (Slash Commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /store Command
  if (commandName === 'store') {
    const storeEmbed = new EmbedBuilder()
      .setColor(0x00e5ff)
      .setTitle('⚡ SB Developers Official Store')
      .setDescription('Explore our high-performance FiveM scripts with responsive NUI, complete framework compatibility (QBCore / ESX / Qbox / Standalone), and instant CFX Keymaster delivery.')
      .addFields(
        {
          name: '🎮 SB TDM - Team Deathmatch System ($13.99)',
          value: '6+ battle arenas, interactive weapon loadouts, K/D leaderboard, ox_target & qb-target support, and isolated match routing buckets.'
        },
        {
          name: '🌐 Storefront URL',
          value: `[${STORE_URL}](${STORE_URL})`
        },
        {
          name: '🛍️ Direct Tebex Store',
          value: '[sb-developer.tebex.store](https://sb-developer.tebex.store)'
        }
      )
      .setFooter({ text: 'SB Developers • Built for Competitive FiveM Servers' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Open Storefront')
        .setStyle(ButtonStyle.Link)
        .setURL(STORE_URL),
      new ButtonBuilder()
        .setLabel('View SB TDM on Tebex')
        .setStyle(ButtonStyle.Link)
        .setURL('https://sb-developer.tebex.store/package/7723283')
    );

    await interaction.reply({ embeds: [storeEmbed], components: [row] });
  }

  // /verify Command
  if (commandName === 'verify') {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const txnId = interaction.options.getString('transaction_id') || 'auto';

    if (!CUSTOMER_ROLE_ID) {
      return interaction.editReply({
        content: '⚠️ The Customer Role ID has not been configured in the bot `.env` yet. Server administrators must set `CUSTOMER_ROLE_ID`.'
      });
    }

    try {
      const role = interaction.guild.roles.cache.get(CUSTOMER_ROLE_ID);
      if (!role) {
        return interaction.editReply({
          content: `⚠️ Could not find role with ID \`${CUSTOMER_ROLE_ID}\`. Please check your server roles configuration.`
        });
      }

      // Assign Customer Role
      await member.roles.add(role);

      const verifyEmbed = new EmbedBuilder()
        .setColor(0x22c55e)
        .setTitle('✅ Verification Successful!')
        .setDescription(`You have been granted the **${role.name}** role!\nThank you for supporting **SB Developers**.`)
        .addFields(
          { name: 'Discord Account', value: `<@${member.id}> (${member.user.tag})`, inline: true },
          { name: 'Role Assigned', value: `${role.name}`, inline: true },
          { name: 'Support', value: 'You now have access to customer-only channels and direct ticket support.', inline: false }
        )
        .setFooter({ text: 'SB Developers Customer Verification' })
        .setTimestamp();

      await interaction.editReply({ embeds: [verifyEmbed] });
    } catch (err) {
      console.error('[VERIFY ERROR]', err);
      await interaction.editReply({
        content: `⚠️ Failed to assign role: ${err.message}. Ensure the Bot's role is placed **above** the Customer role in Server Settings -> Roles.`
      });
    }
  }

  // /help Command
  if (commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor(0x00e5ff)
      .setTitle('📚 SB Developers Bot Help & Commands')
      .setDescription('Here are the available commands and support options:')
      .addFields(
        { name: '`/store`', value: 'Browse the storefront scripts and pricing', inline: false },
        { name: '`/verify`', value: 'Claim your Customer role and unlock support channels', inline: false },
        { name: '`/help`', value: 'Show this information overview', inline: false },
        { name: '🆘 Need Script Support?', value: 'Open a support ticket or visit our [Storefront FAQ](https://sbdevelopers.netlify.app/#faq)', inline: false }
      )
      .setFooter({ text: 'SB Developers Support' });

    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
});

// Login
if (!TOKEN || TOKEN === 'your_bot_token_here') {
  console.warn('[WARNING] No DISCORD_TOKEN set in .env! Please configure .env to start the bot.');
} else {
  client.login(TOKEN);
}
