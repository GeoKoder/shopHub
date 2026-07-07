import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log levels
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom format for detailed logging
const detailedFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

// Development logger
export const devLogger = morgan('dev');

// Production logger
export const prodLogger = morgan(detailedFormat, {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400
});

// Error logger
export const errorLogger = morgan(detailedFormat, {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Custom request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user ? req.user._id : null
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logData.method} ${logData.url} - ${logData.statusCode} - ${logData.duration}`);
    }

    // Log errors to file
    if (res.statusCode >= 400) {
      const errorLog = `${logData.timestamp} - ERROR - ${JSON.stringify(logData)}\n`;
      fs.appendFile(path.join(logsDir, 'error.log'), errorLog, (err) => {
        if (err) console.error('Error writing to error log:', err);
      });
    }
  });

  next();
};