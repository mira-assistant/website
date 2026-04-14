import express from 'express';
import { BrowserWindow } from 'electron';
import os from 'os';

let webhookServer: any = null;

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) continue;

    for (const net of nets) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

export function startWebhookServer(port: number, mainWindow: BrowserWindow): string {
  const app = express();
  app.use(express.json());

  app.post('/webhook', (req, res) => {
    const event = req.body.event;

    console.log('📥 Webhook received:', req.body);

    if (event === 'service_status') {
      mainWindow.webContents.send('service-status-changed', req.body);
    } else if (event === 'action') {
      mainWindow.webContents.send('webhook-action', req.body);
    } else {
      mainWindow.webContents.send('new-interaction', req.body);
    }

    res.status(200).json({ received: true });
  });

  // Listen on all interfaces so Docker can reach it
  webhookServer = app.listen(port, '0.0.0.0');

  // Use WEBHOOK_HOST from .env
  const webhookHost = process.env.WEBHOOK_HOST || getLocalIpAddress();
  const webhookUrl = `http://${webhookHost}:${port}/webhook`;

  return webhookUrl;
}

export function stopWebhookServer() {
  if (webhookServer) {
    webhookServer.close();
    webhookServer = null;
  }
}