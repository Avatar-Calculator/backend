import Redis from 'ioredis';

export module RedisDB {
    const redis = new Redis({
        host: '127.0.0.1',
        port: 6379,
    });
    const defaultTimeout = 86400 //1 Day

    export async function getData(key: string): Promise<any> {
        const data = await redis.get(key);
        return JSON.parse(data);
    }

    export async function setData(key: string, data: any, timeout?: number): Promise<void> {
        if(timeout) {
            await redis.set(key, JSON.stringify(data), 'EX', timeout)
        } else {
            await redis.set(key, JSON.stringify(data), 'EX', defaultTimeout)
        }   
    }
}