import app from './src/app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KaushalSetu Backend Server listening on http://localhost:${PORT}`);
  console.log(`📡 REST API mounted at http://localhost:${PORT}/api`);
});
