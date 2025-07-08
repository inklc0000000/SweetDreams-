const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
require('dotenv').config();

const TOKENBOT = process.env.TOKENBOT;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// === CONFIGURACIÓN ===
const VOICE_CHANNEL_ID = '1347361122826715166'; // ← Reemplaza con ID del canal de voz
const HORA_DESCONEXION = { hora: 5, minuto: 0 }; // 11:00 PM

let voiceConnection = null;

// Función para unirse al canal de voz
async function unirseACanal() {
  try {
    const canal = await client.channels.fetch(VOICE_CHANNEL_ID);
    if (!canal || canal.type !== ChannelType.GuildVoice) {
      console.log('❌ Canal no válido o no es de voz');
      return false;
    }

    // Verificar si ya está conectado
    const existingConnection = getVoiceConnection(canal.guild.id);
    if (existingConnection) {
      console.log('✅ Bot ya está conectado al canal de voz');
      voiceConnection = existingConnection;
      return true;
    }

    voiceConnection = joinVoiceChannel({
      channelId: canal.id,
      guildId: canal.guild.id,
      adapterCreator: canal.guild.voiceAdapterCreator,
    });

    console.log(`🎤 Bot se unió al canal: ${canal.name}`);
    return true;
  } catch (error) {
    console.error('❌ Error al unirse al canal:', error.message);
    return false;
  }
}

// Función para desconectar a todos los usuarios del canal
async function desconectarUsuarios() {
  try {
    const canal = await client.channels.fetch(VOICE_CHANNEL_ID);
    if (!canal || canal.type !== ChannelType.GuildVoice) {
      console.log('❌ Canal no válido o no es de voz');
      return;
    }

    // Verificar permisos del bot
    const botMember = await canal.guild.members.fetch(client.user.id);
    if (!botMember.permissions.has('MoveMembers')) {
      console.log('❌ El bot no tiene permisos para mover miembros');
      return;
    }

    const usuariosEnCanal = canal.members.filter(member => !member.user.bot);
    
    if (usuariosEnCanal.size === 0) {
      console.log('✅ No hay usuarios para desconectar');
      return;
    }

    console.log(`🌙 ¡Es hora de dormir! Desconectando ${usuariosEnCanal.size} usuario(s)...`);
    
    for (const [id, miembro] of usuariosEnCanal) {
      try {
        await miembro.voice.disconnect();
        console.log(`😴 ${miembro.user.username} ha sido desconectado - ¡Buenas noches!`);
      } catch (err) {
        console.error(`❌ Error al desconectar a ${miembro.user.username}: ${err.message}`);
      }
    }
    
    console.log('🌟 ¡Todos desconectados! Que tengan dulces sueños 💤');
  } catch (error) {
    console.error('❌ Error en desconectarUsuarios:', error.message);
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

client.once('ready', async () => {
  console.log(`🤖 SweetDreams Bot conectado como ${client.user.tag}`);
  console.log(`🌙 Configurado para desconectar usuarios a las ${HORA_DESCONEXION.hora}:${HORA_DESCONEXION.minuto.toString().padStart(2, '0')}`);
  
  // Unirse automáticamente al canal al iniciar
  const conectado = await unirseACanal();
  if (conectado) {
    console.log('🎯 Bot listo para Sweet Dreams! 💤');
  } else {
    console.log('⚠️ No se pudo conectar al canal. Verifique la configuración.');
  }
});

client.login(TOKENBOT);
