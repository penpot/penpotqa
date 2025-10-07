#!/usr/bin/env node

/**
 * Script to clean sensitive data from existing Playwright trace files
 * Run this before uploading traces to ensure no credentials are exposed
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class TraceSecurityCleaner {
  constructor() {
    this.sensitivePatterns = [
      // Email patterns
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      // Common password patterns in traces
      /"--password":"[^"]*"/g,
      /"password":"[^"]*"/g,
      /"--email":"[^"]*"/g,
      /"email":"[^"]*"/g,
      // Token patterns
      /"token":"[^"]*"/g,
      /"authorization":"[^"]*"/g,
      /"bearer [^"]*"/gi,
    ];
  }

  async cleanTraceDirectory(dirPath = './test-results') {
    try {
      console.log('🔍 Scanning for trace files...');

      const files = await this.findTraceFiles(dirPath);
      console.log(`📁 Found ${files.length} trace files to process`);

      for (const file of files) {
        await this.processTraceFile(file);
      }

      console.log('✅ Trace cleaning completed');
    } catch (error) {
      console.error('❌ Error cleaning traces:', error.message);
    }
  }

  async findTraceFiles(dirPath) {
    const traceFiles = [];

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findTraceFiles(fullPath);
          traceFiles.push(...subFiles);
        } else if (item.name.includes('trace') && item.name.endsWith('.zip')) {
          traceFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, that's okay
    }

    return traceFiles;
  }

  async processTraceFile(filePath) {
    console.log(`🔒 Processing: ${path.basename(filePath)}`);

    try {
      // Create a backup
      const backupPath = filePath + '.backup';
      await fs.copyFile(filePath, backupPath);

      // Extract, clean, and repackage
      const tempDir = filePath + '_temp';

      // Extract trace
      await execAsync(`unzip -q "${filePath}" -d "${tempDir}"`);

      // Clean JSON files in the extracted trace
      await this.cleanExtractedTrace(tempDir);

      // Repackage
      await execAsync(
        `cd "${tempDir}" && zip -q -r "../${path.basename(filePath)}" .`,
      );

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
      await fs.rm(backupPath); // Remove backup if successful

      console.log(`✅ Cleaned: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`❌ Failed to process ${filePath}:`, error.message);
    }
  }

  async cleanExtractedTrace(traceDir) {
    const files = await fs.readdir(traceDir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(traceDir, file.name);

      if (
        file.isFile() &&
        (file.name.endsWith('.json') || file.name.endsWith('.jsonl'))
      ) {
        await this.cleanJsonFile(fullPath);
      } else if (file.isDirectory()) {
        await this.cleanExtractedTrace(fullPath);
      }
    }
  }

  async cleanJsonFile(filePath) {
    try {
      let content = await fs.readFile(filePath, 'utf8');
      let modified = false;

      // Apply all sensitive patterns
      for (const pattern of this.sensitivePatterns) {
        const originalContent = content;
        content = content.replace(pattern, (match) => {
          if (match.includes('@')) {
            // Email replacement
            return match.replace(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
              'user***@***.com',
            );
          } else if (match.includes('password')) {
            // Password replacement
            return match.replace(/"[^"]*"/, '"***"');
          } else if (match.includes('email')) {
            // Email field replacement
            return match.replace(/"[^"]*"/, '"user***@***.com"');
          } else {
            // Generic sensitive data replacement
            return match.replace(/"[^"]*"/, '"***"');
          }
        });

        if (originalContent !== content) {
          modified = true;
        }
      }

      if (modified) {
        await fs.writeFile(filePath, content, 'utf8');
      }
    } catch (error) {
      // Skip files that can't be processed
    }
  }
}

// CLI usage
if (require.main === module) {
  const cleaner = new TraceSecurityCleaner();
  const targetDir = process.argv[2] || './test-results';

  console.log('🔒 Playwright Trace Security Cleaner');
  console.log(`📂 Target directory: ${targetDir}`);

  cleaner.cleanTraceDirectory(targetDir);
}

module.exports = TraceSecurityCleaner;
