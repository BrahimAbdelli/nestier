import { ObjectId } from 'mongodb';
import { ValidateObjectIdPipe } from '../validate-object-id.pipe';

describe('ValidateObjectIdPipe', () => {
  let pipe: ValidateObjectIdPipe;
  const validObjectId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    pipe = new ValidateObjectIdPipe('Entity');
  });

  describe('transform', () => {
    it('should convert valid hex string to ObjectId instance', () => {
      const result: ObjectId = pipe.transform({ id: validObjectId });

      expect(result).toBeInstanceOf(ObjectId);
      expect(result.toString()).toBe(validObjectId);
    });

    it('should accept both uppercase and lowercase hex characters', () => {
      const uppercase: ObjectId = pipe.transform({ id: '507F1F77BCF86CD799439011' });
      const lowercase: ObjectId = pipe.transform({ id: validObjectId });

      expect(uppercase).toBeInstanceOf(ObjectId);
      expect(lowercase).toBeInstanceOf(ObjectId);
    });

    it('should reject missing params object', () => {
      expect(() => pipe.transform(null)).toThrow();
      expect(() => pipe.transform(undefined)).toThrow();
    });

    it('should reject missing id property', () => {
      expect(() => pipe.transform({})).toThrow();
      expect(() => pipe.transform({ id: null })).toThrow();
      expect(() => pipe.transform({ id: undefined })).toThrow();
    });

    it('should reject invalid ObjectId formats', () => {
      expect(() => pipe.transform({ id: '' })).toThrow();
      expect(() => pipe.transform({ id: 'not-valid' })).toThrow();
      expect(() => pipe.transform({ id: '123' })).toThrow();
      expect(() => pipe.transform({ id: '507f1f77bcf86cd79943901g' })).toThrow();
    });

    it('should use entity name from constructor', () => {
      const customPipe: ValidateObjectIdPipe = new ValidateObjectIdPipe('CustomEntity');
      expect(() => customPipe.transform({ id: 'invalid' })).toThrow();
    });
  });
});


