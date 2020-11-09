/**
 * Dados da tarifa diária
 */
export interface DailyRate {
  /** Data no formato DD/MM/YYYY */
  date?: Date;

  /** Valor da tarifa diária */
  totalValue?: number;
}
