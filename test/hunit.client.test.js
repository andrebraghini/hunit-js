const assert = require('assert')
const HUnitClient = require('../hunit.client')

const defaultOptions = {
    // Código de identificação de um hotel/pousada válido no HUnit
    id: process.env.HOTEL_ID || 123,
    // Usuário de autenticação de um hotel/pousada válido no HUnit
    user: process.env.HOTEL_USER || 'abc',
    // Senha de autenticação de um hotel/pousada válido no HUnit
    password: process.env.HOTEL_PASSWORD || 'abc123'
}
// Código de identificação de uma reserva no HUnit para o mesmo hotel válido
const defaultReservaId = process.env.VALID_LOCATOR_ID || 90
// Código de identificação de uma reserva válida no HUnit, porém para outro hotel (Na dúvida utilizar 90)
const reservaIdDeOutro = process.env.ANOTHER_LOCATOR_ID || 90
// Código de identificação de um tipo de apto válido
const tipoAptoId = process.env.APTO_ID || 1

describe('HUnitClient', () => {

    describe('#getXMLDate(date)', () => {
        it('deve retornar a data no formato yyyy-mm-dd', () => {
            const hunit = new HUnitClient()
            const date = new Date(2020, 11, 31)
            assert.equal(hunit.getXMLDate(date), '2020-12-31', 'Formato da data incorreto')
        })
    })

    describe('#montarXML(tag, content)', () => {
        it('deve retornar o xml montado com o conteúdo especificado e com as credenciais definidas na criação do objeto', () => {
            const tagName = 'TesteRQ'
            const content = '<conteudo />'
            let xmlExpected = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
            xmlExpected += `<${tagName}><hotelId>${defaultOptions.id}</hotelId>`
            xmlExpected += `<userName>${defaultOptions.user}</userName>`
            xmlExpected += `<password>${defaultOptions.password}</password>`
            xmlExpected += content
            xmlExpected += `</${tagName}>`

            const hunit = new HUnitClient(defaultOptions)
            assert.equal(hunit.montarXML(tagName, content), xmlExpected, 'Modelo de XML montado incorretamente')
        })
    })

    describe('#getOTAs()', () => {
        it('deve retornar lista de OTAs utilizadas pelo HUnit', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.getOTAs()

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            // Localizar uma das OTAS da lista pela string
            assert.notEqual(response.data.indexOf('EXPEDIA'), -1, 'EXPEDIA não encontrado no retorno')
            assert.equal(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })

        it('deve retornar erro se utilizar uma autenticação inválida', async () => {
            const hunit = new HUnitClient({id: 1, user: 'abc', password: 'abc123'})
            const response = await hunit.getOTAs()

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.equal(response.data.indexOf('<success'), -1, 'Retornou sucesso incorretamente')
            assert.notEqual(response.data.indexOf('<errors'), -1, 'Não retornou o erro')
        })
    })

    describe('#getReservations()', () => {
        it('deve retornar lista de reservas não sincronizadas', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.getReservations()

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.notEqual(response.data.indexOf('<success'), -1, 'Não encontrou a tag "success" na resposta')
            assert.equal(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })
    })

    describe('#getReservation(id)', () => {
        it('deve retornar uma reserva específica pelo código de identificação', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.getReservation(defaultReservaId)

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.notEqual(response.data.indexOf('<success'), -1, 'Não encontrou a tag "success" na resposta')
            assert.equal(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })

        it('deve retornar erro se passar o código de uma reserva de outro hotel', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.getReservation(reservaIdDeOutro)

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.equal(response.data.indexOf('<success'), -1, 'Retornou sucesso incorretamente')
            assert.notEqual(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })

        it('deve retornar erro se passar um código inexistente', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.getReservation(1)

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.equal(response.data.indexOf('<success'), -1, 'Retornou sucesso incorretamente')
            assert.notEqual(response.data.indexOf('<errors'), -1, 'Não retornou o erro')
        })
    })

    describe('#confirmReservations(ids)', () => {
        it('deve retornar erro se passar código de uma reserva de outro hotel', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.confirmReservations([reservaIdDeOutro])

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.equal(response.data.indexOf('<success'), -1, 'Retornou sucesso incorretamente')
            assert.notEqual(response.data.indexOf('<errors'), -1, 'Não retornou o erro')
        })

        it('deve retornar sucesso se o código da reserva existir', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const response = await hunit.confirmReservations([defaultReservaId])

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.notEqual(response.data.indexOf('<success'), -1, 'Não encontrou a tag "success" na resposta')
            assert.equal(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })
    })

    describe('#updateInventory(updates)', () => {
        it('deve retornar sucesso ao enviar uma atualização de inventário/disponibilidade válida', async () => {
            const hunit = new HUnitClient(defaultOptions)
            const inventario = [
                {id: tipoAptoId, qtd: 0, from: new Date(), to: new Date()}
            ]
            const response = await hunit.updateInventory(inventario)

            assert.equal(response.statusCode, 200, 'Código de resposta HTTP incorreto')
            assert.notEqual(response.data.indexOf('<success'), -1, 'Não encontrou a tag "success" na resposta')
            assert.equal(response.data.indexOf('<errors'), -1, 'Retornou um erro')
        })
    })

})