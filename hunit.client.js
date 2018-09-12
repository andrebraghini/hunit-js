'use strict';

const https = require('https');

class HUnitClient {

    constructor(opt) {
        if (opt.id) this.hotelId = opt.id;
        if (opt.user) this.user = opt.user;
        if (opt.password) this.password = opt.password;
    }

    /**
     * Retorna string da data no formato usado pelo HUnit
     * @param {Date} date - Data para ser transformada no formato usado nos XMLs
     * @returns {string} Data em string no formato yyyy-mm-dd
     */
    getXMLDate(date) {
        let y = date.getFullYear().toString();
        let m = (date.getMonth() + 1).toString();
        let d = date.getDate().toString();

        if (m.length < 2) m = '0' + m;
        if (d.length < 2) d = '0' + d;
        
        return `${y}-${m}-${d}`;
    }

    /**
     * Retorna XML com credenciais de acesso já definidas
     * @param {string} tag - Nome da tag principal do XML
     * @param {string} content - Conteúdo XML que irá no corpo do mesmo
     * @returns {string} XML completo montado já com as credencias de acesso
     */
    montarXML(tag, content) {
        let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
        xml += `<${tag}>`;
        xml += `<hotelId>${this.hotelId}</hotelId>`;
        xml += `<userName>${this.user}</userName>`;
        xml += `<password>${this.password}</password>`;
        if (content) xml += content;
        xml += `</${tag}>`;
        return xml;
    }

    /**
     * Faz requisição POST para a URL solicitada e retorna uma string
     * @param {string} path - Endereço do método que será acrescentado à URL
     * @param {string} content - Conteúdo da requisição
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    doRequest(path, content) {
        let opt = {
            method: 'POST',
            hostname: 'extranet.hunit.com.br',
            port: 443,
            path: '/ENDPOINT-V6/api/' + path,
            headers: {
                'accept': 'application/xml',
                'content-type': 'application/xml',
                'cache-control': 'no-cache'
            }
        };
          
        return new Promise((resolve, reject) => {
            const req = https.request(opt, res => {
                res.setEncoding('utf8');
                res.on('data', data => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
                        return resolve({statusCode: res.statusCode, headers: res.headers, data: data});
                    reject({statusCode: res.statusCode, headers: res.headers, data: data});
                });
            });
            req.on('error', e => reject(e));
            req.write(content);
            req.end();
        });
    }

    /**
     * Retorna lista de OTAs com os quais o HUnit é integrado.
     * Também traz uma flag indicando se a integração está ativa para o estabelecimento solicitado.
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    getOTAs() {
        return this.doRequest('portal/Read', this.montarXML('portalRQ'));
    }

    /**
     * Retorna lista de reservas novas, alteradas ou canceladas. (Reservas não sincronizadas)
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    getReservations() {
        return this.doRequest('booking/Read', this.montarXML('reservationRQ'));
    }

    /**
     * Retorna reserva especificada pelo código de identificação.
     * @param {number} id - Código de identificação da reserva no HUnit
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    getReservation(id) {
        let xml = this.montarXML('reservationByIdRQ', `<locatorId>${id}</locatorId>`);
        return this.doRequest('BookingById/read', xml);
    }

    /**
     * Confirma recebimento de reserva no HUnit. As reservas confirmadas por este método
     * não serão mais retornadas no método de consulta da lista de reservas.
     * @param {number[]} ids - Array com códigos das reservas confirmadas
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    confirmReservations(ids) {
        let content = '';
        for (let i = 0; i < ids.length; i++) {
            content += `<confirmation><reservationId>${ids[i]}</reservationId></confirmation>`;
        }

        content = `<confirmations>${content}</confirmations>`;

        let xml = this.montarXML('reservationConfirmeRQ', content);
        return this.doRequest('Confirme/post', xml);
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
     * @returns {Promise<any>} Promise da requisição http que retorna em formato XML
     */
    updateInventory(updates) {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        let content = '';
        for (let i = 0; i < updates.length; i++) {
            let from = this.getXMLDate(updates[i].from);
            let to = this.getXMLDate(updates[i].to);
            if (!updates[i].days) updates[i].days = {sun: true, mon: true, tue: true, wed: true, thu: true, fri: true, sat: true};

            let daysStr = '';
            for (let j = 0; j < days.length; j++) {
                daysStr += days[j] + '="' + (updates[i].days[days[j]] ? 'true' : 'false') + '" ';
            }

            content += '<update>';
            content += `<roomTypeId>${updates[i].id}</roomTypeId>`;
            content += `<availability>${updates[i].qtd}</availability>`;
            content += `<dateRange from="${from}" to="${to}" ${daysStr}/>`;
            content += '</update>';
        }

        content = `<updates>${content}</updates>`;

        let xml = this.montarXML('updateRQ', `<tag>${content}</tag>`);
        return this.doRequest('Availability/Update', xml);
    }

}

exports.default = HUnitClient;
module.exports = exports['default'];
