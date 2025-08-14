# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.10] - 2025-08-11

### 🔧 Correções Críticas
- **Resolvido**: Erro "Uncaught SyntaxError: Unexpected token '*'" no `marketplace-automation.js`.
- **Resolvido**: Erro "Service worker registration failed. Status code: 15" devido à invalidação de contexto e problemas de recarregamento.
- **Aprimorado**: Sistema de reconexão do content script para lidar de forma mais robusta com "Extension context invalidated".

### 🚀 Melhorias de Estabilidade
- Maior resiliência da extensão a invalidações de contexto.
- Melhoria na comunicação entre background e content scripts.

### 🔍 Detalhes Técnicos
- Correção de sintaxe em seletores DOM no `marketplace-automation.js`.
- Atualização da versão no `manifest.json` para forçar o recarregamento do service worker.
- Implementação de lógica de re-inicialização no `content.js` em caso de invalidação de contexto.

## [1.0.9] - 2025-08-11

### 🔧 Correções Críticas
- **Resolvido**: Erro persistente "Content script port disconnected: Could not establish connection. Receiving end does not exist."
- **Implementado**: Sistema robusto de verificação de prontidão do content script antes de conectar
- **Adicionado**: Mecanismo de PING/PONG para verificar se content script está pronto
- **Melhorado**: Sistema de re-injeção automática de content scripts quando necessário
- **Aumentado**: Timeout de publicação de 30 para 45 segundos para operações mais lentas
- **Implementado**: Verificação dupla de prontidão antes de estabelecer conexão de porta
- **Adicionado**: Tentativas múltiplas (até 10) com backoff exponencial para verificação de prontidão
- **Melhorado**: Função checkFacebookConnection com injeção automática de content script
- **Corrigido**: Automação do campo de descrição em "Mais detalhes" no formulário de criação de anúncios.
  - O campo de descrição agora é preenchido corretamente após expandir a seção "Mais detalhes".
  - Lógica de interação aprimorada para campos dinâmicos.

### 🚀 Melhorias de Estabilidade
- Sistema de comunicação mais robusto entre background e content scripts
- Redução significativa de falhas de conexão durante publicação
- Melhor tratamento de erros de contexto invalidado
- Logs mais detalhados para depuração
- Automação mais confiável para campos dinâmicos.

### 🔍 Detalhes Técnicos
- Implementado waitForContentScriptReady() com verificação em múltiplas tentativas
- Adicionado handler PING em ambos handleMessage() e handlePortMessage()
- Melhorada função checkFacebookConnection() com injeção automática
- Sistema de timeout e retry mais inteligente
- Atualização dos seletores DOM e lógica de interação para o campo de descrição.

## [1.0.8] - 2025-08-10

### 🔧 Correções Críticas
- **Resolvido**: Erro persistente "Content script port disconnected: Could not establish connection. Receiving end does not exist."
- **Implementado**: Sistema robusto de verificação de prontidão do content script antes de conectar
- **Adicionado**: Mecanismo de PING/PONG para verificar se content script está pronto
- **Melhorado**: Sistema de re-injeção automática de content scripts quando necessário
- **Aumentado**: Timeout de publicação de 30 para 45 segundos para operações mais lentas
- **Implementado**: Verificação dupla de prontidão antes de estabelecer conexão de porta
- **Adicionado**: Tentativas múltiplas (até 10) com backoff exponencial para verificação de prontidão
- **Melhorado**: Função checkFacebookConnection com injeção automática

### 🚀 Melhorias de Estabilidade
- Sistema de comunicação mais robusto entre background e content scripts
- Redução significativa de falhas de conexão durante publicação
- Melhor tratamento de erros de contexto invalidado
- Logs mais detalhados para depuração

### 🔍 Detalhes Técnicos
- Implementado waitForContentScriptReady() com verificação em múltiplas tentativas
- Adicionado handler PING em ambos handleMessage() e handlePortMessage()
- Melhorada função checkFacebookConnection() com injeção automática
- Sistema de timeout e retry mais inteligente

## [1.0.7] - 2025-01-08

### 🔧 Corrigido
- **Erro "Assignment to constant variable"**: Resolvido erro que ocorria na função `showLoading` do popup
  - Mudança de `const overlay` para `let overlay` para permitir reatribuição
  - Correção na lógica de criação/reutilização do elemento de loading overlay
  - Eliminação de conflitos de declaração de variáveis

- **Erro "Content script port disconnected unexpectedly"**: Implementada solução robusta para conexão com content scripts
  - Adicionado timeout de 30 segundos para operações de publicação
  - Implementado delay de 2 segundos antes de tentar conectar ao content script
  - Melhorado tratamento de erros de conexão com mensagens específicas
  - Garantida injeção automática do content script em tabs existentes e novas
  - Adicionado sistema de retry e fallback para conexões falhadas

### 🚀 Melhorado
- **Estabilidade de Conexão**: Sistema robusto de comunicação entre background e content scripts
- **Tratamento de Erros**: Mensagens de erro mais específicas e informativas
- **Timeout Management**: Controle adequado de timeouts para evitar travamentos
- **Content Script Injection**: Garantia de que content scripts estejam sempre disponíveis

### ✨ Novo
- **Sistema de Timeout**: Timeout de 30 segundos para operações de publicação
- **Delay Inteligente**: Espera automática para garantir que content scripts estejam prontos
- **Re-injeção Automática**: Content scripts são automaticamente re-injetados quando necessário
- **Logs Detalhados**: Sistema de logging aprimorado para facilitar depuração

## [1.0.6] - 2025-01-08

### 🔧 Corrigido
- **Erro "Cannot read properties of undefined (reading 'id')"**: Resolvido completamente o erro que ocorria ao tentar publicar anúncios
  - Corrigido formato da mensagem enviada do popup para o background script (mudança de `ad:` para `data:`)
  - Adicionada validação robusta no background script para verificar se `adData` existe antes de acessar propriedades
  - Implementada verificação específica para a propriedade `id` obrigatória
  - Adicionadas mensagens de erro descritivas para facilitar depuração futura
  - Garantido que o objeto do anúncio seja passado corretamente através da cadeia de comunicação

### 🚀 Melhorado
- **Validação de Dados**: Sistema robusto de validação de dados de anúncios no background script
- **Tratamento de Erros**: Mensagens de erro mais específicas e informativas
- **Comunicação**: Padronização do formato de mensagens entre popup e background script
- **Depuração**: Logs mais detalhados para facilitar identificação de problemas

### ✨ Novo
- **Validação Preventiva**: Verificação automática de integridade dos dados antes do processamento
- **Mensagens Descritivas**: Erros específicos indicando exatamente qual propriedade está faltando
- **Fallback Seguro**: Tratamento gracioso de dados malformados ou incompletos

## [1.0.5] - 2025-01-08

### 🔧 Corrigido
- **Problema do Popup "Quadrado Azul"**: Resolvido completamente o problema onde o popup aparecia apenas como um pequeno quadrado azul
  - Reescrito CSS do popup com dimensões fixas (420x600px)
  - Corrigido sistema de reset de estilos para evitar conflitos
  - Implementado layout flexbox robusto para estrutura do popup
  - Garantido que html/body tenham dimensões corretas
  - Removido overflow desnecessário que causava problemas de renderização
  - Adicionado estilos específicos para todos os componentes da interface

### 🚀 Melhorado
- **Interface do Popup**: Layout completamente redesenhado e otimizado
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela
- **Estabilidade Visual**: Eliminação de problemas de renderização
- **Experiência do Usuário**: Interface agora carrega corretamente em todas as situações

### ✨ Novo
- **CSS Robusto**: Sistema de estilos completamente reescrito
- **Dimensões Fixas**: Popup com tamanho consistente (420x600px)
- **Layout Flexbox**: Estrutura moderna e confiável
- **Estilos de Botões**: Sistema de botões padronizado e funcional

## [1.0.4] - 2025-01-08

### 🔧 Corrigido
- **Erro "Unknown message type: CHECK_FACEBOOK_CONNECTION"**: Implementado handler completo para verificação de conexão
  - Adicionado método `checkFacebookConnection()` no background script
  - Implementada verificação inteligente de abas do Facebook abertas
  - Detecção específica de abas do Facebook Marketplace
  - Verificação de status do content script nas abas do marketplace
  - Mensagens informativas sobre status da conexão
  - Tratamento robusto de erros de comunicação

### 🚀 Melhorado
- **Verificação de Conexão**: Sistema completo de verificação de status do Facebook
- **Interface do Usuário**: Indicador visual de status de conexão no popup
- **Experiência do Usuário**: Mensagens claras sobre como conectar ao Facebook Marketplace
- **Robustez**: Tratamento de casos onde content script não está pronto

### ✨ Novo
- **Status de Conexão em Tempo Real**: Verificação automática ao abrir o popup
- **Detecção Inteligente**: Diferenciação entre Facebook geral e Facebook Marketplace
- **Orientação do Usuário**: Instruções claras para estabelecer conexão

## [1.0.3] - 2025-01-08

### 🔧 Corrigido
- **Erro "undefined_RESPONSE"**: Corrigido problema de mensagens de resposta indefinidas
  - Implementado tratamento específico para mensagens de resposta (_RESPONSE)
  - Adicionado método dedicado `handlePortMessage` no background script
  - Verificação de tipo de mensagem antes de construir respostas
  - Prevenção de loops de mensagens indefinidas
  - Logs específicos para mensagens de resposta para melhor depuração

### 🚀 Melhorado
- **Sistema de Logs**: Logs mais específicos para diferentes tipos de mensagens
- **Tratamento de Mensagens**: Separação clara entre mensagens regulares e respostas
- **Depuração**: Melhor rastreamento de fluxo de mensagens entre componentes

## [1.0.2] - 2025-01-08

### 🔧 Corrigido
- **Erro "Extension context invalidated"**: Implementado sistema robusto de mensagens
  - Sistema de reconexão automática com backoff exponencial
  - Conexões de longa duração (long-lived connections) para comunicação estável
  - Fallback para runtime.sendMessage quando conexão por porta falha
  - Detecção inteligente de invalidação de contexto
  - Cleanup automático de conexões ao descarregar página
- **Comunicação Background-Content**: Melhorada robustez da comunicação entre scripts
  - Tratamento de erros de desconexão
  - Tentativas de reconexão limitadas com delay progressivo
  - Logs detalhados para depuração de problemas de comunicação

### 🚀 Melhorado
- **Estabilidade de Mensagens**: Sistema de mensagens mais confiável e resistente a falhas
- **Tratamento de Erros**: Melhor captura e tratamento de erros de comunicação
- **Logs de Debug**: Sistema de logging mais detalhado para problemas de conexão

## [1.0.1] - 2025-01-08

### 🔧 Corrigido
- **Erro "Identifier has already been declared"**: Corrigido problema de declaração múltipla de classes
  - Encapsulamento de todos os scripts em IIFE (Immediately Invoked Function Expression)
  - Prevenção de poluição do escopo global
  - Eliminação de conflitos entre scripts
- **Erro "Invalid or unexpected token"**: Removidos caracteres especiais que causavam erros de sintaxe
  - Substituição de acentos em strings críticas
  - Correção de encoding de caracteres
  - Validação de sintaxe JavaScript
- **Popup não funcionando**: Corrigido problema do popup que aparecia apenas como quadrado azul
  - Inicialização robusta do popup
  - Tratamento de erros melhorado
  - Logs de depuração adicionados

### 📚 Adicionado
- **Guia de Solução de Problemas**: Novo arquivo TROUBLESHOOTING.md com soluções detalhadas
- **Diagnóstico Avançado**: Ferramentas para identificar e resolver problemas
- **Códigos de Erro**: Sistema de códigos para facilitar suporte técnico

### 🚀 Melhorado
- **Estabilidade Geral**: Extensão mais estável e confiável
- **Tratamento de Erros**: Melhor captura e tratamento de exceções
- **Logs de Debug**: Sistema de logging mais detalhado para depuração

## [1.0.0] - 2025-01-08

### Adicionado
- **Suporte a Vídeos (NOVO)**
  - Upload de vídeos em formatos MP4, MOV, AVI, WMV
  - Validação automática de duração (5-60 segundos)
  - Limite de tamanho de 100MB por vídeo
  - Preview com controles de reprodução
  - Compressão automática quando necessário
  - Conversão automática para formatos compatíveis
  - Detecção de problemas de qualidade
  - Interface intuitiva para gerenciamento de vídeos

- **Interface Principal**
  - Dashboard com estatísticas em tempo real
  - Editor de anúncios com validação automática
  - Sistema de navegação por abas intuitivo
  - Indicadores visuais de status e progresso

- **Criação de Anúncios**
  - Formulário completo com todos os campos do Facebook Marketplace
  - Upload de múltiplas imagens com otimização automática
  - Validação inteligente de dados antes da publicação
  - Suporte a categorias e subcategorias
  - Sistema de tags e palavras-chave

- **Sistema de Agendamento**
  - Agendamento flexível para qualquer data e horário
  - Publicação em massa com intervalos configuráveis
  - Sistema de retry automático em caso de falhas
  - Monitoramento em tempo real de publicações
  - Gerenciamento completo de agendamentos

- **Automação Avançada**
  - Detecção automática de páginas do Facebook Marketplace
  - Preenchimento automático de formulários
  - Upload automático de imagens
  - Seleção automática de categorias
  - Tratamento inteligente de erros

- **Banco de Dados Local**
  - Armazenamento seguro usando IndexedDB
  - Operações CRUD completas para anúncios
  - Sistema de templates reutilizáveis
  - Backup e restauração de dados
  - Importação/exportação em CSV e JSON

- **Configurações Avançadas**
  - Personalização completa do comportamento da extensão
  - Configurações de automação e timing
  - Sistema de notificações configurável
  - Limites de segurança personalizáveis
  - Modo de depuração com logs detalhados

- **Segurança e Privacidade**
  - Armazenamento local de todos os dados
  - Validação rigorosa contra XSS
  - Conformidade com políticas do Facebook
  - Sistema de rate limiting inteligente
  - Criptografia de dados sensíveis

- **Interface de Usuário**
  - Design responsivo para diferentes tamanhos de tela
  - Tema claro/escuro com detecção automática
  - Animações suaves e feedback visual
  - Acessibilidade completa (WCAG 2.1)
  - Suporte a múltiplos idiomas (PT-BR, EN-US, ES-ES)

- **Recursos de Produtividade**
  - Importação em massa via CSV/JSON
  - Templates de anúncios reutilizáveis
  - Duplicação rápida de anúncios
  - Busca e filtros avançados
  - Estatísticas detalhadas de desempenho

- **Sistema de Logs**
  - Logs detalhados para depuração
  - Exportação de logs para suporte técnico
  - Limpeza automática de logs antigos
  - Diferentes níveis de log (info, warn, error)
  - Timestamps precisos para todas as operações

### Recursos Técnicos
- **Arquitetura**
  - Manifest V3 para máxima compatibilidade
  - Service Worker para background processing
  - Content Scripts para automação de páginas
  - Modular JavaScript architecture
  - CSS Grid e Flexbox para layouts responsivos

- **APIs Utilizadas**
  - Chrome Extension APIs completas
  - IndexedDB para armazenamento persistente
  - Notifications API para alertas
  - Alarms API para agendamentos
  - Tabs API para gerenciamento de abas

- **Compatibilidade**
  - Google Chrome 88+
  - Microsoft Edge 88+
  - Outros navegadores baseados em Chromium
  - Windows 10+, macOS 10.14+, Linux (Ubuntu 18.04+)

### Documentação
- **Guias Completos**
  - README.md com visão geral completa
  - Guia de instalação detalhado (INSTALLATION.md)
  - Manual do usuário abrangente (USER_MANUAL.md)
  - Documentação técnica para desenvolvedores

- **Recursos de Suporte**
  - FAQ com perguntas frequentes
  - Guia de solução de problemas
  - Exemplos de uso e melhores práticas
  - Templates de arquivos CSV/JSON

### Segurança
- **Validações**
  - Sanitização de entrada de dados
  - Validação de tipos e formatos
  - Proteção contra injeção de código
  - Verificação de integridade de arquivos

- **Privacidade**
  - Nenhum dado enviado para servidores externos
  - Armazenamento local criptografado
  - Conformidade com LGPD/GDPR
  - Transparência total sobre coleta de dados

### Performance
- **Otimizações**
  - Carregamento lazy de componentes
  - Compressão de imagens automática
  - Cache inteligente de dados
  - Debouncing de operações frequentes
  - Throttling de requests para APIs

- **Monitoramento**
  - Métricas de performance em tempo real
  - Detecção automática de problemas
  - Alertas sobre uso excessivo de recursos
  - Otimização automática de configurações

## [Planejado para v1.1.0]

### A Adicionar
- **Recursos Avançados**
  - Integração com Google Sheets
  - API para desenvolvedores terceiros
  - Webhooks para notificações externas
  - Sincronização em nuvem opcional

- **Melhorias de Interface**
  - Editor visual de anúncios
  - Prévia em tempo real

