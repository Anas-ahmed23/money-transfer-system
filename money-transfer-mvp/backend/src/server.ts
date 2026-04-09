import { createApp } from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
