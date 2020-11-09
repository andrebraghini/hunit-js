import { Room } from './room';
import { Guest } from './guest';
import { Payment } from './payment';

/**
 * Elemento que representa um reserva
 */
export interface Reservation {
  /** Código que identifica o hotel */
  hotelId?: string;

  /** Código que identifica o portal no HUnit */
  portalId?: string;

  /** Identificador da reserva no portal de origem */
  id?: string;

  /** Status da reserva */
  status?: 'new' | 'modify' | 'cancel' | string;

  /** Data e hora da criação da reserva no formato YYYY-MM-DDTHH:NN:SS */
  createDateTime?: Date;

  /**
   * Quando status = cancel aqui conterá a data e hora do cancelamento.
   * É importante observar que nem todos os canais enviam a data e hora do cancelamento.
   * Neste caso será retornado um valor padrão = 0001-01-01T00:00:00
   */
  cancellationDateTime?: Date;

  /**
   * Tipo de pagamento da reserva:
   * 1 = Cartão de crédito
   * 2 = Depósito
   * 3 = Pagamento direto no hotel
   * 4 = Faturado
   * 5 = Débito
   * 6 = Transferência bancária
   * 7 = Pré-pagamento (operadora pagará antecipado ao hotel)
   */
  paymentType?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | string;

  /** Comentários e pedidos adicionais para a reserva */
  remark?: string;

  /** Código da moeda. Sempre BRL. */
  currencyCode?: string;

  /**
   * Identificar único gerado pelo HUNIT para a reserva. As comunicações
   * posteriores para as reservas deverão ser feitas com o valor deste elemento.
   */
  locatorId?: string;

  /** Valor total da reserva */
  totalValue?: number;

  /** Valor total dos addons */
  totalAddOns?: number;

  /** Elemento container para os quartos da reserva */
  rooms?: Room[];

  /**
   * Elemento que representa o titular ou hospede principal da reserva.
   * OBSERVE que o elemento <room> tem um elemento <guest>. O
   * elemento <guest> dentro do <room> representa o nome do hóspede. Já o
   * elemento <guest> que fica alinhado ao elemento <reservation>
   * representa o titular da reserva.
   */
  guest?: Guest;

  /**
   * Elemento que representa os dados de pagamento.
   * Este elemento só aparecerá nos casos em que o conteúdo de paymentType = 1 (cartão de crédito).
   * Por questão de segurança não é retornado os dados completos do cartão de crédito.
   * Fale diretamente com a HSystem para mais informações.
   */
  payment?: Payment;

  /**
   * Indica quem coleta\cobra o pagamento do hospede, se o próprio hotel ou o canal.
   * Possíveis valores:
   * HotelCollect: o responsável por cobrar o hospede é o próprio hotel.
   * CanalCollect: o canal já cobrou a reserva do hospede.
   */
  collectType?: 'HotelCollect' | 'CanalCollect' | string;
}
