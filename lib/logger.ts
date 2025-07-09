export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
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