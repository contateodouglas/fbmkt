# Guia de Instalação - Facebook Marketplace Auto Poster

## Requisitos do Sistema

### Navegador
- Google Chrome versão 88 ou superior
- Microsoft Edge versão 88 ou superior (baseado em Chromium)
- Outros navegadores baseados em Chromium

### Sistema Operacional
- Windows 10/11
- macOS 10.14 ou superior
- Linux (Ubuntu 18.04+, Fedora 32+, ou equivalente)

### Permissões Necessárias
- Acesso ao Facebook.com
- Armazenamento local
- Notificações do sistema
- Execução de scripts em páginas web

## Instalação da Extensão

### Método 1: Instalação Manual (Recomendado para Desenvolvimento)

1. **Baixar os Arquivos**
   - Faça o download de todos os arquivos da extensão
   - Extraia para uma pasta local (ex: `C:\Extensions\facebook-marketplace-auto-poster`)

2. **Abrir o Chrome**
   - Inicie o Google Chrome
   - Digite `chrome://extensions/` na barra de endereços
   - Pressione Enter

3. **Ativar Modo Desenvolvedor**
   - No canto superior direito, ative o "Modo do desenvolvedor"
   - Isso habilitará opções adicionais na página

4. **Carregar Extensão**
   - Clique em "Carregar sem compactação"
   - Navegue até a pasta onde extraiu os arquivos
   - Selecione a pasta raiz da extensão
   - Clique em "Selecionar pasta"

5. **Verificar Instalação**
   - A extensão deve aparecer na lista
   - Verifique se não há erros exibidos
   - O ícone da extensão deve aparecer na barra de ferramentas

### Método 2: Instalação via Chrome Web Store (Futuro)

*Nota: Esta extensão ainda não está disponível na Chrome Web Store. Use o método de instalação manual.*

1. Acesse a Chrome Web Store
2. Pesquise por "Facebook Marketplace Auto Poster"
3. Clique em "Adicionar ao Chrome"
4. Confirme a instalação

## Configuração Inicial

### Primeira Execução

1. **Acessar a Extensão**
   - Clique no ícone da extensão na barra de ferramentas
   - Se não estiver visível, clique no ícone de quebra-cabeça e fixe a extensão

2. **Configurações Básicas**
   - Clique no ícone de configurações (⚙️) no popup
   - Configure suas preferências básicas:
     - Localização padrão
     - Intervalo entre publicações
     - Notificações

3. **Teste de Conectividade**
   - Acesse facebook.com/marketplace
   - Verifique se o status da conexão mostra "Conectado"
   - Se aparecer "Desconectado", recarregue a página

### Configurações Recomendadas

#### Para Uso Pessoal
- Intervalo entre publicações: 30-60 segundos
- Máximo de publicações por hora: 5-10
- Notificações: Ativadas para sucessos e erros

#### Para Uso Comercial
- Intervalo entre publicações: 60-120 segundos
- Máximo de publicações por hora: 10-20
- Máximo de publicações por dia: 50-100
- Modo de depuração: Ativado (para monitoramento)

## Verificação da Instalação

### Testes Básicos

1. **Teste do Popup**
   - Clique no ícone da extensão
   - Verifique se o popup abre corretamente
   - Navegue entre as abas (Dashboard, Criar Anúncio, Agendamentos)

2. **Teste de Criação de Anúncio**
   - Vá para a aba "Criar Anúncio"
   - Preencha os campos obrigatórios
   - Salve como rascunho
   - Verifique se aparece no dashboard

3. **Teste de Conectividade**
   - Acesse facebook.com/marketplace
   - Verifique se a extensão detecta a página
   - O status deve mostrar "Conectado"

### Solução de Problemas Comuns

#### Extensão Não Carrega
- **Problema**: Erro ao carregar a extensão
- **Solução**: 
  - Verifique se todos os arquivos estão presentes
  - Certifique-se de que o manifest.json está válido
  - Recarregue a extensão na página chrome://extensions/

#### Ícone Não Aparece
- **Problema**: Ícone da extensão não visível
- **Solução**:
  - Clique no ícone de quebra-cabeça na barra de ferramentas
  - Encontre a extensão e clique no ícone de alfinete
  - Recarregue o Chrome se necessário

#### Erro de Permissões
- **Problema**: Extensão não funciona no Facebook
- **Solução**:
  - Verifique se as permissões foram concedidas
  - Acesse chrome://extensions/
  - Clique em "Detalhes" na extensão
  - Verifique as permissões do site

#### Status "Desconectado"
- **Problema**: Extensão não conecta ao Facebook
- **Solução**:
  - Recarregue a página do Facebook
  - Limpe o cache do navegador
  - Verifique se está logado no Facebook
  - Desative outras extensões que possam interferir

## Atualizações

### Atualizações Manuais

1. **Baixar Nova Versão**
   - Faça o download da versão mais recente
   - Substitua os arquivos na pasta da extensão

2. **Recarregar Extensão**
   - Vá para chrome://extensions/
   - Encontre a extensão
   - Clique no ícone de recarregar (🔄)

3. **Verificar Versão**
   - Abra as configurações da extensão
   - Vá para a aba "Sobre"
   - Verifique se a versão foi atualizada

### Backup de Dados

Antes de atualizar, recomenda-se fazer backup dos dados:

1. **Exportar Dados**
   - Abra as configurações da extensão
   - Vá para a aba "Dados"
   - Clique em "Exportar Dados"
   - Salve o arquivo de backup

2. **Após Atualização**
   - Se necessário, importe os dados salvos
   - Verifique se todas as configurações foram mantidas

## Desinstalação

### Remover Extensão

1. **Via Chrome**
   - Acesse chrome://extensions/
   - Encontre a extensão
   - Clique em "Remover"
   - Confirme a remoção

2. **Limpeza Manual**
   - Exclua a pasta da extensão do seu computador
   - Limpe o cache do navegador se desejar

### Limpeza de Dados

A remoção da extensão automaticamente remove:
- Todos os anúncios salvos
- Configurações personalizadas
- Logs e dados de depuração
- Templates salvos

**Importante**: Faça backup dos dados importantes antes de desinstalar.

## Suporte Técnico

### Logs de Depuração

Para obter ajuda com problemas:

1. **Ativar Modo de Depuração**
   - Vá para Configurações > Automação
   - Ative "Modo de Depuração"

2. **Reproduzir o Problema**
   - Execute a ação que está causando erro
   - Aguarde alguns minutos

3. **Coletar Logs**
   - Vá para Configurações > Dados
   - Exporte os dados (incluem logs)
   - Envie o arquivo para suporte

### Console do Navegador

Para problemas técnicos avançados:

1. **Abrir Console**
   - Pressione F12 no Chrome
   - Vá para a aba "Console"

2. **Filtrar Mensagens**
   - Digite "FB Auto Poster" no filtro
   - Copie as mensagens de erro relevantes

3. **Informações Úteis**
   - Versão do Chrome
   - Sistema operacional
   - Mensagens de erro específicas
   - Passos para reproduzir o problema

## Considerações de Segurança

### Dados Pessoais
- A extensão não coleta dados pessoais
- Todos os dados são armazenados localmente
- Nenhuma informação é enviada para servidores externos

### Permissões
- A extensão só acessa páginas do Facebook
- Não monitora outras atividades de navegação
- Não acessa dados de outros sites

### Uso Responsável
- Respeite os termos de uso do Facebook
- Use intervalos apropriados entre publicações
- Não abuse da automação para spam
- Monitore regularmente a atividade da conta

## Contato e Suporte

Para dúvidas, problemas ou sugestões:

- **Email**: [Inserir email de suporte]
- **Documentação**: [Link para documentação completa]
- **Issues**: [Link para sistema de tickets]
- **FAQ**: [Link para perguntas frequentes]

---

**Versão do Documento**: 1.0.0  
**Última Atualização**: [Data atual]  
**Compatibilidade**: Chrome 88+, Edge 88+

