import express from 'express';
import cors from 'cors';
import config from './config/index.js';
import apiRouter from './routes/api.js';
import mcpService from './services/mcpService.js';

const app = express();

// Config Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Bind API router
app.use('/api', apiRouter);

// Base health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    mcpInitialized: mcpService.initialized,
    aiProvider: config.ai.provider
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Express Server Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start Server & Initialize MCP Connection
const port = config.port;
const host = config.host;

app.listen(port, host, async () => {
  console.log(`==================================================`);
  console.log(`🚀 SLACK AI ASSISTANT SERVER RUNNING ON http://${host}:${port}`);
  console.log(`==================================================`);
  
  try {
    await mcpService.init();
  } catch (err) {
    console.warn("\n⚠️  MCP Initialize Warning: Slack MCP connection could not start.");
    console.warn("Reason:", err.message);
    console.warn("Server will continue running in MOCK mode. Configure tokens in settings to try again.\n");
  }
});
