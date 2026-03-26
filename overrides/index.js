/**
 * Overrides - Sistema de modificações externas para o Amélie
 *
 * Este módulo deve ser carregado ANTES de qualquer require dos módulos originais.
 *
 * Para desabilitar os overrides, comente a linha require('./overrides') no amelie.js
 */

const path = require('path');

// Carregar dotenv ANTES de usar variáveis de ambiente
const dotenv = require('dotenv');
dotenv.config();

// ============================================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================================

// Prefixo configurado
const COMMAND_PREFIX = process.env.COMMAND_PREFIX || '.';
global.COMMAND_PREFIX = COMMAND_PREFIX;


// Timezone configurado
const moment = require('moment-timezone');
const TIMEZONE = process.env.TZ || process.env.TIMEZONE || 'America/Sao_Paulo';
moment.tz.setDefault(TIMEZONE);

// PATCH: Impedir que moment.tz.setDefault seja sobrescrito pelo src/index.js
const originalSetDefault = moment.tz.setDefault;
moment.tz.setDefault = function(zone) {
    if (zone === 'America/Sao_Paulo' && TIMEZONE !== 'America/Sao_Paulo') {
        console.log('[Overrides/Timezone] Ignorando setDefault("America/Sao_Paulo"), mantendo:', `"${TIMEZONE}"`);
        return;
    }
    return originalSetDefault.call(this, zone);
};

console.log('[Overrides] Inicializando sistema de overrides...');
console.log('[Overrides] Prefixo de comandos:', `"${COMMAND_PREFIX}"`);
console.log('[Overrides] Timezone configurado:', `"${TIMEZONE}"`);

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const comandosConhecidos = [
    'ajuda', 'cego', 'audio', 'video', 'imagem',
    'longo', 'curto', 'legenda', 'reset', 'filas',
    'doc', 'config', 'prompt', 'users'
];

const substituirPrefixos = (texto) => {
    if (typeof texto !== 'string') return texto;
    // Substituir .comando por prefixo+comando
    // Lookahead: espaço, newline, ), ,, . ou fim de string
    let resultado = texto.replace(
        new RegExp(`\\.(${comandosConhecidos.join('|')})(?=[ \\n\\)\\,\\.]|$)`, 'g'),
        `${COMMAND_PREFIX}$1`
    );
    // Substituir instruções de uso
    resultado = resultado.replace(
        /Use com um ponto antes da palavra de comando/g,
        `Use com ${COMMAND_PREFIX} antes da palavra de comando`
    );
    return resultado;
};

// ============================================================================
// INTERCEPTADOR GLOBAL DE MODULE.PROTOTYPE.REQUIRE
// ============================================================================

const Module = require('module');
const fs = require('fs');
const vm = require('vm');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    const modulePath = String(id);

    // ------------------------------------------------------------------------
    // PATCH 0: ProcessadorVideo - Substituir limite hardcoded por variável de ambiente
    // ------------------------------------------------------------------------
    if (modulePath.includes('ProcessadorVideo') || modulePath.includes('processadores/ProcessadorVideo')) {
        const resolvedPath = Module._resolveFilename(id, this);
        const originalCode = fs.readFileSync(resolvedPath, 'utf8');

        // Substituir: limiteMB = 20  →  limiteMB = process.env.MAX_FILE_SIZE_MB || 20
        const patchedCode = originalCode.replace(
            /limiteMB\s*=\s*(\d+)/g,
            'limiteMB = process.env.MAX_FILE_SIZE_MB || $1'
        );

        // Substituir também nas mensagens de erro hardcoded
        const finalCode = patchedCode.replace(
            /vídeos de até \d+MB\./g,
            'vídeos de até ' + (process.env.MAX_FILE_SIZE_MB || '20') + 'MB.'
        );

        if (originalCode !== finalCode) {
            // Criar um novo módulo e compilar o código modificado
            const mod = new Module(resolvedPath, this);
            mod.filename = resolvedPath;
            mod.paths = Module._nodeModulePaths(resolvedPath);

            // Compilar e executar o código modificado
            const script = new vm.Script(finalCode, { filename: resolvedPath });
            const result = script.runInNewContext({
                module: mod,
                exports: mod.exports,
                require: mod.require.bind(mod),
                __filename: resolvedPath,
                __dirname: require('path').dirname(resolvedPath),
                process,
                Buffer,
                console,
                global
            });

            this.exports = mod.exports;
            console.log('[Overrides/FileSize] ProcessadorVideo patchado com MAX_FILE_SIZE_MB=', process.env.MAX_FILE_SIZE_MB || 20);
            require.cache[resolvedPath] = mod;
            return mod.exports;
        }
    }

    const module = originalRequire.apply(this, arguments);

    // ------------------------------------------------------------------------
    // PATCH 1: Ferrovia/Trilho - Remove bloqueio de grupos
    // ------------------------------------------------------------------------
    if (modulePath.includes('Ferrovia') || modulePath.includes('utilitarios/Ferrovia')) {
        if (module.Trilho && module.Trilho.encadear && !module.Trilho.__patchedByOverrides) {
            const originalEncadear = module.Trilho.encadear;

            module.Trilho.encadear = function(...steps) {
                const filteredSteps = steps.filter(step => {
                    if (typeof step !== 'function') return true;
                    const funcStr = step.toString();
                    const bloqueiaGrupos = funcStr.includes('ehGrupo') &&
                                         funcStr.includes('Mensagem de grupo ignorada');
                    if (bloqueiaGrupos) return false;
                    return true;
                });

                return originalEncadear.apply(this, filteredSteps);
            };

            module.Trilho.__patchedByOverrides = true;
            console.log('[Overrides/Groups] Trilho.encadear patchado (grupos liberados)');
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 2: Validadores - Prefixo dinâmico (SÓ aceita comandos COM prefixo)
    // ------------------------------------------------------------------------
    if (modulePath.includes('Validadores') || modulePath.includes('dominio/Validadores')) {
        if (module.verificarTipoMensagem && !module.__patchedByOverrides) {
            const _ = require('lodash/fp');

            module.verificarTipoMensagem = _.curry((registrador, registroComandos, dados) => {
                const { mensagem } = dados;
                let tipo = 'texto';
                let comandoNormalizado = null;

                const normalizarTexto = (txt) => {
                    if (!txt) return '';
                    return txt.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
                };

                const textoOriginal = mensagem.body || '';
                const textoNormalizado = normalizarTexto(textoOriginal);

                // SÓ processa como comando SE começar com o prefixo
                if (textoNormalizado && textoNormalizado.startsWith(COMMAND_PREFIX)) {
                    const textoSemPrefixo = textoNormalizado.substring(COMMAND_PREFIX.length).trim();
                    const primeiraPalavra = textoSemPrefixo.split(/\s+/)[0];

                    const comandosRegistrados = registroComandos.listarComandos();
                    const nomesComandosOriginais = comandosRegistrados.map(cmd => cmd.nome);
                    const nomesComandosRegistrados = nomesComandosOriginais.map(normalizarTexto);

                    const ehComando = primeiraPalavra && nomesComandosRegistrados.includes(primeiraPalavra);

                    if (ehComando) {
                        tipo = 'comando';
                        comandoNormalizado = primeiraPalavra;
                        registrador.info(`Comando detectado: ${comandoNormalizado} (Texto original: "${mensagem.body}")`);
                    }
                }

                if (tipo !== 'comando' && mensagem.hasMedia) {
                    tipo = 'midia';
                }

                const { Resultado } = require('../src/utilitarios/Ferrovia');
                return Resultado.sucesso({ ...dados, tipo, comandoNormalizado });
            });

            module.getPrefixo = () => COMMAND_PREFIX;
            module.__patchedByOverrides = true;
            console.log('[Overrides/Prefix] verificarTipoMensagem patchado com prefixo dinâmico');
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 3: GerenciadorMensagens - Desabilitar auto-saída de grupos
    // ------------------------------------------------------------------------
    // Só aplica para GerenciadorMensagens.js, NÃO para AdaptadorGerenciadorMensagens.js
    if (modulePath.includes('GerenciadorMensagens') && !modulePath.includes('Adaptador')) {
        if (typeof module === 'function' && !module.__patchedByOverrides) {
            const originalCriar = module;

            const patchedCriar = function(dependencias) {
                const gerenciador = originalCriar(dependencias);

                if (gerenciador.processarEntradaGrupo) {
                    gerenciador.processarEntradaGrupo = async function(notificacao) {
                        console.log('[Overrides/Groups] Auto-saída de grupos desabilitada');
                        return { sucesso: true, ignorado: true };
                    };
                }

                return gerenciador;
            };

            Object.defineProperty(patchedCriar, 'name', { value: originalCriar.name });
            Object.defineProperty(patchedCriar, 'length', { value: originalCriar.length });
            patchedCriar.__patchedByOverrides = true;
            this.exports = patchedCriar;

            console.log('[Overrides/Groups] Auto-saída de grupos desabilitada');
            return this.exports;
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 4: EstrategiasEnvio - Substituir prefixo hardcoded no envio final
    // ------------------------------------------------------------------------
    if (modulePath.includes('EstrategiasEnvio')) {
        if (!module.__patchedByOverrides) {
            // Patchar envioBaileysNativo
            if (module.envioBaileysNativo) {
                const original = module.envioBaileysNativo;
                module.envioBaileysNativo = async (cliente, dest, texto, msgOriginal) => {
                    const textoModificado = substituirPrefixos(texto);
                    return original(cliente, dest, textoModificado, msgOriginal);
                };
            }

            // Patchar envioDireto
            if (module.envioDireto) {
                const original = module.envioDireto;
                module.envioDireto = async (cliente, dest, texto) => {
                    const textoModificado = substituirPrefixos(texto);
                    return original(cliente, dest, textoModificado);
                };
            }

            // Patchar envioComContextoManual
            if (module.envioComContextoManual) {
                const original = module.envioComContextoManual;
                module.envioComContextoManual = async (cliente, dest, texto, contexto) => {
                    const textoModificado = substituirPrefixos(texto);
                    return original(cliente, dest, textoModificado, contexto);
                };
            }

            module.__patchedByOverrides = true;
            console.log('[Overrides/HelpTexts] EstrategiasEnvio patchado');
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 5: PromptLoader - Substituir prefixo hardcoded nos prompts
    // ------------------------------------------------------------------------
    if (modulePath.includes('PromptLoader') || modulePath.includes('config/PromptLoader')) {
        if (!module.__patchedByOverrides) {
            if (module.prompts) {
                const comandosNoPrompts = [
                    'INSTRUCAO_BASE', 'INSTRUCAO_BASE_CONVERSA', 'PROMPT_MODO_CEGO'
                ];

                comandosNoPrompts.forEach(chave => {
                    if (module.prompts[chave] && typeof module.prompts[chave] === 'string') {
                        module.prompts[chave] = substituirPrefixos(module.prompts[chave]);
                    }
                });

                module.__patchedByOverrides = true;
                console.log('[Overrides/HelpTexts] PromptLoader patchado');
            }
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 6: GerenciadorAI - Substituir DEFAULT_MODEL hardcoded
    // ------------------------------------------------------------------------
    if (modulePath.includes('GerenciadorAI') || modulePath.includes('adaptadores/ai/GerenciadorAI')) {
        const resolvedPath = Module._resolveFilename(id, this);
        const originalCode = fs.readFileSync(resolvedPath, 'utf8');

        // Substituir: const DEFAULT_MODEL = "gemini-2.5-flash-lite";
        // Por: const DEFAULT_MODEL = process.env.AI_MODEL || "gemini-2.5-flash-lite";
        const patchedCode = originalCode.replace(
            /const DEFAULT_MODEL = "gemini[^"]*";/,
            'const DEFAULT_MODEL = process.env.AI_MODEL || "gemini-2.5-flash-lite";'
        );

        if (originalCode !== patchedCode) {
            const mod = new Module(resolvedPath, this);
            mod.filename = resolvedPath;
            mod.paths = Module._nodeModulePaths(resolvedPath);

            const script = new vm.Script(patchedCode, { filename: resolvedPath });
            script.runInNewContext({
                module: mod,
                exports: mod.exports,
                require: mod.require.bind(mod),
                __filename: resolvedPath,
                __dirname: require('path').dirname(resolvedPath),
                process,
                Buffer,
                console,
                global
            });

            this.exports = mod.exports;
            console.log('[Overrides/AIModel] GerenciadorAI patchado com AI_MODEL=', process.env.AI_MODEL || 'gemini-2.5-flash-lite');
            require.cache[resolvedPath] = mod;
            return mod.exports;
        }
    }

    // ------------------------------------------------------------------------
    // PATCH 7: ProcessadorAudioAI - Remover timestamps SRT da transcrição
    // ------------------------------------------------------------------------
    if (modulePath.includes('ProcessadorAudioAI')) {
        if (!module.__patchedByOverrides) {
            const originalClass = module.default || module;

            // Patchar o método processarAudio
            if (originalClass.prototype && originalClass.prototype.processarAudio) {
                const originalProcessarAudio = originalClass.prototype.processarAudio;

                originalClass.prototype.processarAudio = async function(audioData, audioId, config) {
                    const resultado = await originalProcessarAudio.call(this, audioData, audioId, config);

                    // Remover timestamps SRT/VTT pós-processamento
                    if (resultado.sucesso && resultado.dados) {
                        resultado.dados = resultado.dados
                            .replace(/\d{2}:\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}\.\d{3}/g, '')
                            .replace(/\n{3,}/g, '\n\n')
                            .trim();
                    }

                    return resultado;
                };

                module.__patchedByOverrides = true;
                console.log('[Overrides/Audio] ProcessadorAudioAI patchado (timestamps removidos)');
            }
        }
    }


    return module;
};

// ============================================================================
// PATCH ADICIONAL PARA REGISTROCOMANDOS
// ============================================================================

const patchRegistroComandos = () => {
    const RegistroComandosPath = path.join(__dirname, '../src/adaptadores/whatsapp/comandos/RegistroComandos');

    try {
        delete require.cache[require.resolve(RegistroComandosPath)];
        const RegistroComandos = require(RegistroComandosPath);

        if (RegistroComandos && !RegistroComandos.__patchedByOverrides) {
            const originalCriar = RegistroComandos;

            const patchedCriar = function(dependencias) {
                const registro = originalCriar(dependencias);

                if (registro.executarComando && !registro.__executarComandoPatched) {
                    const originalExecutar = registro.executarComando;

                    registro.executarComando = async function(nomeComando, mensagem, args, chatId) {
                        const resultado = await originalExecutar.call(this, nomeComando, mensagem, args, chatId);

                        // Substituir prefixo nas mensagens de erro
                        if (resultado && !resultado.sucesso && resultado.erro && resultado.erro.message) {
                            resultado.erro.message = substituirPrefixos(resultado.erro.message);
                        }

                        return resultado;
                    };

                    registro.__executarComandoPatched = true;
                }

                return registro;
            };

            Object.defineProperty(patchedCriar, 'name', { value: originalCriar.name });
            patchedCriar.__patchedByOverrides = true;

            require.cache[require.resolve(RegistroComandosPath)].exports = patchedCriar;

            console.log('[Overrides/HelpTexts] RegistroComandos patchado');
        }
    } catch (erro) {
        // Módulo pode não existir ainda
    }
};

patchRegistroComandos();

// ============================================================================
// EXPORTAR UTILITÁRIOS
// ============================================================================

module.exports = {
    getPrefixo: () => COMMAND_PREFIX,
    getTimezone: () => TIMEZONE,
    substituirPrefixos
};

console.log('[Overrides] Sistema de overrides carregado.');
