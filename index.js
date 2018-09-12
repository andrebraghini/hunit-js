const HUnitClient = require('./hunit.client');

/**
 * Retorna cliente de comunicação com HUnit
 * @param {number} id - Código de identificação do estabelecimento no HUnit
 * @param {string} user - Usuário de autenticação para comunicação
 * @param {string} password - Senha de autenticação para comunicação
 * @returns {HUnitClient} Classe cliente de comunicação com o HUnit
 */
exports.newClient = function(id, user, password) {
    return new HUnitClient({id: id, user: user, password: password});
}

/**
 * Retorna lista de OTAs com os quais o HUnit é integrado.
 * Também traz uma flag indicando se a integração está ativa para o estabelecimento solicitado.
 * @param {Object} opt - Credenciais de comunicação
 * @param {number} opt.id - Código de identificação do estabelecimento no HUnit
 * @param {string} opt.user - Usuário de autenticação  para comunicação
 * @param {string} opt.password - Senha de autenticação para comunicação
 * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
 */
exports.getOTAs = function(opt) {
    return new HUnitClient(opt).getOTAs();
}

/**
 * Retorna lista de reservas novas, alteradas ou canceladas. (Reservas não sincronizadas)
 * @param {Object} opt - Credenciais de comunicação
 * @param {number} opt.id - Código de identificação do estabelecimento no HUnit
 * @param {string} opt.user - Usuário de autenticação  para comunicação
 * @param {string} opt.password - Senha de autenticação para comunicação
 * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
 */
exports.getReservations = function(opt) {
    return new HUnitClient(opt).getReservations();
}

/**
 * Retorna reserva especificada pelo código de identificação.
 * @param {number} id - Código de identificação da reserva no HUnit
 * @param {Object} opt - Credenciais de comunicação
 * @param {number} opt.id - Código de identificação do estabelecimento no HUnit
 * @param {string} opt.user - Usuário de autenticação  para comunicação
 * @param {string} opt.password - Senha de autenticação para comunicação
 * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
 */
exports.getReservation = function(id, opt) {
    return new HUnitClient(opt).getReservation(id);
}

/**
 * Confirma recebimento de reserva no HUnit. As reservas confirmadas por este método
 * não serão mais retornadas no método de consulta da lista de reservas.
 * @param {number[]} ids - Array com códigos das reservas confirmadas
 * @param {Object} opt - Credenciais de comunicação
 * @param {number} opt.id - Código de identificação do estabelecimento no HUnit
 * @param {string} opt.user - Usuário de autenticação  para comunicação
 * @param {string} opt.password - Senha de autenticação para comunicação
 * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
 */
exports.confirmReservations = function(ids, opt) {
    return new HUnitClient(opt).confirmReservations(ids);
}

/**
 * Atualiza inventário (Disponibilidade de tipos de aptos) no HUnit.
 * @param {Object[]} updates - Lista de atualizações de inventário para tipos de apto
 * @param {string} updates[].id - Código do tipo do apto no PMS (Seu sistema, não no HUnit)
 * @param {number} updates[].qtd - Quantidade de apartamentos disponíveis no período para o tipo informado
 * @param {Date} updates[].from - Data de início da solicitação de alteração
 * @param {Date} updates[].to - Data de fim da solicitação de alteração (incluída na alteração)
 * @param {Object} updates[].days - Dias da semana para aplicar a disponibilidade (Se não passar vai aplicar para todos)
 * @param {boolean} updates[].days.sun - Domingo
 * @param {boolean} updates[].days.mon - Segunda-feira
 * @param {boolean} updates[].days.tue - Terça-feira
 * @param {boolean} updates[].days.wed - Quarta-feira
 * @param {boolean} updates[].days.thu - Quinta-feira
 * @param {boolean} updates[].days.fri - Sexta-feira
 * @param {boolean} updates[].days.sat - Sábado
 * @param {Object} opt - Credenciais de comunicação
 * @param {number} opt.id - Código de identificação do estabelecimento no HUnit
 * @param {string} opt.user - Usuário de autenticação  para comunicação
 * @param {string} opt.password - Senha de autenticação para comunicação
 * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
 */
exports.updateInventory = function(updates, opt) {
    return new HUnitClient(opt).updateInventory(updates);
}
