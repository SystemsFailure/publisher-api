import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import AvitoAutoloadService from '../autoload/avito.autoload';
import { AutoloadService } from '../../database/services/AutoloadService';
import { IAutoloadState } from '../../types';
import SocketService from '../socket.service';
import CianAutoloadService from '../autoload/cian.autoload';
import YoulaAutoloadService from '../autoload/youla.autoload';

class TaskScheduler {
    private static redisClient: Redis | null = null;
    private static queue: Queue | null = null;
    private static worker: Worker | null = null;
    private static queueName: string = '';

    private constructor() {
        // Prevent instantiation
    }

    public static initialize(redisOptions: { host: string, port: number }, queueName: string, dbNumber: number = 1) {
        if (!TaskScheduler.redisClient) {
            TaskScheduler.redisClient = new Redis({
                ...redisOptions,
                db: dbNumber,
                maxRetriesPerRequest: null, // Set maxRetriesPerRequest to null
            });
        }

        if (!TaskScheduler.queue) {
            TaskScheduler.queueName = queueName;
            TaskScheduler.queue = new Queue(queueName, { connection: TaskScheduler.redisClient });
        }
    }

    public static async scheduleTask(executionTime: string, jobData: { platform: string, id: string, officeId: string }) {
        if (!TaskScheduler.queue) {
            throw new Error('Queue not initialized. Call initialize() first.');
        }

        const delay = new Date(executionTime).getTime() - Date.now();
        if (delay < 0) {
            throw new Error('Execution time must be in the future.');
        }

        await TaskScheduler.queue.add(TaskScheduler.queueName, jobData, { delay });
        console.log(`Task scheduled to run at ${executionTime}`);
    }

    public static async processTasks(workerOptions: any = {}) {
        if (TaskScheduler.worker) {
            throw new Error('Worker is already running.');
        }

        if (!TaskScheduler.queue) {
            throw new Error('Queue not initialized. Call initialize() first.');
        }

        TaskScheduler.worker = new Worker(TaskScheduler.queueName, async (job: Job) => {
            const { platform, officeId, id } = job.data;
            try {
                const result = await TaskScheduler.runPlatformTask(platform, id, officeId);
                if (result?.result) {
                    await TaskScheduler.updateAutoload(id, platform);
                }
            } catch (error: any) {
                console.error(`Error processing job ${job.id}:`, error?.message);
                if (platform === 'youla') {
                    if (error?.message === 'feed limit is reached') {
                        console.log("Превышен лимит кол-ва одновременно созданных и запущенных фидов для Юлы");

                        // Обновляем статус при ошибке
                        const autoloadService = new AutoloadService();
                        await autoloadService.updateAutoload(id, { status: IAutoloadState.pending });

                        SocketService.sendErrorUpdateAutoload({ platform, result: false, message: 'Превышен лимит кол-ва одновременно созданных и запущенных фидов для Юлы' });

                    }
                }
            }
        }, {
            connection: TaskScheduler.redisClient,
            removeOnFail: { count: 0 },
            removeOnComplete: { count: 0 },
            concurrency: 5, // Устанавливаем максимальное количество одновременных задач
            ...workerOptions,
        });

        TaskScheduler.worker.on('completed', (job: Job) => {
            console.log(`Job ${job.id} completed`);
        });

        TaskScheduler.worker.on('failed', (job: Job | undefined, error: Error) => {
            if (job) {
                console.error(`Job ${job.id} failed: ${error.message}`);
            } else {
                console.error(`Job undefined failed: ${error.message}`);
            }
        });

        return TaskScheduler.worker;
    }

    private static async runPlatformTask(platform: string, id: string, officeId: string) {
        switch (platform) {
            case 'avito': {
                const avitoAutoloadService = new AvitoAutoloadService();
                return avitoAutoloadService.run(id, officeId);
            }
            case 'cian': {
                const cianAutoloadService = new CianAutoloadService();
                return cianAutoloadService.run(id, officeId);
            }
            case 'youla': {
                const youlaAutoloadService = new YoulaAutoloadService();
                return youlaAutoloadService.run(id, officeId);
            }
            default: {
                throw new Error(`Unsupported platform: ${platform}`);
            }
        }
    }

    private static async updateAutoload(id: string, platform: string) {
        const autoloadService = new AutoloadService();
        await autoloadService.updateAutoload(id, { status: IAutoloadState.published });
        SocketService.sendUpdateAutoload({ autoloadId: id, result: true, platform });
    }
}

export default TaskScheduler;
