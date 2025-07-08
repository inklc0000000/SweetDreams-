const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const TOKENBOT = process.env.TOKENBOT;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// === CONFIGURACIÓN ===
const VOICE_CHANNEL_ID = '1391973791516590131'; // ← Reemplaza con tu ID real
const HORA_DESCONEXION = { hora: 6, minuto: 30 }; // 6:30 AM

// Función para desconectar a todos los usuarios del canal
async function desconectarUsuarios() {
  const canal = await client.channels.fetch(VOICE_CHANNEL_ID);
  if (!canal || canal.type !== ChannelType.GuildVoice) {
    console.log('Canal no válido o no es de voz');
    return;
  }

  for (const [id, miembro] of canal.members) {
    try {
      await miembro.voice.disconnect();
      console.log(`Desconectado: ${miembro.user.username}`);
    } catch (err) {
      console.error(`Error al desconectar a ${miembro.user.username}: ${err.message}`);
    }
  }
}

// Verifica cada minuto si es hora de desconectar
setInterval(() => {
  const ahora = new Date();
  if (
    ahora.getHours() === HORA_DESCONEXION.hora &&
    ahora.getMinutes() === HORA_DESCONEXION.minuto
  ) {
    desconectarUsuarios();
  }
}, 60 * 1000); // cada minuto

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.login(TOKENBOT);
