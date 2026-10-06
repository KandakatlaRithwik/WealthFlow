const app = require('./app');
const connectDB = require('./config/db');
const { startScheduler } = require('./utils/reminderScheduler');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`WealthFlow API running on port ${PORT}`));
  if (process.env.DISABLE_SCHEDULER !== 'true') startScheduler();
});
