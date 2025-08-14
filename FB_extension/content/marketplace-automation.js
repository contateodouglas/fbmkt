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
     * Upload images with improved file handling
     */
    async uploadImages(images) {
      this.log('Uploading images:', images.length);
      
      try {
        // Find image upload area or input
        let uploadElement = document.querySelector(this.selectors.imageUploadArea);
        
        if (!uploadElement) {
          uploadElement = document.querySelector(this.selectors.imageUploadInput);
        }

        if (!uploadElement) {
          // Try to find any file input that accepts images
          const fileInputs = document.querySelectorAll('input[type="file"]');
          for (const input of fileInputs) {
            const accept = input.getAttribute('accept');
            if (!accept || accept.includes('image')) {
              uploadElement = input;
              break;
            }
          }
        }

        if (!uploadElement) {
          throw new Error('Image upload element not found');
        }

        // If it's a clickable area, click it to reveal file input
        if (uploadElement.tagName !== 'INPUT') {
          await this.clickElement(uploadElement);
          await this.sleep(1000 + Math.random() * 300);
          
          // Now find the actual file input
          uploadElement = document.querySelector(this.selectors.imageUploadInput);
          if (!uploadElement) {
            uploadElement = document.querySelector('input[type="file"]');
          }
        }

        if (!uploadElement || uploadElement.tagName !== 'INPUT') {
          throw new Error('File input not found after clicking upload area');
        }

        // Upload images one by one
        for (let i = 0; i < Math.min(images.length, 10); i++) {
          const imageData = images[i];
          
          if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            this.log(`Uploading image ${i + 1}/${images.length}`);
            
            // Convert base64 to file
            const file = await this.base64ToFile(imageData, `image_${i + 1}.jpg`);
            
            // Create file list with single file
            const fileList = new DataTransfer();
            fileList.items.add(file);
            
            // Set files to input
            uploadElement.files = fileList.files;
            
            // Trigger change event
            uploadElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Wait for upload to process
            await this.sleep(this.uploadDelay + Math.random() * 1000);
            
            // Check for upload completion
            await this.waitForImageUpload(i + 1);
          }
        }

        this.log('Images uploaded successfully');

      } catch (error) {
        this.log('Image upload failed:', error);
        // Don't throw error, continue with ad creation
      }
    }

    /**
     * Upload video with improved handling
     */
    async uploadVideo(video) {
      if (!video) return;

      this.log('Uploading video:', video.name);
      
      try {
        // Find video upload area or input
        let uploadElement = document.querySelector(this.selectors.videoUploadArea);
        
        if (!uploadElement) {
          uploadElement = document.querySelector(this.selectors.videoUploadInput);
        }

        if (!uploadElement) {
          // Try to find any file input that accepts videos
          const fileInputs = document.querySelectorAll('input[type="file"]');
          for (const input of fileInputs) {
            const accept = input.getAttribute('accept');
            if (accept && accept.includes('video')) {
              uploadElement = input;
              break;
            }
          }
        }

        if (!uploadElement) {
          this.log('Video upload not supported on this page');
          return;
        }

        // If it's a clickable area, click it to reveal file input
        if (uploadElement.tagName !== 'INPUT') {
          await this.clickElement(uploadElement);
          await this.sleep(1000 + Math.random() * 300);
          
          uploadElement = document.querySelector(this.selectors.videoUploadInput);
        }

        if (!uploadElement || uploadElement.tagName !== 'INPUT') {
          this.log('Video file input not found');
          return;
        }

        // Convert base64 video to file
        if (typeof video.dataUrl === 'string' && video.dataUrl.startsWith('data:')) {
          const file = await this.base64ToFile(video.dataUrl, video.name, video.type);
          
          // Create file list
          const fileList = new DataTransfer();
          fileList.items.add(file);
          
          // Set files to input
          uploadElement.files = fileList.files;
          
          // Trigger change event
          uploadElement.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Wait for upload to complete (videos take longer)
          await this.sleep(this.uploadDelay * 3 + Math.random() * 2000);
          
          // Check for upload completion
          await this.waitForVideoUpload();
          
          this.log('Video uploaded successfully');
        }

      } catch (error) {
        this.log('Video upload failed:', error);
        // Don't throw error, continue with ad creation
      }
    }

    /**
     * Submit the ad form
     */
    async submitAdForm() {
      this.log('Submitting ad form');
      
      try {
        // Look for Next button first
        let submitButton = document.querySelector(this.selectors.nextButton);
        
        if (submitButton) {
          this.log('Found Next button, clicking...');
          await this.clickElement(submitButton);
          await this.sleep(3000 + Math.random() * 1000);
          
          // After clicking Next, look for Publish button
          await this.waitForElement(this.selectors.publishButton, 10000);
          submitButton = document.querySelector(this.selectors.publishButton);
        } else {
          // Look directly for Publish button
          submitButton = await this.waitForElement(this.selectors.publishButton, 10000);
        }

        if (!submitButton) {
          throw new Error('Submit button not found');
        }

        this.log('Found Publish button, clicking...');
        await this.clickElement(submitButton);
        await this.sleep(2000 + Math.random() * 500);

      } catch (error) {
        this.log('Submit button interaction failed:', error);
        throw error;
      }
    }

    /**
     * Wait for publish confirmation
     */
    async waitForPublishConfirmation() {
      this.log('Waiting for publish confirmation');
      
      try {
        // Wait for success message or navigation away from create page
        const timeout = 30000; // 30 seconds
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
          // Check for success message
          const successMessage = document.querySelector(this.selectors.successMessage);
          if (successMessage) {
            this.log('Success message found');
            return true;
          }
          
          // Check if we navigated away from create page
          if (!window.location.href.includes('/marketplace/create')) {
            this.log('Navigated away from create page - likely successful');
            return true;
          }
          
          // Check for error messages
          const errorMessage = document.querySelector(this.selectors.errorMessage);
          if (errorMessage) {
            throw new Error(`Publish failed: ${errorMessage.textContent}`);
          }
          
          await this.sleep(1000);
        }
        
        throw new Error('Publish confirmation timeout');
        
      } catch (error) {
        this.log('Publish confirmation failed:', error);
        throw error;
      }
    }

    /**
     * Wait for element to appear with improved error handling
     */
    async waitForElement(selector, timeout = 10000) {
      this.log(`Waiting for element: ${selector}`);
      
      return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
          this.log('Element found immediately');
          resolve(element);
          return;
        }

        const observer = new MutationObserver((mutations, obs) => {
          const element = document.querySelector(selector);
          if (element) {
            this.log('Element found via observer');
            obs.disconnect();
            resolve(element);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        });

        setTimeout(() => {
          observer.disconnect();
          this.log(`Element not found within ${timeout}ms: ${selector}`);
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
      });
    }

    /**
     * Wait for navigation to complete
     */
    async waitForNavigation(expectedPath, timeout = 15000) {
      this.log(`Waiting for navigation to: ${expectedPath}`);
      
      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkNavigation = () => {
          if (window.location.href.includes(expectedPath)) {
            this.log('Navigation completed');
            resolve();
          } else if (Date.now() - startTime > timeout) {
            reject(new Error(`Navigation timeout: ${expectedPath}`));
          } else {
            setTimeout(checkNavigation, 500);
          }
        };
        
        checkNavigation();
      });
    }

    /**
     * Wait for page to fully load
     */
    async waitForPageLoad() {
      this.log('Waiting for page to load');
      
      return new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve, { once: true });
        }
      });
    }

    /**
     * Wait for image upload to complete
     */
    async waitForImageUpload(imageIndex = 1) {
      this.log(`Waiting for image ${imageIndex} upload to complete`);
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();

      return new Promise(async (resolve, reject) => {
        while (Date.now() - startTime < timeout) {
          const imagePreview = document.querySelectorAll(this.selectors.imagePreview);
          if (imagePreview.length >= imageIndex) {
            this.log(`Image ${imageIndex} preview found`);
            resolve(true);
            return;
          }
          await this.sleep(1000);
        }
        reject(new Error(`Image ${imageIndex} upload timeout`));
      });
    }

    /**
     * Wait for video upload to complete
     */
    async waitForVideoUpload() {
      this.log('Waiting for video upload to complete');
      const timeout = 60000; // 60 seconds
      const startTime = Date.now();

      return new Promise(async (resolve, reject) => {
        while (Date.now() - startTime < timeout) {
          const videoPreview = document.querySelector(this.selectors.videoPreview);
          if (videoPreview) {
            this.log('Video preview found');
            resolve(true);
            return;
          }
          await this.sleep(1000);
        }
        reject(new Error('Video upload timeout'));
      });
    }

    /**
     * Helper function to clear and fill input fields
     */
    async clearAndFillInput(element, value) {
      element.focus();
      element.value = '';
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      for (let i = 0; i < value.length; i++) {
        const char = value.charAt(i);
        element.value += char;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keypress', { key: char, bubbles: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
        await this.sleep(50 + Math.random() * 30); // Simulate typing speed with variation
      }
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.blur();
    }

    /**
     * Helper function to click elements with retry logic
     */
    async clickElement(element, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          // Simulate mouse movement before click
          const rect = element.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top + rect.height / 2;
          
          element.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true }));
          await this.sleep(100 + Math.random() * 50);

          element.click();
          this.log('Clicked element:', element);
          return;
        } catch (error) {
          this.log(`Click failed, retrying (${i + 1}/${retries}):`, error);
          await this.sleep(500 + Math.random() * 200);
        }
      }
      throw new Error('Failed to click element after multiple retries');
    }

    /**
     * Helper function for logging
     */
    log(...args) {
      if (this.debugMode) {
        console.log('[MarketplaceAutomation]', ...args);
      }
    }

    /**
     * Helper function for sleep
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Helper function to convert base64 to File object
     */
    async base64ToFile(base64, filename, mimeType) {
      const res = await fetch(base64);
      const blob = await res.blob();
      return new File([blob], filename, { type: mimeType || blob.type });
    }

    /**
     * Category mapping (example, can be expanded)
     */
    getCategoryMap() {
      return {
        'veículos': 'Veículos',
        'eletrônicos': 'Eletrônicos',
        'roupas': 'Roupas e acessórios',
        'casa e jardim': 'Casa e jardim'
      };
    }

    /**
     * Condition mapping (example, can be expanded)
     */
    getConditionMap() {
      return {
        'novo': 'Novo',
        'usado - como novo': 'Usado - Como novo',
        'usado - bom': 'Usado - Bom',
        'usado - razoável': 'Usado - Razoável'
      };
    }
  }

  // Expose the class to the global scope for content script to use
  window.MarketplaceAutomation = MarketplaceAutomation;
})();



    /**
     * Wait for page to fully load
     */
    async waitForPageLoad() {
      this.log('Waiting for page to load');
      
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve, { once: true });
        }
      });
    }

    /**
     * Wait for navigation to complete
     */
    async waitForNavigation(expectedPath) {
      this.log('Waiting for navigation to:', expectedPath);
      
      const timeout = 15000; // 15 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        if (window.location.href.includes(expectedPath)) {
          this.log('Navigation completed');
          return true;
        }
        await this.sleep(500);
      }
      
      throw new Error(`Navigation timeout: expected ${expectedPath}`);
    }

    /**
     * Wait for image upload to complete
     */
    async waitForImageUpload(expectedCount) {
      this.log(`Waiting for image upload completion (${expectedCount} images)`);
      
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const uploadedImages = document.querySelectorAll(this.selectors.imagePreview);
        if (uploadedImages.length >= expectedCount) {
          this.log('Image upload completed');
          return true;
        }
        
        // Check for loading indicators
        const loadingSpinner = document.querySelector(this.selectors.loadingSpinner);
        if (!loadingSpinner) {
          // No loading spinner, assume upload is complete
          return true;
        }
        
        await this.sleep(1000);
      }
      
      this.log('Image upload timeout, continuing anyway');
      return false;
    }

    /**
     * Wait for video upload to complete
     */
    async waitForVideoUpload() {
      this.log('Waiting for video upload completion');
      
      const timeout = 60000; // 60 seconds for video
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        const uploadedVideo = document.querySelector(this.selectors.videoPreview);
        if (uploadedVideo) {
          this.log('Video upload completed');
          return true;
        }
        
        // Check for loading indicators
        const loadingSpinner = document.querySelector(this.selectors.loadingSpinner);
        if (!loadingSpinner) {
          // No loading spinner, assume upload is complete
          return true;
        }
        
        await this.sleep(2000);
      }
      
      this.log('Video upload timeout, continuing anyway');
      return false;
    }

    /**
     * Clear and fill input field
     */
    async clearAndFillInput(input, value) {
      this.log('Clearing and filling input:', value);
      
      // Clear the input
      input.focus();
      input.select();
      input.value = '';
      
      // Trigger events to clear
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      
      await this.sleep(200);
      
      // Fill with new value
      await this.typeText(input, value);
    }

    /**
     * Publish ad form (alias for submitAdForm for compatibility)
     */
    async publishAdForm() {
      return await this.submitAdForm();
    }

