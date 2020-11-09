/**
 * Dados do endereço
 */
export interface Address {
  /** Logradouro */
  street?: string;

  /** CEP */
  zipcode?: string;

  /** Nome da Cidade */
  city?: string;

  /** Nome do País */
  country?: string;
}
