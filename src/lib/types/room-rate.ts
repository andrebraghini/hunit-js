/**
 * Elemento que representa uma combinação de tipo de quarto e tarifa
 */
export interface RoomRate {
  /** Código que identifica o tipo de quarto */
  id?: string;

  /** Nome do tipo de quarto */
  name?: string;

  /** Se o tipo de quarto em questão está ativo ou inativo */
  isActive?: boolean;

  /**
   * Quando o tipo de quarto é dependente de outro este atributo será definido como true.
   * A ausência deste atributo significa que o portal é máster (não é filho de outro portal).
   */
  isChildRoomRate?: boolean;

  /**
   * Este atributo só irá aparecer para os roomRates aonde isChildRoomRate for ‘true’.
   * Identifica o id do tipo de quarto Pai.
   */
  masterRoomRateId?: string;

  /**
   * Este atributo só irá aparecer para os roomRates aonde isChildRoomRate for ‘true’.
   * Identifica o nome do tipo de quarto Pai.
   */
  MasterRoomRate?: string;
}
