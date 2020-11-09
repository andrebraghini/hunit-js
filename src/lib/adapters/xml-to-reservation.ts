import { Reservation, Room } from '../types';
import {
  getXmlString,
  strToDate,
  transformToArray,
  cloneXmlStrings,
  cloneXmlNumbers,
  getXmlNumber,
  getXmlBoolean,
} from '../util';

function parseRoom(room: any): Room {
  const result: Room = {
    ...cloneXmlStrings(room, ['id', 'roomLocatorId', 'roomTypeId', 'status', 'remark', 'mealPlan']),
    ...cloneXmlNumbers(room, ['adults', 'children', 'totalValue']),
  };

  /** Data de chegada */
  if (room.arrivalDate) {
    result.arrivalDate = strToDate(getXmlString(room.arrivalDate));
  }
  /** Data de partida */
  if (room.departureDate) {
    result.departureDate = strToDate(getXmlString(room.departureDate));
  }

  if (room.ageChildren && room.ageChildren.ageChild) {
    result.ageChildren = { ageChild: getXmlNumber(room.ageChildren.ageChild) };
  }

  if (room.addons && room.addons.addon) {
    const addonList = transformToArray(room.addons.addon);
    result.addons = addonList.map((addon) => ({
      name: getXmlString(addon.name),
      totalValue: getXmlNumber(addon.totalValue),
    }));
  }

  if (room.dailyRates && room.dailyRates.dailyRate) {
    const dailyRateList = transformToArray(room.dailyRates.dailyRate);
    result.dailyRates = dailyRateList.map((rate) => ({
      date: strToDate(getXmlString(rate.date)),
      totalValue: getXmlNumber(rate.totalValue),
    }));
  }

  if (room.guest) {
    result.guest = cloneXmlStrings(room.guest);
  }

  return result;
}

function parseReservation(reservation: any): Reservation {
  const result: Reservation = {
    ...cloneXmlStrings(reservation, [
      'hotelId',
      'portalId',
      'id',
      'status',
      'paymentType',
      'remark',
      'currencyCode',
      'locatorId',
      'collectType',
    ]),
    ...cloneXmlNumbers(reservation, ['totalValue']),
    ...(reservation.guest && { guest: cloneXmlStrings(reservation.guest) }),
  };

  // Data de criação
  if (reservation.createDateTime) {
    result.createDateTime = new Date(getXmlString(reservation.createDateTime));
  }
  // Data de cancelamento
  if (reservation.cancellationDateTime) {
    result.cancellationDateTime = new Date(getXmlString(reservation.cancellationDateTime));
  }

  if (reservation.rooms && reservation.rooms.room) {
    const roomXMLList = transformToArray(reservation.rooms.room);
    result.rooms = roomXMLList.map(parseRoom);
  }

  // Dados do hóspede principal da reserva
  if (reservation.guest) {
    result.guest = {
      ...cloneXmlStrings(reservation.guest, [
        'firstName',
        'lastName',
        'email',
        'documentType',
        'documentNumber',
        'document',
        'phone',
      ]),
      ...(reservation.guest.address && { address: cloneXmlStrings(reservation.guest.address) }),
    };
  }

  // Dados do pagamento
  if (reservation.payment) {
    result.payment = {
      ...cloneXmlStrings(reservation.payment, [
        'cardType',
        'cardNumber',
        'cardHolderName',
        'seriesCode',
        'expireDate',
        'authorizationCode',
      ]),
      ...cloneXmlNumbers(reservation.payment, ['prePaymentValue', 'numberOfInstallments', 'installmentValue']),
      ...(reservation.payment.prePaymentCharged && {
        prePaymentCharged: getXmlBoolean(reservation.payment.prePaymentCharged),
      }),
    };
  }

  return result;
}

export function xmlToReservation(xml: any, rootTag: string = 'reservationRS'): Reservation[] {
  if (!xml[rootTag].reservation) {
    return [];
  }
  const reservationXMLList = transformToArray(xml[rootTag].reservation);
  return reservationXMLList.map(parseReservation);
}

export function xmlOneCallToReservation(xml: any): Reservation[] {
  const result: Reservation[] = [];

  const list = transformToArray(xml.ArrayOfTReservationRS.TReservationRS);
  list.forEach((item) => {
    if (item.reservation) {
      const reservationXMLList = transformToArray(item.reservation);
      result.push(...reservationXMLList.map(parseReservation));
    }
  });

  return result;
}
