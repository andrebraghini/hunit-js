import axios from 'axios';
import { HUnitClient } from './hunit-client';
import { Credentials, Reservation } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('axios');

/**
 * Get XML file as string from the test folder
 * @param filename XML file name
 */
function getXmlTestFile(filename): string {
  const path = join('src', '__tests__', 'mock-response', filename);
  return readFileSync(path, { encoding: 'utf8' });
}

describe('HUnitClient', () => {
  let hunit: HUnitClient;
  const defaultCredentials: Credentials = {
    hotelId: '984',
    userName: 'user984',
    password: 'user984.password',
  };
  const axiosMock = {
    post: jest.fn()
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (axios.create as jest.Mock).mockReturnValue(axiosMock);
    hunit = new HUnitClient(defaultCredentials);
  });

  describe('constructor()', () => {
    it('should be created', () => {
      expect(hunit).toBeDefined();
    });
    it('deve configurar URL correta para a API do HUnit', () => {
      expect((axios.create as jest.Mock).mock.calls[0][0].baseURL).toBe('https://services.hunit.com.br/api/');
    });
  });

  describe('portalRead()', () => {
    it('deve retornar lista de portais', () => {
      // Setup
      const data = { data: getXmlTestFile('portal-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<portalRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '</portalRQ>';

      // Execute
      return hunit.portalRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('portal/read');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result).toMatchObject([
          { id: '1', name: 'Expedia', isActive: true },
          { id: '2', name: 'Booking.com', isActive: true },
          { id: '3', name: 'Hotels.com', isActive: true, isChildPortal: true, masterPortalId: '1', masterPortal: 'Expedia' },
          { id: '4', name: 'Venere', isActive: true, isChildPortal: true, masterPortalId: '1', masterPortal: 'Expedia' },
          { id: '5', name: 'HBOOK', isActive: true },
          { id: '6', name: 'Orbitz', isActive: false },
          { id: '7', name: 'Decolar', isActive: true }
        ]);
      });
    });
  });

  describe('availabilityUpdate()', () => {
    it('deve enviar atualização de disponilidade', () => {
      // Setup
      const data = { data: getXmlTestFile('update-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const updates = [
        {
          roomTypeId: '12',
          availability: 0,
          dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') }
        },
        {
          roomTypeId: '12',
          availability: 2,
          dateRange: { from: new Date('2021-01-01'), to: new Date('2021-01-31'), fri: true, sat: true }
        },
        {
          roomTypeId: '222',
          dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31') },
          stopSell: true
        },
        {
          roomTypeId: '15',
          dateRange: { from: new Date('2021-12-25'), to: new Date('2021-12-31'), sun: false, sat: false },
          stopSell: false
        }
      ];
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<updateRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '<updates>' +
          '<update>' +
            '<roomTypeId>12</roomTypeId>' +
            '<availability>0</availability>' +
            '<dateRange from="2021-12-25" to="2021-12-31" sun="true" mon="true" tue="true" wed="true" thu="true" fri="true" sat="true"/>' +
          '</update>' +
          '<update>' +
            '<roomTypeId>12</roomTypeId>' +
            '<availability>2</availability>' +
            '<dateRange from="2021-01-01" to="2021-01-31" sun="false" mon="false" tue="false" wed="false" thu="false" fri="true" sat="true"/>' +
          '</update>' +
          '<update>' +
            '<roomTypeId>222</roomTypeId>' +
            '<stopSell>true</stopSell>' +
            '<dateRange from="2021-12-25" to="2021-12-31" sun="true" mon="true" tue="true" wed="true" thu="true" fri="true" sat="true"/>' +
          '</update>' +
          '<update>' +
            '<roomTypeId>15</roomTypeId>' +
            '<stopSell>false</stopSell>' +
            '<dateRange from="2021-12-25" to="2021-12-31" sun="false" mon="true" tue="true" wed="true" thu="true" fri="true" sat="false"/>' +
          '</update>' +
        '</updates>' +
        '</updateRQ>';

      // Execute
      return hunit.availabilityUpdate(updates).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('availability/update');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result).toBe(true);
      });
    });
  });

  describe('bookingRead()', () => {
    it('deve retornar lista de reservas pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<reservationRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '</reservationRQ>';

      // Execute
      return hunit.bookingRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('booking/read');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result.length).toBe(1);
        const reservation: Reservation = result[0];
        expect(reservation.hotelId).toBe('123');
        expect(reservation.portalId).toBe('1');
        expect(reservation.id).toBe('2222');
        expect(reservation.status).toBe('new');
        expect(reservation.createDateTime?.getTime()).toBe(new Date('2011-12-30T23:39:00Z').getTime());
        expect(reservation.paymentType).toBe('1');
        expect(reservation.remark).toBe('Comentários adicionais');
        expect(reservation.currencyCode).toBe('BRL');
        expect(reservation.locatorId).toBe('5689');
        expect(reservation.totalValue).toBe(350);
        expect(reservation.collectType).toBe('HotelCollect');

        // Dados do hóspede
        expect(reservation.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          documentType: 'CPF',
          documentNumber: '22687496532',
          email: 'ar@host.com',
          phone: '1141267898'
        });

        // Dados de pagamento
        expect(reservation.payment).toMatchObject({
          cardType: 'VISA',
          cardNumber: '000055565456444',
          cardHolderName: 'Franco Roberto',
          seriesCode: '123',
          expireDate: '12/2015',
          prePaymentValue: 95.50,
          prePaymentCharged: true,
          authorizationCode: '34cx5632xxgr2111',
        });

        // Dados dos quartos
        const room = (reservation.rooms?.length && reservation.rooms[0]) || {};
        expect(reservation.rooms?.length).toBe(1);
        expect(room.id).toBe('1');
        expect(room.roomLocatorId).toBe('265992');
        expect(room.roomTypeId).toBe('222');
        expect(room.status).toBe('active');
        expect(room.arrivalDate?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(room.departureDate?.getTime()).toBe(new Date('2016-10-24Z').getTime());
        expect(room.adults).toBe(2);
        expect(room.children).toBe(1);
        expect(room.ageChildren?.ageChild).toBe(3);
        expect(room.totalValue).toBe(300);
        expect(room.remark).toBe('Comentários adicionais');
        expect(room.mealPlan).toBe('1');
        // Addons
        const addon = (room.addons && room.addons[0]) || {};
        expect(room.addons?.length).toBe(1);
        expect(addon.name).toBe('Decoração especial no quarto');
        expect(addon.totalValue).toBe(50);
        // Daily rates
        const firstDailyRate = (room.dailyRates && room.dailyRates[0]) || {};
        const secondDailyRate = (room.dailyRates && room.dailyRates[1]) || {};
        expect(room.dailyRates?.length).toBe(2);
        expect(firstDailyRate.date?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(firstDailyRate.totalValue).toBe(130);
        expect(secondDailyRate.date?.getTime()).toBe(new Date('2016-10-23Z').getTime());
        expect(secondDailyRate.totalValue).toBe(120);
        // Guest date
        expect(room.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          email: 'ar@host.com'
        });
      });
    });
  });

  describe('confirmePost()', () => {
    it('deve enviar confirmação de recebimento de reserva', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-confirme-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const confirmations = [
        { reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
        { reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
        { reservationId: '98', pmsReservationIdentifier: 'my_id_78' }
      ];
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<reservationConfirmeRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '<confirmations>' +
          '<confirmation>' +
            '<reservationId>12</reservationId>' +
            '<pmsReservationIdentifier>my_id_1</pmsReservationIdentifier>' +
          '</confirmation>' +
          '<confirmation>' +
            '<reservationId>52</reservationId>' +
            '<pmsReservationIdentifier>my_id_2</pmsReservationIdentifier>' +
          '</confirmation>' +
          '<confirmation>' +
            '<reservationId>98</reservationId>' +
            '<pmsReservationIdentifier>my_id_78</pmsReservationIdentifier>' +
          '</confirmation>' +
        '</confirmations>' +
        '</reservationConfirmeRQ>';

      // Execute
      return hunit.confirmePost(confirmations).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('confirme/post');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result).toBe(true);
      });
    });
  });

  describe('packageRead()', () => {
    it('deve retornar lista de pacotes de processamento pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('package-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<packageRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '</packageRQ>';

      // Execute
      return hunit.packageRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('package/read');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result.length).toBe(2);
        const firstPackage = result[0] || {};
        const secondPackage = result[1] || {};
        expect(firstPackage.id).toBe('1');
        expect(firstPackage.portalId).toBe('1');
        expect(firstPackage.portalName).toBe('Booking.com');
        expect(firstPackage.createDateTime?.getTime()).toBe(new Date('2011-12-30T23:39:00Z').getTime());
        expect(firstPackage.status).toBe('3');
        expect(firstPackage.attemptsSending).toBe('1');
        expect(secondPackage.id).toBe('2');
        expect(secondPackage.portalId).toBe('1');
        expect(secondPackage.portalName).toBe('Booking.com');
        expect(secondPackage.createDateTime?.getTime()).toBe(new Date('2011-12-30T23:39:00Z').getTime());
        expect(secondPackage.status).toBe('1');
        expect(secondPackage.attemptsSending).toBe('1');
      });
    });
  });

  describe('roomRateRead()', () => {
    it('deve retornar lista de tipos de quartos e tarifas', () => {
      // Setup
      const data = { data: getXmlTestFile('room-rate-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<roomRateRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '</roomRateRQ>';

      // Execute
      return hunit.roomRateRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('roomrate/read');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result.length).toBe(8);
        expect(result[0].id).toBe('2445');
        expect(result[0].name).toBe('SILVER DUPLO CASAL');
        expect(result[0].isActive).toBe(true);
        expect(result[0].isChildRoomRate).toBe(false);
        expect(result[1].id).toBe('2446');
        expect(result[1].name).toBe('SILVER SINGLE CASAL');
        expect(result[1].isActive).toBe(true);
        expect(result[1].isChildRoomRate).toBe(true);
        expect(result[1].masterRoomRateId).toBe('2445');
        expect(result[1].MasterRoomRate).toBe('SILVER DUPLO CASAL');
        expect(result[2].id).toBe('2447');
        expect(result[2].name).toBe('SILVER DUPLO SOLTEIRO');
        expect(result[2].isActive).toBe(true);
        expect(result[2].isChildRoomRate).toBe(false);
        expect(result[3].id).toBe('2448');
        expect(result[3].name).toBe('SILVER SINGLE SOLTEIRO');
        expect(result[3].isActive).toBe(true);
        expect(result[3].isChildRoomRate).toBe(true);
        expect(result[3].masterRoomRateId).toBe('2447');
        expect(result[3].MasterRoomRate).toBe('SILVER DUPLO SOLTEIRO');
        expect(result[4].id).toBe('2449');
        expect(result[4].name).toBe('GOLD DUPLO CASAL');
        expect(result[4].isActive).toBe(true);
        expect(result[4].isChildRoomRate).toBe(false);
        expect(result[5].id).toBe('2450');
        expect(result[5].name).toBe('GOLD SINGLE CASAL');
        expect(result[5].isActive).toBe(true);
        expect(result[5].isChildRoomRate).toBe(true);
        expect(result[5].masterRoomRateId).toBe('2449');
        expect(result[5].MasterRoomRate).toBe('GOLD DUPLO CASAL');
        expect(result[6].id).toBe('2451');
        expect(result[6].name).toBe('GOLD DUPLO SOLTEIRO');
        expect(result[6].isActive).toBe(true);
        expect(result[6].isChildRoomRate).toBe(false);
        expect(result[7].id).toBe('2452');
        expect(result[7].name).toBe('GOLD SINGLE SOLTEIRO');
        expect(result[7].isActive).toBe(true);
        expect(result[7].isChildRoomRate).toBe(true);
        expect(result[7].masterRoomRateId).toBe('2451');
        expect(result[7].MasterRoomRate).toBe('GOLD DUPLO SOLTEIRO');
      });
    });
  });

  describe('bookingByIdRead()', () => {
    it('deve retornar lista de reservas pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-by-id-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<reservationByIdRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '<locatorId>5689</locatorId>' +
        '</reservationByIdRQ>';

      // Execute
      return hunit.bookingByIdRead({ locatorId: '5689' }).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('bookingbyid/read');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        if (!result) {
          fail('Deveria retornar os dados da reserva');
          return;
        }
        expect(result.hotelId).toBe('123');
        expect(result.portalId).toBe('1');
        expect(result.id).toBe('2222');
        expect(result.status).toBe('new');
        expect(result.createDateTime?.getTime()).toBe(new Date('2011-12-30T23:39:00Z').getTime());
        expect(result.paymentType).toBe('1');
        expect(result.remark).toBe('Comentários adicionais');
        expect(result.currencyCode).toBe('BRL');
        expect(result.locatorId).toBe('5689');
        expect(result.totalValue).toBe(350);
        expect(result.collectType).toBe('HotelCollect');

        // Dados do hóspede
        expect(result.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          documentType: 'CPF',
          documentNumber: '22687496532',
          email: 'ar@host.com',
          phone: '1141267898'
        });

        // Dados de pagamento
        expect(result.payment).toMatchObject({
          cardType: 'VISA',
          cardNumber: '000055565456444',
          cardHolderName: 'Franco Roberto',
          seriesCode: '123',
          expireDate: '12/2015',
          prePaymentValue: 95.50,
          prePaymentCharged: true,
          authorizationCode: '34cx5632xxgr2111',
        });

        // Dados dos quartos
        const room = (result.rooms?.length && result.rooms[0]) || {};
        expect(result.rooms?.length).toBe(1);
        expect(room.id).toBe('1');
        expect(room.roomLocatorId).toBe('265992');
        expect(room.roomTypeId).toBe('222');
        expect(room.status).toBe('active');
        expect(room.arrivalDate?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(room.departureDate?.getTime()).toBe(new Date('2016-10-24Z').getTime());
        expect(room.adults).toBe(2);
        expect(room.children).toBe(1);
        expect(room.ageChildren?.ageChild).toBe(3);
        expect(room.totalValue).toBe(300);
        expect(room.remark).toBe('Comentários adicionais');
        expect(room.mealPlan).toBe('1');
        // Addons
        const addon = (room.addons && room.addons[0]) || {};
        expect(room.addons?.length).toBe(1);
        expect(addon.name).toBe('Decoração especial no quarto');
        expect(addon.totalValue).toBe(50);
        // Daily rates
        const firstDailyRate = (room.dailyRates && room.dailyRates[0]) || {};
        const secondDailyRate = (room.dailyRates && room.dailyRates[1]) || {};
        expect(room.dailyRates?.length).toBe(2);
        expect(firstDailyRate.date?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(firstDailyRate.totalValue).toBe(130);
        expect(secondDailyRate.date?.getTime()).toBe(new Date('2016-10-23Z').getTime());
        expect(secondDailyRate.totalValue).toBe(120);
        // Guest date
        expect(room.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          email: 'ar@host.com'
        });
      });
    });
  });
  
  describe('bookingReadOneCall()', () => {
    it('deve retornar lista de reservas pendentes para vários hotéis', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-rs-one-call.xml') };
      axiosMock.post.mockResolvedValue(data);
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<reservationRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '</reservationRQ>';

      // Execute
      return hunit.bookingReadOneCall().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('booking/readonecall');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result.length).toBe(2);
        const firstReservation: Reservation = result[0];
        expect(firstReservation.hotelId).toBe('123');
        expect(firstReservation.portalId).toBe('1');
        expect(firstReservation.id).toBe('2222');
        expect(firstReservation.status).toBe('new');
        expect(firstReservation.createDateTime?.getTime()).toBe(new Date('2015-12-01T23:39:00Z').getTime());
        expect(firstReservation.paymentType).toBe('1');
        expect(firstReservation.remark).toBe('Comentários');
        expect(firstReservation.currencyCode).toBe('BRL');
        expect(firstReservation.locatorId).toBe('5689');
        expect(firstReservation.totalValue).toBe(350.5);
        expect(firstReservation.collectType).toBe('CanalCollect');

        // Dados do hóspede
        expect(firstReservation.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          documentType: 'CPF',
          documentNumber: '22687496532',
          email: 'ar@host.com',
          phone: '1141267898'
        });

        // Dados de pagamento
        expect(firstReservation.payment).toMatchObject({
          cardType: 'VISA',
          prePaymentValue: 95.50,
          prePaymentCharged: true,
          authorizationCode: '34cx5632xxgr2111'
        });

        // Dados dos quartos
        const room = (firstReservation.rooms?.length && firstReservation.rooms[0]) || {};
        expect(firstReservation.rooms?.length).toBe(1);
        expect(room.id).toBe('1');
        expect(room.roomLocatorId).toBe('235469');
        expect(room.roomTypeId).toBe('222');
        expect(room.status).toBe('active');
        expect(room.arrivalDate?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(room.departureDate?.getTime()).toBe(new Date('2016-10-24Z').getTime());
        expect(room.adults).toBe(2);
        expect(room.children).toBe(1);
        expect(room.ageChildren?.ageChild).toBe(3);
        expect(room.totalValue).toBe(300.5);
        expect(room.remark).toBe('Comentários');
        expect(room.mealPlan).toBe('1');
        // Addons
        const addon = (room.addons && room.addons[0]) || {};
        expect(room.addons?.length).toBe(1);
        expect(addon.name).toBe('Decoração especial no quarto');
        expect(addon.totalValue).toBe(50);
        // Daily rates
        const firstDailyRate = (room.dailyRates && room.dailyRates[0]) || {};
        const secondDailyRate = (room.dailyRates && room.dailyRates[1]) || {};
        expect(room.dailyRates?.length).toBe(2);
        expect(firstDailyRate.date?.getTime()).toBe(new Date('2016-10-22Z').getTime());
        expect(firstDailyRate.totalValue).toBe(130);
        expect(secondDailyRate.date?.getTime()).toBe(new Date('2016-10-23Z').getTime());
        expect(secondDailyRate.totalValue).toBe(120);
        // Guest date
        expect(room.guest).toMatchObject({
          firstName: 'Volnei Hartaman',
          lastName: 'Silva',
          email: 'volnei@gmail.com'
        });

        // Segunda reserva
        const secondReservation: Reservation = result[1];
        expect(secondReservation.hotelId).toBe('555');
        expect(secondReservation.portalId).toBe('20');
        expect(secondReservation.id).toBe('965985555');
        expect(secondReservation.status).toBe('new');
        expect(secondReservation.createDateTime?.getTime()).toBe(new Date('2011-12-30T23:39:00Z').getTime());
        expect(secondReservation.paymentType).toBe('1');
        expect(secondReservation.remark).toBe('Comentários');
        expect(secondReservation.currencyCode).toBe('BRL');
        expect(secondReservation.locatorId).toBe('5690');
        expect(secondReservation.totalValue).toBe(350);
        expect(secondReservation.collectType).toBe('CanalCollect');

        // Dados do hóspede
        expect(secondReservation.guest).toMatchObject({
          firstName: 'Antonio Rodrigues',
          lastName: 'Antonio Rodrigues',
          documentType: 'Passport',
          documentNumber: '22687496532',
          email: 'ar@host.com',
          phone: '1141267898'
        });

        // Dados de pagamento
        expect(secondReservation.payment).toMatchObject({
          cardType: 'MASTERCARD',
          numberOfInstallments: 2,
          installmentValue: 150,
          prePaymentCharged: true,
          authorizationCode: '34cx5632xxgr2111'
        });

        // Dados dos quartos
        const secondRoom = (secondReservation.rooms?.length && secondReservation.rooms[0]) || {};
        expect(secondReservation.rooms?.length).toBe(1);
        expect(secondRoom.id).toBe('1');
        expect(secondRoom.roomLocatorId).toBe('236478');
        expect(secondRoom.roomTypeId).toBe('333');
        expect(secondRoom.status).toBe('active');
        expect(secondRoom.arrivalDate?.getTime()).toBe(new Date('2016-08-27Z').getTime());
        expect(secondRoom.departureDate?.getTime()).toBe(new Date('2016-08-30Z').getTime());
        expect(secondRoom.adults).toBe(2);
        expect(secondRoom.children).toBe(1);
        expect(secondRoom.totalValue).toBe(850);
        expect(secondRoom.remark).toBe('Comentários');
        expect(secondRoom.mealPlan).toBe('1');
        // Daily rates
        const firstDailyRate2 = (secondRoom.dailyRates && secondRoom.dailyRates[0]) || {};
        const secondDailyRate2 = (secondRoom.dailyRates && secondRoom.dailyRates[1]) || {};
        const thirdDailyRate2 = (secondRoom.dailyRates && secondRoom.dailyRates[2]) || {};
        expect(secondRoom.dailyRates?.length).toBe(3);
        expect(firstDailyRate2.date?.getTime()).toBe(new Date('2016-08-27Z').getTime());
        expect(firstDailyRate2.totalValue).toBe(250);
        expect(secondDailyRate2.date?.getTime()).toBe(new Date('2016-08-28Z').getTime());
        expect(secondDailyRate2.totalValue).toBe(250);
        expect(thirdDailyRate2.date?.getTime()).toBe(new Date('2016-08-29Z').getTime());
        expect(thirdDailyRate2.totalValue).toBe(350);
        // Guest date
        expect(secondRoom.guest).toMatchObject({
          firstName: 'Volnei Hartaman',
          lastName: 'Silva',
          email: 'volnei@gmail.com'
        });
      });
    });
  });

  describe('bookingConfirmationOneCall()', () => {
    it('deve enviar confirmação de recebimento de reserva para vários hotéis', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-confirme-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const confirmations = [
        { hotelId: '486', reservationId: '12', pmsReservationIdentifier: 'my_id_1' },
        { hotelId: '486', reservationId: '52', pmsReservationIdentifier: 'my_id_2' },
        { hotelId: '654', reservationId: '98', pmsReservationIdentifier: 'my_id_78' }
      ];
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<reservationConfirmeRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<confirmations>' +
          '<confirmation>' +
            '<hotelId>486</hotelId>' +
            '<reservationId>12</reservationId>' +
            '<pmsReservationIdentifier>my_id_1</pmsReservationIdentifier>' +
          '</confirmation>' +
          '<confirmation>' +
            '<hotelId>486</hotelId>' +
            '<reservationId>52</reservationId>' +
            '<pmsReservationIdentifier>my_id_2</pmsReservationIdentifier>' +
          '</confirmation>' +
          '<confirmation>' +
            '<hotelId>654</hotelId>' +
            '<reservationId>98</reservationId>' +
            '<pmsReservationIdentifier>my_id_78</pmsReservationIdentifier>' +
          '</confirmation>' +
        '</confirmations>' +
        '</reservationConfirmeRQ>';

      // Execute
      return hunit.bookingConfirmationOneCall(confirmations).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('booking/confirmationonecall');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result).toBe(true);
      });
    });
  });

  describe('occupancyRateUpdate()', () => {
    it('deve enviar atualização da taxa de ocupação diária', () => {
      // Setup
      const data = { data: getXmlTestFile('occupancy-rate-rs.xml') };
      axiosMock.post.mockResolvedValue(data);
      const updates = [
        { date: new Date('2020-01-01'), occupancy: 15 },
        { date: new Date('2020-01-02'), occupancy: 21 },
        { date: new Date('2020-01-03'), occupancy: 13 }
      ];
      const expectedRequest = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<occupancyRateRQ>' +
        '<userName>user984</userName>' +
        '<password>user984.password</password>' +
        '<hotelId>984</hotelId>' +
        '<updates>' +
          '<update date="2020-01-01" occupancy="15"/>' +
          '<update date="2020-01-02" occupancy="21"/>' +
          '<update date="2020-01-03" occupancy="13"/>' +
        '</updates>' +
        '</occupancyRateRQ>';

      // Execute
      return hunit.occupancyRateUpdate(updates).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('occupancyrate/update');
        expect(axiosMock.post.mock.calls[0][1]).toBe(expectedRequest);
        expect(result).toBe(true);
      });
    });
  });

});
