import { Portal } from '../types';
import { cloneXmlStrings, getXmlBoolean, transformToArray } from '../util';

function parsePortal(portal: any): Portal {
  const result: Portal = {
    ...cloneXmlStrings(portal._attributes),
    isActive: getXmlBoolean(portal._attributes.isActive),
    isChildPortal: getXmlBoolean(portal._attributes.isChildPortal)
  };

  return result;
}

export function xmlToPortal(xml: any): Portal[] {
  if (!xml.portalRS.portal) {
    return [];
  }

  const portalXMLList = transformToArray(xml.portalRS.portal);
  return portalXMLList.map(parsePortal);
}