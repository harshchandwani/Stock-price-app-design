import { createClient, RedisClientType } from 'redis';
const client = createClient();
export class PubSubManager {
    private static instance: PubSubManager;
    private redisClient: RedisClientType;
    //for mulitple stocks we have to keep track of the subscribers, so we are having a map here
    private subscriptions: Map<string, string[]>;

    private constructor() {
        // Create a Redis client and connect to the Redis server
        this.redisClient = createClient();
        this.redisClient.connect();
        this.subscriptions = new Map();
    }

    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance
    }
    async userSubscribe(userId: string, stockName: string) {
        //Basically I need to add the user that particular stock pub sub as subscriber here
        if (!this.subscriptions.has(stockName)) {
            this.subscriptions.set(stockName, []);
        }
        this.subscriptions.get(stockName)?.push(userId);

        if (this.subscriptions.get(stockName)?.length === 1) {
            console.log("subscribing to stock", stockName);
        }

    }
    public userUnSubscribe(userId: string, stock: string) {
        this.subscriptions.set(stock, this.subscriptions.get(stock)?.filter((sub) => sub !== userId) || []);

        if (this.subscriptions.get(stock)?.length === 0) {
            this.redisClient.unsubscribe(stock);
            console.log(`UnSubscribed to Redis channel: ${stock}`);
        }
    }
    // Define the method that will be called when a message is published to the subscribed channel
    private handleMessage(stock: string, message: string) {
        console.log(`Message received on channel ${stock}: ${message}`);
        this.subscriptions.get(stock)?.forEach((sub) => {
            console.log(`Sending message to user: ${sub}`);
        });
    }

    // Cleanup on instance destruction
    public async disconnect() {
        await this.redisClient.quit();
    }
}

