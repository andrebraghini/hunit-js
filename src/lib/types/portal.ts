/**
 * Dados do portal
 */
export interface Portal {
  /** Código que identifica o portal */
  id?: string;

  /** Nome do portal */
  name?: string;

  /** Se o portal em questão está ativo para o hotel */
  isActive?: boolean;

  /**
   * Se o portal é filho de outro portal. Um portal filho não tem extranet
   * própria, ele usa as informações de outro portal. Ex.: Expedia e Hotels.com.
   * Hotels.com usa os dados da Expedia. A ausência deste atributo significa que
   * o portal é master (não é filho de outro portal)
   */
  isChildPortal?: boolean;

  /**
   * Este atributo só irá aparecer para os portais aonde isChildPortal for ‘true’.
   * Identifica o id do portal Pai.
   */
  masterPortalId?: string;

  /**
   * Este atributo só irá aparecer para os portais aonde isChildPortal for ‘true’.
   * Identifica o nome do portal Pai.
   */
  masterPortal?: string;
}
