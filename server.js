// server.js - серверная часть для симуляции данных
// server.js - серверная часть для симуляции данных
const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());

// Обслуживание статичных файлов для клиента
app.use(express.static('public'));

// Создание HTTPS сервера (используйте сертификаты для продакшна)
const server = https.createServer({
  key: fs.readFileSync('key.pem'), // Путь к приватному ключу
  cert: fs.readFileSync('cert.pem'), // Путь к сертификату
}, app);

const wss = new WebSocket.Server({ server });

// Генерация случайных данных для судов
const ships = Array.from({ length: 10 }, (_, i) => ({
  id: `ship-${i + 1}`,
  name: `Ship ${i + 1}`,
  latitude: 40 + Math.random() * 20,
  longitude: -70 + Math.random() * 20,
  cargoStatus: Math.random() > 0.5 ? 'Loaded' : 'Empty',
}));

// Обновление данных судов
function updateShipData() {
  ships.forEach((ship) => {
    ship.latitude += (Math.random() - 0.5) * 0.1;
    ship.longitude += (Math.random() - 0.5) * 0.1;
    ship.cargoStatus = Math.random() > 0.5 ? 'Loaded' : 'Empty';
  });
}

// Отправка данных через WebSocket
function broadcastShipData() {
  const data = JSON.stringify(ships);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

setInterval(() => {
  updateShipData();
  broadcastShipData();
}, 5000);

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify(ships));

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(443, () => {
  console.log('Server is running on port 443');
});
