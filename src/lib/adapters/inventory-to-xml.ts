import { InventoryUpdate } from '../types';
import { clone } from '../util';
import { dateToStr } from '../util';

function getDaysOfWeek(value) {
  const result = clone(value, ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
  const hasDayTrue = Object.keys(result).filter(day => result[day] === true).length;
  
  for (const day of ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']) {
    if (result[day] === undefined) {
      result[day] = hasDayTrue ? false : true;
    }
  }

  return {
    sun: result.sun,
    mon: result.mon,
    tue: result.tue,
    wed: result.wed,
    thu: result.thu,
    fri: result.fri,
    sat: result.sat
  };
}

export function inventoryToXml(inventoryUpdates: InventoryUpdate[]) {
  return inventoryUpdates.map(updateItem => ({
    ...clone(updateItem, ['roomTypeId',  'availability',  'stopSell',  'portalId']),
    dateRange: {
      _attributes: {
        from: dateToStr(updateItem.dateRange?.from, 'YYYY-MM-DD'),
        to: dateToStr(updateItem.dateRange?.to, 'YYYY-MM-DD'),
        ...getDaysOfWeek(updateItem.dateRange)
      },
    }
  }));
}
