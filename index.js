const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Initialize Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const COC_API_BASE_URL = 'https://cocproxy.royaleapi.dev/v1';

// Function to fetch clan data from Clash of Clans API
async function fetchClanData(clanTag) {
    try {
        const response = await axios.get(`${COC_API_BASE_URL}/clans/${encodeURIComponent(clanTag)}`, {
            headers: {
                Authorization: `Bearer ${process.env.COC_API_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching clan data:', error);
        return null;
    }
}

// Function to fetch player data from Clash of Clans API
async function fetchPlayerData(playerTag) {
    try {
        const response = await axios.get(`${COC_API_BASE_URL}/players/${encodeURIComponent(playerTag)}`, {
            headers: {
                Authorization: `Bearer ${process.env.COC_API_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching player data:', error);
        return null;
    }
}

// When the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'clan') {
        const clanTag = interaction.options.getString('tag');

        // Fetch clan data
        const clanData = await fetchClanData(clanTag);

        if (!clanData) {
            await interaction.reply(`Error: Could not fetch clan data for tag ${clanTag}.`);
            return;
        }

        // Construct clan embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${clanData.name} (${clanData.tag})`)
            .setDescription(clanData.description || 'No description available')
            .setThumbnail(clanData.badgeUrls.medium)
            .addFields(
                { name: 'Clan Level', value: `${clanData.clanLevel}`, inline: true },
                { name: 'Members', value: `${clanData.members}/50`, inline: true },
                { name: 'Clan Points', value: `${clanData.clanPoints}`, inline: true },
                { name: 'War Wins', value: `${clanData.warWins}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

        await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'player') {
        const playerTag = interaction.options.getString('tag');

        // Fetch player data
        const playerData = await fetchPlayerData(playerTag);

        if (!playerData) {
            await interaction.reply(`Error: Could not fetch player data for tag ${playerTag}.`);
            return;
        }

        // Construct player embed
        const embed = new EmbedBuilder()
            .setColor('#00ff99')
            .setTitle(`${playerData.name} (${playerData.tag})`)
            .setDescription(`Town Hall Level: ${playerData.townHallLevel}`)
            .addFields(
                { name: 'Experience Level', value: `${playerData.expLevel}`, inline: true },
                { name: 'Trophies', value: `${playerData.trophies}`, inline: true },
                { name: 'Best Trophies', value: `${playerData.bestTrophies}`, inline: true },
                { name: 'War Stars', value: `${playerData.warStars}`, inline: true },
                { name: 'Attack Wins', value: `${playerData.attackWins}`, inline: true },
                { name: 'Defense Wins', value: `${playerData.defenseWins}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() });

        await interaction.reply({ embeds: [embed] });
    }
});

// Register commands
client.once('ready', async () => {
    const commands = [
        {
            name: 'clan',
            description: 'Made by Jk',
            options: [
                {
                    name: 'tag',
                    type: 3, // STRING
                    description: 'Tag (e.g., #2P0LYQ09V)',
                    required: true
                }
            ]
        },
        {
            name: 'player',
            description: 'Made by Jk',
            options: [
                {
                    name: 'tag',
                    type: 3, // STRING
                    description: 'Tag (e.g., #2P0LYQ09V)',
                    required: true
                }
            ]
        }
    ];

    await client.application.commands.set(commands);
    console.log('Slash commands registered successfully!');
});

// Login to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);
