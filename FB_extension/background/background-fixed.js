// Background script for Facebook Marketplace Auto Poster Extension
// Handles scheduling, alarms, and communication between components

/**
 * Background service worker for the extension
 */
class BackgroundService {
  constructor() {
    this.isInitialized = false;
    this.activePublishing = new Set();
    this.publishQueue = [];
    this.maxConcurrentPublishing = 3;
    this.publishDelay = 30000; // 30 seconds between posts
  }

  /**
   * Initialize background service
   */
  async init() {
    if (this.isInitialized) return;

    console.log("[Background] Initializing Facebook Marketplace Auto Poster");

    // Set up event listeners
    this.setupEventListeners();
    
    // Set up alarms for scheduled posts
    this.setupAlarms();
    
    // Check for pending scheduled posts
    this.checkScheduledPosts();

    this.isInitialized = true;
    console.log("[Background] Initialization complete");
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Message handling from popup and content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Add listener for long-lived connections from content scripts
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === "content-script-port") {
        console.log("[Background] Content script connected.");
        port.onMessage.addListener((message) => {
          // Handle port messages properly
          this.handlePortMessage(message, port);
        });
        port.onDisconnect.addListener(() => {
          console.log("[Background] Content script disconnected.");
        });
      }
    });

    // Alarm handling for scheduled posts
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    // Tab updates to inject content scripts
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });
  }

  /**
   * Handle extension installation
   */
  async handleInstallation(details) {
    console.log("[Background] Extension installed/updated:", details.reason);

    if (details.reason === "install") {
      // First time installation
      await this.setDefaultSettings();
      this.showWelcomeNotification();
    } else if (details.reason === "update") {
      // Extension updated
      this.showUpdateNotification();
    }
  }

  /**
   * Set default settings
   */
  async setDefaultSettings() {
    const defaultSettings = {
      autoPublish: true,
      publishDelay: 30, // seconds
      maxRetries: 3,
      notifications: true,
      debugMode: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    await chrome.storage.local.set({ settings: defaultSettings });
    console.log("[Background] Default settings saved");
  }

  /**
   * Handle messages from other parts of the extension
   */
  async handleMessage(message, sender, sendResponse) {
    console.log("[Background] Received message:", message.type);

    try {
      switch (message.type) {
        case "CHECK_FACEBOOK_CONNECTION":
          const connectionStatus = await this.checkFacebookConnection();
          sendResponse(connectionStatus);
          break;

        case "PUBLISH_AD":
          await this.publishAd(message.data);
          sendResponse({ success: true });
          break;

        case "SCHEDULE_AD":
          await this.scheduleAd(message.data);
          sendResponse({ success: true });
          break;

        case "CANCEL_SCHEDULED_AD":
          await this.cancelScheduledAd(message.data.id);
          sendResponse({ success: true });
          break;

        case "GET_PUBLISHING_STATUS":
          sendResponse({
            success: true,
            data: {
              active: Array.from(this.activePublishing),
              queue: this.publishQueue.length
            }
          });
          break;

        case "BULK_PUBLISH":
          await this.bulkPublish(message.data);
          sendResponse({ success: true });
          break;

        case "GET_SETTINGS":
          const settings = await this.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        case "UPDATE_SETTINGS":
          await this.updateSettings(message.data);
          sendResponse({ success: true });
          break;

        case "CONTENT_SCRIPT_READY":
          console.log("[Background] Content script ready on", message.data.url);
          sendResponse({ success: true });
          break;

        case "AD_PUBLISHED":
          await this.updateAdStatus(message.data.adId, "published", { url: message.data.url });
          this.showNotification(
            "Anúncio Publicado",
            `\"${message.data.title}\" foi publicado com sucesso!`,
            "success"
          );
          sendResponse({ success: true });
          break;

        case "AD_PUBLISH_FAILED":
          await this.updateAdStatus(message.data.adId, "failed", {
            lastError: message.data.error,
            attempts: (message.data.attempts || 0) + 1
          });
          this.showNotification(
            "Erro na Publicação",
            `Falha ao publicar \"${message.data.title}\": ${message.data.error}`,
            "error"
          );
          sendResponse({ success: true });
          break;

        case "PAGE_VISIBLE":
          console.log("[Background] Page visible:", message.data.url);
          sendResponse({ success: true });
          break;

        default:
          console.warn("[Background] Unknown message type:", message.type);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("[Background] Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle messages from port connections
   */
  async handlePortMessage(message, port) {
    console.log("[Background] Received port message:", message.type);

    try {
      // Check if this is a response message from content script
      if (message.type && message.type.endsWith("_RESPONSE")) {
        console.log("[Background] Received response:", message.type, message.response);
        // This is a response to a previous request, just log it
        return;
      }

      // Handle regular messages
      switch (message.type) {
        case "CONTENT_SCRIPT_READY":
          console.log("[Background] Content script ready on", message.data.url);
          break;

        case "AD_PUBLISHED":
          await this.updateAdStatus(message.data.adId, "published", { url: message.data.url });
          this.showNotification(
            "Anúncio Publicado",
            `\"${message.data.title}\" foi publicado com sucesso!`,
            "success"
          );
          break;

        case "AD_PUBLISH_FAILED":
          await this.updateAdStatus(message.data.adId, "failed", {
            lastError: message.data.error,
            attempts: (message.data.attempts || 0) + 1
          });
          this.showNotification(
            "Erro na Publicação",
            `Falha ao publicar \"${message.data.title}\": ${message.data.error}`,
            "error"
          );
          break;

        case "PAGE_VISIBLE":
          console.log("[Background] Page visible:", message.data.url);
          break;

        default:
          console.warn("[Background] Unknown port message type:", message.type);
      }
    } catch (error) {
      console.error("[Background] Error handling port message:", error);
    }
  }

  /**
   * Handle tab updates
   */
  handleTabUpdate(tabId, changeInfo, tab) {
    // Inject content script when Facebook Marketplace is loaded
    if (changeInfo.status === "complete" && 
        tab.url && 
        tab.url.includes("facebook.com/marketplace")) {
      
      console.log("[Background] Facebook Marketplace detected, injecting content script");
      
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["lib/utils.js", "content/marketplace-automation.js", "content/content.js"]
      }).catch(error => {
        console.error("[Background] Failed to inject content script:", error);
      });
    }
  }

  /**
   * Set up alarms for scheduled posts
   */
  setupAlarms() {
    // Create a recurring alarm to check for scheduled posts every minute
    chrome.alarms.create("checkScheduledPosts", {
      delayInMinutes: 1,
      periodInMinutes: 1
    });

    console.log("[Background] Scheduled post alarm created");
  }

  /**
   * Handle alarm events
   */
  async handleAlarm(alarm) {
    console.log("[Background] Alarm triggered:", alarm.name);

    switch (alarm.name) {
      case "checkScheduledPosts":
        await this.checkScheduledPosts();
        break;
      
      default:
        // Handle individual ad alarms
        if (alarm.name.startsWith("publishAd_")) {
          const adId = alarm.name.replace("publishAd_", "");
          await this.publishScheduledAd(adId);
        }
    }
  }

  /**
   * Check for scheduled posts that are ready to publish
   */
  async checkScheduledPosts() {
    try {
      const result = await chrome.storage.local.get(["ads"]);
      const ads = result.ads || [];
      const now = new Date();

      const readyAds = ads.filter(ad => 
        ad.status === "scheduled" && 
        ad.scheduledAt && 
        new Date(ad.scheduledAt) <= now
      );

      for (const ad of readyAds) {
        if (!this.activePublishing.has(ad.id)) {
          this.publishQueue.push(ad);
        }
      }

      // Process publish queue
      await this.processPublishQueue();

    } catch (error) {
      console.error("[Background] Error checking scheduled posts:", error);
    }
  }

  /**
   * Process the publish queue
   */
  async processPublishQueue() {
    while (this.publishQueue.length > 0 && 
           this.activePublishing.size < this.maxConcurrentPublishing) {
      
      const ad = this.publishQueue.shift();
      await this.publishAd(ad);
    }
  }

  /**
   * Publish an ad
   */
  async publishAd(adData) {
    // Validate adData exists and has required properties
    if (!adData) {
      throw new Error("Ad data is undefined or null");
    }
    
    if (!adData.id) {
      throw new Error("Ad data is missing required 'id' property");
    }

    if (this.activePublishing.has(adData.id)) {
      console.log("[Background] Ad already being published:", adData.id);
      return;
    }

    this.activePublishing.add(adData.id);
    console.log("[Background] Starting to publish ad:", adData.title || 'Untitled Ad');

    try {
      // Find or create Facebook Marketplace tab
      const tab = await this.getOrCreateMarketplaceTab();
      
      // Wait for content script to be ready with verification
      await this.waitForContentScriptReady(tab.id);
      
      // Send publish command to content script via long-lived port with timeout
      const response = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Timeout waiting for content script response"));
        }, 45000); // Increased to 45 seconds

        try {
          // Verify content script is ready before connecting
          chrome.tabs.sendMessage(tab.id, { type: "PING" }, (pingResponse) => {
            if (chrome.runtime.lastError) {
              clearTimeout(timeout);
              reject(new Error(`Content script not ready: ${chrome.runtime.lastError.message}`));
              return;
            }

            // Content script responded to ping, now create port connection
            const port = chrome.tabs.connect(tab.id, { name: "content-script-port" });
            
            port.onMessage.addListener((msg) => {
              if (msg.type === "PUBLISH_AD_RESPONSE") {
                clearTimeout(timeout);
                resolve(msg.response);
              }
            });
            
            port.onDisconnect.addListener(async () => {
              clearTimeout(timeout);
              if (chrome.runtime.lastError) {
                console.warn(`[Background] Content script port disconnected: ${chrome.runtime.lastError.message}`);
                if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
                  console.log("[Background] Extension context invalidated, attempting re-injection and retry.");
                  try {
                    await chrome.scripting.executeScript({
                      target: { tabId: tab.id },
                      files: ["lib/utils.js", "content/marketplace-automation.js", "content/content.js"]
                    });
                    // After re-injection, retry the publish ad operation
                    // This is a more robust retry mechanism
                    resolve({ success: false, error: "Extension context invalidated, re-injection attempted. Retrying ad publication." });
                  } catch (e) {
                    reject(new Error(`Extension context invalidated and re-injection failed: ${e.message}`));
                  }
                } else {
                  reject(new Error(`Content script port disconnected: ${chrome.runtime.lastError.message}`));
                }
              } else {
                reject(new Error("Content script port disconnected unexpectedly."));
              }
            });
            
            // Send the message after setting up listeners
            port.postMessage({ type: "PUBLISH_AD", data: adData });
          });
          
        } catch (error) {
          clearTimeout(timeout);
          reject(new Error(`Failed to connect to content script: ${error.message}`));
        }
      });

      if (response.success) {
        await this.updateAdStatus(adData.id, "published");
        this.showNotification(
          "Anúncio Publicado",
          `\"${adData.title}\" foi publicado com sucesso!`,
          "success"
        );
      } else {
        throw new Error(response.error || "Failed to publish ad");
      }

    } catch (error) {
      console.error("[Background] Error publishing ad:", error);
      
      await this.updateAdStatus(adData.id, "failed", {
        lastError: error.message,
        attempts: (adData.attempts || 0) + 1
      });

      this.showNotification(
        "Erro na Publicação",
        `Falha ao publicar \"${adData.title}\": ${error.message}`,
        "error"
      );

      // Retry if under max attempts
      const settings = await this.getSettings();
      if ((adData.attempts || 0) < settings.maxRetries) {
        setTimeout(() => {
          this.publishQueue.push(adData);
        }, 60000); // Retry after 1 minute
      }

    } finally {
      this.activePublishing.delete(adData.id);
      
      // Add delay between publications
      if (this.publishQueue.length > 0) {
        setTimeout(() => {
          this.processPublishQueue();
        }, this.publishDelay);
      }
    }
  }

  /**
   * Wait for content script to be ready with multiple verification attempts
   */
  async waitForContentScriptReady(tabId, maxAttempts = 10) {
    console.log("[Background] Waiting for content script to be ready on tab", tabId);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Try to ping the content script
        const response = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Ping timeout"));
          }, 3000);

          chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
            clearTimeout(timeout);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });

        if (response && response.success) {
          console.log("[Background] Content script is ready on tab", tabId);
          return true;
        }
      } catch (error) {
        console.log(`[Background] Content script ping attempt ${attempt}/${maxAttempts} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          throw new Error(`Content script not ready after ${maxAttempts} attempts`);
        }
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to re-inject content script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["lib/utils.js", "content/marketplace-automation.js", "content/content.js"]
          });
          console.log("[Background] Content script re-injected successfully.");
        } catch (e) {
          console.error("[Background] Failed to re-inject content script:", e);
        }
      }
    }
    throw new Error("Content script not ready after multiple attempts");
  }

  /**
   * Get or create a Facebook Marketplace tab
   */
  async getOrCreateMarketplaceTab() {
    const marketplaceUrl = "https://www.facebook.com/marketplace/";
    
    // Try to find an existing Marketplace tab
    const tabs = await chrome.tabs.query({ url: `${marketplaceUrl}*` });
    if (tabs.length > 0) {
      console.log("[Background] Found existing Marketplace tab:", tabs[0].id);
      await chrome.tabs.update(tabs[0].id, { active: true });
      return tabs[0];
    } else {
      // Create a new tab if no existing one is found
      console.log("[Background] Creating new Marketplace tab");
      const newTab = await chrome.tabs.create({ url: marketplaceUrl });
      return newTab;
    }
  }

  /**
   * Update ad status in storage
   */
  async updateAdStatus(adId, status, data = {}) {
    const result = await chrome.storage.local.get(["ads"]);
    const ads = result.ads || [];
    const adIndex = ads.findIndex(ad => ad.id === adId);

    if (adIndex !== -1) {
      ads[adIndex] = { ...ads[adIndex], status, ...data, lastUpdated: new Date().toISOString() };
      await chrome.storage.local.set({ ads });
      console.log(`[Background] Ad ${adId} status updated to ${status}`);
    }
  }

  /**
   * Schedule an ad for future publication
   */
  async scheduleAd(adData) {
    console.log("[Background] Scheduling ad:", adData.title);
    
    const result = await chrome.storage.local.get(["ads"]);
    const ads = result.ads || [];

    // Assign a unique ID if not present
    if (!adData.id) {
      adData.id = `ad_${Date.now()}`;
    }

    adData.status = "scheduled";
    adData.scheduledAt = adData.scheduledAt || new Date().toISOString(); // Default to now if not provided
    ads.push(adData);

    await chrome.storage.local.set({ ads });
    console.log("[Background] Ad scheduled and saved:", adData.id);

    // Set up alarm for scheduled time
    const scheduledTime = new Date(adData.scheduledAt).getTime();
    const delayInMinutes = Math.max(1, Math.ceil((scheduledTime - Date.now()) / (1000 * 60)));

    chrome.alarms.create(`publishAd_${adData.id}`, {
      when: Date.now() + delayInMinutes * 60 * 1000
    });

    this.showNotification(
      "Anúncio Agendado",
      `\"${adData.title}\" será publicado em ${new Date(adData.scheduledAt).toLocaleString()}.`,
      "info"
    );
  }

  /**
   * Cancel a scheduled ad
   */
  async cancelScheduledAd(adId) {
    console.log("[Background] Cancelling scheduled ad:", adId);
    
    const result = await chrome.storage.local.get(["ads"]);
    let ads = result.ads || [];

    const initialLength = ads.length;
    ads = ads.filter(ad => ad.id !== adId);

    if (ads.length < initialLength) {
      await chrome.storage.local.set({ ads });
      chrome.alarms.clear(`publishAd_${adId}`);
      console.log("[Background] Ad cancelled and removed from storage:", adId);
      this.showNotification("Agendamento Cancelado", `O agendamento do anúncio ${adId} foi cancelado.`, "info");
    } else {
      console.log("[Background] Ad not found for cancellation:", adId);
    }
  }

  /**
   * Publish a scheduled ad
   */
  async publishScheduledAd(adId) {
    console.log("[Background] Publishing scheduled ad:", adId);
    const result = await chrome.storage.local.get(["ads"]);
    const ads = result.ads || [];
    const adToPublish = ads.find(ad => ad.id === adId);

    if (adToPublish) {
      await this.publishAd(adToPublish);
    } else {
      console.warn("[Background] Scheduled ad not found:", adId);
    }
  }

  /**
   * Perform bulk publishing
   */
  async bulkPublish(adList) {
    console.log("[Background] Starting bulk publish for", adList.length, "ads");
    for (const ad of adList) {
      this.publishQueue.push(ad);
    }
    await this.processPublishQueue();
  }

  /**
   * Get current settings
   */
  async getSettings() {
    const result = await chrome.storage.local.get(["settings"]);
    return result.settings || {};
  }

  /**
   * Update settings
   */
  async updateSettings(newSettings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await chrome.storage.local.set({ settings: updatedSettings });
    console.log("[Background] Settings updated:", updatedSettings);
  }

  /**
   * Show desktop notification
   */
  showNotification(title, message, type = "info") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/icons/icon48.png",
      title: title,
      message: message
    });
  }

  /**
   * Show welcome notification on install
   */
  showWelcomeNotification() {
    this.showNotification(
      "Bem-vindo ao Facebook Marketplace Auto Poster!",
      "Sua extensão foi instalada com sucesso. Comece a automatizar suas postagens agora."
    );
  }

  /**
   * Show update notification
   */
  showUpdateNotification() {
    this.showNotification(
      "Facebook Marketplace Auto Poster Atualizado!",
      "A extensão foi atualizada para a versão mais recente. Verifique as novidades!"
    );
  }

  /**
   * Check Facebook connection status
   */
  async checkFacebookConnection() {
    try {
      const response = await fetch("https://www.facebook.com/marketplace/");
      if (response.ok) {
        const text = await response.text();
        if (text.includes("marketplace_create_listing_button") || text.includes("Comprar e vender")) {
          return { success: true, message: "Conectado ao Facebook Marketplace." };
        } else {
          return { success: false, message: "Não conectado ao Facebook Marketplace. Faça login ou verifique sua conexão." };
        }
      }
      return { success: false, message: `Erro de conexão: ${response.status} ${response.statusText}` };
    } catch (error) {
      return { success: false, message: `Erro de rede: ${error.message}` };
    }
  }
}

// Initialize the background service worker
const backgroundService = new BackgroundService();
backgroundService.init();

// Listen for service worker activation
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
  console.log("[Service Worker] Activated and claimed clients.");
});

// Listen for fetch events (optional, for offline capabilities or request modification)
self.addEventListener("fetch", (event) => {
  // Example: Respond with cached assets for offline use
  // event.respondWith(caches.match(event.request).then(response => {
  //   return response || fetch(event.request);
  // }));
});

// Ensure the service worker stays alive
self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("[Service Worker] Installed and skipping waiting.");
});

// Keep the service worker alive by responding to keep-alive messages
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === "keep-alive") {
    setTimeout(function() {
      port.postMessage({ type: "keep-alive" });
    }, 25000); // Send a message every 25 seconds
  }
});

// Re-initialize on service worker restart
chrome.runtime.onStartup.addListener(() => {
  console.log("[Background] Service Worker restarting, re-initializing.");
  backgroundService.init();
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  backgroundService.handleMessage(message, sender, sendResponse);
  return true; // Required for async sendResponse
});

// Handle long-lived connections
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content-script-port") {
    console.log("[Background] Content script connected.");
    port.onMessage.addListener((message) => {
      backgroundService.handlePortMessage(message, port);
    });
    port.onDisconnect.addListener(() => {
      console.log("[Background] Content script disconnected.");
    });
  }
});



