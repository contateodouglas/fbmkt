// popup.js for Facebook Marketplace Auto Poster Extension

/**
 * Popup Manager class to handle all UI interactions and data logic
 */
class PopupManager {
  constructor() {
    this.currentTab = 'dashboard';
    this.currentAd = null;
    this.adImages = [];
    this.adVideo = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the popup manager
   */
  async init() {
    if (this.isInitialized) return;

    console.log('[Popup] Initializing...');

    try {
      // Initialize database
      await db.init();
      console.log('[Popup] Database initialized.');

      // Load settings
      await this.loadSettings();
      console.log('[Popup] Settings loaded.');

      // Set up event listeners
      this.setupEventListeners();
      console.log('[Popup] Event listeners set up.');

      // Load initial data for dashboard
      await this.loadDashboardData();
      console.log('[Popup] Dashboard data loaded.');

      // Check Facebook connection status
      this.checkFacebookConnection();
      console.log('[Popup] Facebook connection check initiated.');

      this.isInitialized = true;
      console.log('[Popup] Initialized successfully');

    } catch (error) {
      console.error('[Popup] Initialization failed:', error);
      this.showNotification('Erro ao inicializar a extensão: ' + error.message, 'error');
    }
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    const result = await chrome.storage.local.get(['settings']);
    this.settings = result.settings || this.getDefaultSettings();
  }

  /**
   * Get default settings (should match options.js)
   */
  getDefaultSettings() {
    return {
      autoPublish: true,
      publishDelay: 30,
      maxRetries: 3,
      theme: 'light',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      defaultLocation: '',
      debugMode: false,
      waitTimeout: 10,
      typingSpeed: 50,
      continueOnError: true,
      saveErrorScreenshots: false,
      maxPostsPerHour: 10,
      maxPostsPerDay: 100,
      notifications: true,
      notifySuccess: true,
      notifyErrors: true,
      notifyScheduled: true,
      notificationSounds: false,
      notificationVolume: 50
    };
  }

  /**
   * Set up all event listeners for UI elements
   */
  setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Header buttons
    document.getElementById('settingsBtn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    document.getElementById('helpBtn').addEventListener('click', () => {
      // Open user manual or help page
      chrome.tabs.create({ url: chrome.runtime.getURL('USER_MANUAL.md') });
    });

    // Dashboard quick actions
    document.getElementById('quickCreateBtn').addEventListener('click', () => {
      this.switchTab('create');
      this.resetAdForm();
    });
    document.getElementById('bulkImportBtn').addEventListener('click', () => {
      this.openBulkImportModal();
    });

    // Ad form submission
    document.getElementById('adForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAdSubmission();
    });

    // Save as draft button
    document.getElementById('saveAsDraftBtn').addEventListener('click', () => {
      this.saveAd(true);
    });

    // Image upload
    document.getElementById('imageUploadArea').addEventListener('click', () => {
      document.getElementById('imageInput').click();
    });
    document.getElementById('imageInput').addEventListener('change', (e) => {
      this.handleImageUpload(e.target.files);
    });
    document.getElementById('imageUploadArea').addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('dragover');
    });
    document.getElementById('imageUploadArea').addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('dragover');
    });
    document.getElementById('imageUploadArea').addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('dragover');
      this.handleImageUpload(e.dataTransfer.files);
    });

    // Video upload
    document.getElementById('videoUploadArea').addEventListener('click', () => {
      document.getElementById('videoInput').click();
    });
    document.getElementById('videoInput').addEventListener('change', (e) => {
      this.handleVideoUpload(e.target.files[0]);
    });
    document.getElementById('videoUploadArea').addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add('dragover');
    });
    document.getElementById('videoUploadArea').addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('dragover');
    });
    document.getElementById('videoUploadArea').addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleVideoUpload(e.dataTransfer.files[0]);
      }
    });

    // Schedule options toggle
    document.getElementById('schedulePost').addEventListener('change', (e) => {
      document.getElementById('scheduleOptions').style.display = e.target.checked ? 'block' : 'none';
    });

    // Schedule tab filters
    document.getElementById('refreshScheduleBtn').addEventListener('click', () => {
      this.loadScheduledAds();
    });
    document.getElementById('scheduleFilter').addEventListener('change', () => {
      this.loadScheduledAds();
    });

    // Bulk import modal
    document.getElementById('closeBulkModal').addEventListener('click', () => {
      this.closeBulkImportModal();
    });
    document.getElementById('cancelImportBtn').addEventListener('click', () => {
      this.closeBulkImportModal();
    });
    document.getElementById('bulkFileInput').addEventListener('change', (e) => {
      this.handleBulkFileUpload(e.target.files[0]);
    });
    document.getElementById('confirmImportBtn').addEventListener('click', () => {
      this.confirmBulkImport();
    });

    console.log('[Popup] Event listeners set up');
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    this.currentTab = tabName;

    // Load data for the new tab
    if (tabName === 'dashboard') {
      this.loadDashboardData();
    } else if (tabName === 'schedule') {
      this.loadScheduledAds();
    }
  }

  /**
   * Load data for the dashboard tab
   */
  async loadDashboardData() {
    try {
      const stats = await db.getStatistics();
      document.getElementById('totalAds').textContent = stats.total;
      document.getElementById('scheduledAds').textContent = stats.scheduled;
      document.getElementById('publishedAds').textContent = stats.published;

      // TODO: Load recent activity logs
      const activityList = document.getElementById('activityList');
      activityList.innerHTML = ''; // Clear existing
      const defaultActivity = `
        <div class="activity-item">
            <div class="activity-icon">📝</div>
            <div class="activity-content">
                <div class="activity-title">Bem-vindo ao Auto Poster!</div>
                <div class="activity-time">Comece criando seu primeiro anúncio</div>
            </div>
        </div>
      `;
      activityList.innerHTML = defaultActivity;

    } catch (error) {
      console.error('[Popup] Error loading dashboard data:', error);
      this.showNotification('Erro ao carregar dados do dashboard.', 'error');
    }
  }

  /**
   * Handle ad form submission (Publish Now)
   */
  async handleAdSubmission() {
    const ad = this.collectAdData();
    if (!ad) return;

    // Validate ad data
    const validationErrors = this.validateAd(ad);
    if (validationErrors.length > 0) {
      this.showNotification('Por favor, corrija os seguintes erros:\n' + validationErrors.join('\n'), 'error');
      return;
    }

    // If scheduled, save and notify
    if (ad.scheduled) {
      ad.status = 'scheduled';
      await this.saveAd(false, ad);
      this.showNotification('Anúncio agendado com sucesso!', 'success');
      this.switchTab('schedule');
      this.resetAdForm();
      return;
    }

    // If not scheduled, send to background for immediate publishing
    this.showLoading(true, 'Publicando anúncio...');
    try {
      const response = await this.sendMessageToBackground({
        type: 'PUBLISH_AD',
        data: ad
      });

      if (response.success) {
        this.showNotification('Anúncio publicado com sucesso!', 'success');
        this.resetAdForm();
        this.switchTab('dashboard');
      } else {
        throw new Error(response.error || 'Erro desconhecido ao publicar.');
      }
    } catch (error) {
      console.error('[Popup] Error publishing ad:', error);
      this.showNotification('Falha ao publicar anúncio: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Collect ad data from the form
   */
  collectAdData() {
    const ad = {
      id: this.currentAd ? this.currentAd.id : Utils.generateId(),
      title: document.getElementById('adTitle').value,
      description: document.getElementById('adDescription').value,
      price: parseFloat(document.getElementById('adPrice').value),
      condition: document.getElementById('adCondition').value,
      category: document.getElementById('adCategory').value,
      brand: document.getElementById('adBrand').value,
      tags: document.getElementById('adTags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      location: document.getElementById('adLocation').value,
      images: this.adImages,
      video: this.adVideo,
      scheduled: document.getElementById('schedulePost').checked,
      scheduleDate: null,
      scheduleTime: null,
      status: 'draft', // default status
      createdAt: this.currentAd ? this.currentAd.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (ad.scheduled) {
      ad.scheduleDate = document.getElementById('scheduleDate').value;
      ad.scheduleTime = document.getElementById('scheduleTime').value;
    }

    return ad;
  }

  /**
   * Validate ad data
   */
  validateAd(ad) {
    const errors = [];
    if (!ad.title) errors.push('Título é obrigatório.');
    if (!ad.description) errors.push('Descrição é obrigatório.');
    if (isNaN(ad.price) || ad.price < 0) errors.push('Preço inválido.');
    if (!ad.condition) errors.push('Condição é obrigatória.');
    if (!ad.category) errors.push('Categoria é obrigatória.');
    if (!ad.location) errors.push('Localização é obrigatória.');
    if (ad.images.length === 0) errors.push('Pelo menos uma imagem é obrigatória.');

    if (ad.scheduled) {
      if (!ad.scheduleDate) errors.push('Data de agendamento é obrigatória.');
      if (!ad.scheduleTime) errors.push('Horário de agendamento é obrigatório.');
      const scheduleDateTime = new Date(`${ad.scheduleDate}T${ad.scheduleTime}`);
      if (isNaN(scheduleDateTime.getTime())) errors.push('Data ou horário de agendamento inválido.');
      if (scheduleDateTime < new Date()) errors.push('Data e horário de agendamento devem ser no futuro.');
    }

    return errors;
  }

  /**
   * Save ad to database (draft or scheduled)
   */
  async saveAd(isDraft = false, adData = null) {
    const ad = adData || this.collectAdData();
    if (!ad) return;

    ad.status = isDraft ? 'draft' : (ad.scheduled ? 'scheduled' : 'draft');

    try {
      this.showLoading(true, 'Salvando anúncio...');
      await db.saveAd(ad);
      this.showNotification('Anúncio salvo com sucesso!', 'success');
      this.resetAdForm();
      this.switchTab('dashboard');
    } catch (error) {
      console.error('[Popup] Error saving ad:', error);
      this.showNotification('Erro ao salvar anúncio: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Reset the ad creation form
   */
  resetAdForm() {
    document.getElementById('adForm').reset();
    document.getElementById('imagePreviewGrid').innerHTML = '';
    document.getElementById('videoPreviewGrid').innerHTML = '';
    document.getElementById('scheduleOptions').style.display = 'none';
    this.adImages = [];
    this.adVideo = null;
    this.currentAd = null;
    // Set default location if available
    if (this.settings.defaultLocation) {
      document.getElementById('adLocation').value = this.settings.defaultLocation;
    }
  }

  /**
   * Handle image file uploads
   */
  async handleImageUpload(files) {
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      // Limit to 10 images
      if (this.adImages.length >= 10) {
        this.showNotification('Máximo de 10 imagens por anúncio.', 'warning');
        break;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imgDataUrl = e.target.result;
        this.adImages.push(imgDataUrl); // Store base64

        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview-item';
        imgContainer.innerHTML = `
          <img src="${imgDataUrl}" alt="Prévia da imagem">
          <button type="button" class="remove-image-btn" data-index="${this.adImages.length - 1}">&times;</button>
        `;
        imagePreviewGrid.appendChild(imgContainer);

        // Add remove listener
        imgContainer.querySelector('.remove-image-btn').addEventListener('click', (event) => {
          const indexToRemove = parseInt(event.target.dataset.index);
          this.removeImage(indexToRemove);
        });
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove an image from the preview and array
   */
  removeImage(index) {
    this.adImages.splice(index, 1);
    this.updateImagePreviews();
  }

  /**
   * Update image previews after removal or reordering
   */
  updateImagePreviews() {
    const imagePreviewGrid = document.getElementById('imagePreviewGrid');
    imagePreviewGrid.innerHTML = ''; // Clear all
    this.adImages.forEach((imgDataUrl, index) => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-preview-item';
      imgContainer.innerHTML = `
        <img src="${imgDataUrl}" alt="Prévia da imagem">
        <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
      `;
      imagePreviewGrid.appendChild(imgContainer);
      imgContainer.querySelector('.remove-image-btn').addEventListener('click', (event) => {
        const indexToRemove = parseInt(event.target.dataset.index);
        this.removeImage(indexToRemove);
      });
    });
  }

  /**
   * Handle video file upload
   */
  async handleVideoUpload(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      this.showNotification('Por favor, selecione um arquivo de vídeo válido.', 'error');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      this.showNotification('O arquivo de vídeo é muito grande. Máximo permitido: 100MB.', 'error');
      return;
    }

    try {
      // Create video element to get duration and other metadata
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.src = url;
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Validate duration (5-60 seconds)
        const duration = video.duration;
        if (duration < 5 || duration > 60) {
          this.showNotification('A duração do vídeo deve estar entre 5 e 60 segundos.', 'error');
          URL.revokeObjectURL(url);
          return;
        }

        // Convert to base64 for storage
        const reader = new FileReader();
        reader.onload = (e) => {
          this.adVideo = {
            name: file.name,
            size: file.size,
            duration: duration,
            type: file.type,
            dataUrl: e.target.result
          };

          this.updateVideoPreview();
          this.showNotification('Vídeo carregado com sucesso!', 'success');
        };
        reader.readAsDataURL(file);
        
        URL.revokeObjectURL(url);
      };

      video.onerror = () => {
        this.showNotification('Erro ao carregar o vídeo. Verifique se o formato é suportado.', 'error');
        URL.revokeObjectURL(url);
      };

    } catch (error) {
      console.error('[Popup] Error handling video upload:', error);
      this.showNotification('Erro ao processar o vídeo: ' + error.message, 'error');
    }
  }

  /**
   * Update video preview
   */
  updateVideoPreview() {
    const videoPreviewGrid = document.getElementById('videoPreviewGrid');
    videoPreviewGrid.innerHTML = ''; // Clear existing

    if (this.adVideo) {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'video-preview-item';
      
      const durationFormatted = this.formatDuration(this.adVideo.duration);
      const sizeFormatted = this.formatFileSize(this.adVideo.size);
      
      videoContainer.innerHTML = `
        <video controls preload="metadata">
          <source src="${this.adVideo.dataUrl}" type="${this.adVideo.type}">
          Seu navegador não suporta o elemento de vídeo.
        </video>
        <div class="video-info">
          <div class="video-name">${this.adVideo.name}</div>
          <div class="video-details">
            <span class="video-size">${sizeFormatted}</span>
            <span class="video-duration">${durationFormatted}</span>
          </div>
        </div>
        <button type="button" class="remove-video-btn">&times;</button>
      `;
      
      videoPreviewGrid.appendChild(videoContainer);
      
      // Add remove listener
      videoContainer.querySelector('.remove-video-btn').addEventListener('click', () => {
        this.removeVideo();
      });
    }
  }

  /**
   * Remove video
   */
  removeVideo() {
    this.adVideo = null;
    this.updateVideoPreview();
    this.showNotification('Vídeo removido.', 'info');
  }

  /**
   * Format duration in seconds to MM:SS
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format file size in bytes to human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Load scheduled ads for the schedule tab
   */
  async loadScheduledAds() {
    try {
      const filter = document.getElementById('scheduleFilter').value;
      let ads = await db.getAds();

      // Filter ads based on status
      if (filter !== 'all') {
        ads = ads.filter(ad => ad.status === filter);
      }

      const scheduleList = document.getElementById('scheduleList');
      scheduleList.innerHTML = ''; // Clear existing

      if (ads.length === 0) {
        scheduleList.innerHTML = `
          <div class="empty-state">
              <div class="empty-icon">📅</div>
              <div class="empty-text">
                  <h4>Nenhum agendamento encontrado</h4>
                  <p>Crie um anúncio e agende sua publicação</p>
              </div>
          </div>
        `;
        return;
      }

      // Sort by schedule date/time
      ads.sort((a, b) => {
        const dateA = new Date(`${a.scheduleDate}T${a.scheduleTime}`);
        const dateB = new Date(`${b.scheduleDate}T${b.scheduleTime}`);
        return dateA - dateB;
      });

      ads.forEach(ad => {
        const adItem = document.createElement('div');
        adItem.className = 'schedule-item';
        adItem.innerHTML = `
          <div class="schedule-info">
              <div class="schedule-title">${ad.title}</div>
              <div class="schedule-details">
                  <span>${ad.category}</span>
                  <span>${ad.location}</span>
                  <span>${ad.scheduleDate || 'N/A'} ${ad.scheduleTime || 'N/A'}</span>
              </div>
          </div>
          <div class="schedule-actions">
              <span class="schedule-status status-${ad.status}">${ad.status.toUpperCase()}</span>
              <button class="btn btn-sm btn-outline edit-ad-btn" data-id="${ad.id}">✏️</button>
              <button class="btn btn-sm btn-danger delete-ad-btn" data-id="${ad.id}">🗑️</button>
          </div>
        `;
        scheduleList.appendChild(adItem);

        // Add event listeners for edit and delete
        adItem.querySelector('.edit-ad-btn').addEventListener('click', (e) => {
          this.editAd(e.target.dataset.id);
        });
        adItem.querySelector('.delete-ad-btn').addEventListener('click', (e) => {
          this.deleteAd(e.target.dataset.id);
        });
      });

    } catch (error) {
      console.error('[Popup] Error loading scheduled ads:', error);
      this.showNotification('Erro ao carregar agendamentos.', 'error');
    }
  }

  /**
   * Edit an existing ad
   */
  async editAd(adId) {
    try {
      const ad = await db.getAd(adId);
      if (!ad) {
        this.showNotification('Anúncio não encontrado.', 'error');
        return;
      }

      this.currentAd = ad;
      this.adImages = ad.images || [];
      this.adVideo = ad.video || null;

      // Populate form
      document.getElementById('adTitle').value = ad.title;
      document.getElementById('adDescription').value = ad.description;
      document.getElementById('adPrice').value = ad.price;
      document.getElementById('adCondition').value = ad.condition;
      document.getElementById('adCategory').value = ad.category;
      document.getElementById('adBrand').value = ad.brand;
      document.getElementById('adTags').value = ad.tags ? ad.tags.join(', ') : '';
      document.getElementById('adLocation').value = ad.location;

      this.updateImagePreviews();
      this.updateVideoPreview();

      document.getElementById('schedulePost').checked = ad.scheduled;
      document.getElementById('scheduleOptions').style.display = ad.scheduled ? 'block' : 'none';
      if (ad.scheduled) {
        document.getElementById('scheduleDate').value = ad.scheduleDate;
        document.getElementById('scheduleTime').value = ad.scheduleTime;
      }

      this.switchTab('create');
      this.showNotification('Anúncio carregado para edição.', 'info');

    } catch (error) {
      console.error('[Popup] Error editing ad:', error);
      this.showNotification('Erro ao carregar anúncio para edição: ' + error.message, 'error');
    }
  }

  /**
   * Delete an ad
   */
  async deleteAd(adId) {
    if (!confirm('Tem certeza que deseja excluir este anúncio?')) {
      return;
    }

    try {
      await db.deleteAd(adId);
      this.showNotification('Anúncio excluído com sucesso!', 'success');
      this.loadScheduledAds(); // Refresh list
      this.loadDashboardData(); // Refresh stats
    } catch (error) {
      console.error('[Popup] Error deleting ad:', error);
      this.showNotification('Erro ao excluir anúncio: ' + error.message, 'error');
    }
  }

  /**
   * Open bulk import modal
   */
  openBulkImportModal() {
    document.getElementById('bulkImportModal').classList.add('show');
    document.getElementById('bulkFileInput').value = ''; // Clear previous file
    document.getElementById('importPreview').style.display = 'none';
    document.getElementById('confirmImportBtn').disabled = true;
  }

  /**
   * Close bulk import modal
   */
  closeBulkImportModal() {
    document.getElementById('bulkImportModal').classList.remove('show');
  }

  /**
   * Handle bulk file upload (CSV/JSON)
   */
  async handleBulkFileUpload(file) {
    if (!file) return;

    const importTypeCSV = document.getElementById('importCSV').checked;
    const importTypeJSON = document.getElementById('importJSON').checked;
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = '';
    document.getElementById('confirmImportBtn').disabled = true;

    try {
      const text = await file.text();
      let parsedData;

      if (importTypeCSV) {
        parsedData = Utils.parseCSV(text); // Assuming Utils.parseCSV exists
      } else if (importTypeJSON) {
        parsedData = JSON.parse(text);
      } else {
        throw new Error('Tipo de importação não selecionado.');
      }

      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo.');
      }

      // Display a preview of the first few items
      const displayLimit = 5;
      const previewItems = parsedData.slice(0, displayLimit);
      previewContent.innerHTML = `
        <p>Encontrados ${parsedData.length} anúncios. Prévia dos primeiros ${previewItems.length}:</p>
        <ul>
          ${previewItems.map(item => `<li>${item.title || 'Anúncio sem título'}</li>`).join('')}
        </ul>
      `;
      document.getElementById('importPreview').style.display = 'block';
      document.getElementById('confirmImportBtn').disabled = false;
      this.bulkImportData = parsedData; // Store for confirmation

    } catch (error) {
      console.error('[Popup] Error handling bulk file:', error);
      this.showNotification('Erro ao ler arquivo: ' + error.message, 'error');
      document.getElementById('importPreview').style.display = 'none';
    }
  }

  /**
   * Confirm and import bulk data
   */
  async confirmBulkImport() {
    if (!this.bulkImportData || this.bulkImportData.length === 0) {
      this.showNotification('Nenhum dado para importar.', 'warning');
      return;
    }

    this.showLoading(true, `Importando ${this.bulkImportData.length} anúncios...`);
    try {
      let importedCount = 0;
      for (const adData of this.bulkImportData) {
        // Assign unique ID and default status
        adData.id = Utils.generateId();
        adData.status = 'draft'; 
        adData.createdAt = new Date().toISOString();
        adData.updatedAt = new Date().toISOString();
        // Ensure images is an array, convert if necessary (e.g., from CSV string)
        if (typeof adData.images === 'string') {
          adData.images = adData.images.split(',').map(img => img.trim()).filter(img => img !== '');
        }
        await db.saveAd(adData);
        importedCount++;
      }
      this.showNotification(`${importedCount} anúncios importados com sucesso!`, 'success');
      this.closeBulkImportModal();
      this.loadDashboardData();
      this.loadScheduledAds();
    } catch (error) {
      console.error('[Popup] Error confirming bulk import:', error);
      this.showNotification('Erro ao importar dados em massa: ' + error.message, 'error');
    } finally {
      this.showLoading(false);
      this.bulkImportData = null; // Clear data after import
    }
  }

  /**
   * Check Facebook connection status by sending message to background script
   */
  async checkFacebookConnection() {
    const statusIndicator = document.getElementById('connectionStatus');
    const statusText = document.getElementById('connectionText');

    statusIndicator.className = 'status-indicator connecting';
    statusText.textContent = 'Verificando conexão...';

    try {
      const response = await this.sendMessageToBackground({ type: 'CHECK_FACEBOOK_CONNECTION' });
      if (response.isConnected) {
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = 'Conectado ao Facebook Marketplace';
      } else {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Desconectado do Facebook Marketplace. Visite facebook.com/marketplace';
      }
    } catch (error) {
      console.error('[Popup] Error checking connection:', error);
      statusIndicator.className = 'status-indicator disconnected';
      statusText.textContent = 'Erro ao verificar conexão: ' + error.message;
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
   * Show/hide loading overlay
   */
  showLoading(show, message = 'Processando...') {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      // Create overlay if it doesn't exist (e.g., first run)
      const body = document.body;
      const newOverlay = document.createElement('div');
      newOverlay.id = 'loadingOverlay';
      newOverlay.className = 'loading-overlay';
      newOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>${message}</p>
        </div>
      `;
      body.appendChild(newOverlay);
      overlay = newOverlay;
    }
    
    const loadingText = overlay.querySelector('p');
    if (loadingText) loadingText.textContent = message;

    overlay.classList.toggle('show', show);
  }

  /**
   * Show notification message
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
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: white;
      background-color: ${type === 'success' ? '#28a745' : (type === 'error' ? '#dc3545' : '#007bff')};
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

// Initialize popup manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const popupManager = new PopupManager();
  popupManager.init();
  
  // Make available globally for debugging
  window.popupManager = popupManager;
});


