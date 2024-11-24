const { Command } = require('commander');
const express = require('express');
const app = express();

const program = new Command();

// Конфігурація командного рядка
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до кешу');

program.parse(process.argv);
const options = program.opts();

// Запуск сервера
app.get('/', (req, res) => {
  res.send('Сервер працює!');
});

app.listen(options.port, options.host, () => {
  const serverUrl = `http://${options.host}:${options.port}`;
  console.log(`Сервер запущено: ${serverUrl}`);
  console.log(`Кеш-файли знаходяться у: ${options.cache}`);
});
