# Olá! Eu sou a Amélie 👋

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?style=flat-square&logo=node.js&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.0-blue?style=flat-square&logo=google-gemini&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys-25D366?style=flat-square&logo=whatsapp&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

Prazer em conhecer você! Sou uma assistente de IA multimídia acessível integrada ao WhatsApp, criada e idealizada pela Belle Utsch. Minha missão é tornar o WhatsApp mais acessível para todas as pessoas, especialmente aquelas com deficiência visual.

## Como posso te ajudar? 🤝

Posso:

- Descrever imagens detalhadamente
- Transcrever áudios palavra por palavra
- Interpretar vídeos
- Conversar sobre diversos assuntos

## Como me usar 📱

Para falar comigo:

1. Me adicione como contato: (31) 97234-4065
2. Me envie uma mensagem no WhatsApp
3. Use o comando `.ajuda` para ver todas as minhas funcionalidades

## Meus comandos 🎯

Use um ponto (.) antes de cada comando, sem espaço. Por exemplo: `.ajuda`

### Comandos principais:

`.cego` - Ativa configurações para pessoas com deficiência visual

- Habilita descrição automática de imagens
- Ajusta o formato das respostas para leitores de tela

`.audio` - Liga/desliga transcrição de áudio

- Quando ativo, transcrevo todos os áudios recebidos
- Transcrição palavra por palavra (verbatim)

`.video` - Liga/desliga interpretação de vídeo

- Quando ativo, descrevo o conteúdo dos vídeos
- Inclui ações, cenário e elementos importantes

`.imagem` - Liga/desliga descrição de imagem

- Quando ativo, descrevo todas as imagens recebidas
- Inclui detalhes visuais importantes

`.longo` - Usa descrição detalhada

- Descrições mais completas de imagens e vídeos
- Ideal para entender todos os detalhes

`.curto` - Usa descrição concisa

- Descrições mais objetivas e diretas
- Ideal para informações rápidas

`.reset` - Restaura configurações originais

- Limpa todas as configurações personalizadas
- Volta ao modo padrão

`.legenda` - Liga/desliga legenda de imagem

- Quando ativo, transcrevo em legenda a trilha de audio do vídeo
- Acessibilidade para Surdos

`.ajuda` - Mostra esta lista de comandos

## Como solicitar descrições específicas 🔍

Se quiser mais detalhes sobre uma imagem ou vídeo:

1. Envie a mídia novamente
2. Junto com ela, envie um comentário dizendo qual aspecto você quer que eu foque
3. Vou gerar uma nova descrição com ênfase no que você pediu

## Como funciona ⚙️

Amélie foi construída com foco em **acessibilidade** e **eficiência**. Sua estrutura técnica baseia-se em:

- **Processamento em Fluxo (Railway):** Utilizamos o padrão *Railway Oriented Programming* para garantir que cada mensagem seja processada com segurança, tratando erros de forma precisa sem interromper o serviço.
- **Arquitetura Funcional:** O sistema é construído sobre fábricas de funções, garantindo um código modular, fácil de testar e manter.
- **Filas de Processamento:** Para garantir que nenhuma mídia seja perdida, utilizamos o `Better-Queue`. Isso permite que áudios, imagens e vídeos sejam processados de forma assíncrona e organizada, respeitando os limites das APIs de IA.
- **Pipelines Multimídia:**
    - **Imagens e Áudios:** Processamento rápido e direto.
    - **Vídeos e Documentos:** Fluxos robustos que incluem upload para nuvem e análise profunda para fornecer descrições detalhadas.

Para saber mais sobre os detalhes técnicos, consulte a nossa [Documentação de Arquitetura](./docs/ARCHITECTURE.md).

## Grupos oficiais e contatos 👥

- Grupo oficial: https://chat.whatsapp.com/C0Ys7pQ6lZH5zqDD9A8cLp
- Minha idealizadora: Belle Utsch (https://beacons.ai/belleutsch)
- Meu código fonte: https://github.com/manelsen/amelie

## Dicas de uso 💡

1. Para descrições de imagem:
   - Uso linguagem clara e objetiva
   - Descrevo elementos importantes como texto, pessoas e objetos
   - Mantenho uma ordem lógica na descrição

2. Para transcrições de áudio:
   - Transcrevo exatamente o que foi dito
   - Mantenho a fidelidade do conteúdo
   - Indico pausas e elementos sonoros relevantes

## Precisa de ajuda? 🆘

Se tiver dúvidas ou precisar de ajuda:

1. Use o comando `.ajuda` para ver todos os comandos
2. Entre no grupo oficial para suporte
3. Fale com a Belle Utsch através do link do perfil dela

## Contribuindo com o projeto 🤝

Meu código é open source! Se quiser contribuir:

1. Visite meu repositório: https://github.com/manelsen/amelie
2. Faça um fork
3. Envie suas melhorias através de pull requests

## Sobre mim ℹ️

Sou baseada no Google Gemini Flash 2.0 e fui criada para tornar o WhatsApp mais acessível e inclusivo. Minha missão é ajudar pessoas com deficiência visual a participarem plenamente das conversas, garantindo que todo conteúdo visual seja devidamente descrito.

Com carinho,
Amélie 💜