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
  try {
    const canal = await client.channels.fetch(VOICE_CHANNEL_ID);
    if (!canal || canal.type !== ChannelType.GuildVoice) {
      console.log('❌ Canal no válido o no es de voz');
      return;
    }

    // Verificar permisos del bot
    const botMember = await canal.guild.members.fetch(client.user.id);
    if (!botMember.permissions.has('MoveMembers')) {
      console.log('❌ El bot no tiene permisos para mover miembros. Necesita el permiso "Move Members"');
      return;
    }

    if (canal.members.size === 0) {
      console.log('✅ No hay usuarios en el canal de voz');
      return;
    }

    console.log(`🔄 Desconectando ${canal.members.size} usuario(s) del canal...`);
    
    for (const [id, miembro] of canal.members) {
      try {
        await miembro.voice.disconnect();
        console.log(`✅ Desconectado: ${miembro.user.username}`);
      } catch (err) {
        console.error(`❌ Error al desconectar a ${miembro.user.username}: ${err.message}`);
      }
    }
    
    console.log('🎯 Proceso de desconexión completado');
  } catch (error) {
    console.error('❌ Error general en desconectarUsuarios:', error.message);
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
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
  console.log(`📅 Configurado para desconectar usuarios a las ${HORA_DESCONEXION.hora}:${HORA_DESCONEXION.minuto.toString().padStart(2, '0')}`);
  console.log(`🎯 Canal objetivo: ${VOICE_CHANNEL_ID}`);
  
  // Verificar que el canal existe
  client.channels.fetch(VOICE_CHANNEL_ID)
    .then(canal => {
      if (canal) {
        console.log(`✅ Canal encontrado: ${canal.name}`);
      } else {
        console.log('❌ No se pudo encontrar el canal especificado');
      }
    })
    .catch(err => {
      console.log('❌ Error al verificar el canal:', err.message);
    });
});

client.login(TOKENBOT);
