import { app } from './app';
const PORT = Number.parseInt(process.env.PORT ?? '4000', 10);

const server = app.listen(PORT, () => {
  console.log(`Hyperliquid Quest backend listening on http://localhost:${PORT}`);
});

const shutdownSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

for (const signal of shutdownSignals) {
  process.once(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    server.close((error) => {
      if (error) {
        console.error('Error closing HTTP server', error);
      }
      process.exit(error ? 1 : 0);
    });
  });
}
