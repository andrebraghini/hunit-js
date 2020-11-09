import { Address } from './address';

/**
 * Dados do hóspede
 */
export interface Guest {
  /** Primeiro nome do hóspede. */
  firstName?: string;

  /** Último nome do hóspede */
  lastName?: string;

  /** Email do hóspede */
  email?: string;

  /** Tipo do documento que consta em DocumentNumber */
  documentType?: 'CPF' | 'Passport' | string;

  /**
   * Número do documento relativo a DocumentType.
   * Muitos portais não enviam para a HSystem qualquer documento, logo, não se deve usar ele como chave.
   */
  documentNumber?: string;
  
  /** Documento de identificação do hóspede (legado) */
  document?: string;

  /** Telefone do hóspede */
  phone?: string;

  /**
   * Container para as informações de endereço. Muitos portais não pedem
   * esta informação aos clientes, logo as informação virão em branco.
   */
  address?: Address;
}
