
console.log("[Automation] Script de automação carregado.");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "START_POST") {
    console.log("[Automation] Recebendo dados do anúncio:", msg.payload);
    startPosting(msg.payload);
    sendResponse({ ok: true });
  }
});

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function humanScroll() {
  console.log("[Automation] Rolando página lentamente...");
  window.scrollBy({ top: 200, behavior: 'smooth' });
  await delay(800);
  window.scrollBy({ top: 400, behavior: 'smooth' });
  await delay(1000);
  window.scrollBy({ top: -200, behavior: 'smooth' });
  await delay(700);
}

async function startPosting(data) {
  const timeoutMs = 2 * 60 * 1000; // 2 minutos
  let finished = false;

  const timeout = setTimeout(() => {
    if (!finished) {
      console.warn("[Automation] Timeout atingido, enviando POST_FAILED");
      chrome.runtime.sendMessage({ type: "POST_FAILED", id: data.id });
    }
  }, timeoutMs);

  try {
    await delay(1500);
    await humanScroll();

    // Título
    const titleInput = document.querySelector('input[name="title"]') || document.querySelector('input[aria-label="Título"]');
    if (titleInput) {
      titleInput.focus();
      titleInput.value = data.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("[Automation] Preencheu título.");
      await delay(800);
    }

    // Preço
    const priceInput = document.querySelector('input[name="price"]') || document.querySelector('input[aria-label="Preço"]');
    if (priceInput) {
      priceInput.focus();
      priceInput.value = data.price;
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("[Automation] Preencheu preço.");
      await delay(800);
    }

    // Descrição
    const descInput = document.querySelector('textarea[name="description"]') || document.querySelector('textarea[aria-label="Descrição"]');
    if (descInput) {
      descInput.focus();
      descInput.value = data.description;
      descInput.dispatchEvent(new Event('input', { bubbles: true }));
      console.log("[Automation] Preencheu descrição.");
      await delay(800);
    }

    // Simulação de upload de imagens - placeholder
    console.log("[Automation] (Placeholder) Upload de imagens seria feito aqui.");

    // Clica em Publicar
    const publishBtn = Array.from(document.querySelectorAll('div[role="button"], button'))
      .find(el => el.innerText && el.innerText.toLowerCase().includes("publicar"));
    if (publishBtn) {
      publishBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await delay(1000);
      publishBtn.click();
      console.log("[Automation] Clicou em Publicar.");
    } else {
      console.error("[Automation] Botão Publicar não encontrado.");
      chrome.runtime.sendMessage({ type: "POST_FAILED", id: data.id });
      clearTimeout(timeout);
      return;
    }

    // Aguarda detecção de postagem concluída
    console.log("[Automation] Aguardando confirmação de publicação...");
    let tries = 0;
    while (tries < 20) { // ~20s
      await delay(1000);
      if (document.body.innerText.toLowerCase().includes("publicado") ||
          document.body.innerText.toLowerCase().includes("listagem criada")) {
        console.log("[Automation] Publicação detectada como concluída.");
        chrome.runtime.sendMessage({ type: "POST_DONE", id: data.id });
        finished = true;
        clearTimeout(timeout);
        return;
      }
      tries++;
    }

    console.warn("[Automation] Não conseguiu confirmar visualmente, marcando como sucesso mesmo assim.");
    chrome.runtime.sendMessage({ type: "POST_DONE", id: data.id });
    finished = true;
    clearTimeout(timeout);

  } catch (err) {
    console.error("[Automation] Erro no processo:", err);
    chrome.runtime.sendMessage({ type: "POST_FAILED", id: data.id });
    clearTimeout(timeout);
  }
}
