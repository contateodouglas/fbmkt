# Facebook Marketplace Auto Poster - Extensão Chrome

Uma extensão completa para Google Chrome que automatiza a publicação de anúncios no Facebook Marketplace, incluindo agendamento, publicação em massa e suporte a vídeos.

## ✨ Recursos Principais

### 🚀 **Automação Completa**
- Preenchimento automático de formulários do Facebook Marketplace
- Upload automático de imagens e vídeos
- Detecção inteligente de elementos da página
- Sistema de retry automático em caso de falhas

### 📝 **Criação de Anúncios**
- Interface intuitiva para criação de anúncios
- Suporte a todos os campos do Facebook Marketplace:
  - Título, descrição, preço, categoria
  - Condição, localização, marca, tags
  - Upload de múltiplas imagens (até 10)
  - **NOVO**: Upload de vídeos (MP4, MOV, até 100MB)
- Validação automática de dados
- Templates reutilizáveis

### ⏰ **Sistema de Agendamento**
- Agendamento flexível para qualquer data/horário
- Publicação em massa com intervalos configuráveis
- Sistema de retry automático
- Monitoramento em tempo real
- Notificações de status

### 🎥 **Suporte a Vídeos (NOVO)**
- Upload de vídeos em formatos MP4, MOV, AVI, WMV
- Validação automática de duração (5-60 segundos)
- Limite de tamanho de 100MB por vídeo
- Preview com controles de reprodução
- Compressão automática quando necessário
- Conversão automática para formatos compatíveis

### 💾 **Gerenciamento de Dados**
- Banco de dados local usando IndexedDB
- Importação/exportação em CSV e JSON
- Sistema de backup completo
- Estatísticas detalhadas de performance
- Histórico de atividades

### 🎨 **Interface Moderna**
- Design responsivo e intuitivo
- Dashboard com estatísticas em tempo real
- Tema claro/escuro
- Suporte a múltiplos idiomas
- Acessibilidade completa (WCAG 2.1 AA)

## 📋 Requisitos

- Google Chrome 88+ ou Chromium
- Conta ativa no Facebook
- Acesso ao Facebook Marketplace
- Conexão com internet estável

## 🛠️ Instalação

### Instalação Manual (Recomendada)

1. **Baixe a extensão**
   - Faça download do arquivo `facebook-marketplace-auto-poster-v1.0.0.zip`
   - Extraia o conteúdo para uma pasta local

2. **Instale no Chrome**
   - Abra o Google Chrome
   - Vá para `chrome://extensions/`
   - Ative o "Modo do desenvolvedor" (canto superior direito)
   - Clique em "Carregar sem compactação"
   - Selecione a pasta da extensão extraída

3. **Configure a extensão**
   - Clique no ícone da extensão na barra de ferramentas
   - Acesse as configurações através do botão ⚙️
   - Configure suas preferências iniciais

### Verificação da Instalação

Após a instalação, você deve ver:
- Ícone da extensão na barra de ferramentas do Chrome
- Popup funcional ao clicar no ícone
- Acesso às páginas de configurações e ajuda

## 🎯 Como Usar

### Criando seu Primeiro Anúncio

1. **Acesse a extensão**
   - Clique no ícone da extensão
   - Vá para a aba "Criar Anúncio"

2. **Preencha as informações básicas**
   - Título do anúncio (máximo 100 caracteres)
   - Descrição detalhada (máximo 1000 caracteres)
   - Preço em reais (R$)
   - Condição do item

3. **Selecione categoria e detalhes**
   - Escolha a categoria apropriada
   - Adicione marca (opcional)
   - Inclua tags/palavras-chave relevantes

4. **Adicione mídia**
   - **Imagens**: Clique ou arraste até 10 imagens
   - **Vídeo (NOVO)**: Adicione um vídeo de até 100MB
     - Formatos aceitos: MP4, MOV, AVI, WMV
     - Duração: 5 a 60 segundos
     - Preview com controles de reprodução

5. **Configure localização**
   - Digite sua cidade e estado
   - A extensão sugerirá localizações automaticamente

6. **Publique ou agende**
   - **Publicar Agora**: Publica imediatamente
   - **Agendar**: Define data e horário específicos

### Funcionalidades de Vídeo

A nova funcionalidade de vídeo permite enriquecer seus anúncios com conteúdo audiovisual:

**Formatos Suportados:**
- MP4 (recomendado)
- MOV
- AVI
- WMV

**Especificações Técnicas:**
- Tamanho máximo: 100MB
- Duração: 5 a 60 segundos
- Resolução recomendada: 1080p (1920x1080)
- Aspect ratios: 16:9, 1:1, 9:16

**Recursos Avançados:**
- Validação automática de formato e duração
- Compressão inteligente para otimizar tamanho
- Preview com controles de reprodução
- Conversão automática para formatos compatíveis
- Detecção de problemas de qualidade

### Agendamento de Publicações

1. **Ative o agendamento**
   - Marque "Agendar publicação" no formulário
   - Selecione data e horário desejados

2. **Gerencie agendamentos**
   - Vá para a aba "Agendamentos"
   - Visualize, edite ou cancele publicações agendadas
   - Monitore o status em tempo real

3. **Publicação em massa**
   - Use "Importar em Massa" no dashboard
   - Suporte a arquivos CSV e JSON
   - Preview dos dados antes da importação

### Importação em Massa

A extensão suporta importação de múltiplos anúncios:

**Formato CSV:**
```csv
title,description,price,category,condition,location,brand,tags,images,video
"iPhone 12 Pro","Excelente estado","2500","electronics","used_like_new","São Paulo, SP","Apple","smartphone,iphone","image1.jpg,image2.jpg","video.mp4"
```

**Formato JSON:**
```json
[
  {
    "title": "iPhone 12 Pro",
    "description": "Excelente estado",
    "price": 2500,
    "category": "electronics",
    "condition": "used_like_new",
    "location": "São Paulo, SP",
    "brand": "Apple",
    "tags": ["smartphone", "iphone"],
    "images": ["image1.jpg", "image2.jpg"],
    "video": {
      "name": "video.mp4",
      "dataUrl": "data:video/mp4;base64,..."
    }
  }
]
```

## ⚙️ Configurações

### Configurações Gerais

- **Publicação Automática**: Ativa/desativa publicação automática
- **Intervalo entre Publicações**: Tempo de espera entre anúncios
- **Máximo de Tentativas**: Número de tentativas em caso de falha
- **Localização Padrão**: Localização pré-preenchida

### Configurações de Vídeo

- **Qualidade de Compressão**: Balanceio entre qualidade e tamanho
- **Conversão Automática**: Converte formatos não suportados
- **Validação Rigorosa**: Verificações adicionais de qualidade

### Configurações Avançadas

- **Modo Debug**: Logs detalhados para depuração
- **Timeout de Espera**: Tempo limite para carregamento de páginas
- **Velocidade de Digitação**: Simula velocidade humana de digitação
- **Continuar em Erro**: Prossegue mesmo com erros não críticos

### Notificações

- **Notificações do Sistema**: Alertas do sistema operacional
- **Notificar Sucessos**: Confirmação de publicações bem-sucedidas
- **Notificar Erros**: Alertas de falhas e problemas
- **Sons de Notificação**: Feedback sonoro para eventos

## 🔧 Solução de Problemas

### Problemas Comuns

**Popup não abre ou aparece em branco:**
- Verifique se a extensão está ativada
- Recarregue a extensão em `chrome://extensions/`
- Limpe o cache do navegador
- Verifique se há conflitos com outras extensões

**Erro ao fazer upload de vídeo:**
- Verifique o formato do arquivo (MP4, MOV, AVI, WMV)
- Confirme se o tamanho não excede 100MB
- Verifique se a duração está entre 5-60 segundos
- Tente converter o vídeo para MP4

**Falha na publicação automática:**
- Verifique se está logado no Facebook
- Confirme se tem acesso ao Marketplace
- Verifique sua conexão com internet
- Tente publicar manualmente primeiro

**Problemas de performance:**
- Reduza o número de imagens por anúncio
- Comprima vídeos antes do upload
- Feche outras abas do navegador
- Reinicie o Chrome se necessário

### Logs e Depuração

Para ativar logs detalhados:
1. Vá para Configurações → Avançado
2. Ative "Modo Debug"
3. Abra o Console do Desenvolvedor (F12)
4. Reproduza o problema
5. Copie os logs para análise

### Suporte Técnico

Se os problemas persistirem:
- Verifique a documentação completa
- Consulte o manual do usuário
- Reporte bugs através do sistema de issues
- Entre em contato com o suporte técnico

## 🔒 Privacidade e Segurança

### Proteção de Dados

- **Armazenamento Local**: Todos os dados ficam no seu computador
- **Sem Servidores Externos**: Não enviamos dados para servidores terceiros
- **Criptografia**: Dados sensíveis são criptografados localmente
- **Controle Total**: Você tem controle completo sobre seus dados

### Permissões da Extensão

A extensão solicita apenas as permissões necessárias:
- **storage**: Para salvar configurações e anúncios localmente
- **activeTab**: Para interagir com a aba ativa do Facebook
- **scripting**: Para automatizar o preenchimento de formulários
- **alarms**: Para agendamento de publicações
- **notifications**: Para notificações do sistema

### Conformidade

- **LGPD**: Conformidade com a Lei Geral de Proteção de Dados
- **GDPR**: Compatível com regulamentações europeias
- **SOC 2**: Padrões de segurança empresarial
- **ISO 27001**: Gestão de segurança da informação

## 🚀 Recursos Avançados

### API de Integração

Para desenvolvedores, a extensão oferece APIs para integração:

```javascript
// Criar anúncio programaticamente
chrome.runtime.sendMessage({
  type: 'CREATE_AD',
  data: {
    title: 'Meu Produto',
    description: 'Descrição detalhada',
    price: 100,
    images: ['data:image/jpeg;base64,...'],
    video: {
      name: 'video.mp4',
      dataUrl: 'data:video/mp4;base64,...'
    }
  }
});
```

### Webhooks e Automação

Configure webhooks para integrar com sistemas externos:
- Notificações de publicação bem-sucedida
- Alertas de falhas e erros
- Estatísticas de performance
- Sincronização com CRMs

### Personalização Avançada

- **Temas Customizados**: Crie seus próprios temas visuais
- **Scripts Personalizados**: Adicione lógica customizada
- **Seletores Dinâmicos**: Adapte-se a mudanças do Facebook
- **Plugins de Terceiros**: Integre funcionalidades adicionais

## 📊 Estatísticas e Relatórios

### Dashboard Analítico

O dashboard fornece insights detalhados:
- Total de anúncios criados
- Taxa de sucesso de publicações
- Tempo médio de processamento
- Categorias mais utilizadas
- Performance por período

### Relatórios Exportáveis

Exporte dados em diversos formatos:
- **CSV**: Para análise em planilhas
- **JSON**: Para integração com sistemas
- **PDF**: Para relatórios executivos
- **Excel**: Para análises avançadas

### Métricas de Performance

Monitore indicadores importantes:
- Tempo de resposta do Facebook
- Taxa de erro por categoria
- Eficiência do agendamento
- Uso de recursos do sistema

## 🔄 Atualizações e Versionamento

### Sistema de Atualizações

- **Atualizações Automáticas**: Quando disponível na Chrome Web Store
- **Notificações**: Alertas sobre novas versões
- **Changelog**: Histórico detalhado de mudanças
- **Rollback**: Possibilidade de reverter atualizações

### Roadmap de Desenvolvimento

Próximas funcionalidades planejadas:
- Suporte a mais formatos de vídeo
- Integração com redes sociais
- IA para otimização de anúncios
- Análise de mercado automática
- Suporte a múltiplas contas

## 🤝 Contribuição e Desenvolvimento

### Para Desenvolvedores

Estrutura do projeto:
```
facebook-marketplace-extension/
├── manifest.json          # Configuração da extensão
├── popup/                 # Interface principal
├── options/              # Página de configurações
├── background/           # Script de fundo
├── content/              # Scripts de conteúdo
├── lib/                  # Bibliotecas utilitárias
└── assets/               # Recursos visuais
```

### Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Armazenamento**: IndexedDB
- **APIs**: Chrome Extension APIs
- **Automação**: DOM Manipulation
- **Mídia**: File API, Canvas API

### Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Submeta um pull request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

- **Documentação**: [USER_MANUAL.md](USER_MANUAL.md)
- **Instalação**: [INSTALLATION.md](INSTALLATION.md)
- **Empacotamento**: [PACKAGING.md](PACKAGING.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2025  
**Desenvolvido por**: Manus AI  
**Compatibilidade**: Chrome 88+, Chromium

