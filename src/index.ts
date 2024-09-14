import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import CommonRouter from '../src/routes/index';
import { Database } from './database/utils/Database';
import { corsOptions } from './helpers/cors.config';
import TaskScheduler from './services/queue/queue.service';
import http from 'http';
import SocketService from './services/socket.service';

const app: Express = express();
const port: number = 3035;

const server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(CommonRouter);

// CORS headers
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});

// СОКЕТ


// export const taskScheduler = new TaskScheduler({
//   host: 'localhost',
//   port: 6379
// }, 'task:autoload', 1);

// 1. Инициализация класса
const redisOptions = { host: 'localhost', port: 6379 };
const queueName = 'myQueue';
const dbNumber = 1; // Если требуется, иначе можно опустить этот параметр

TaskScheduler.initialize(redisOptions, queueName, dbNumber);


Database.connect().then(() => {
  server.listen(port, async () => {
    // const worker = await taskScheduler.processTasks({ autorun: false });
    // worker.run();

    // 3. Запустить обработчик задач
    TaskScheduler.processTasks()
      .then(worker => {
        console.log('Worker started successfully');
        // worker.run();
      })
      .catch(error => console.error('Error starting worker:', error));

    // Сокет
    SocketService.getInstance(server);

    console.debug(`Server is running on port ${port}`);
  });
});