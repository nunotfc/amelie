/**
 * ComandoCego - Implementação do comando para modo cego
 */
const _ = require('lodash/fp');
const { Resultado, Trilho } = require('../../../../utilitarios/Ferrovia');
const { criarComando } = require('../ComandoBase');
const { prompts, identity } = require('../../../../config/PromptLoader');

const criarComandoCego = (dependencias) => {
  const { registrador, gerenciadorConfig, servicoMensagem } = dependencias;
  
  const executar = (mensagem, args, chatId) => {
    const BOT_NAME = identity.NOME_BOT || 'Amélie';

    // Prompt especializado para usuários cegos (puxado do Markdown)
    const promptAudiomar = prompts.PROMPT_MODO_CEGO;

    // Pipeline para ativar modo cego usando composição funcional
    return Trilho.encadear(
      // Manter as configurações originais do modo cego
      () => Trilho.dePromise(gerenciadorConfig.definirConfig(chatId, 'mediaImage', true)),
      () => Trilho.dePromise(gerenciadorConfig.definirConfig(chatId, 'mediaAudio', false)),
      
      // Definir e ativar o prompt especializado
      () => Trilho.dePromise(gerenciadorConfig.definirPromptSistema(chatId, BOT_NAME, promptAudiomar)),
      () => Trilho.dePromise(gerenciadorConfig.definirPromptSistemaAtivo(chatId, BOT_NAME)),
      
      // Enviar confirmação
      () => Trilho.dePromise(servicoMensagem.enviarResposta(
        mensagem, 
        'Configurações para usuários com deficiência visual aplicadas com sucesso:\n' +
        '- Descrição de imagens habilitada\n' +
        '- Transcrição de áudio desabilitada\n' +
        '- Prompt de descrição ativado'
      ))
    )()
    .then(resultado => {
      if (resultado.sucesso) {
        registrador.info(`[CdCgo] Configs para deficiência visual aplicadas.`);
      }
      return resultado;
    });
  };
  
  return criarComando(
    'cego', 
    'Aplica configurações para usuários com deficiência visual', 
    executar
  );
};

module.exports = criarComandoCego;
