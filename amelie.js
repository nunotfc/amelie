/**
 * Amélie - Assistente Virtual de IA para WhatsApp
 *
 * Arquivo principal que inicializa e integra os módulos do sistema.
 * Esta versão utiliza a arquitetura hexagonal para melhor organização.
 *
 * @author Belle Utsch
 * @version 2.0.0
 * @license MIT
 */

// Carregar overrides ANTES do código original
// Os overrides permitem customizar o bot sem modificar o código fonte,
// facilitando atualizações futuras do upstream sem conflitos.
require('./overrides');

// Iniciar a aplicação importando o ponto de entrada
require('./src/index');