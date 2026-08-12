require('dotenv').config();
const { ensureDatabaseSchema } = require('./src/utils/migrateOnStartup');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await ensureDatabaseSchema();
  
  app.listen(PORT, () => {
    console.log(`Barber API corriendo en puerto ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});


// modified

// modified

// modified

// modified
