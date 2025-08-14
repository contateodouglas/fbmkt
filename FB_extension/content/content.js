// Content script for Facebook Marketplace Auto Poster Extension
// Bridges communication between background script and marketplace automation

(function() {
  // Ensure Utils and MarketplaceAutomation are available from the global scope
  const Utils = window.Utils;
  const MarketplaceAutomation = window.MarketplaceAutomation;

  /**
   * Content script manager with robust messaging
   */
  class ContentScript {
    constructor() {
      this.automation = null;
      this.isInitialized = false;
      this.messageHandlers = new Map();
      this.backgroundPort = null;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 1000; // Start with 1 second
    }

    /**
     * Initialize content script
     */
    async init() {
      if (this.isInitialized) return;

      console.log("[Content Script] Initializing on:", window.location.href);

      // Check if we're on Facebook Marketplace
      if (!this.isMarketplacePage()) {
        console.log("[Content Script] Not on marketplace page, skipping initialization");
        return;
      }

      try {
        // Initialize marketplace automation
        this.automation = new MarketplaceAutomation();
        await this.automation.init();

        // Set up robust messaging system
        this.setupRobustMessaging();

        // Set up event listeners
        this.setupEventListeners();

        this.isInitialized = true;
        console.log("[Content Script] Initialized successfully");

        // Notify background script that content script is ready
        this.sendMessageToBackground({
          type: "CONTENT_SCRIPT_READY",
          data: { url: window.location.href }
        });

      } catch (error) {
        console.error("[Content Script] Initialization failed:", error);
      }
    }

    /**
     * Check if current page is Facebook Marketplace
     */
    isMarketplacePage() {
      return window.location.href.includes("facebook.com/marketplace");
    }

    /**
     * Set up robust messaging system
     */
    setupRobustMessaging() {
      // Set up message handlers for one-time messages
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open for async response
      });

      // Set up long-lived connection for reliable communication
      this.connectToBackground();

      console.log("[Content Script] Robust messaging system set up");
    }

    /**
     * Connect to background script with automatic reconnection
     */
    connectToBackground() {
      try {
        // Create long-lived connection
        this.backgroundPort = chrome.runtime.connect({ name: "content-script-port" });
        
        this.backgroundPort.onMessage.addListener((message) => {
          this.handlePortMessage(message);
        });

        this.backgroundPort.onDisconnect.addListener(() => {
          console.log("[Content Script] Background port disconnected");
          this.backgroundPort = null;
          
          // If the port is disconnected due to context invalidation, try to re-initialize
          if (chrome.runtime.lastError && chrome.runtime.lastError.message.includes("Extension context invalidated")) {
            console.warn("[Content Script] Extension context invalidated. Attempting re-initialization.");
            this.isInitialized = false; // Reset initialization flag
            this.init(); // Re-initialize the content script
          } else {
            // Attempt to reconnect for other disconnection reasons
            this.attemptReconnection();
          }
        });

        // Reset reconnection attempts on successful connection
        this.reconnectAttempts = 0;
        console.log("[Content Script] Connected to background script");

      } catch (error) {
        console.error("[Content Script] Failed to connect to background:", error);
        this.attemptReconnection();
      }
    }

    /**
     * Attempt to reconnect to background script
     */
    attemptReconnection() {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log("[Content Script] Max reconnection attempts reached, giving up");
        return;
      }

      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(`[Content Script] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

      setTimeout(() => {
        this.connectToBackground();
      }, delay);
    }

    /**
     * Handle messages from port connection
     */
    async handlePortMessage(message) {
      console.log("[Content Script] Received port message:", message.type);

      try {
        let response;

        switch (message.type) {
          case "PING":
            // Respond to ping to indicate content script is ready
            response = { success: true, ready: true };
            break;

          case "PUBLISH_AD":
            response = await this.handlePublishAd(message.data);
            break;

          case "FILL_FORM":
            response = await this.handleFillForm(message.data);
            break;

          case "CHECK_PAGE_STATUS":
            response = this.handleCheckPageStatus();
            break;

          case "NAVIGATE_TO_CREATE":
            response = await this.handleNavigateToCreate();
            break;

          case "GET_FORM_DATA":
            response = await this.handleGetFormData();
            break;

          case "CLEAR_FORM":
            response = await this.handleClearForm();
            break;

          default:
            console.warn("[Content Script] Unknown port message type:", message.type);
            response = { success: false, error: "Unknown message type" };
        }

        // Send response back through port
        if (this.backgroundPort && message.type) {
          this.backgroundPort.postMessage({
            type: `${message.type}_RESPONSE`,
            response: response
          });
        }

      } catch (error) {
        console.error("[Content Script] Error handling port message:", error);
        
        if (this.backgroundPort && message.type) {
          this.backgroundPort.postMessage({
            type: `${message.type}_RESPONSE`,
            response: { success: false, error: error.message }
          });
        }
      }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
      // Listen for page navigation changes
      let lastUrl = window.location.href;
      
      const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
          lastUrl = window.location.href;
          this.handleUrlChange();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Listen for page visibility changes
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.handlePageVisible();
        }
      });

      // Listen for beforeunload to clean up connections
      window.addEventListener("beforeunload", () => {
        this.cleanup();
      });

      console.log("[Content Script] Event listeners set up");
    }

    /**
     * Handle messages from background script (fallback method)
     */
    async handleMessage(message, sender, sendResponse) {
      console.log("[Content Script] Received message:", message.type);

      try {
        switch (message.type) {
          case "PING":
            // Respond to ping to indicate content script is ready
            sendResponse({ success: true, ready: true });
            break;

          case "PUBLISH_AD":
            const publishResult = await this.handlePublishAd(message.data);
            sendResponse(publishResult);
            break;

          case "FILL_FORM":
            const fillResult = await this.handleFillForm(message.data);
            sendResponse(fillResult);
            break;

          case "CHECK_PAGE_STATUS":
            const statusResult = this.handleCheckPageStatus();
            sendResponse(statusResult);
            break;

          case "NAVIGATE_TO_CREATE":
            const navResult = await this.handleNavigateToCreate();
            sendResponse(navResult);
            break;

          case "GET_FORM_DATA":
            const dataResult = await this.handleGetFormData();
            sendResponse(dataResult);
            break;

          case "CLEAR_FORM":
            const clearResult = await this.handleClearForm();
            sendResponse(clearResult);
            break;

          default:
            console.warn("[Content Script] Unknown message type:", message.type);
            sendResponse({ success: false, error: "Unknown message type" });
        }

      } catch (error) {
        console.error("[Content Script] Error handling message:", error);
        sendResponse({ success: false, error: error.message });
      }
    }

    /**
     * Handle publish ad request
     */
    async handlePublishAd(adData) {
      console.log("[Content Script] Publishing ad:", adData.title);

      try {
        if (!this.automation) {
          throw new Error("Automation not initialized");
        }

        // Fill the form with ad data
        await this.automation.fillAdForm(adData);

        // Wait a moment for form to be fully filled
        await this.sleep(2000);

        // Publish the ad
        await this.automation.publishAdForm();

        const result = {
          success: true,
          data: {
            message: "Ad published successfully",
            url: window.location.href
          }
        };

        // Notify background script of successful publication
        this.sendMessageToBackground({
          type: "AD_PUBLISHED",
          data: {
            adId: adData.id,
            title: adData.title,
            url: window.location.href
          }
        });

        return result;

      } catch (error) {
        console.error("[Content Script] Error publishing ad:", error);
        
        const result = {
          success: false,
          error: error.message
        };

        // Notify background script of failed publication
        this.sendMessageToBackground({
          type: "AD_PUBLISH_FAILED",
          data: {
            adId: adData.id,
            title: adData.title,
            error: error.message
          }
        });

        return result;
      }
    }

    /**
     * Handle fill form request
     */
    async handleFillForm(adData) {
      console.log("[Content Script] Filling form with ad data");

      try {
        if (!this.automation) {
          throw new Error("Automation not initialized");
        }

        await this.automation.fillAdForm(adData);

        return {
          success: true,
          data: { message: "Form filled successfully" }
        };

      } catch (error) {
        console.error("[Content Script] Error filling form:", error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    /**
     * Handle check page status request
     */
    handleCheckPageStatus() {
      const status = {
        url: window.location.href,
        isMarketplace: this.isMarketplacePage(),
        isCreatePage: window.location.href.includes("/marketplace/create"),
        isInitialized: this.isInitialized,
        hasAutomation: !!this.automation,
        portConnected: !!this.backgroundPort
      };

      console.log("[Content Script] Page status:", status);
      return { success: true, data: status };
    }

    /**
     * Handle navigate to create page request
     */
    async handleNavigateToCreate() {
      console.log("[Content Script] Navigating to create page");

      try {
        if (!this.automation) {
          throw new Error("Automation not initialized");
        }

        await this.automation.navigateToCreateListing();

        return {
          success: true,
          data: { url: window.location.href }
        };

      } catch (error) {
        console.error("[Content Script] Error navigating to create page:", error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    /**
     * Handle get form data request
     */
    async handleGetFormData() {
      console.log("[Content Script] Getting current form data");

      try {
        const formData = await this.extractFormData();
        
        return {
          success: true,
          data: formData
        };

      } catch (error) {
        console.error("[Content Script] Error getting form data:", error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    /**
     * Handle clear form request
     */
    async handleClearForm() {
      console.log("[Content Script] Clearing form");

      try {
        await this.clearForm();
        
        return {
          success: true,
          data: { message: "Form cleared successfully" }
        };

      } catch (error) {
        console.error("[Content Script] Error clearing form:", error);
        return {
          success: false,
          error: error.message
        };
      }
    }

    /**
     * Extract current form data
     */
    async extractFormData() {
      const selectors = this.automation.selectors;
      const formData = {};

      try {
        // Extract title
        const titleInput = document.querySelector(selectors.titleInput);
        if (titleInput) formData.title = titleInput.value;

        // Extract description
        const descriptionInput = document.querySelector(selectors.descriptionInput);
        if (descriptionInput) formData.description = descriptionInput.value;

        // Extract price
        const priceInput = document.querySelector(selectors.priceInput);
        if (priceInput) formData.price = priceInput.value;

        // Extract location
        const locationInput = document.querySelector(selectors.locationInput);
        if (locationInput) formData.location = locationInput.value;

        // Extract brand
        const brandInput = document.querySelector(selectors.brandInput);
        if (brandInput) formData.brand = brandInput.value;

        // Extract tags
        const tagsInput = document.querySelector(selectors.tagsInput);
        if (tagsInput) formData.tags = tagsInput.value;

        console.log("[Content Script] Extracted form data:", formData);
        return formData;

      } catch (error) {
        console.error("[Content Script] Error extracting form data:", error);
        return {};
      }
    }

    /**
     * Clear form fields
     */
    async clearForm() {
      const selectors = this.automation.selectors;

      try {
        // Clear text inputs
        const inputs = [
          selectors.titleInput,
          selectors.descriptionInput,
          selectors.priceInput,
          selectors.locationInput,
          selectors.brandInput,
          selectors.tagsInput
        ];

        for (const selector of inputs) {
          const input = document.querySelector(selector);
          if (input) {
            input.value = "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }

        console.log("[Content Script] Form cleared");

      } catch (error) {
        console.error("[Content Script] Error clearing form:", error);
        throw error;
      }
    }

    /**
     * Handle URL changes
     */
    handleUrlChange() {
      console.log("[Content Script] URL changed to:", window.location.href);

      // Reinitialize if we navigated to a marketplace page
      if (this.isMarketplacePage() && !this.isInitialized) {
        setTimeout(() => {
          this.init();
        }, 1000);
      }
    }

    /**
     * Handle page becoming visible
     */
    handlePageVisible() {
      console.log("[Content Script] Page became visible");

      // Notify background script
      this.sendMessageToBackground({
        type: "PAGE_VISIBLE",
        data: { url: window.location.href }
      });
    }

    /**
     * Send message to background script with error handling
     */
    sendMessageToBackground(message) {
      if (this.backgroundPort) {
        try {
          this.backgroundPort.postMessage(message);
        } catch (error) {
          console.error("[Content Script] Error sending message via port:", error);
          // Fallback to chrome.runtime.sendMessage if port fails
          chrome.runtime.sendMessage(message).catch(err => {
            console.error("[Content Script] Fallback sendMessage failed:", err);
          });
        }
      } else {
        // If port is not established, use one-time message
        chrome.runtime.sendMessage(message).catch(err => {
          console.error("[Content Script] sendMessage failed (no port):", err);
        });
      }
    }

    /**
     * Sleep for a given duration
     */
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Clean up resources
     */
    cleanup() {
      if (this.backgroundPort) {
        this.backgroundPort.disconnect();
        this.backgroundPort = null;
      }
      this.isInitialized = false;
      console.log("[Content Script] Cleaned up resources");
    }
  }

  // Initialize the content script
  const contentScript = new ContentScript();
  contentScript.init();
})();

