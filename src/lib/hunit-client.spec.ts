import axios from 'axios';
import { HUnitClient } from './hunit-client';
import { Credentials, Reservation } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';

jest.mock('axios');

function getXmlTestFile(filename) {
  const path = join('src', '__tests__', 'mock-response', filename);
  return readFileSync(path, { encoding: 'utf8' });
}

describe('HUnitClient', () => {
  let hunit: HUnitClient;
  const defaultCredentials: Credentials = {
    hotelId: process.env.TEST_HOTEL_ID,
    userName: process.env.TEST_HOTEL_USERNAME,
    password: process.env.TEST_HOTEL_PASSWORD,
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

      // Execute
      return hunit.portalRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('portal/read');
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

  // TODO: Implementar testes do método availabilityUpdate()

  describe('bookingRead()', () => {
    it('deve retornar lista de reservas pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-rs.xml') };
      axiosMock.post.mockResolvedValue(data);

      // Execute
      return hunit.bookingRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('booking/read');
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

  // TODO: Implementar testes do método confirmePost()

  describe('packageRead()', () => {
    it('deve retornar lista de pacotes de processamento pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('package-rs.xml') };
      axiosMock.post.mockResolvedValue(data);

      // Execute
      return hunit.packageRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('package/read');
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

      // Execute
      return hunit.roomRateRead().then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('roomrate/read');
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

  // TODO: Implementar testes do método bookingByIdRead()
  describe('bookingByIdRead()', () => {
    it('deve retornar lista de reservas pendentes', () => {
      // Setup
      const data = { data: getXmlTestFile('reservation-by-id-rs.xml') };
      axiosMock.post.mockResolvedValue(data);

      // Execute
      return hunit.bookingByIdRead({ locatorId: '5689' }).then(result => {
        // Validate
        expect(axiosMock.post.mock.calls.length).toBe(1);
        expect(axiosMock.post.mock.calls[0][0]).toBe('bookingbyid/read');
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
  
  // TODO: Implementar testes do método bookingReadOneCall()
  // TODO: Implementar testes do método bookingConfirmationOneCall()
  // TODO: Implementar testes do método occupancyRateUpdate()

});
