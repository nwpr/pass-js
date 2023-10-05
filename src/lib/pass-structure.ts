/* eslint-disable max-depth */
/**
 * Class that implements base structure fields setters / getters
 *
 * @see {@link https://developer.apple.com/library/content/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/LowerLevel.html#//apple_ref/doc/uid/TP40012026-CH3-SW3}
 */

import { PASS_STYLES, STRUCTURE_FIELDS, TRANSIT } from '../constants.js';
import {
  ApplePass,
  BoardingPass,
  NFCDictionary,
  PassCommonStructure,
  PassStyle,
  TransitType,
} from '../interfaces.js';

import { FieldsMap } from './fieldsMap.js';
import { NFCField } from './nfc-fields.js';

export class PassStructure {
  [key: string]: unknown;
  protected fields: Partial<ApplePass> = {};

  constructor(fields: Partial<ApplePass> = {}) {
    // setting style first
    for (const style of PASS_STYLES) {
      if (style in fields) {
        this.style = style;
        if ('boardingPass' in fields && fields.boardingPass) {
          this.transitType = (fields.boardingPass as BoardingPass)
            .transitType as TransitType;
        } else if ('storeCard' in this.fields && 'nfc' in fields) {
          // check NFC fields
          this.fields.nfc = new NFCField(fields.nfc as NFCDictionary);
        }
        const structure: PassCommonStructure = fields[
          this.style
        ] as PassCommonStructure;
        for (const prop of STRUCTURE_FIELDS) {
          if (prop in structure) {
            const currentProperty = structure[prop];
            if (Array.isArray(currentProperty))
              for (const field of currentProperty)
                (this[prop] as FieldsMap).add(field);
            else if (currentProperty instanceof FieldsMap)
              // copy fields
              for (const [key, data] of currentProperty)
                (this[prop] as FieldsMap).add({ key, ...data });
          }
        }
      }
    }
  }

  /**
   * Pass type, e.g boardingPass, coupon, etc
   */
  get style(): PassStyle | undefined {
    for (const style of PASS_STYLES) {
      if (style in this.fields) return style;
    }
    return undefined;
  }

  /**
   * Required for boarding passes; otherwise not allowed.
   * Type of transit.
   * Must be one of the following values: PKTransitTypeAir, PKTransitTypeBoat, PKTransitTypeBus, PKTransitTypeGeneric,PKTransitTypeTrain.
   */
  get transitType(): TransitType | undefined {
    if (this.style !== 'boardingPass')
      throw new ReferenceError(
        `transitType field only allowed in Boarding Passes, current pass is ${this.style}`,
      );
    if ('boardingPass' in this.fields && this.fields.boardingPass)
      return (this.fields.boardingPass as BoardingPass).transitType as
        | TransitType
        | undefined;
    return undefined;
  }

  /**
   * NFC-enabled pass keys support sending reward card information as part of an Apple Pay transaction.
   *
   * NFC-enabled pass keys are only supported in passes that contain an Enhanced Passbook/NFC certificate.
   * For more information, contact merchant support at https://developer.apple.com/contact/passkit/.
   * **Only for storeCards with special Apple approval**
   *
   * @see {@link https://developer.apple.com/library/archive/documentation/UserExperience/Reference/PassKit_Bundle/Chapters/TopLevel.html#//apple_ref/doc/uid/TP40012026-CH2-DontLinkElementID_3}
   */
  get nfc(): NFCField {
    if (!('storeCard' in this.fields))
      throw new ReferenceError(
        `NFC fields only available for storeCard passes, current is ${this.style}`,
      );
    return this.fields.nfc as NFCField;
  }

  get headerFields(): FieldsMap {
    const { style } = this;
    if (!style)
      throw new ReferenceError(
        `Pass style is undefined, set the pass style before accessing pass structure fields`,
      );
    const styleFields: PassCommonStructure = this.fields[
      style
    ] as PassCommonStructure;
    if (!(styleFields.headerFields instanceof FieldsMap))
      styleFields.headerFields = new FieldsMap();
    return styleFields.headerFields;
  }
  get auxiliaryFields(): FieldsMap {
    const { style } = this;
    if (!style)
      throw new ReferenceError(
        `Pass style is undefined, set the pass style before accessing pass structure fields`,
      );
    const styleFields: PassCommonStructure = this.fields[
      style
    ] as PassCommonStructure;
    if (!(styleFields.auxiliaryFields instanceof FieldsMap))
      styleFields.auxiliaryFields = new FieldsMap();
    return styleFields.auxiliaryFields;
  }
  get backFields(): FieldsMap {
    const { style } = this;
    if (!style)
      throw new ReferenceError(
        `Pass style is undefined, set the pass style before accessing pass structure fields`,
      );
    const styleFields: PassCommonStructure = this.fields[
      style
    ] as PassCommonStructure;
    if (!(styleFields.backFields instanceof FieldsMap))
      styleFields.backFields = new FieldsMap();
    return styleFields.backFields;
  }
  get primaryFields(): FieldsMap {
    const { style } = this;
    if (!style)
      throw new ReferenceError(
        `Pass style is undefined, set the pass style before accessing pass structure fields`,
      );
    const styleFields: PassCommonStructure = this.fields[
      style
    ] as PassCommonStructure;
    if (!(styleFields.primaryFields instanceof FieldsMap))
      styleFields.primaryFields = new FieldsMap();
    return styleFields.primaryFields;
  }
  get secondaryFields(): FieldsMap {
    const { style } = this;
    if (!style)
      throw new ReferenceError(
        `Pass style is undefined, set the pass style before accessing pass structure fields`,
      );
    const styleFields: PassCommonStructure = this.fields[
      style
    ] as PassCommonStructure;
    if (!(styleFields.secondaryFields instanceof FieldsMap))
      styleFields.secondaryFields = new FieldsMap();
    return styleFields.secondaryFields;
  }

  set style(v: PassStyle | undefined) {
    // remove all other styles
    for (const style of PASS_STYLES) if (style !== v) delete this.fields[style];
    if (!v) return;
    if (!PASS_STYLES.has(v)) throw new TypeError(`Invalid Pass type "${v}"`);
    if (!(v in this.fields)) this.fields[v] = {};
    // Add NFC fields
    if ('storeCard' in this.fields) this.fields.nfc = new NFCField();
    //   if ('boardingPass' in this.fields && this.fields.boardingPass) this.fields.boardingPass.
  }

  set transitType(v: TransitType | undefined) {
    const { style } = this;
    if (!style) {
      // removing transitType on empty pass does nothing
      if (!v) return;
      // setting transitStyle on a pass without type will set this pass as boardingPass also
      this.style = 'boardingPass';
    }
    if (!('boardingPass' in this.fields))
      throw new ReferenceError(
        `transitType field is only allowed at boarding passes`,
      );

    if (!v) {
      if (this.fields.boardingPass)
        delete (this.fields.boardingPass as BoardingPass).transitType;
    } else {
      if (Object.values(TRANSIT).includes(v)) {
        if (this.fields.boardingPass)
          (this.fields.boardingPass as BoardingPass).transitType = v;
        else this.fields.boardingPass = { transitType: v };
      } else throw new TypeError(`Unknown transit type "${v}"`);
    }
  }
}
