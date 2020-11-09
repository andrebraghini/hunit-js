/**
 * Dados do pagamento
 */
export interface Payment {
  /** Tipo da bandeira do cartão de crédito */
  cardType?: 'Visa' | 'MasterCard' | 'AmericanExpress' | 'DiscoveryCard' |
             'Maestro' | 'CarteBlanche' | 'DinersClub' | 'Discover' | 'Switch' |
             'CartaSi' | 'ELO' | 'Hiper' | 'Hipercard' | string;

  /** Número do cartão de crédito utilizado para a reserva */
  cardNumber?: string;
  
  /** Nome do titular do cartão de crédito utilizado para a reserva */
  cardHolderName?: string;

  /** Número de serie do cartão de crédito utilizado para a reserva */
  seriesCode?: string;
  
  /** Data de expiração do cartão de crédito utilizado para a reserva */
  expireDate?: string;

  /**
   * Valor devido de pré-pagamento para a reserva. Este valor é calculado de
   * acordo com a política de pré-pagamento das tarifas que compõem a reserva.
   * Só aparecerá no retorno caso prePaymentCharged = true.
   */
  prePaymentValue?: number;
  
  /** Número de parcelas para o caso da reserva ter sido parcelada */
  numberOfInstallments?: number

  /** Valor de cada parcela para o caso da reserva ter sido parcelada */
  installmentValue?: number;

  /**
   * Informa se já foi executada a cobrando do valor do pré-pagamento da
   * reserva. Valor definido no elemento prePaymentValue.
   */
  prePaymentCharged?: boolean;

  /**
   * Código de autorização gerado pela adquirente (CIELO, REDECARD, GetNET etc) no momento da cobrança
   */
  authorizationCode?: string;
}
