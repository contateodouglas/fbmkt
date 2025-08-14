# Guia de Solução de Problemas - Facebook Marketplace Auto Poster

Este guia aborda os problemas mais comuns encontrados na extensão Facebook Marketplace Auto Poster e suas respectivas soluções.

# Guia de Solução de Problemas - Facebook Marketplace Auto Poster

Este guia aborda os problemas mais comuns encontrados na extensão Facebook Marketplace Auto Poster e suas respectivas soluções.

## 🔧 Problemas Corrigidos na Versão 1.0.8

### ✅ "Content script port disconnected: Could not establish connection. Receiving end does not exist."

**Status**: ✅ **RESOLVIDO COMPLETAMENTE** na versão 1.0.8

**Descrição**: Este era o erro mais crítico da extensão, ocorrendo quando o background script tentava se conectar ao content script antes dele estar completamente pronto para receber mensagens.

**Sintomas Anteriores**:
- Erro no console: "Content script port disconnected: Could not establish connection. Receiving end does not exist."
- Falha na publicação de anúncios
- Notificações de erro durante tentativas de publicação
- Content script conectava mas desconectava imediatamente

**Solução Implementada**:
- **Sistema PING/PONG**: Verificação de prontidão antes de conectar
- **Tentativas Múltiplas**: Até 10 tentativas com backoff exponencial (2s, 4s, 8s...)
- **Re-injeção Automática**: Content scripts são automaticamente re-injetados quando necessário
- **Timeout Aumentado**: De 30 para 45 segundos para operações mais lentas
- **Verificação Dupla**: Ping antes de criar conexão de porta
- **Logs Detalhados**: Sistema de logging aprimorado para depuração

**Como Verificar se Foi Resolvido**:
1. Abra o Facebook Marketplace
2. Tente publicar um anúncio
3. Verifique o console (F12) - não deve haver erros de "port disconnected"
4. A publicação deve funcionar normalmente sem falhas de conexão

---

## 🔧 Problemas Corrigidos na Versão 1.0.7

### ❌ Problema: Erro "Assignment to constant variable" na Função showLoading

**Problema:** Ao tentar salvar um anúncio como rascunho ou executar operações que exibem o overlay de loading, a extensão apresentava o erro "TypeError: Assignment to constant variable" e a operação falhava.

**Sintomas:**
- Erro exibido no console: `TypeError: Assignment to constant variable.`
- Erro ocorre na linha da função `showLoading` (popup.js:903)
- Operações de salvamento de anúncios falham
- Overlay de loading não aparece corretamente
- Interface trava durante operações que requerem feedback visual

**Causa:** O problema era causado por uma tentativa de reatribuir uma variável declarada como `const`:

```javascript
// ❌ Código problemático:
const overlay = document.getElementById('loadingOverlay');
if (!overlay) {
  // ... criar novo overlay
  overlay = newOverlay; // ERRO: Assignment to constant variable
}
```

**Solução Implementada:**

```javascript
// ✅ Código corrigido:
let overlay = document.getElementById('loadingOverlay');
if (!overlay) {
  // ... criar novo overlay
  overlay = newOverlay; // OK: let permite reatribuição
}
```

**Arquivos Modificados:**
- `popup/popup.js` - Linha 889: Mudança de `const` para `let` na declaração da variável `overlay`

**Resultado:**
- Função `showLoading` funciona corretamente
- Overlay de loading aparece durante operações
- Salvamento de anúncios funciona sem erros
- Interface responsiva durante operações longas

### ❌ Problema: Erro "Content script port disconnected unexpectedly" Durante Publicação

**Problema:** Ao tentar publicar um anúncio, a extensão apresentava o erro "Content script port disconnected unexpectedly" e a publicação falhava, mesmo com o Facebook Marketplace aberto.

**Sintomas:**
- Erro exibido no console: `Error: Content script port disconnected unexpectedly.`
- Erro adicional: `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist.`
- Publicação de anúncios falha completamente
- Notificação de erro: "Falha ao publicar: Content script port disconnected unexpectedly."
- Background script não consegue se comunicar com content script

**Causa:** O problema era causado por múltiplos fatores na comunicação entre background e content scripts:

1. **Timing Issues**: Background script tentava conectar antes do content script estar pronto
2. **Falta de Timeout**: Conexões ficavam pendentes indefinidamente
3. **Content Script Não Injetado**: Em algumas situações, o content script não era injetado automaticamente
4. **Tratamento de Erro Inadequado**: Erros de conexão não eram tratados adequadamente

**Solução Implementada:**

1. **Delay Inteligente Antes da Conexão:**
   ```javascript
   // Espera 2 segundos para content script estar pronto
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

2. **Sistema de Timeout Robusto:**
   ```javascript
   const timeout = setTimeout(() => {
     reject(new Error("Timeout waiting for content script response"));
   }, 30000); // 30 segundos
   ```

3. **Re-injeção Automática de Content Scripts:**
   ```javascript
   // Garante que content script esteja injetado
   try {
     await chrome.scripting.executeScript({
       target: { tabId: tab.id },
       files: ["lib/utils.js", "content/marketplace-automation.js", "content/content.js"]
     });
   } catch (error) {
     console.log("Content script already injected or injection failed");
   }
   ```

4. **Tratamento de Erros Melhorado:**
   ```javascript
   port.onDisconnect.addListener(() => {
     clearTimeout(timeout);
     if (chrome.runtime.lastError) {
       reject(new Error(`Content script port disconnected: ${chrome.runtime.lastError.message}`));
     } else {
       reject(new Error("Content script port disconnected unexpectedly."));
     }
   });
   ```

**Arquivos Modificados:**
- `background/background.js` - Linhas 375-413: Implementação de timeout e delay
- `background/background.js` - Linhas 538-590: Melhoria na função `getOrCreateMarketplaceTab`

**Resultado:**
- Conexão estável entre background e content scripts
- Publicação de anúncios funciona corretamente
- Sistema de timeout previne travamentos
- Re-injeção automática garante disponibilidade do content script
- Mensagens de erro específicas facilitam depuração

**Teste de Verificação:**
1. Abra o Facebook Marketplace
2. Preencha um anúncio completo
3. Clique em "Publicar Agora"
4. **Deve funcionar**: Anúncio processado sem erros de conexão
5. **Console limpo**: Sem erros de "port disconnected"

## 🔧 Problemas Corrigidos na Versão 1.0.6

### ❌ Problema: Erro "Cannot read properties of undefined (reading 'id')" ao Publicar Anúncios

**Problema:** Ao tentar publicar um anúncio através do botão "Publicar Agora", a extensão apresentava o erro "Cannot read properties of undefined (reading 'id')" e a publicação falhava completamente.

**Sintomas:**
- Erro exibido no console: `TypeError: Cannot read properties of undefined (reading 'id')`
- Notificação de erro: "Falha ao publicar anúncio: Cannot read properties of undefined (reading 'id')"
- Anúncio não é publicado no Facebook Marketplace
- Background script falha na linha 357 (função publishAd)
- Interface do popup trava durante tentativa de publicação

**Causa:** O problema era causado por inconsistência no formato de dados passados entre o popup e o background script:

1. **Formato Inconsistente de Mensagem:** O popup enviava o objeto do anúncio com a chave `ad:`, mas o background script esperava receber com a chave `data:`
2. **Falta de Validação:** O background script não validava se o objeto `adData` existia antes de tentar acessar suas propriedades
3. **Propagação de Undefined:** Quando `message.ad` era undefined, o valor undefined era passado para `publishAd(adData)`, causando o erro ao tentar acessar `adData.id`

**Fluxo Problemático (v1.0.5):**
```javascript
// Popup enviava:
{ type: 'PUBLISH_AD', ad: adObject }

// Background recebia e processava:
case "PUBLISH_AD":
  await this.publishAd(message.data); // message.data era undefined!
  
// publishAd tentava acessar:
if (this.activePublishing.has(adData.id)) // adData era undefined!
```

**Solução Implementada:**

1. **Correção do Formato de Mensagem:**
   ```javascript
   // Popup agora envia corretamente:
   const response = await this.sendMessageToBackground({
     type: 'PUBLISH_AD',
     data: ad  // Mudança de 'ad:' para 'data:'
   });
   ```

2. **Validação Robusta no Background Script:**
   ```javascript
   async publishAd(adData) {
     // Validação completa adicionada
     if (!adData) {
       throw new Error("Ad data is undefined or null");
     }
     
     if (!adData.id) {
       throw new Error("Ad data is missing required 'id' property");
     }
     
     // Resto da função continua normalmente...
   }
   ```

3. **Tratamento de Erros Melhorado:**
   - Mensagens de erro específicas indicando exatamente qual propriedade está faltando
   - Logs detalhados para facilitar depuração futura
   - Fallback gracioso para dados malformados

**Arquivos Modificados:**
- `popup/popup.js` - Linha 292-295: Correção do formato da mensagem
- `background/background.js` - Linhas 356-372: Adição de validação robusta

**Resultado:**
- Publicação de anúncios funciona corretamente
- Mensagens de erro específicas e informativas
- Sistema robusto contra dados malformados
- Comunicação padronizada entre componentes

**Teste de Verificação:**
1. Preencha um anúncio completo no popup
2. Clique em "Publicar Agora"
3. **Deve funcionar**: Anúncio é processado sem erros
4. **Console limpo**: Sem erros de "Cannot read properties of undefined"

## 🔧 Problemas Corrigidos na Versão 1.0.5

### ❌ Problema: Popup Aparece Apenas Como "Quadrado Azul"

**Problema:** Ao clicar no ícone da extensão, o popup aparecia apenas como um pequeno quadrado azul sem conteúdo visível, impedindo o acesso a todas as funcionalidades da extensão.

**Sintomas:**
- Popup exibe apenas uma pequena área azul (aproximadamente 50x50px)
- Nenhum conteúdo da interface é visível
- Impossibilidade de acessar formulários, configurações ou funcionalidades
- Problema persistente em diferentes navegadores e sistemas operacionais
- Interface não responsiva a cliques ou interações

**Causa:** O problema era causado por conflitos no sistema de estilos CSS do popup, especificamente:
1. **Dimensões Indefinidas:** O CSS não especificava dimensões fixas para html/body
2. **Conflitos de Overflow:** Propriedades de overflow conflitantes impediam a renderização
3. **Layout Flexbox Incompleto:** Estrutura flexbox mal configurada causava colapso do layout
4. **Reset CSS Inadequado:** Falta de reset adequado permitia interferência de estilos externos
5. **Variáveis CSS Não Definidas:** Uso de variáveis CSS não declaradas causava falhas de renderização

**Solução Implementada:**

1. **CSS Completamente Reescrito:**
   - Sistema de estilos robusto com dimensões fixas (420x600px)
   - Reset CSS adequado para html/body
   - Eliminação de variáveis CSS não definidas
   - Estrutura flexbox corrigida e otimizada

2. **Dimensões Fixas Garantidas:**
   ```css
   html, body {
     margin: 0;
     padding: 0;
     width: 420px;
     min-height: 600px;
     overflow: hidden;
   }
   
   .popup-container {
     width: 420px;
     height: 600px;
     display: flex;
     flex-direction: column;
   }
   ```

3. **Layout Flexbox Robusto:**
   - Header com flex-shrink: 0 para manter tamanho
   - Tab content com flex: 1 para ocupar espaço restante
   - Status bar com flex-shrink: 0 para posicionamento fixo

4. **Sistema de Estilos Padronizado:**
   - Botões com estilos consistentes e funcionais
   - Formulários com layout responsivo
   - Componentes com dimensões e espaçamentos adequados

5. **Eliminação de Conflitos:**
   - Remoção de propriedades CSS conflitantes
   - Simplificação de seletores complexos
   - Uso apenas de propriedades CSS padrão

**Arquivos Modificados:**
- `popup/popup.css` - Completamente reescrito com 600+ linhas de CSS robusto
- Sistema de layout moderno e confiável implementado

**Resultado:**
- Popup agora abre corretamente com interface completa visível
- Todas as funcionalidades acessíveis (Dashboard, Criar Anúncio, Agendamentos)
- Interface responsiva e estável
- Compatibilidade garantida com diferentes navegadores

## 🔧 Problemas Corrigidos na Versão 1.0.4

### ❌ Erro: "Unknown message type: CHECK_FACEBOOK_CONNECTION"

**Problema:** A extensão apresentava erro no console indicando que o tipo de mensagem "CHECK_FACEBOOK_CONNECTION" não era reconhecido pelo background script, impedindo a verificação de status de conexão com o Facebook.

**Sintomas:**
- Console mostrando "Unknown message type: CHECK_FACEBOOK_CONNECTION"
- Indicador de status de conexão não funcionando no popup
- Impossibilidade de verificar se o Facebook Marketplace está acessível
- Erro ao tentar verificar conexão durante inicialização do popup

**Causa:** O background script não possuía um handler implementado para processar mensagens do tipo "CHECK_FACEBOOK_CONNECTION" enviadas pelo popup durante a verificação de status de conexão.

**Solução Implementada:**
1. **Handler Dedicado:** Adicionado case específico para "CHECK_FACEBOOK_CONNECTION" no método `handleMessage()`
2. **Método de Verificação:** Implementado método completo `checkFacebookConnection()` no background script
3. **Verificação Inteligente:** Sistema que verifica abas do Facebook abertas e status do content script
4. **Detecção de Marketplace:** Diferenciação entre Facebook geral e Facebook Marketplace específico
5. **Mensagens Informativas:** Retorno de status detalhado com instruções para o usuário
6. **Tratamento de Erros:** Captura e tratamento robusto de erros de comunicação

**Funcionalidades do Sistema de Verificação:**
- Detecção de abas do Facebook abertas no navegador
- Verificação específica de abas do Facebook Marketplace
- Teste de comunicação com content script nas abas do marketplace
- Retorno de status detalhado (conectado/desconectado/erro)
- Mensagens orientativas para estabelecer conexão
- Informações sobre ID da aba e URL quando conectado

**Arquivos Modificados:**
- `background/background.js` - Adicionado handler e método `checkFacebookConnection()`
- Sistema de verificação completo implementado

## 🔧 Problemas Corrigidos na Versão 1.0.3

### ❌ Erro: "undefined_RESPONSE"

**Problema:** A extensão apresentava mensagens de erro no console indicando "Unknown message type: undefined_RESPONSE", causando poluição nos logs e potencial confusão no sistema de mensagens.

**Sintomas:**
- Console mostrando "Unknown message type: undefined_RESPONSE"
- Logs excessivos de mensagens não reconhecidas
- Possível interferência no fluxo de comunicação
- Dificuldade na depuração devido a mensagens irrelevantes

**Causa:** O sistema de mensagens estava tentando tratar mensagens de resposta (_RESPONSE) como mensagens regulares, causando loops de processamento e mensagens indefinidas.

**Solução Implementada:**
1. **Método Dedicado para Mensagens de Porta:** Criado `handlePortMessage()` específico para conexões de longa duração
2. **Detecção de Mensagens de Resposta:** Verificação específica para mensagens terminadas em "_RESPONSE"
3. **Separação de Fluxos:** Separação clara entre mensagens regulares e mensagens de resposta
4. **Verificação de Tipo:** Validação de tipo de mensagem antes de construir respostas
5. **Logs Específicos:** Logs dedicados para diferentes tipos de mensagens

**Arquivos Modificados:**
- `background/background.js` - Adicionado método `handlePortMessage` e tratamento específico
- `content/content.js` - Melhorada verificação de tipo antes de enviar respostas

## 🔧 Problemas Corrigidos na Versão 1.0.2

### ❌ Erro: "Extension context invalidated"

**Problema:** A extensão apresentava erros de comunicação entre o script de conteúdo e o service worker de fundo, especialmente após recarregamentos da extensão ou atualizações.

**Sintomas:**
- Console mostrando "Extension context invalidated"
- Falha na comunicação entre popup e background script
- Automação parando de funcionar após algum tempo
- Mensagens não sendo enviadas entre componentes

**Causa:** O contexto da extensão era invalidado quando a extensão era recarregada, atualizada ou quando o service worker era reiniciado, causando falha nas conexões de mensagem.

**Solução Implementada:**
1. **Sistema de Reconexão Automática:** Implementado sistema que detecta desconexões e tenta reconectar automaticamente
2. **Conexões de Longa Duração:** Uso de `chrome.runtime.connect()` para conexões mais estáveis
3. **Fallback de Mensagens:** Sistema de fallback que usa `chrome.runtime.sendMessage()` quando conexões por porta falham
4. **Backoff Exponencial:** Tentativas de reconexão com delay progressivo para evitar spam
5. **Detecção Inteligente:** Detecção específica de invalidação de contexto para parar tentativas desnecessárias
6. **Cleanup Automático:** Limpeza automática de conexões ao descarregar páginas

**Arquivos Modificados:**
- `background/background.js` - Adicionado suporte a conexões de longa duração
- `content/content.js` - Implementado sistema robusto de mensagens com reconexão

## 🔧 Problemas Corrigidos na Versão 1.0.1

### ❌ Erro: "Identifier has already been declared"

**Problema:** A extensão apresentava erros de JavaScript no console indicando que identificadores (classes) estavam sendo declarados múltiplas vezes.

**Sintomas:**
- Console mostrando erros como "Identifier 'Utils' has already been declared"
- Console mostrando erros como "Identifier 'MarketplaceAutomation' has already been declared"
- Console mostrando erros como "Identifier 'ContentScript' has already been declared"
- Popup da extensão não funcionando corretamente

**Causa:** Os scripts estavam sendo carregados múltiplas vezes devido à estrutura do manifest.json e à forma como as classes eram declaradas globalmente.

**Solução Implementada:**
1. **Encapsulamento em IIFE (Immediately Invoked Function Expression):** Todos os scripts foram envolvidos em funções auto-executáveis para evitar poluição do escopo global
2. **Verificação de Existência:** Adicionada verificação antes de declarar classes no escopo global
3. **Correção de Caracteres Especiais:** Removidos caracteres especiais que causavam erros de sintaxe

**Arquivos Modificados:**
- `lib/utils.js` - Encapsulado em IIFE
- `content/marketplace-automation.js` - Encapsulado em IIFE
- `content/content.js` - Encapsulado em IIFE

### ❌ Erro: "Invalid or unexpected token"

**Problema:** Caracteres especiais (acentos) em strings causavam erros de sintaxe.

**Sintomas:**
- Erros de sintaxe no console
- Scripts não carregando corretamente

**Solução:** Substituição de caracteres acentuados por versões sem acento em strings críticas.

## 🚨 Problemas Comuns e Soluções

### 1. Popup Não Abre ou Aparece em Branco

**Sintomas:**
- Clicar no ícone da extensão não abre o popup
- Popup abre mas mostra apenas uma tela branca ou azul
- Console mostra erros de JavaScript

**Soluções:**

1. **Recarregar a Extensão:**
   - Vá para `chrome://extensions/`
   - Encontre "Facebook Marketplace Auto Poster"
   - Clique no botão de recarregar (🔄)

2. **Verificar Erros no Console:**
   - Clique com botão direito no ícone da extensão
   - Selecione "Inspecionar popup"
   - Verifique se há erros no console

3. **Reinstalar a Extensão:**
   - Remova a extensão completamente
   - Reinstale usando o arquivo ZIP mais recente

### 2. Automação Não Funciona no Facebook

**Sintomas:**
- Formulários não são preenchidos automaticamente
- Imagens não são carregadas
- Botões não são clicados

**Soluções:**

1. **Verificar Permissões:**
   - Certifique-se de que a extensão tem permissão para acessar facebook.com
   - Vá para `chrome://extensions/` e verifique as permissões

2. **Atualizar Seletores:**
   - O Facebook muda frequentemente sua interface
   - Verifique se há atualizações da extensão

3. **Verificar Página Correta:**
   - Certifique-se de estar na página correta do Facebook Marketplace
   - URL deve conter `/marketplace/`

### 3. Upload de Imagens Falha

**Sintomas:**
- Imagens não aparecem no anúncio
- Erro durante o upload
- Processo trava na etapa de imagens

**Soluções:**

1. **Verificar Formato das Imagens:**
   - Use apenas JPG, PNG, GIF
   - Tamanho máximo: 10MB por imagem
   - Máximo 10 imagens por anúncio

2. **Verificar Conexão:**
   - Certifique-se de ter conexão estável com internet
   - Tente com imagens menores primeiro

3. **Limpar Cache:**
   - Limpe o cache do navegador
   - Reinicie o Chrome

### 4. Upload de Vídeo Não Funciona

**Sintomas:**
- Vídeo não é carregado
- Erro de formato não suportado
- Processo trava no upload de vídeo

**Soluções:**

1. **Verificar Especificações do Vídeo:**
   - Formato: MP4, MOV, AVI, WMV
   - Duração: 5-60 segundos
   - Tamanho máximo: 100MB

2. **Converter Vídeo:**
   - Use um conversor online para MP4
   - Reduza a resolução se necessário
   - Comprima o arquivo se muito grande

3. **Verificar Suporte do Facebook:**
   - Nem todas as páginas do Marketplace suportam vídeo
   - Tente em diferentes categorias

### 5. Agendamento Não Funciona

**Sintomas:**
- Anúncios agendados não são publicados
- Horários não são respeitados
- Notificações não aparecem

**Soluções:**

1. **Verificar Permissões de Notificação:**
   - Permita notificações para a extensão
   - Verifique configurações do sistema

2. **Manter Chrome Aberto:**
   - O Chrome deve estar aberto para agendamentos funcionarem
   - Não feche completamente o navegador

3. **Verificar Configurações de Energia:**
   - Desative modo de economia de energia
   - Mantenha computador ligado no horário agendado

### 6. Dados Não São Salvos

**Sintomas:**
- Anúncios criados desaparecem
- Configurações não são mantidas
- Histórico é perdido

**Soluções:**

1. **Verificar Armazenamento:**
   - Vá para `chrome://settings/content/cookies`
   - Certifique-se de que cookies estão habilitados

2. **Não Usar Modo Incógnito:**
   - Use o Chrome normal, não incógnito
   - Dados não são salvos em modo privado

3. **Fazer Backup:**
   - Use a função de exportar dados
   - Salve regularmente seus anúncios

## 🔍 Diagnóstico Avançado

### Verificar Logs da Extensão

1. **Abrir Console da Extensão:**
   ```
   chrome://extensions/ → Detalhes → Inspecionar visualizações → popup.html
   ```

2. **Verificar Logs do Background:**
   ```
   chrome://extensions/ → Detalhes → Inspecionar visualizações → service worker
   ```

3. **Verificar Logs do Content Script:**
   - Abra o Facebook Marketplace
   - Pressione F12
   - Vá para a aba Console
   - Procure por mensagens com "[Content Script]"

### Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| ERR_001 | Elemento não encontrado | Aguarde carregamento da página |
| ERR_002 | Timeout de upload | Verifique conexão de internet |
| ERR_003 | Formato inválido | Verifique formato do arquivo |
| ERR_004 | Permissão negada | Verifique permissões da extensão |
| ERR_005 | Quota excedida | Limpe dados da extensão |

### Informações do Sistema

Para reportar problemas, inclua:

1. **Versão do Chrome:**
   ```
   chrome://version/
   ```

2. **Versão da Extensão:**
   - Visível em `chrome://extensions/`

3. **Sistema Operacional:**
   - Windows, macOS, Linux

4. **URL Específica:**
   - Página exata onde ocorreu o erro

## 📞 Suporte Técnico

### Antes de Reportar um Bug

1. **Tente as soluções acima**
2. **Verifique se há atualizações**
3. **Teste em modo incógnito**
4. **Desative outras extensões temporariamente**

### Informações para Incluir no Reporte

- Versão da extensão
- Versão do Chrome
- Sistema operacional
- Passos para reproduzir o problema
- Screenshots ou vídeos do erro
- Logs do console (se disponíveis)

### Canais de Suporte

- **GitHub Issues:** Para bugs e solicitações de recursos
- **Email:** Para suporte direto
- **Documentação:** Consulte os arquivos README e USER_MANUAL

## 🔄 Atualizações e Manutenção

### Verificar Atualizações

1. **Automática (Chrome Web Store):**
   - Atualizações são instaladas automaticamente
   - Reinicie o Chrome para aplicar

2. **Manual (Instalação Local):**
   - Baixe a versão mais recente
   - Substitua os arquivos da extensão
   - Recarregue em `chrome://extensions/`

### Limpeza de Dados

Para resolver problemas persistentes:

1. **Limpar Dados da Extensão:**
   ```javascript
   // No console da extensão
   chrome.storage.local.clear();
   ```

2. **Reset Completo:**
   - Desinstale a extensão
   - Limpe dados do navegador
   - Reinstale a extensão

### Backup e Restauração

1. **Fazer Backup:**
   - Use a função "Exportar Dados" na extensão
   - Salve o arquivo JSON em local seguro

2. **Restaurar Dados:**
   - Use a função "Importar Dados"
   - Selecione o arquivo de backup

## ⚠️ Limitações Conhecidas

### Limitações do Facebook

1. **Rate Limiting:**
   - Facebook limita número de ações por minuto
   - Respeite intervalos entre publicações

2. **Mudanças de Interface:**
   - Facebook atualiza interface regularmente
   - Seletores podem precisar de atualização

3. **Políticas de Uso:**
   - Respeite termos de uso do Facebook
   - Não use para spam ou atividades maliciosas

### Limitações Técnicas

1. **Dependência do DOM:**
   - Extensão depende da estrutura HTML do Facebook
   - Mudanças podem quebrar funcionalidade

2. **Limitações do Chrome:**
   - Algumas APIs têm limitações de quota
   - Armazenamento local tem limites

3. **Conectividade:**
   - Requer conexão estável com internet
   - Falhas de rede podem interromper processo

## 📈 Melhorias Futuras

### Versão 1.1.0 (Planejada)

- Detecção automática de mudanças no Facebook
- Seletores adaptativos
- Melhor tratamento de erros
- Interface de diagnóstico integrada

### Versão 2.0.0 (Planejada)

- Suporte a múltiplas plataformas
- IA para otimização de anúncios
- Analytics avançados
- API para desenvolvedores

---

**Última Atualização:** Janeiro 2025  
**Versão do Documento:** 1.0.1  
**Compatibilidade:** Chrome 88+, Extensão v1.0.1+

