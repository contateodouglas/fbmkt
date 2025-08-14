// Improved Facebook Marketplace automation with updated selectors and robust logic

(function() {
  /**
   * Facebook Marketplace automation class - Improved version
   */
  class MarketplaceAutomation {
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
     * Get updated Facebook Marketplace selectors based on current UI
     */
    getUpdatedSelectors() {
      return {
        // Main form elements - Updated selectors based on current Facebook UI
        titleInput: 'input[placeholder*="Título" i], input[placeholder*="Title" i], input[aria-label*="título" i], input[aria-label*="title" i], input[name="title"]',
        descriptionInput: 'textarea[placeholder*="Descrição" i], textarea[placeholder*="Description" i], textarea[aria-label*="descrição" i], textarea[aria-label*="description" i], textarea[name="description"]',
        priceInput: 'input[placeholder*="Preço" i], input[placeholder*="Price" i], input[aria-label*="preço" i], input[aria-label*="price" i], input[name="price"]',
        locationInput: 'input[placeholder*="Localização" i], input[placeholder*="Location" i], input[aria-label*="localização" i], input[aria-label*="location" i], input[name="location"]',
        
        // Category selection - Updated for current UI
        categoryDropdown: '[role="combobox"][aria-label*="Categoria" i], [role="combobox"][aria-label*="Category" i], button[aria-label*="Categoria" i], button[aria-label*="Category" i], div[aria-label*="Categoria" i][role="button"]',
        categoryOption: '[role="option"], [data-visualcompletion="ignore-dynamic"], div[role="option"]',
        
        // Condition selection - Updated for current UI
        conditionDropdown: '[role="combobox"][aria-label*="Condição" i], [role="combobox"][aria-label*="Condition" i], button[aria-label*="Condição" i], button[aria-label*="Condition" i], div[aria-label*="Condição" i][role="button"]',
        conditionOption: '[role="option"], [data-visualcompletion="ignore-dynamic"], div[role="option"]',
        
        // Brand input
        brandInput: 'input[placeholder*="Marca" i], input[placeholder*="Brand" i], input[aria-label*="marca" i], input[aria-label*="brand" i], input[name="brand"]',
        
        // Image upload - Updated selectors
        imageUploadArea: '[aria-label*="Adicione fotos" i], [aria-label*="Add photos" i], [aria-label*="foto" i], [aria-label*="photo" i], div[role="button"][tabindex="0"][aria-label*="Adicionar fotos"]',
        imageUploadInput: 'input[type="file"][accept*="image"], input[type="file"]:not([accept*="video"])',
        imagePreview: 'img[src*="blob:"], img[src*="scontent"]',
        
        // Video upload - Updated selectors
        videoUploadArea: '[aria-label*="Adicione vídeo" i], [aria-label*="Add video" i], [aria-label*="vídeo" i], [aria-label*="video" i], div[role="button"][tabindex="0"][aria-label*="Adicionar vídeo"]',
        videoUploadInput: 'input[type="file"][accept*="video"]',
        videoPreview: 'video[src*="blob:"], video[src*="scontent"]',
        
        // Tags/Keywords
        tagsInput: 'input[placeholder*="palavra" i], input[placeholder*="keyword" i], input[placeholder*="tag" i], input[aria-label*="tag" i], input[name="tags"]',
        
        // Navigation buttons - Updated for current UI
        nextButton: '[aria-label*="Avançar" i], [aria-label*="Next" i], [aria-label*="Próximo" i], button:contains("Avançar"), button:contains("Next"), div[role="button"][aria-label*="Avançar"]',
        publishButton: '[aria-label*="Publicar" i], [aria-label*="Publish" i], button:contains("Publicar"), button:contains("Publish"), div[role="button"][aria-label*="Publicar"]',
        errorMessage: '[role="alert"], .error, [data-testid*="error"], [aria-live="polite"], div[role="alert"]',
        
        // Loading indicators
        loadingSpinner: '[role="progressbar"], .loading, [aria-label*="Carregando" i], [aria-label*="Loading" i], div[role="progressbar"]',
        
        // Success indicators
        successMessage: '[role="alert"][aria-live="polite"], .success, [data-testid*="success"], div[role="alert"][aria-live="polite"]'
      };
    }

    /**
     * Initialize automation with improved error handling
     */
    async init() {
      if (this.isInitialized) return;

      this.log('Initializing Facebook Marketplace Automation...');
      
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
      // Check for common logged-in indicators
      const indicators = [
        '[aria-label*="Seu perfil" i]',
        '[aria-label*="Your profile" i]',
        '[data-testid="blue_bar_profile_link"]',
        'div[role="banner"] a[href*="/profile"]'
      ];

      return indicators.some(selector => document.querySelector(selector));
    }

    /**
     * Main function to publish an ad with improved error handling
     */
    async publishAd(adData) {
      this.log('Starting ad publication:', adData.title);

      try {
        await this.init();
        
        // Navigate to create listing page
        await this.navigateToCreateListing();
        
        // Wait for page to fully load
        await this.waitForPageLoad();
        
        // Select item type if needed
        await this.selectItemType();
        
        // Fill the form step by step
        await this.fillAdForm(adData);
        
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
     * Navigate to create listing page with improved navigation
     */
    async navigateToCreateListing() {
      this.log('Navigating to create listing page');
      
      // If already on create page, return
      if (window.location.href.includes('/marketplace/create')) {
        this.log('Already on create page');
        return;
      }

      // Try to find "Create new listing" button on current page
      const createButton = document.querySelector('[aria-label*="Criar novo" i], [aria-label*="Create new" i], a[href*="/marketplace/create"]');
      
      if (createButton) {
        this.log('Found create button, clicking...');
        await this.clickElement(createButton);
        await this.waitForNavigation('/marketplace/create');
      } else {
        // Navigate directly
        this.log('Navigating directly to create page');
        window.location.href = 'https://www.facebook.com/marketplace/create';
        await this.waitForNavigation('/marketplace/create');
      }

      await this.waitForPageLoad();
    }

    /**
     * Select item type (Item for sale)
     */
    async selectItemType() {
      this.log('Selecting item type');
      
      try {
        // Look for item type selection
        const itemForSaleButton = await this.waitForElement(
          '[aria-label*="Item para venda" i], [aria-label*="Item for sale" i], div:contains("Item para venda"), div:contains("Item for sale")',
          5000
        );
        
        if (itemForSaleButton) {
          this.log('Found item type selector, clicking...');
          await this.clickElement(itemForSaleButton);
          await this.sleep(2000 + Math.random() * 1000); // Add random delay
        }
      } catch (error) {
        this.log('Item type selection not needed or not found');
      }
    }

    /**
     * Fill ad form with improved field detection
     */
    async fillAdForm(adData) {
      this.log('Filling ad form:', adData.title);

      try {
        // Upload images first (if any)
        if (adData.images && adData.images.length > 0) {
          await this.uploadImages(adData.images);
        }

        // Upload video (if any)
        if (adData.video) {
          await this.uploadVideo(adData.video);
        }

        // Fill text fields
        await this.fillTitle(adData.title);
        await this.fillPrice(adData.price);
        await this.selectCategory(adData.category);
        await this.selectCondition(adData.condition);
        await this.fillDescription(adData.description);
        await this.fillLocation(adData.location);
        
        // Fill optional fields
        if (adData.brand) {
          await this.fillBrand(adData.brand);
        }
        
        if (adData.tags && adData.tags.length > 0) {
          await this.fillTags(adData.tags);
        }

        this.log('Form filled successfully');
        return true;

      } catch (error) {
        this.log('Error filling form:', error);
        throw error;
      }
    }

    /**
     * Fill title field with improved detection
     */
    async fillTitle(title) {
      this.log('Filling title:', title);
      
      const titleInput = await this.waitForElement(this.selectors.titleInput, 10000);
      await this.clearAndFillInput(titleInput, title);
      await this.sleep(500 + Math.random() * 200); // Add random delay
      
      // Verify title was filled
      if (titleInput.value !== title) {
        throw new Error('Title field was not filled correctly');
      }
    }

    /**
     * Fill price field with improved validation
     */
    async fillPrice(price) {
      this.log('Filling price:', price);
      
      const priceInput = await this.waitForElement(this.selectors.priceInput, 10000);
      
      // Clean price value (remove currency symbols, etc.)
      const cleanPrice = price.toString().replace(/[^\d.,]/g, '');
      
      await this.clearAndFillInput(priceInput, cleanPrice);
      await this.sleep(500 + Math.random() * 200); // Add random delay
      
      // Verify price was filled
      const filledValue = priceInput.value.replace(/[^\d.,]/g, '');
      if (filledValue !== cleanPrice) {
        this.log('Price verification failed, retrying...');
        await this.clearAndFillInput(priceInput, cleanPrice);
      }
    }

    /**
     * Select category with improved dropdown handling
     */
    async selectCategory(category) {
      this.log('Selecting category:', category);
      
      try {
        // Find and click category dropdown
        const categoryDropdown = await this.waitForElement(this.selectors.categoryDropdown, 10000);
        await this.clickElement(categoryDropdown);
        await this.sleep(1500 + Math.random() * 500);

        // Wait for options to appear
        await this.waitForElement(this.selectors.categoryOption, 5000);
        
        // Find matching category option
        const categoryOptions = document.querySelectorAll(this.selectors.categoryOption);
        const categoryMap = this.getCategoryMap();
        const targetCategory = categoryMap[category] || category;

        let optionFound = false;
        for (const option of categoryOptions) {
          const optionText = option.textContent.toLowerCase().trim();
          if (optionText.includes(targetCategory.toLowerCase()) || 
              targetCategory.toLowerCase().includes(optionText)) {
            this.log('Found matching category option:', optionText);
            await this.clickElement(option);
            await this.sleep(1000 + Math.random() * 300);
            optionFound = true;
            break;
          }
        }

        if (!optionFound) {
          this.log('Category not found, using first available option');
          if (categoryOptions.length > 0) {
            await this.clickElement(categoryOptions[0]);
            await this.sleep(1000 + Math.random() * 300);
          }
        }

      } catch (error) {
        this.log('Category selection failed:', error);
        // Continue without category selection
      }
    }

    /**
     * Select condition with improved dropdown handling
     */
    async selectCondition(condition) {
      this.log('Selecting condition:', condition);
      
      try {
        // Find and click condition dropdown
        const conditionDropdown = await this.waitForElement(this.selectors.conditionDropdown, 10000);
        await this.clickElement(conditionDropdown);
        await this.sleep(1500 + Math.random() * 500);

        // Wait for options to appear
        await this.waitForElement(this.selectors.conditionOption, 5000);
        
        // Find matching condition option
        const conditionOptions = document.querySelectorAll(this.selectors.conditionOption);
        const conditionMap = this.getConditionMap();
        const targetCondition = conditionMap[condition] || condition;

        let optionFound = false;
        for (const option of conditionOptions) {
          const optionText = option.textContent.toLowerCase().trim();
          if (optionText.includes(targetCondition.toLowerCase()) || 
              targetCondition.toLowerCase().includes(optionText)) {
            this.log('Found matching condition option:', optionText);
            await this.clickElement(option);
            await this.sleep(1000 + Math.random() * 300);
            optionFound = true;
            break;
          }
        }

        if (!optionFound) {
          this.log('Condition not found, using first available option');
          if (conditionOptions.length > 0) {
            await this.clickElement(conditionOptions[0]);
            await this.sleep(1000 + Math.random() * 300);
          }
        }

      } catch (error) {
        this.log('Condition selection failed:', error);
        // Continue without condition selection
      }
    }

    /**
     * Fill description field
     */
    async fillDescription(description) {
      this.log('Filling description');
      
      const descriptionInput = await this.waitForElement(this.selectors.descriptionInput, 10000);
      await this.clearAndFillInput(descriptionInput, description);
      await this.sleep(500 + Math.random() * 200);
    }

    /**
     * Fill location field with autocomplete handling
     */
    async fillLocation(location) {
      this.log('Filling location:', location);
      
      try {
        const locationInput = await this.waitForElement(this.selectors.locationInput, 10000);
        await this.clearAndFillInput(locationInput, location);
        await this.sleep(2000 + Math.random() * 500); // Wait for autocomplete suggestions
        
        // Press Enter to select first suggestion or confirm input
        locationInput.dispatchEvent(new KeyboardEvent('keydown', { 
          key: 'Enter', 
          bubbles: true, 
          cancelable: true 
        }));
        await this.sleep(1000 + Math.random() * 300);
        
      } catch (error) {
        this.log('Location filling failed:', error);
        // Continue without location
      }
    }

    /**
     * Fill brand field
     */
    async fillBrand(brand) {
      this.log('Filling brand:', brand);
      
      try {
        const brandInput = await this.waitForElement(this.selectors.brandInput, 5000);
        await this.clearAndFillInput(brandInput, brand);
        await this.sleep(500 + Math.random() * 200);
      } catch (error) {
        this.log('Brand field not found, skipping');
      }
    }

    /**
     * Fill tags field
     */
    async fillTags(tags) {
      this.log('Filling tags:', tags);
      
      try {
        const tagsInput = await this.waitForElement(this.selectors.tagsInput, 5000);
        const tagsString = Array.isArray(tags) ? tags.join(', ') : tags;
        await this.clearAndFillInput(tagsInput, tagsString);
        await this.sleep(500 + Math.random() * 200);
      } catch (error) {
        this.log('Tags field not found, skipping');
      }
    }

    /**
     * Upload images to the form
     */
    async uploadImages(imageUrls) {
      this.log('Uploading images:', imageUrls);
      
      try {
        const imageUploadArea = await this.waitForElement(this.selectors.imageUploadArea, 10000);
        await this.clickElement(imageUploadArea);
        await this.sleep(1000);

        const imageUploadInput = await this.waitForElement(this.selectors.imageUploadInput, 5000);
        
        // Create a DataTransfer object to simulate file selection
        const dataTransfer = new DataTransfer();
        for (const url of imageUrls) {
          const response = await fetch(url);
          const blob = await response.blob();
          const file = new File([blob], 'image.jpg', { type: blob.type });
          dataTransfer.items.add(file);
        }

        imageUploadInput.files = dataTransfer.files;
        imageUploadInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('Image files set on input');

        // Wait for images to appear in preview
        await this.waitForElement(this.selectors.imagePreview, this.uploadDelay * imageUrls.length);
        this.log('Images uploaded successfully');

      } catch (error) {
        this.log('Error uploading images:', error);
        throw error;
      }
    }

    /**
     * Upload video to the form
     */
    async uploadVideo(videoUrl) {
      this.log('Uploading video:', videoUrl);
      
      try {
        const videoUploadArea = await this.waitForElement(this.selectors.videoUploadArea, 10000);
        await this.clickElement(videoUploadArea);
        await this.sleep(1000);

        const videoUploadInput = await this.waitForElement(this.selectors.videoUploadInput, 5000);
        
        // Create a DataTransfer object to simulate file selection
        const dataTransfer = new DataTransfer();
        const response = await fetch(videoUrl);
        const blob = await response.blob();
        const file = new File([blob], 'video.mp4', { type: blob.type });
        dataTransfer.items.add(file);

        videoUploadInput.files = dataTransfer.files;
        videoUploadInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.log('Video file set on input');

        // Wait for video to appear in preview
        await this.waitForElement(this.selectors.videoPreview, this.uploadDelay);
        this.log('Video uploaded successfully');

      } catch (error) {
        this.log('Error uploading video:', error);
        throw error;
      }
    }

    /**
     * Submit the ad form
     */
    async submitAdForm() {
      this.log('Submitting ad form');
      
      const publishButton = await this.waitForElement(this.selectors.publishButton, 10000);
      await this.clickElement(publishButton);
      this.log('Publish button clicked');
    }

    /**
     * Wait for page to fully load
     */
    async waitForPageLoad() {
      this.log('Waiting for page to load...');
      await this.sleep(this.stepDelay);
      // Add more robust checks here if needed, e.g., waiting for specific elements
      this.log('Page loaded');
    }

    /**
     * Wait for navigation to a specific URL
     */
    async waitForNavigation(targetUrl, timeout = 15000) {
      this.log('Waiting for navigation to:', targetUrl);
      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        if (window.location.href.includes(targetUrl)) {
          this.log('Navigation successful to:', targetUrl);
          return true;
        }
        await this.sleep(500);
      }
      throw new Error(`Navigation to ${targetUrl} timed out`);
    }

    /**
     * Wait for publish confirmation or error
     */
    async waitForPublishConfirmation() {
      this.log('Waiting for publish confirmation...');
      try {
        await this.waitForElement(this.selectors.successMessage, 30000); // Wait up to 30 seconds for success
        this.log('Publish confirmation received');
        return true;
      } catch (error) {
        // Check for error message if success not found
        try {
          const errorMessage = await this.waitForElement(this.selectors.errorMessage, 5000); // Wait 5 seconds for error
          const errorText = errorMessage.textContent;
          this.log('Publish error received:', errorText);
          throw new Error(`Publish failed: ${errorText}`);
        } catch (noErrorFound) {
          this.log('No specific success or error message found, assuming timeout or unexpected state.');
          throw new Error('Publish confirmation timed out or unexpected error occurred.');
        }
      }
    }

    /**
     * Helper to wait for a specific element to appear in the DOM
     */
    async waitForElement(selector, timeout = 10000) {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
          const element = document.querySelector(selector);
          if (element) {
            clearInterval(interval);
            resolve(element);
          } else if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            reject(new Error(`Element with selector ${selector} not found within timeout`));
          }
        }, 500);
      });
    }

    /**
     * Helper to simulate a delay
     */
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Helper to click an element
     */
    async clickElement(element) {
      this.log('Clicking element:', element);
      element.click();
      await this.sleep(500 + Math.random() * 200); // Small delay after click
    }

    /**
     * Helper to clear and fill an input field
     */
    async clearAndFillInput(element, value) {
      this.log('Clearing and filling input:', element, value);
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      await this.sleep(500 + Math.random() * 200); // Small delay after filling
    }

    /**
     * Helper for logging
     */
    log(...args) {
      if (this.debugMode) {
        console.log('[MarketplaceAutomation]', ...args);
      }
    }

    /**
     * Get category mapping (example, should be dynamic)
     */
    getCategoryMap() {
      return {
        'eletronicos': 'Eletrônicos e computadores',
        'veiculos': 'Veículos',
        'imoveis': 'Imóveis para alugar',
        'roupas': 'Roupas e acessórios'
      };
    }

    /**
     * Get condition mapping (example, should be dynamic)
     */
    getConditionMap() {
      return {
        'novo': 'Novo',
        'usado': 'Usado - Como novo',
        'bom': 'Usado - Bom',
        'razoavel': 'Usado - Razoável'
      };
    }
  }

  // Export for use in other modules
  if (typeof window !== 'undefined') {
    window.MarketplaceAutomation = MarketplaceAutomation;
  }
})();

