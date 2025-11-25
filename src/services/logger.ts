import db from '../database';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LoggerService {
    async log(level: LogLevel, message: string, meta?: any) {
        try {
            const timestamp = Date.now();
            const metaString = meta ? JSON.stringify(meta) : null;

            // Also log to console for dev visibility
            const consoleMsg = `[${level.toUpperCase()}] ${message}`;
            if (level === 'error') console.error(consoleMsg, meta || '');
            else if (level === 'warn') console.warn(consoleMsg, meta || '');
            else console.log(consoleMsg, meta || '');

            await db.runAsync(
                `INSERT INTO logs (level, message, meta, timestamp) VALUES (?, ?, ?, ?);`,
                [level, message, metaString, timestamp]
            );
        } catch (error) {
            // Fallback to console if DB fails
            console.error('Failed to save log to DB:', error);
        }
    }

    async info(message: string, meta?: any) {
        await this.log('info', message, meta);
    }

    async warn(message: string, meta?: any) {
        await this.log('warn', message, meta);
    }

    async error(message: string, meta?: any) {
        await this.log('error', message, meta);
    }

    async debug(message: string, meta?: any) {
        await this.log('debug', message, meta);
    }

    async getLogs(limit = 100, offset = 0) {
        try {
            return await db.getAllAsync(
                `SELECT * FROM logs ORDER BY timestamp DESC LIMIT ? OFFSET ?;`,
                [limit, offset]
            );
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return [];
        }
    }

    async clearLogs() {
        try {
            await db.runAsync('DELETE FROM logs;');
        } catch (error) {
            console.error('Failed to clear logs:', error);
        }
    }
}

export const Logger = new LoggerService();
