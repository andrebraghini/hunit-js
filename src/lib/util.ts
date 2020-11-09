/**
 * Retorna uma nova instância do objeto de referência com os dados passados no segundo parâmetro.
 * Se não passar nenhuma propriedade no segundo parâmetro, então retorna todas.
 * @param obj Objeto original de referência
 * @param propList Lista de propriedades clonadas (opcional)
 */
export function clone(obj: any, propList?: string[]) {
  let copy;
  // Handle the 3 simple types, and null or undefined
  if (null == obj || 'object' !== typeof obj) {
    return obj;
  }
  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }
  // Handle Object
  if (obj instanceof Object) {
    copy = {};
    for (const attr in obj) {
      if (propList && propList.indexOf(attr) < 0) {
        continue;
      }
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy;
  }
  throw new Error('Unable to copy obj! Its type isn\'t supported.');
}

/**
 * Garante o retorno do dado em um array se não estiver
 * @param data 
 */
export function transformToArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  return [data];
}

/**
 * Preencher com zeros a esquerda
 * @param value Valor de entrada
 * @param length Número de caracteres desejado na string de saída
 */
export function pad(value: string | number, length: number): string {
  const resto = length - String(value).length;
  return '0'.repeat(resto > 0 ? resto : 0) + value;
}

/**
 * Transformar data em string
 * @param date Data de input
 * @param format Formato da data de input
 */
export function dateToStr(date?: Date, format: string = 'DD/MM/YYYY'): string {
  if (!date) { return '' };
  
  const yyyy = pad(date.getUTCFullYear(), 4);
  const yy = yyyy.substr(-2);
  const mm = pad(date.getUTCMonth() + 1, 2);
  const dd = pad(date.getUTCDate(), 2);
  const hh = pad(date.getUTCHours(), 2);
  const nn = pad(date.getUTCMinutes(), 2);
  const ss = pad(date.getUTCSeconds(), 2);
  const zzz = pad(date.getUTCMilliseconds(), 3);

  return format
    .toUpperCase()
    .replace('YYYY', yyyy)
    .replace('YY', yy)
    .replace('MM', mm)
    .replace('DD', dd)
    .replace('HH', hh)
    .replace('MM', nn)
    .replace('NN', nn)
    .replace('SS', ss)
    .replace('ZZZ', zzz);
};

/**
 * Converter string dd/mm/yyyy para Date
 * @param dateString Data no formato dd/mm/yyyy
 */
export function strToDate(dateString: string): Date {
  const [date] = dateString.split(' ');
  const [day, month, fullYear] = date.split('/');

  let year = fullYear;
  if (year && year.length === 2) {
      const anoAtual = new Date().getUTCFullYear().toString();
      year = anoAtual.substring(0, 2) + year;
  }

  return new Date(`${year}-${month}-${day}Z`);
};

export function getXmlString(value: any): string {
  if (value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }

  if (value._text) {
    return getXmlString(value._text);
  }

  return '';
}

export function getXmlNumber(value: any): number | undefined {
  if (value === undefined) {
    return value;
  }

  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    return parseFloat(value.replace(',', '.'));
  }

  if (value._text) {
    return getXmlNumber(value._text);
  }

  return undefined;
}

export function getXmlBoolean(value: any): boolean {
  return getXmlString(value).trim().toLowerCase() === 'true';
}

export function cloneXmlStrings(obj: any, fields?: string[]) {
  if (!fields) {
    fields = Object.keys(obj);
  }

  const result: any = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = getXmlString(obj[key]);
    }
  }
  return result;
}

export function cloneXmlNumbers(obj: any, fields?: string[]) {
  if (!fields) {
    fields = Object.keys(obj);
  }
  
  const result: any = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = getXmlNumber(obj[key]);
    }
  }
  return result;
}

export function cloneXmlBooleans(obj: any, fields?: string[]) {
  if (!fields) {
    fields = Object.keys(obj);
  }
  
  const result: any = {};
  for (const key of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = getXmlBoolean(obj[key]);
    }
  }
  return result;
}
