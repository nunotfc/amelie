/**
 * Centraliza todas as instruções do sistema para o bot Amélie
 * Agora utiliza o PromptLoader para carregar definições de Markdown
 * 
 * @author Belle Utsch (adaptado)
 */

const { identity, prompts } = require('./PromptLoader');

// Instrução base que se repete em todo o código
const INSTRUCAO_BASE = prompts.INSTRUCAO_BASE;

// Instrução base SIMPLIFICADA para conversas normais (sem lista de comandos)
const INSTRUCAO_BASE_CONVERSA = prompts.INSTRUCAO_BASE_CONVERSA;

// Prompt específico para imagens (numerado como solicitado)
const PROMPT_ESPECIFICO_IMAGEM = prompts.PROMPT_ESPECIFICO_IMAGEM;

// Adicionar um novo prompt para o modo de descrição curta para imagens
const PROMPT_ESPECIFICO_IMAGEM_CURTO = prompts.PROMPT_ESPECIFICO_IMAGEM_CURTO;

const PROMPT_ESPECIFICO_VIDEO = prompts.PROMPT_ESPECIFICO_VIDEO;

// Adicionar um novo prompt para o modo de descrição curta para vídeos
const PROMPT_ESPECIFICO_VIDEO_CURTO = prompts.PROMPT_ESPECIFICO_VIDEO_CURTO;

// NOVO: Adicionar prompt específico para legendagem de vídeos 
const PROMPT_ESPECIFICO_VIDEO_LEGENDA = prompts.PROMPT_ESPECIFICO_VIDEO_LEGENDA;

// Generalizado: Adicionar prompt específico para Documentos (PDF, TXT, HTML, etc.)
const PROMPT_ESPECIFICO_DOCUMENTO = prompts.PROMPT_ESPECIFICO_DOCUMENTO;

// Funções para obter as instruções completas
const obterInstrucaoPadrao = () => INSTRUCAO_BASE; 

const obterInstrucaoConversa = () => INSTRUCAO_BASE_CONVERSA; 

const obterInstrucaoAudio = () => prompts.PROMPT_ESPECIFICO_AUDIO;

const obterInstrucaoImagem = () => PROMPT_ESPECIFICO_IMAGEM;

const obterInstrucaoImagemCurta = () => PROMPT_ESPECIFICO_IMAGEM_CURTO;

const obterInstrucaoVideo = () => PROMPT_ESPECIFICO_VIDEO;

const obterInstrucaoVideoCurta = () => PROMPT_ESPECIFICO_VIDEO_CURTO;

const obterInstrucaoVideoLegenda = () => PROMPT_ESPECIFICO_VIDEO_LEGENDA;

// Generalizado: Função para obter instrução de Documento
const obterInstrucaoDocumento = () => PROMPT_ESPECIFICO_DOCUMENTO;

// Funções para obter apenas os prompts específicos
const obterPromptImagem = () => PROMPT_ESPECIFICO_IMAGEM;
const obterPromptImagemCurto = () => PROMPT_ESPECIFICO_IMAGEM_CURTO;
const obterPromptVideo = () => PROMPT_ESPECIFICO_VIDEO;
const obterPromptVideoCurto = () => PROMPT_ESPECIFICO_VIDEO_CURTO;
const obterPromptVideoLegenda = () => PROMPT_ESPECIFICO_VIDEO_LEGENDA;

module.exports = {
  INSTRUCAO_BASE,
  PROMPT_ESPECIFICO_IMAGEM,
  PROMPT_ESPECIFICO_IMAGEM_CURTO,
  PROMPT_ESPECIFICO_VIDEO,
  PROMPT_ESPECIFICO_VIDEO_CURTO,
  PROMPT_ESPECIFICO_VIDEO_LEGENDA,
  obterInstrucaoPadrao,
  obterInstrucaoAudio,
  obterInstrucaoImagem,
  obterInstrucaoImagemCurta,
  obterInstrucaoVideo,
  obterInstrucaoVideoCurta,
  obterInstrucaoVideoLegenda,
  obterPromptImagem,
  obterPromptImagemCurto,
  obterPromptVideo,
  obterPromptVideoCurto,
  obterPromptVideoLegenda,
  obterInstrucaoDocumento,
  obterInstrucaoConversa,
  identity // Exportar identidade se necessário
};

