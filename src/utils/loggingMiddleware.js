// Logging Middleware for URL Shortener App
// This middleware provides comprehensive logging functionality as required

class LoggingMiddleware {
  constructor() {
    this.logs = [];
    this.isEnabled = true;
  }

  log(level, message, data = null) {
    if (!this.isEnabled) return;

    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.logs.push(logEntry);
    

    if (window.location.hostname === 'localhost') {
      console.log(`[${logEntry.level}] ${logEntry.timestamp}: ${message}`, data || '');
    }

    
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }


  logUserAction(action, details = {}) {
    this.info(`User Action: ${action}`, {
      action,
      ...details,
      sessionId: this.getSessionId()
    });
  }

  
  logApiCall(method, url, payload = null, response = null) {
    this.info(`API Call: ${method} ${url}`, {
      method,
      url,
      payload,
      response,
      timestamp: new Date().toISOString()
    });
  }

  
  logError(error, context = '') {
    this.error(`Error in ${context}`, {
      message: error.message,
      stack: error.stack,
      context
    });
  }

 
  getSessionId() {
    if (!sessionStorage.getItem('sessionId')) {
      sessionStorage.setItem('sessionId', Date.now() + '-' + Math.random().toString(36).substr(2, 9));
    }
    return sessionStorage.getItem('sessionId');
  }

  
  getLogs(level = null) {
    if (level) {
      return this.logs.filter(log => log.level === level.toUpperCase());
    }
    return this.logs;
  }

 
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.info(`Logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

const logger = new LoggingMiddleware();


logger.info('Logging Middleware initialized', {
  userAgent: navigator.userAgent,
  url: window.location.href,
  sessionId: logger.getSessionId()
});

export default logger;
