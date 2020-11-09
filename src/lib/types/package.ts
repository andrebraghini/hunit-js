/**
 * Elemento que representa um pacote de processamento
 */
export interface Package {
  /** Identificar único para o pacote dentro do HUNIT */
  id?: string;

  /** Id do portal do pacote */
  portalId?: string;

  /** Nome do portal do pacote */
  portalName?: string;

  /** Data em que o pacote foi recebido no HUNIT */
  createDateTime?: Date;

  /**
   * Status de processamento para o pacote.
   * Possíveis valores: 1 = Pendente, 3 = Com erro no processamento
   */
  status?: '1' | '3' | string;

  /** Número de tentativas ao portal para o pacote */
  attemptsSending?: string;
}
