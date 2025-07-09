export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args); // Changed from console.debug to console.log
    }
  },
  info: (...args: any[]) => {
    console.log(...args);
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  error: (...args: any[]) => {
    const [message, errorObj, ...rest] = args;
    if (errorObj && typeof errorObj === 'object' && errorObj !== null) {
      console.error(message, errorObj.message || '', errorObj.details || '', errorObj.hint || '', errorObj, ...rest);
    } else {
      console.error(...args);
    }
  },
}; 