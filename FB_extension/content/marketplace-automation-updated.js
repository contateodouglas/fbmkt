// Facebook Marketplace automation with updated DOM selectors - Version 2.0

(function() {
  /**
   * Facebook Marketplace automation class - Updated version with current DOM structure
   */
  class MarketplaceAutomationV2 {
    constructor() {
      this.isInitialized = false;
      this.currentStep = 0;
      this.maxRetries = 5;
      this.stepDelay = 1500; // 1.5 seconds between steps
      this.uploadDelay = 3000; // 3 seconds for image uploads
      this.selectors = this.getUpdatedSelectors();
      this.debugMode = true;
    }

    /**
     * Get updated Facebook Marketplace selectors based on current UI structure
     */
    getUpdatedSelectors() {
      return {
        // Basic form fields - Updated based on current DOM structure
        titleInput: 'input[aria-label*="título" i], input[placeholder*="título" i], div[data-testid*="title"] input, input[type="text"]:not([placeholder*="pesquisar" i])',
        priceInput: 'input[aria-label*="preço" i], input[placeholder*="preço" i], div[data-testid*="price"] input, input[inputmode="decimal"]',
        
        // Dropdowns - Updated selectors
        categoryDropdown: 'label:contains("Categoria"), div[aria-label*="categoria" i][role="button"], div[role="combobox"][aria-label*="categoria" i]',
        categoryOptions: 'div[role="option"], div[data-visualcompletion="ignore-dynamic"]',
        conditionDropdown: 'label:contains("Condição"), div[aria-label*="condição" i][role="button"], div[role="combobox"][aria-label*="condição" i]',
        conditionOptions: 'div[role="option"], div[data-visualcompletion="ignore-dynamic"]',
        
        // More details section
        moreDetailsButton: 'div:contains("Mais detalhes"), div[aria-label*="mais detalhes" i]',
        moreDetailsExpanded: 'div:contains("Descrição"), label:contains("Descrição")',
        
        // Expanded fields (after clicking "More details")
        descriptionInput: 'textarea[placeholder*="descrição" i], div[contenteditable="true"][aria-label*="descrição" i], textarea[aria-label*="descrição" i]',
        tagsInput: 'input[placeholder*="etiqueta" i], input[aria-label*="etiqueta" i], input[placeholder*="tag" i]',
        skuInput: 'input[placeholder*="sku" i], input[aria-label*="sku" i]',
        locationInput: 'input[placeholder*="localização" i], input[aria-label*="localização" i], input[placeholder*="location" i]',
        
        // Meeting preferences
        publicMeetingCheckbox: 'input[type="checkbox"][aria-label*="encontro público" i], input[type="checkbox"][aria-label*="public meeting" i]',
        pickupCheckbox: 'input[type="checkbox"][aria-label*="retirada" i], input[type="checkbox"][aria-label*="pickup" i]',
        deliveryCheckbox: 'input[type="checkbox"][aria-label*="entrega" i], input[type="checkbox"][aria-label*="delivery" i]',
        
        // Image upload - Updated selectors
        imageUploadArea: 'div:contains("Adicione fotos"), div[aria-label*="adicione fotos" i], div[aria-label*="add photos" i]',
        imageUploadInput: 'input[type="file"][accept*="image"], input[type="file"]:not([accept*="video"])',
        imagePreview: 'img[src*="blob:"], img[src*="scontent"], img[alt*="preview" i]',
        
        // Video upload
        videoUploadArea: 'div:contains("Adicione vídeo"), div[aria-label*="adicione vídeo" i], div[aria-label*="add video" i]',
        videoUploadInput: 'input[type="file"][accept*="video"]',
        videoPreview: 'video[src*="blob:"], video[src*="scontent"]',
        
        // Navigation buttons
        nextButton: 'div:contains("Avançar")[role="button"], button:contains("Avançar"), div[aria-label*="avançar" i][role="button"]',
        publishButton: 'div:contains("Publicar")[role="button"], button:contains("Publicar"), div[aria-label*="publicar" i][role="button"]',
        
        // Status indicators
        errorMessage: '[role="alert"], .error, [data-testid*="error"], [aria-live="polite"]',
        loadingSpinner: '[role="progressbar"], .loading, [aria-label*="carregando" i]',
        successMessage: '[role="alert"][aria-live="polite"], .success, [data-testid*="success"]'
      };
    }

    /**
     * Initialize automation with improved error handling
     */
    async init() {
      if (this.isInitialized) return;

      this.log('Initializing Facebook Marketplace Automation V2...');
      
      // Check if we're on Facebook domain
      if (!window.location.hostname.includes('facebook.com')) {
        throw new Error('Not on Facebook domain');
      }

      // Check if user is logged in
      if (!this.isUserLoggedIn()) {
        throw new Error('User not logged in to Facebook');
      }

      this.isInitialized = true;
      this.log('Initialized successfully');
    }

    /**
     * Check if user is logged in to Facebook
     */
    isUserLoggedIn() {
      const indicators = [
        '[aria-label*="Seu perfil" i]',
        '[aria-label*="Your profile" i]',
        '[data-testid="blue_bar_profile_link"]',
        'div[role="banner"] a[href*="/profile"]'
      ];

      return indicators.some(selector => document.querySelector(selector));
    }

    /**
     * Main function to publish an ad with updated DOM handling
     */
    async publishAd(adData) {
      this.log('Starting ad publication:', adData.title);

      try {
        await this.init();
        
        // Navigate to create listing page if needed
        await this.ensureOnCreatePage();
        
        // Wait for page to fully load
        await this.waitForPageLoad();
        
        // Fill the form step by step
        await this.fillAdFormV2(adData);
        
        // Submit the form
        await this.submitAdForm();
        
        // Wait for confirmation
        await this.waitForPublishConfirmation();
        
        this.log('Ad published successfully');
        return { success: true, message: 'Ad published successfully' };

      } catch (error) {
        this.log('Error publishing ad:', error);
        return { success: false, error: error.message };
      }
    }

    /**
     * Ensure we're on the create page
     */
    async ensureOnCreatePage() {
      if (!window.location.href.includes('/marketplace/create/item')) {
        this.log('Navigating to create page');
        window.location.href = 'https://www.facebook.com/marketplace/create/item';
        await this.waitForNavigation('/marketplace/create/item');
        await this.waitForPageLoad();
      }
    }

    /**
     * Fill ad form with updated field detection - Version 2
     */
    async fillAdFormV2(adData) {
      this.log('Filling ad form V2:', adData.title);

      try {
        // Upload images first (if any)
        if (adData.images && adData.images.length > 0) {
          await this.uploadImagesV2(adData.images);
        }

        // Fill basic required fields
        await this.fillTitleV2(adData.title);
        await this.fillPriceV2(adData.price);
        await this.selectCategoryV2(adData.category);
        await this.selectConditionV2(adData.condition);
        
        // Expand "More details" section if needed
        await this.expandMoreDetails();
        
        // Fill optional fields
        if (adData.description) {
          await this.fillDescriptionV2(adData.description);
        }
        
        if (adData.location) {
          await this.fillLocationV2(adData.location);
        }
        
        if (adData.tags && adData.tags.length > 0) {
          await this.fillTagsV2(adData.tags);
        }

        this.log('Form filled successfully');
        return true;

      } catch (error) {
        this.log('Error filling form:', error);
        throw error;
      }
    }

    /**
     * Fill title field - Version 2
     */
    async fillTitleV2(title) {
      this.log('Filling title V2:', title);
      
      // Try multiple selectors for title input
      const titleSelectors = [
        'input[aria-label*="título" i]',
        'input[placeholder*="título" i]',
        'input[type="text"]:not([placeholder*="pesquisar" i])',
        'div[data-testid*="title"] input'
      ];
      
      let titleInput = null;
      for (const selector of titleSelectors) {
        titleInput = document.querySelector(selector);
        if (titleInput) {
          this.log('Found title input with selector:', selector);
          break;
        }
      }
      
      if (!titleInput) {
        throw new Error('Title input not found');
      }
      
      await this.clearAndFillInputV2(titleInput, title);
      await this.sleep(500 + Math.random() * 200);
      
      // Verify title was filled
      if (titleInput.value !== title) {
        this.log('Title verification failed, retrying...');
        await this.clearAndFillInputV2(titleInput, title);
      }
    }

    /**
     * Fill price field - Version 2
     */
    async fillPriceV2(price) {
      this.log('Filling price V2:', price);
      
      const priceSelectors = [
        'input[aria-label*="preço" i]',
        'input[placeholder*="preço" i]',
        'input[inputmode="decimal"]',
        'div[data-testid*="price"] input'
      ];
      
      let priceInput = null;
      for (const selector of priceSelectors) {
        priceInput = document.querySelector(selector);
        if (priceInput) {
          this.log('Found price input with selector:', selector);
          break;
        }
      }
      
      if (!priceInput) {
        throw new Error('Price input not found');
      }
      
      // Clean price value
      const cleanPrice = price.toString().replace(/[^\d.,]/g, '');
      
      await this.clearAndFillInputV2(priceInput, cleanPrice);
      await this.sleep(500 + Math.random() * 200);
    }

    /**
     * Select category - Version 2
     */
    async selectCategoryV2(category) {
      this.log('Selecting category V2:', category);
      
      try {
        // Find category dropdown by text content
        const categoryElements = Array.from(document.querySelectorAll('label, div')).filter(el => 
          el.textContent.toLowerCase().includes('categoria')
        );
        
        if (categoryElements.length === 0) {
          throw new Error('Category dropdown not found');
        }
        
        const categoryDropdown = categoryElements[0];
        this.log('Found category dropdown');
        
        await this.clickElementV2(categoryDropdown);
        await this.sleep(1500 + Math.random() * 500);

        // Wait for options to appear and select
        await this.selectFromDropdownOptions(category, 'categoria');

      } catch (error) {
        this.log('Category selection failed:', error);
        // Continue without category selection
      }
    }

    /**
     * Select condition - Version 2
     */
    async selectConditionV2(condition) {
      this.log('Selecting condition V2:', condition);
      
      try {
        // Find condition dropdown by text content
        const conditionElements = Array.from(document.querySelectorAll('label, div')).filter(el => 
          el.textContent.toLowerCase().includes('condição')
        );
        
        if (conditionElements.length === 0) {
          throw new Error('Condition dropdown not found');
        }
        
        const conditionDropdown = conditionElements[0];
        this.log('Found condition dropdown');
        
        await this.clickElementV2(conditionDropdown);
        await this.sleep(1500 + Math.random() * 500);

        // Wait for options to appear and select
        await this.selectFromDropdownOptions(condition, 'condição');

      } catch (error) {
        this.log('Condition selection failed:', error);
        // Continue without condition selection
      }
    }

    /**
     * Expand "More details" section
     */
    async expandMoreDetails() {
      this.log('Expanding more details section');
      
      try {
        // Check if already expanded
        const descriptionField = document.querySelector(this.selectors.descriptionInput);
        if (descriptionField) {
          this.log('More details already expanded');
          return;
        }
        
        // Find and click "More details" button
        const moreDetailsElements = Array.from(document.querySelectorAll('div')).filter(el => 
          el.textContent.toLowerCase().includes('mais detalhes')
        );
        
        if (moreDetailsElements.length > 0) {
          this.log('Found more details button, clicking...');
          await this.clickElementV2(moreDetailsElements[0]);
          await this.sleep(2000 + Math.random() * 500);
        }
        
      } catch (error) {
        this.log('Failed to expand more details:', error);
      }
    }

    /**
     * Fill description field - Version 2
     */
    async fillDescriptionV2(description) {
      this.log('Filling description V2');
      
      try {
        // Wait for description field to be available
        await this.sleep(1000);
        
        const descriptionSelectors = [
          'textarea[placeholder*="descrição" i]',
          'textarea[aria-label*="descrição" i]',
          'div[contenteditable="true"][aria-label*="descrição" i]',
          'textarea'
        ];
        
        let descriptionInput = null;
        for (const selector of descriptionSelectors) {
          descriptionInput = document.querySelector(selector);
          if (descriptionInput) {
            this.log('Found description input with selector:', selector);
            break;
          }
        }
        
        if (!descriptionInput) {
          this.log('Description input not found, skipping');
          return;
        }
        
        await this.clearAndFillInputV2(descriptionInput, description);
        await this.sleep(500 + Math.random() * 200);
        
      } catch (error) {
        this.log('Description filling failed:', error);
      }
    }

    /**
     * Fill location field - Version 2
     */
    async fillLocationV2(location) {
      this.log('Filling location V2:', location);
      
      try {
        const locationSelectors = [
          'input[placeholder*="localização" i]',
          'input[aria-label*="localização" i]',
          'input[placeholder*="location" i]'
        ];
        
        let locationInput = null;
        for (const selector of locationSelectors) {
          locationInput = document.querySelector(selector);
          if (locationInput) {
            this.log('Found location input with selector:', selector);
            break;
          }
        }
        
        if (!locationInput) {
          this.log('Location input not found, skipping');
          return;
        }
        
        await this.clearAndFillInputV2(locationInput, location);
        await this.sleep(2000 + Math.random() * 500);
        
        // Press Enter to confirm
        locationInput.dispatchEvent(new KeyboardEvent('keydown', { 
          key: 'Enter', 
          bubbles: true, 
          cancelable: true 
        }));
        await this.sleep(1000 + Math.random() * 300);
        
      } catch (error) {
        this.log('Location filling failed:', error);
      }
    }

    /**
     * Fill tags field - Version 2
     */
    async fillTagsV2(tags) {
      this.log('Filling tags V2:', tags);
      
      try {
        const tagsSelectors = [
          'input[placeholder*="etiqueta" i]',
          'input[aria-label*="etiqueta" i]',
          'input[placeholder*="tag" i]'
        ];
        
        let tagsInput = null;
        for (const selector of tagsSelectors) {
          tagsInput = document.querySelector(selector);
          if (tagsInput) {
            this.log('Found tags input with selector:', selector);
            break;
          }
        }
        
        if (!tagsInput) {
          this.log('Tags input not found, skipping');
          return;
        }
        
        const tagsString = Array.isArray(tags) ? tags.join(', ') : tags;
        await this.clearAndFillInputV2(tagsInput, tagsString);
        await this.sleep(500 + Math.random() * 200);
        
      } catch (error) {
        this.log('Tags filling failed:', error);
      }
    }

    /**
     * Upload images - Version 2
     */
    async uploadImagesV2(images) {
      this.log('Uploading images V2:', images.length);
      
      try {
        // Find image upload area
        const uploadElements = Array.from(document.querySelectorAll('div')).filter(el => 
          el.textContent.toLowerCase().includes('adicione fotos') ||
          el.textContent.toLowerCase().includes('add photos')
        );
        
        if (uploadElements.length === 0) {
          this.log('Image upload area not found');
          return;
        }
        
        // Look for file input
        const fileInput = document.querySelector(this.selectors.imageUploadInput);
        if (!fileInput) {
          this.log('File input not found');
          return;
        }
        
        // Create file list for upload
        const dataTransfer = new DataTransfer();
        for (const imagePath of images) {
          try {
            // Note: In a real browser extension, you would handle file upload differently
            // This is a simplified version for demonstration
            this.log('Would upload image:', imagePath);
          } catch (error) {
            this.log('Failed to upload image:', imagePath, error);
          }
        }
        
      } catch (error) {
        this.log('Image upload failed:', error);
      }
    }

    /**
     * Select from dropdown options
     */
    async selectFromDropdownOptions(targetValue, dropdownType) {
      this.log('Selecting from dropdown options:', targetValue, dropdownType);
      
      try {
        // Wait for options to appear
        await this.sleep(1000);
        
        const options = document.querySelectorAll('div[role="option"], div[data-visualcompletion="ignore-dynamic"]');
        this.log('Found options:', options.length);
        
        const targetLower = targetValue.toLowerCase();
        let optionFound = false;
        
        for (const option of options) {
          const optionText = option.textContent.toLowerCase().trim();
          if (optionText.includes(targetLower) || targetLower.includes(optionText)) {
            this.log('Found matching option:', optionText);
            await this.clickElementV2(option);
            await this.sleep(1000 + Math.random() * 300);
            optionFound = true;
            break;
          }
        }
        
        if (!optionFound && options.length > 0) {
          this.log('Target option not found, using first available');
          await this.clickElementV2(options[0]);
          await this.sleep(1000 + Math.random() * 300);
        }
        
      } catch (error) {
        this.log('Dropdown selection failed:', error);
      }
    }

    /**
     * Submit ad form
     */
    async submitAdForm() {
      this.log('Submitting ad form');
      
      try {
        // Find and click "Next" button
        const nextElements = Array.from(document.querySelectorAll('div, button')).filter(el => 
          el.textContent.toLowerCase().includes('avançar') ||
          el.textContent.toLowerCase().includes('next')
        );
        
        if (nextElements.length === 0) {
          throw new Error('Next button not found');
        }
        
        this.log('Found next button, clicking...');
        await this.clickElementV2(nextElements[0]);
        await this.sleep(3000 + Math.random() * 1000);
        
        // Look for publish button on next page
        await this.sleep(2000);
        const publishElements = Array.from(document.querySelectorAll('div, button')).filter(el => 
          el.textContent.toLowerCase().includes('publicar') ||
          el.textContent.toLowerCase().includes('publish')
        );
        
        if (publishElements.length > 0) {
          this.log('Found publish button, clicking...');
          await this.clickElementV2(publishElements[0]);
          await this.sleep(3000 + Math.random() * 1000);
        }
        
      } catch (error) {
        this.log('Form submission failed:', error);
        throw error;
      }
    }

    /**
     * Wait for publish confirmation
     */
    async waitForPublishConfirmation() {
      this.log('Waiting for publish confirmation');
      
      const maxWait = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        // Check for success indicators
        const successIndicators = [
          'div:contains("publicado")',
          'div:contains("published")',
          '[role="alert"][aria-live="polite"]'
        ];
        
        for (const selector of successIndicators) {
          const element = document.querySelector(selector);
          if (element && element.textContent.toLowerCase().includes('publicado')) {
            this.log('Publish confirmation found');
            return true;
          }
        }
        
        // Check for errors
        const errorElement = document.querySelector(this.selectors.errorMessage);
        if (errorElement) {
          throw new Error('Publish failed: ' + errorElement.textContent);
        }
        
        await this.sleep(1000);
      }
      
      this.log('Publish confirmation timeout');
      return false;
    }

    /**
     * Improved clear and fill input function
     */
    async clearAndFillInputV2(element, value) {
      if (!element) return;
      
      // Focus the element
      element.focus();
      await this.sleep(100);
      
      // Clear existing content
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(100);
      
      // Type the new value with human-like delays
      for (let i = 0; i < value.length; i++) {
        element.value += value[i];
        element.dispatchEvent(new Event('input', { bubbles: true }));
        await this.sleep(50 + Math.random() * 50); // Random delay between keystrokes
      }
      
      // Trigger change event
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await this.sleep(100);
    }

    /**
     * Improved click element function
     */
    async clickElementV2(element) {
      if (!element) return;
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await this.sleep(500);
      
      // Simulate human-like click
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 10;
      const y = rect.top + rect.height / 2 + (Math.random() - 0.5) * 10;
      
      // Dispatch mouse events
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: x, clientY: y }));
      await this.sleep(50 + Math.random() * 50);
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, clientX: x, clientY: y }));
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
      
      await this.sleep(200 + Math.random() * 200);
    }

    /**
     * Wait for page load
     */
    async waitForPageLoad() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve, { once: true });
        }
      });
    }

    /**
     * Wait for navigation
     */
    async waitForNavigation(expectedPath) {
      const maxWait = 10000; // 10 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWait) {
        if (window.location.pathname.includes(expectedPath)) {
          return true;
        }
        await this.sleep(500);
      }
      
      return false;
    }

    /**
     * Sleep function
     */
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Logging function
     */
    log(...args) {
      if (this.debugMode) {
        console.log('[MarketplaceAutomationV2]', ...args);
      }
    }
  }

  // Export the class
  window.MarketplaceAutomationV2 = MarketplaceAutomationV2;

  // Initialize and expose to content script
  if (typeof window.marketplaceAutomationV2 === 'undefined') {
    window.marketplaceAutomationV2 = new MarketplaceAutomationV2();
  }

})();

