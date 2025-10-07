/**
 * Custom Playwright reporter that filters sensitive information from logs
 */
class SecureReporter {
  constructor(options = {}) {
    this.options = options;
    this.sensitivePatterns = [
      /password[s]?[:\s=]["']?([^"'\s\n]+)/gi,
      /token[s]?[:\s=]["']?([^"'\s\n]+)/gi,
      /secret[s]?[:\s=]["']?([^"'\s\n]+)/gi,
      /key[s]?[:\s=]["']?([^"'\s\n]+)/gi,
      /email[s]?[:\s=]["']?([^"'\s\n]+@[^"'\s\n]+)/gi,
      // Common patterns for credentials
      /Bearer\s+([A-Za-z0-9\-._~+/]+=*)/gi,
      /Basic\s+([A-Za-z0-9+/=]+)/gi,
    ];
  }

  filterSensitiveData(text) {
    if (typeof text !== 'string') return text;

    let filtered = text;
    this.sensitivePatterns.forEach((pattern) => {
      filtered = filtered.replace(pattern, (match, ...groups) => {
        // Replace the captured group with asterisks, keeping the structure
        const sensitiveValue = groups[0];
        if (sensitiveValue && sensitiveValue.length > 2) {
          const masked =
            sensitiveValue.slice(0, 2) +
            '*'.repeat(Math.min(8, sensitiveValue.length - 2));
          return match.replace(sensitiveValue, masked);
        }
        return match.replace(sensitiveValue, '***');
      });
    });

    return filtered;
  }

  onBegin(config, suite) {
    console.log(`🔒 Secure reporter enabled - sensitive data will be filtered`);
  }

  onTestBegin(test, result) {
    // Filter test title and annotations
    if (test.title) {
      test.title = this.filterSensitiveData(test.title);
    }
  }

  onStdOut(chunk, test, result) {
    const filtered = this.filterSensitiveData(chunk.toString());
    process.stdout.write(filtered);
  }

  onStdErr(chunk, test, result) {
    const filtered = this.filterSensitiveData(chunk.toString());
    process.stderr.write(filtered);
  }

  onTestEnd(test, result) {
    // Filter error messages
    if (result.error?.message) {
      result.error.message = this.filterSensitiveData(result.error.message);
    }
    if (result.error?.stack) {
      result.error.stack = this.filterSensitiveData(result.error.stack);
    }
  }

  onEnd(result) {
    console.log(`🔒 Test run completed with secure logging`);
  }
}

module.exports = SecureReporter;
