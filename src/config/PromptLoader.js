const fs = require('fs');
const path = require('path');

/**
 * Carregador de Prompts e Identidade baseado em Markdown
 * Permite centralizar a "personalidade" e as instruções do bot fora do código.
 */

const carregarMarkdown = (filePath) => {
  try {
    const conteudo = fs.readFileSync(filePath, 'utf8');
    const secoes = {};
    let secaoAtual = '';
    
    conteudo.split('
').forEach(linha => {
      if (linha.startsWith('# ')) {
        secaoAtual = linha.replace('# ', '').trim();
        secoes[secaoAtual] = [];
      } else if (secaoAtual) {
        secoes[secaoAtual].push(linha);
      }
    });

    // Join lines and trim
    Object.keys(secoes).forEach(key => {
      secoes[key] = secoes[key].join('
').trim();
    });

    return secoes;
  } catch (error) {
    console.error(`Erro ao carregar arquivo Markdown: ${filePath}`, error);
    return {};
  }
};

const processarVariaveis = (texto, variaveis) => {
  if (!texto) return '';
  let resultado = texto;
  Object.keys(variaveis).forEach(chave => {
    const regex = new RegExp(`{{${chave}}}`, 'g');
    resultado = resultado.replace(regex, variaveis[chave]);
  });
  return resultado;
};

// Carregar Identidade
const identityPath = path.join(__dirname, 'IDENTITY.md');
const rawIdentity = carregarMarkdown(identityPath);

// Processar variáveis internas da identidade (ex: BIO_COMPLETA usa VERSAO_MODELO)
const identity = {};
Object.keys(rawIdentity).forEach(key => {
  identity[key] = processarVariaveis(rawIdentity[key], rawIdentity);
});

// Carregar Prompts
const promptsPath = path.join(__dirname, 'PROMPTS.md');
const rawPrompts = carregarMarkdown(promptsPath);

// Processar variáveis da identidade dentro dos prompts
const prompts = {};
Object.keys(rawPrompts).forEach(key => {
  prompts[key] = processarVariaveis(rawPrompts[key], identity);
});

module.exports = {
  identity,
  prompts,
  // Helper para recarregar em tempo de execução se necessário
  reload: () => {
    const freshIdentity = carregarMarkdown(identityPath);
    Object.keys(freshIdentity).forEach(key => {
      identity[key] = processarVariaveis(freshIdentity[key], freshIdentity);
    });
    const freshPrompts = carregarMarkdown(promptsPath);
    Object.keys(freshPrompts).forEach(key => {
      prompts[key] = processarVariaveis(freshPrompts[key], identity);
    });
  }
};
