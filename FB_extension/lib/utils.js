// Utility functions for Facebook Marketplace Auto Poster Extension

(function() {
  /**
   * Utility class with common helper functions
   */
  class Utils {
    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    static generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Format date to readable string
     * @param {Date} date - Date object
     * @returns {string} Formatted date string
     */
    static formatDate(date) {
      if (!date) return '';
      
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'Agora mesmo';
      if (minutes < 60) return `${minutes} min atras`;
      if (hours < 24) return `${hours}h atras`;
      if (days < 7) return `${days} dias atras`;
      
      return date.toLocaleDateString('pt-BR');
    }

    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @returns {string} Formatted currency string
     */
    static formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }

    /**
     * Validate email format
     * @param {string} email - Email string
     * @returns {boolean} Is valid email
     */
    static isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML string
     * @returns {string} Sanitized HTML
     */
    static sanitizeHtml(html) {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
      if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            clonedObj[key] = Utils.deepClone(obj[key]);
          }
        }
        return clonedObj;
      }
    }

    /**
     * Convert file to base64
     * @param {File} file - File object
     * @returns {Promise<string>} Base64 string
     */
    static fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }

    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} type - MIME type
     */
    static downloadFile(data, filename, type = 'text/plain') {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    /**
     * Parse CSV data
     * @param {string} csvData - CSV string
     * @returns {Array} Parsed data array
     */
    static parseCSV(csvData) {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        }
      }

      return data;
    }

    /**
     * Convert array to CSV
     * @param {Array} data - Data array
     * @returns {string} CSV string
     */
    static arrayToCSV(data) {
      if (!data.length) return '';
      
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      return csvContent;
    }

    /**
     * Validate ad data
     * @param {Object} adData - Ad data object
     * @returns {Object} Validation result
     */
    static validateAdData(adData) {
      const errors = [];
      const warnings = [];

      // Required fields
      if (!adData.title || adData.title.trim().length === 0) {
        errors.push('Titulo e obrigatorio');
      } else if (adData.title.length > 100) {
        errors.push('Titulo deve ter no maximo 100 caracteres');
      }

      if (!adData.description || adData.description.trim().length === 0) {
        errors.push('Descricao e obrigatoria');
      } else if (adData.description.length > 1000) {
        errors.push('Descricao deve ter no maximo 1000 caracteres');
      }

      if (!adData.price || adData.price <= 0) {
        errors.push('Preco deve ser maior que zero');
      }

      if (!adData.category) {
        errors.push('Categoria e obrigatoria');
      }

      if (!adData.condition) {
        errors.push('Condicao do item e obrigatoria');
      }

      if (!adData.location || adData.location.trim().length === 0) {
        errors.push('Localizacao e obrigatoria');
      }

      // Warnings
      if (!adData.images || adData.images.length === 0) {
        warnings.push('Anuncios com imagens tem melhor performance');
      }

      if (!adData.brand || adData.brand.trim().length === 0) {
        warnings.push('Informar a marca pode aumentar a visibilidade');
      }

      if (!adData.tags || adData.tags.length === 0) {
        warnings.push('Tags ajudam na busca do seu anuncio');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after sleep
     */
    static sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retry function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} baseDelay - Base delay in milliseconds
     * @returns {Promise} Promise that resolves with function result
     */
    static async retry(fn, maxRetries = 3, baseDelay = 1000) {
      let lastError;
      
      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          if (i === maxRetries) break;
          
          const delay = baseDelay * Math.pow(2, i);
          await Utils.sleep(delay);
        }
      }
      
      throw lastError;
    }

    /**
     * Check if Facebook Marketplace page is loaded
     * @returns {boolean} Is marketplace page
     */
    static isMarketplacePage() {
      return window.location.href.includes('facebook.com/marketplace');
    }

    /**
     * Wait for element to appear
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element>} Promise that resolves with element
     */
    static waitForElement(selector, timeout = 10000) {
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }

        const observer = new MutationObserver((mutations, obs) => {
          const element = document.querySelector(selector);
          if (element) {
            obs.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

        setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    }

    /**
     * Log message with timestamp
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    static log(level, message, data = null) {
      const timestamp = new Date().toISOString();
      const logEntry = {
        timestamp,
        level,
        message,
        data
      };

      console[level](`[FB Auto Poster] ${timestamp} - ${message}`, data);

      // Store in extension storage for debugging
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['logs'], (result) => {
          const logs = result.logs || [];
          logs.push(logEntry);
          
          // Keep only last 100 logs
          if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
          }
          
          chrome.storage.local.set({ logs });
        });
      }
    }

    /**
     * Show notification
     * @param {string} title - Notification title
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     */
    static showNotification(title, message, type = 'info') {
      if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../assets/icons/icon48.png',
          title,
          message
        });
      }

      // Also log the notification
      Utils.log(type === 'error' ? 'error' : 'info', `${title}: ${message}`);
    }
  }

  // Export for use in other modules
  if (typeof window !== 'undefined') {
    window.Utils = Utils;
  }
})();

