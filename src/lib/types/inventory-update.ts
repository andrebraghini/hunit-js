import { DateRange } from './date-range';

/**
 * Dados de atualização de inventário
 */
export interface InventoryUpdate {
  /** Código do tipo de quarto que será atualizado */
  roomTypeId?: string;

  /** Quantidade de quartos disponíveis para venda */
  availability?: number;

  /** Elemento que define a estrutura de período */
  dateRange?: DateRange;

  /** Define se o quarto está aberto ou fechado para a venda */
  stopSell?: boolean;

  /**
   * Quando definido a atualização será processada apenas para o portal em questão.
   * (este elemento não tem efeito para a informação do elemento availability).
   */
  portalId?: string;
}
