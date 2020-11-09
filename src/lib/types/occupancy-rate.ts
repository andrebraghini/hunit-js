/**
 * Dados da taxa de ocupação diária
 */
export interface OccupancyRate {
  /** Data no formato YYYY-MM-DD */
  date?: Date;

  /** Taxa de ocupação diária */
  occupancy?: number;
}
