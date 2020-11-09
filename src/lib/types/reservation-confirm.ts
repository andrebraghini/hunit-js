/**
 * Dados da confirmação de recebimento da reserva por parte do PMS
 */
export interface ReservationConfirm {
  /** Código de identificação do hotel */
  hotelId?: string;

  /** Código de identificação da reserva no HUnit */
  reservationId: string;

  /** Código de identificação da reserva no PMS */
  pmsReservationIdentifier?: string;
}
