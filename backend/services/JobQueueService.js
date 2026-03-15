const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

// Create a generic Redis connection with graceful fallback
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        if (times > 3) {
            console.warn('[Redis] Connection failed after 3 attempts. Disabling background jobs.');
            return null; // Stop retrying
        }
        return Math.min(times * 50, 2000);
    }
});

let emailQueue = null;
let pdfQueue = null;

try {
    emailQueue = new Queue('EmailQueue', { connection });
    pdfQueue = new Queue('PdfReceiptQueue', { connection });

    const emailWorker = new Worker('EmailQueue', async job => {
        console.log(`[Worker - Email] Processing job ${job.id}`);
        const { to, subject, body } = job.data;
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`[Worker - Email] Successfully sent email to: ${to}`);
    }, { connection });

    const pdfWorker = new Worker('PdfReceiptQueue', async job => {
        console.log(`[Worker - PDF] Processing job ${job.id}`);
        const { transactionId, amount } = job.data;
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log(`[Worker - PDF] Generated receipt for tx: ${transactionId} ($${amount})`);
    }, { connection });

    emailWorker.on('error', err => console.error('[Email Worker Error]', err.message));
    pdfWorker.on('error', err => console.error('[PDF Worker Error]', err.message));

} catch (err) {
    console.error("[BullMQ] Failed to initialize queues. Is Redis running?", err.message);
}

// Export a safe wrapper
module.exports = {
    emailQueue: {
        add: async (name, data) => {
            if (emailQueue) return emailQueue.add(name, data);
            console.warn(`[Mock Queue] Would have added ${name} job:`, data);
        }
    },
    pdfQueue: {
        add: async (name, data) => {
            if (pdfQueue) return pdfQueue.add(name, data);
            console.warn(`[Mock Queue] Would have added ${name} job:`, data);
        }
    },
    connection 
};
