/**
 * Elemento que define a estrutura de período
 */
export interface DateRange {
  /** Data de inicio no formato YYYY-MM-DD */
  from?: Date;

  /** Data de fim no formato YYYY-MM-DD */
  to?: Date;

  /** Sunday */
  sun?: boolean;

  /** Monday */
  mon?: boolean;

  /** Tuesday */
  tue?: boolean;

  /** Wednesday */
  wed?: boolean;

  /** Thursday */
  thu?: boolean;

  /** Friday */
  fri?: boolean;

  /** Saturday */
  sat?: boolean;
}
  