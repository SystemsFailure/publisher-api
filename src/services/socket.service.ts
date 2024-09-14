import { Server } from 'socket.io';

class SocketService {
    private static io: Server;
    private static instance: SocketService;

    private constructor(server: any) {
        // Инициализируем сервер сокетов
        SocketService.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Настраиваем события сокета
        SocketService.io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            // Слушаем сообщения от клиента
            socket.on('message', (data) => {
                console.log('Message from client:', data);
                // Здесь можно обрабатывать сообщения от клиента
            });
        });
    }

    public static getInstance(server: any): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService(server);
        }
        return SocketService.instance;
    }

    public static sendNotification(notification: any): void {
        SocketService.io.emit('notification', notification);
    }

    public static sendToast(toast: any): void {
        SocketService.io.emit('toast', toast);
    }

    public static sendUpdateAutoload(data: any): void {
        SocketService.io.emit('update:autoload', data);
    }

    // Ошибки
    public static sendErrorUpdateAutoload(data: { result: boolean, message: string, platform: string}) {
        SocketService.io.emit('error:update:autoload', data);
    }
}

export default SocketService;
