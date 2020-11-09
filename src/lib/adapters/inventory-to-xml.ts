import { InventoryUpdate } from '../types';
import { clone } from '../util';
import { dateToStr } from '../util';

export function inventoryToXml(inventoryUpdates: InventoryUpdate[]) {
  return inventoryUpdates.map(updateItem => {
    const result = clone(updateItem, ['roomTypeId',  'availability',  'stopSell',  'portalId']);
    result.dateRange = {
      _attributes: clone(updateItem.dateRange, ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
    };
    result.dataRange._attributes.from = dateToStr(updateItem.dateRange?.from, 'YYYY-MM-DD');
    result.dataRange._attributes.to = dateToStr(updateItem.dateRange?.to, 'YYYY-MM-DD');
    return result;
  });
}
