import { ObjectId } from "mongodb";

/**
 * To use in @Transform decorator to tranform property value
 * @param value ObjectId or entity Object to transform
 */
export function transformEntity({ value }): any {
  if (value?._id) value._id = new ObjectId(String(value._id));
  else if (value) value = new ObjectId(String(value)).toHexString();
  return value;
}
