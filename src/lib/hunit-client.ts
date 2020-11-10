import axios, { AxiosInstance } from 'axios';
import { js2xml, xml2js } from 'xml-js';
import { Credentials, InventoryUpdate, OccupancyRate, Package, Portal, Reservation, RoomRate } from './types';
import { clone, cloneXmlBooleans, cloneXmlStrings, dateToStr, transformToArray } from './util';
import { xmlOneCallToReservation, xmlToReservation } from './adapters/xml-to-reservation';
import { ReservationConfirm } from './types/reservation-confirm';
import { inventoryToXml } from './adapters/inventory-to-xml';
import { xmlToPortal } from './adapters/xml-to-portal';

interface BookingByIdSearch {
  locatorId?: string;
  portalId?: string;
  channelReservationId?: string;
}

export class HUnitClient {
  private api: AxiosInstance;

  constructor(public credentials: Credentials = {}) {
    this.api = axios.create({
      baseURL: 'https://services.hunit.com.br/api/',
      headers: {
        accept: 'application/xml',
        'content-type': 'application/xml',
        'cache-control': 'no-cache',
      },
    });
  }

  /**
   * Retorna objeto base do XML com credenciais definidas
   * @param rootTag Nome da tag principal do XML para inserir as credenciais
   * @param content Objeto que será transformado em XML
   */
  private getXMLBase(rootTag: string, content?: any, setHotelId: boolean = true): any {
    const xml: any = {
      _declaration: {
        _attributes: {
          version: '1.0',
          encoding: 'UTF-8',
          standalone: 'yes',
        },
      },
    };

    xml[rootTag] = {
      userName: this.credentials.userName,
      password: this.credentials.password,
      ...(setHotelId && { hotelId: this.credentials.hotelId }),
      ...content,
    };

    return xml;
  }

  /**
   * Lê a tag principal do XML procurando pela tag de erro.
   * Se encontrar a tag de erro gera uma exceção com o conteúdo dos erros.
   * @param xmlResponse XML de resposta já transformado em objeto
   */
  private errorHandler(xmlResponse: any) {
    const rootTag = Object.keys(xmlResponse).find((key) => key[0] !== '_');
    if (rootTag) {
      if (xmlResponse[rootTag].errors) {
        const errors = transformToArray(xmlResponse[rootTag].errors.error);
        throw errors;
      }
    }
    return xmlResponse;
  }

  /**
   * Faz requisição POST para a URL solicitada e retorna uma string
   * @param path Endereço do método que será acrescentado à URL
   * @param content Conteúdo da requisição
   */
  private doRequest(path: string, content: any): Promise<any> {
    const contentStr = typeof content === 'string' ? content : js2xml(content, { compact: true });
    return this.api
      .post(path, contentStr)
      .then((response) => xml2js(response.data, { compact: true }))
      .then(this.errorHandler);
  }

  /**
   * Lista de Portais
   */
  async portalRead(): Promise<Portal[]> {
    const xml = this.getXMLBase('portalRQ');
    const response = await this.doRequest('portal/read', xml);
    return xmlToPortal(response);
  }

  /**
   * Atualizar disponibilidade e tarifas
   * @param inventoryUpdates Lista de atualizações de inventário e tarifas para tipos de apto
   */
  async availabilityUpdate(inventoryUpdates: InventoryUpdate[]): Promise<boolean> {
    const update = inventoryToXml(inventoryUpdates);
    const updates = { update };
    const xml = this.getXMLBase('updateRQ', { updates });
    return this.doRequest('availability/update', xml).then((response) => !response.updateRS.errors);
  }

  /**
   * Busca de reservas
   */
  async bookingRead(): Promise<Reservation[]> {
    const xml = this.getXMLBase('reservationRQ');
    const response = await this.doRequest('booking/read', xml);
    return xmlToReservation(response);
  }

  /**
   * Confirmação de recebimento de reservas
   * @param confirmationList Códigos das reservas confirmadas sem o hotel_id
   */
  async confirmePost(confirmation: ReservationConfirm[]): Promise<any> {
    const confirmations = { confirmation };
    const xml = this.getXMLBase('reservationConfirmeRQ', { confirmations });
    return this.doRequest('confirme/post', xml).then((response) => !response.reservationConfirmeRS.errors);
  }

  /**
   * Pacotes de Processamento
   */
  async packageRead(): Promise<Package[]> {
    const xml = this.getXMLBase('packageRQ');
    const response = await this.doRequest('package/read', xml);

    if (!response.packageRS.package) {
      return [];
    }
    const packageXMLList = transformToArray(response.packageRS.package);
    return packageXMLList.map((packageItem) => ({
      ...clone(packageItem._attributes),
      ...(!!packageItem._attributes.createDateTime && {
        createDateTime: new Date(packageItem._attributes.createDateTime),
      }),
    }));
  }

  /**
   * Tipos de Quarto e Tarifa
   */
  async roomRateRead(): Promise<RoomRate[]> {
    const xml = this.getXMLBase('roomRateRQ');
    const response = await this.doRequest('roomrate/read', xml);

    const roomRateXMLList = transformToArray(response.roomRateRS.roomRate);
    return roomRateXMLList.map((roomRate) => ({
      ...cloneXmlStrings(roomRate._attributes, ['id', 'name', 'masterRoomRateId', 'MasterRoomRate']),
      ...cloneXmlBooleans(roomRate._attributes, ['isActive', 'isChildRoomRate']),
    }));
  }

  /**
   * Buscando uma reserva individualmente
   * @param id Código de identificação da reserva no HUnit (locatorId)
   *           ou pelo id do portal (portalId +  channelReservationId)
   */
  async bookingByIdRead(id: BookingByIdSearch): Promise<Reservation | void> {
    const xml = this.getXMLBase('reservationByIdRQ', id);
    const response = await this.doRequest('bookingbyid/read', xml);

    if (!response.reservationByIdRS.reservation) {
      return;
    }

    return xmlToReservation(response, 'reservationByIdRS')[0];
  }

  /**
   * Busca de reserva (OneCall)
   */
  async bookingReadOneCall(): Promise<Reservation[]> {
    const xml = this.getXMLBase('reservationRQ', undefined, false);
    const response = await this.doRequest('booking/readonecall', xml);
    return xmlOneCallToReservation(response);
  }

  /**
   * Confirmação de recebimento de reservas (OneCall)
   * @param confirmationList Códigos das reservas confirmadas com o hotel_id
   */
  async bookingConfirmationOneCall(confirmation: ReservationConfirm[]): Promise<boolean> {
    const confirmations = { confirmation };
    const xml = this.getXMLBase('reservationConfirmeRQ', { confirmations }, false);
    return this.doRequest('booking/confirmationonecall', xml).then(
      (response) => !response.reservationConfirmeRS.errors,
    );
  }

  /**
   * Atualizando a taxa de ocupação
   * @param occupancyRates Lista de taxa de ocupação diária
   */
  async occupancyRateUpdate(occupancyRates: OccupancyRate[]): Promise<boolean> {
    const updates = {
      update: occupancyRates.map((rate) => ({
        _attributes: {
          date: dateToStr(rate.date, 'YYYY-MM-DD'),
          occupancy: rate.occupancy,
        },
      })),
    };

    const xml = this.getXMLBase('occupancyRateRQ', { updates });
    return this.doRequest('occupancyrate/update', xml).then((response) => !response.occupancyRateRS.errors);
  }
}
