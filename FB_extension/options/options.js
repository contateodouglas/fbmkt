// Options page JavaScript for Facebook Marketplace Auto Poster Extension

/**
 * Options page manager
 */
class OptionsManager {
  constructor() {
    this.currentSection = 'general';
    this.settings = {};
    this.isInitialized = false;
  }

  /**
   * Initialize options page
   */
  async init() {
    if (this.isInitialized) return;

    console.log('[Options] Initializing...');

    try {
      // Initialize database
      await db.init();

      // Load current settings
      await this.loadSettings();

      // Set up event listeners
      this.setupEventListeners();

      // Set up navigation
      this.setupNavigation();

      // Load statistics
      await this.loadStatistics();

      // Apply current theme
      this.applyTheme();

      this.isInitialized = true;
      console.log('[Options] Initialized successfully');

    } catch (error) {
      console.error('[Options] Initialization failed:', error);
      this.showError('Erro ao inicializar configurações: ' + error.message);
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      // Load from chrome storage
      const result = await chrome.storage.local.get(['settings']);
      this.settings = result.settings || this.getDefaultSettings();

      // Apply settings to form
      this.applySettingsToForm();

    } catch (error) {
      console.error('[Options] Error loading settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings() {
    return {
      // General
      autoPublish: true,
      publishDelay: 30,
      maxRetries: 3,
      theme: 'light',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      defaultLocation: '',

      // Automation
      debugMode: false,
      waitTimeout: 10,
      typingSpeed: 50,
      continueOnError: true,
      saveErrorScreenshots: false,
      maxPostsPerHour: 10,
      maxPostsPerDay: 100,

      // Notifications
      notifications: true,
      notifySuccess: true,
      notifyErrors: true,
      notifyScheduled: true,
      notificationSounds: false,
      notificationVolume: 50
    };
  }

  /**
   * Apply settings to form elements
   */
  applySettingsToForm() {
    for (const [key, value] of Object.entries(this.settings)) {
      const element = document.getElementById(key);
      if (!element) continue;

      if (element.type === 'checkbox') {
        element.checked = value;
      } else if (element.type === 'range') {
        element.value = value;
        // Update volume display
        if (key === 'notificationVolume') {
          document.querySelector('.volume-value').textContent = value + '%';
        }
      } else {
        element.value = value;
      }
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Save settings button
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      this.saveSettings();
    });

    // Reset settings button
    document.getElementById('resetSettingsBtn').addEventListener('click', () => {
      this.resetSettings();
    });

    // Volume slider
    const volumeSlider = document.getElementById('notificationVolume');
    const volumeValue = document.querySelector('.volume-value');
    
    volumeSlider.addEventListener('input', (e) => {
      volumeValue.textContent = e.target.value + '%';
    });

    // Data management buttons
    document.getElementById('exportDataBtn').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importDataBtn').addEventListener('click', () => {
      document.getElementById('importDataInput').click();
    });

    document.getElementById('importDataInput').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    document.getElementById('cleanOldAdsBtn').addEventListener('click', () => {
      this.cleanOldAds();
    });

    document.getElementById('cleanLogsBtn').addEventListener('click', () => {
      this.cleanLogs();
    });

    document.getElementById('resetAllBtn').addEventListener('click', () => {
      this.resetAllData();
    });

    // Auto-save on input change
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', Utils.debounce(() => {
        this.autoSave();
      }, 1000));
    });

    console.log('[Options] Event listeners set up');
  }

  /**
   * Set up navigation
   */
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.switchSection(section);
      });
    });
  }

  /**
   * Switch to specified section
   */
  switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    this.currentSection = sectionName;

    // Load section-specific data
    if (sectionName === 'data') {
      this.loadStatistics();
    }
  }

  /**
   * Save settings
   */
  async saveSettings() {
    try {
      this.showLoading(true);

      // Collect settings from form
      const newSettings = this.collectSettingsFromForm();

      // Validate settings
      const validation = this.validateSettings(newSettings);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Save to chrome storage
      await chrome.storage.local.set({ settings: newSettings });

      // Update local settings
      this.settings = newSettings;

      // Apply theme if changed
      this.applyTheme();

      // Notify background script of settings change
      await this.sendMessageToBackground({
        type: 'UPDATE_SETTINGS',
        data: newSettings
      });

      this.showSuccess('Configurações salvas com sucesso!');

    } catch (error) {
      console.error('[Options] Error saving settings:', error);
      this.showError('Erro ao salvar configurações: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Collect settings from form
   */
  collectSettingsFromForm() {
    const settings = {};

    // Get all form elements
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      if (!input.id) return;

      if (input.type === 'checkbox') {
        settings[input.id] = input.checked;
      } else if (input.type === 'number' || input.type === 'range') {
        settings[input.id] = parseInt(input.value);
      } else {
        settings[input.id] = input.value;
      }
    });

    return settings;
  }

  /**
   * Validate settings
   */
  validateSettings(settings) {
    const errors = [];

    // Validate numeric ranges
    if (settings.publishDelay < 10 || settings.publishDelay > 300) {
      errors.push('Intervalo entre publicações deve estar entre 10 e 300 segundos');
    }

    if (settings.waitTimeout < 5 || settings.waitTimeout > 30) {
      errors.push('Tempo de espera deve estar entre 5 e 30 segundos');
    }

    if (settings.notificationVolume < 0 || settings.notificationVolume > 100) {
      errors.push('Volume deve estar entre 0 e 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings() {
    if (!confirm('Tem certeza que deseja restaurar todas as configurações padrão?')) {
      return;
    }

    try {
      this.showLoading(true);

      // Reset to defaults
      this.settings = this.getDefaultSettings();

      // Apply to form
      this.applySettingsToForm();

      // Save to storage
      await chrome.storage.local.set({ settings: this.settings });

      // Apply theme
      this.applyTheme();

      this.showSuccess('Configurações restauradas para os padrões!');

    } catch (error) {
      console.error('[Options] Error resetting settings:', error);
      this.showError('Erro ao restaurar configurações: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Auto-save settings
   */
  async autoSave() {
    try {
      const newSettings = this.collectSettingsFromForm();
      await chrome.storage.local.set({ settings: newSettings });
      this.settings = newSettings;
    } catch (error) {
      console.warn('[Options] Auto-save failed:', error);
    }
  }

  /**
   * Apply theme
   */
  applyTheme() {
    const theme = this.settings.theme || 'light';
    
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      document.body.classList.remove('dark-theme');
    } else if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark-theme', prefersDark);
    }
  }

  /**
   * Load statistics
   */
  async loadStatistics() {
    try {
      const stats = await db.getStatistics();
      
      document.getElementById('totalAdsCount').textContent = stats.total;
      document.getElementById('publishedAdsCount').textContent = stats.published;
      document.getElementById('scheduledAdsCount').textContent = stats.scheduled;

      // Calculate storage usage
      const storageUsage = await this.calculateStorageUsage();
      document.getElementById('storageUsed').textContent = this.formatBytes(storageUsage);

    } catch (error) {
      console.error('[Options] Error loading statistics:', error);
    }
  }

  /**
   * Calculate storage usage
   */
  async calculateStorageUsage() {
    try {
      const result = await chrome.storage.local.get(null);
      const jsonString = JSON.stringify(result);
      return new Blob([jsonString]).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Export data
   */
  async exportData() {
    try {
      this.showLoading(true);

      // Get all data
      const ads = await db.getAds();
      const templates = await db.getTemplates();
      const settings = await chrome.storage.local.get(['settings']);

      const exportData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        ads,
        templates,
        settings: settings.settings || {}
      };

      // Download as JSON file
      const filename = `facebook-marketplace-backup-${new Date().toISOString().split('T')[0]}.json`;
      Utils.downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');

      this.showSuccess('Dados exportados com sucesso!');

    } catch (error) {
      console.error('[Options] Error exporting data:', error);
      this.showError('Erro ao exportar dados: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Import data
   */
  async importData(file) {
    if (!file) return;

    try {
      this.showLoading(true);

      const text = await file.text();
      const importData = JSON.parse(text);

      // Validate import data
      if (!importData.version || !importData.ads) {
        throw new Error('Arquivo de backup inválido');
      }

      // Confirm import
      const confirmMessage = `
Importar dados do backup?

- ${importData.ads.length} anúncios
- ${importData.templates?.length || 0} templates
- Configurações incluídas: ${importData.settings ? 'Sim' : 'Não'}

ATENÇÃO: Isso substituirá todos os dados atuais!
      `;

      if (!confirm(confirmMessage)) {
        return;
      }

      // Clear existing data
      await db.clearAllData();

      // Import ads
      if (importData.ads.length > 0) {
        await db.importAds(importData.ads);
      }

      // Import templates
      if (importData.templates && importData.templates.length > 0) {
        for (const template of importData.templates) {
          await db.saveTemplate(template);
        }
      }

      // Import settings
      if (importData.settings) {
        await chrome.storage.local.set({ settings: importData.settings });
        this.settings = importData.settings;
        this.applySettingsToForm();
        this.applyTheme();
      }

      // Reload statistics
      await this.loadStatistics();

      this.showSuccess('Dados importados com sucesso!');

    } catch (error) {
      console.error('[Options] Error importing data:', error);
      this.showError('Erro ao importar dados: ' + error.message);
    } finally {
      this.showLoading(false);
      // Clear file input
      document.getElementById('importDataInput').value = '';
    }
  }

  /**
   * Clean old ads
   */
  async cleanOldAds() {
    if (!confirm('Remover anúncios publicados há mais de 30 dias?')) {
      return;
    }

    try {
      this.showLoading(true);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const ads = await db.getAds();
      let removedCount = 0;

      for (const ad of ads) {
        if (ad.status === 'published' && 
            ad.publishedAt && 
            new Date(ad.publishedAt) < thirtyDaysAgo) {
          
          await db.deleteAd(ad.id);
          removedCount++;
        }
      }

      await this.loadStatistics();
      this.showSuccess(`${removedCount} anúncios antigos removidos!`);

    } catch (error) {
      console.error('[Options] Error cleaning old ads:', error);
      this.showError('Erro ao limpar anúncios antigos: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Clean logs
   */
  async cleanLogs() {
    if (!confirm('Limpar todos os logs de depuração?')) {
      return;
    }

    try {
      this.showLoading(true);

      // Clear logs from chrome storage
      await chrome.storage.local.remove(['logs']);

      this.showSuccess('Logs limpos com sucesso!');

    } catch (error) {
      console.error('[Options] Error cleaning logs:', error);
      this.showError('Erro ao limpar logs: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Reset all data
   */
  async resetAllData() {
    const confirmMessage = `
ATENÇÃO: Esta ação irá apagar TODOS os dados!

- Todos os anúncios (rascunhos, agendados, publicados)
- Todos os templates
- Todas as configurações
- Todos os logs

Esta ação NÃO PODE ser desfeita!

Digite "CONFIRMAR" para continuar:
    `;

    const confirmation = prompt(confirmMessage);
    if (confirmation !== 'CONFIRMAR') {
      return;
    }

    try {
      this.showLoading(true);

      // Clear database
      await db.clearAllData();

      // Clear chrome storage
      await chrome.storage.local.clear();

      // Reset settings to defaults
      this.settings = this.getDefaultSettings();
      await chrome.storage.local.set({ settings: this.settings });

      // Apply to form
      this.applySettingsToForm();
      this.applyTheme();

      // Reload statistics
      await this.loadStatistics();

      this.showSuccess('Todos os dados foram removidos!');

    } catch (error) {
      console.error('[Options] Error resetting all data:', error);
      this.showError('Erro ao resetar dados: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Send message to background script
   */
  sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Show loading overlay
   */
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.toggle('show', show);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialize options manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const optionsManager = new OptionsManager();
  optionsManager.init();
  
  // Make available globally for debugging
  window.optionsManager = optionsManager;
});

