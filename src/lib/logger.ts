type LogLevel = "info" | "warn" | "error" | "debug"

interface LogEntry {
  level: LogLevel
  message: string
  data?: unknown
  timestamp: string
}

class Logger {
  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    }

    if (process.env.NODE_ENV === "development") {
      const consoleMethod = level === "info" ? "log" : level
      if (data) {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data)
      } else {
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`)
      }
    } else {
      // In production, output structured JSON for log aggregators
      // Using console.log/error ensures it goes to stdout/stderr
      const output = JSON.stringify(entry)
      if (level === "error") {
        console.error(output)
      } else {
        console.log(output)
      }
    }
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data)
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data)
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data)
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data)
  }
}

export const logger = new Logger()
