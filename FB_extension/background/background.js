
// BACKGROUND SCRIPT WITH QUEUE AND HUMAN AUTOMATION

let processing = false;
let queue = [];
let failedQueue = [];
const MIN_DELAY = 3 * 60 * 1000; // 3 min
const MAX_DELAY = 7 * 60 * 1000; // 7 min

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ queue: [], failedQueue: [] });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "ADD_TO_QUEUE") {
    addToQueue(msg.payload);
    sendResponse({ ok: true });
  } else if (msg?.type === "POST_DONE") {
    console.log("Post concluído:", msg.id);
    queue.shift();
    chrome.storage.local.set({ queue }, () => {
      scheduleNext();
    });
  } else if (msg?.type === "POST_FAILED") {
    console.warn("Post falhou:", msg.id);
    const item = queue.shift();
    item.attempts = (item.attempts || 0) + 1;
    if (item.attempts < 3) {
      queue.push(item);
    } else {
      failedQueue.push(item);
      chrome.storage.local.set({ failedQueue });
    }
    chrome.storage.local.set({ queue }, () => {
      scheduleNext();
    });
  }
  return true;
});

function addToQueue(item) {
  item.id = crypto.randomUUID();
  queue.push(item);
  chrome.storage.local.set({ queue }, () => {
    if (!processing) processQueue();
  });
}

function processQueue() {
  if (queue.length === 0) {
    processing = false;
    console.log("Fila vazia.");
    return;
  }
  processing = true;
  const current = queue[0];
  console.log("Processando item:", current);
  openMarketplaceTab(current);
}

function openMarketplaceTab(item) {
  chrome.tabs.create({ url: "https://www.facebook.com/marketplace/create/item" }, (tab) => {
    if (!tab || !tab.id) {
      console.error("Não foi possível abrir aba para postagem.");
      chrome.runtime.sendMessage({ type: "POST_FAILED", id: item.id });
      return;
    }
    // Garantir que content script está injetado
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["content/human-automation.js"]
      },
      () => {
        chrome.tabs.sendMessage(tab.id, { type: "START_POST", payload: item });
      }
    );
  });
}

function scheduleNext() {
  const delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  console.log(`Próxima postagem em ${(delay / 1000 / 60).toFixed(1)} minutos`);
  setTimeout(processQueue, delay);
}
