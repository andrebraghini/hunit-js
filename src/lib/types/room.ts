import { Addon } from './addon';
import { DailyRate } from './daily-rate';
import { Guest } from './guest';

/**
 * Dados do quarto da reserva
 */
export interface Room {
  /** Identificador único do quarto no portal de origem da reserva */
  id?: string;

  /** Identificador único do quarto dentro do banco de dados da HSystem */
  roomLocatorId?: string;

  /** Código de identificação do tipo do apto no HUnit (Mapeado) */
  roomTypeId?: string;

  /** Determina o status de um quarto da estadia */
  status?: 'active' | 'cancel' | string;

  /** Data de entrada do apto no formato DD/MM/YYYY */
  arrivalDate?: Date;

  /** Data de saída do apto no formato DD/MM/YYYY */
  departureDate?: Date;

  /** Número de adultos do apto */
  adults?: number;

  /** Número de crianças do apto */
  children?: number;

  ageChildren?: { ageChild?: number };

  /** Valor total do apto */
  totalValue?: number;

  /**
   * Tipo de pensão:
   * 0 = Sem pensão
   * 1 = Breakfast
   * 2 = Lunch
   * 3 = Dinner
   * 4 = HalfBoard
   * 5 = FullBoard
   * 6 = AllInclusive
   */
  mealPlan?: '0' | '1' | '2' | '3' | '4' | '5' | '6' | string;

  /** Observações do apto */
  remark?: string;

  /** Elemento container para os itens extras/adicionais */
  addons?: Addon[];

  /** Valores individuais das diárias do apto */
  dailyRates?: DailyRate[];

  /** Dados do hóspede */
  guest?: Guest;
}
