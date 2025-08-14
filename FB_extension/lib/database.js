// Database management for Facebook Marketplace Auto Poster Extension
// Uses IndexedDB for local storage

/**
 * Database manager class
 */
class Database {
  constructor() {
    this.dbName = 'FacebookMarketplaceAutoPoster';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Initialize database connection
   * @returns {Promise<IDBDatabase>} Database instance
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        Utils.log('error', 'Database initialization failed', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        Utils.log('info', 'Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this.createObjectStores(db);
      };
    });
  }

  /**
   * Create object stores (tables)
   * @param {IDBDatabase} db - Database instance
   */
  createObjectStores(db) {
    // Ads store
    if (!db.objectStoreNames.contains('ads')) {
      const adsStore = db.createObjectStore('ads', { keyPath: 'id' });
      adsStore.createIndex('status', 'status', { unique: false });
      adsStore.createIndex('createdAt', 'createdAt', { unique: false });
      adsStore.createIndex('scheduledAt', 'scheduledAt', { unique: false });
      adsStore.createIndex('category', 'category', { unique: false });
    }

    // Templates store
    if (!db.objectStoreNames.contains('templates')) {
      const templatesStore = db.createObjectStore('templates', { keyPath: 'id' });
      templatesStore.createIndex('name', 'name', { unique: false });
      templatesStore.createIndex('category', 'category', { unique: false });
    }

    // Settings store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }

    // Logs store
    if (!db.objectStoreNames.contains('logs')) {
      const logsStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
      logsStore.createIndex('timestamp', 'timestamp', { unique: false });
      logsStore.createIndex('level', 'level', { unique: false });
    }

    Utils.log('info', 'Database object stores created');
  }

  /**
   * Get transaction for store
   * @param {string} storeName - Store name
   * @param {string} mode - Transaction mode (readonly, readwrite)
   * @returns {IDBObjectStore} Object store
   */
  getStore(storeName, mode = 'readonly') {
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  // ADS MANAGEMENT

  /**
   * Save ad to database
   * @param {Object} adData - Ad data
   * @returns {Promise<string>} Ad ID
   */
  async saveAd(adData) {
    const ad = {
      id: adData.id || Utils.generateId(),
      title: adData.title,
      description: adData.description,
      price: parseFloat(adData.price),
      category: adData.category,
      condition: adData.condition,
      location: adData.location,
      brand: adData.brand || '',
      tags: adData.tags || [],
      images: adData.images || [],
      video: adData.video || null, // New video field
      status: adData.status || 'draft', // draft, scheduled, published, failed
      scheduledAt: adData.scheduledAt || null,
      publishedAt: adData.publishedAt || null,
      createdAt: adData.createdAt || new Date(),
      updatedAt: new Date(),
      attempts: adData.attempts || 0,
      lastError: adData.lastError || null
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('ads', 'readwrite');
      const request = store.put(ad);

      request.onsuccess = () => {
        Utils.log('info', `Ad saved: ${ad.title}`, { id: ad.id });
        resolve(ad.id);
      };

      request.onerror = () => {
        Utils.log('error', 'Failed to save ad', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get ad by ID
   * @param {string} id - Ad ID
   * @returns {Promise<Object>} Ad data
   */
  async getAd(id) {
    return new Promise((resolve, reject) => {
      const store = this.getStore('ads');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all ads with optional filter
   * @param {Object} filter - Filter options
   * @returns {Promise<Array>} Array of ads
   */
  async getAds(filter = {}) {
    return new Promise((resolve, reject) => {
      const store = this.getStore('ads');
      const request = store.getAll();

      request.onsuccess = () => {
        let ads = request.result;

        // Apply filters
        if (filter.status) {
          ads = ads.filter(ad => ad.status === filter.status);
        }

        if (filter.category) {
          ads = ads.filter(ad => ad.category === filter.category);
        }

        if (filter.dateFrom) {
          ads = ads.filter(ad => new Date(ad.createdAt) >= new Date(filter.dateFrom));
        }

        if (filter.dateTo) {
          ads = ads.filter(ad => new Date(ad.createdAt) <= new Date(filter.dateTo));
        }

        // Sort by creation date (newest first)
        ads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        resolve(ads);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Update ad status
   * @param {string} id - Ad ID
   * @param {string} status - New status
   * @param {Object} additionalData - Additional data to update
   * @returns {Promise<void>}
   */
  async updateAdStatus(id, status, additionalData = {}) {
    const ad = await this.getAd(id);
    if (!ad) {
      throw new Error(`Ad not found: ${id}`);
    }

    ad.status = status;
    ad.updatedAt = new Date();

    // Add additional data
    Object.assign(ad, additionalData);

    if (status === 'published') {
      ad.publishedAt = new Date();
    }

    return this.saveAd(ad);
  }

  /**
   * Delete ad
   * @param {string} id - Ad ID
   * @returns {Promise<void>}
   */
  async deleteAd(id) {
    return new Promise((resolve, reject) => {
      const store = this.getStore('ads', 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => {
        Utils.log('info', `Ad deleted: ${id}`);
        resolve();
      };

      request.onerror = () => {
        Utils.log('error', 'Failed to delete ad', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get scheduled ads
   * @returns {Promise<Array>} Array of scheduled ads
   */
  async getScheduledAds() {
    const ads = await this.getAds({ status: 'scheduled' });
    const now = new Date();
    
    return ads.filter(ad => 
      ad.scheduledAt && new Date(ad.scheduledAt) <= now
    );
  }

  // TEMPLATES MANAGEMENT

  /**
   * Save template
   * @param {Object} templateData - Template data
   * @returns {Promise<string>} Template ID
   */
  async saveTemplate(templateData) {
    const template = {
      id: templateData.id || Utils.generateId(),
      name: templateData.name,
      description: templateData.description || '',
      category: templateData.category,
      data: templateData.data,
      createdAt: templateData.createdAt || new Date(),
      updatedAt: new Date()
    };

    return new Promise((resolve, reject) => {
      const store = this.getStore('templates', 'readwrite');
      const request = store.put(template);

      request.onsuccess = () => {
        Utils.log('info', `Template saved: ${template.name}`);
        resolve(template.id);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all templates
   * @returns {Promise<Array>} Array of templates
   */
  async getTemplates() {
    return new Promise((resolve, reject) => {
      const store = this.getStore('templates');
      const request = store.getAll();

      request.onsuccess = () => {
        const templates = request.result;
        templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(templates);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete template
   * @param {string} id - Template ID
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    return new Promise((resolve, reject) => {
      const store = this.getStore('templates', 'readwrite');
      const request = store.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // SETTINGS MANAGEMENT

  /**
   * Save setting
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<void>}
   */
  async saveSetting(key, value) {
    const setting = { key, value, updatedAt: new Date() };

    return new Promise((resolve, reject) => {
      const store = this.getStore('settings', 'readwrite');
      const request = store.put(setting);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get setting
   * @param {string} key - Setting key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} Setting value
   */
  async getSetting(key, defaultValue = null) {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings');
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : defaultValue);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get all settings
   * @returns {Promise<Object>} Settings object
   */
  async getAllSettings() {
    return new Promise((resolve, reject) => {
      const store = this.getStore('settings');
      const request = store.getAll();

      request.onsuccess = () => {
        const settings = {};
        request.result.forEach(item => {
          settings[item.key] = item.value;
        });
        resolve(settings);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // STATISTICS

  /**
   * Get ads statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getStatistics() {
    const ads = await this.getAds();
    
    const stats = {
      total: ads.length,
      draft: ads.filter(ad => ad.status === 'draft').length,
      scheduled: ads.filter(ad => ad.status === 'scheduled').length,
      published: ads.filter(ad => ad.status === 'published').length,
      failed: ads.filter(ad => ad.status === 'failed').length,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    stats.thisWeek = ads.filter(ad => 
      new Date(ad.createdAt) >= weekAgo
    ).length;

    stats.thisMonth = ads.filter(ad => 
      new Date(ad.createdAt) >= monthAgo
    ).length;

    return stats;
  }

  // BULK OPERATIONS

  /**
   * Import ads from array
   * @param {Array} adsData - Array of ad data
   * @returns {Promise<Object>} Import result
   */
  async importAds(adsData) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const adData of adsData) {
      try {
        // Validate ad data
        const validation = Utils.validateAdData(adData);
        if (!validation.isValid) {
          results.failed++;
          results.errors.push({
            data: adData,
            errors: validation.errors
          });
          continue;
        }

        // Save ad
        await this.saveAd(adData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          data: adData,
          error: error.message
        });
      }
    }

    Utils.log('info', `Bulk import completed: ${results.success} success, ${results.failed} failed`);
    return results;
  }

  /**
   * Export ads to array
   * @param {Object} filter - Filter options
   * @returns {Promise<Array>} Array of ads
   */
  async exportAds(filter = {}) {
    const ads = await this.getAds(filter);
    
    // Remove internal fields for export
    return ads.map(ad => {
      const exportAd = { ...ad };
      delete exportAd.id;
      delete exportAd.createdAt;
      delete exportAd.updatedAt;
      delete exportAd.attempts;
      delete exportAd.lastError;
      return exportAd;
    });
  }

  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clearAllData() {
    const stores = ['ads', 'templates', 'settings', 'logs'];
    
    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const store = this.getStore(storeName, 'readwrite');
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    Utils.log('info', 'All data cleared');
  }
}

// Create global database instance
const db = new Database();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Database;
} else if (typeof window !== 'undefined') {
  window.Database = Database;
  window.db = db;
}

