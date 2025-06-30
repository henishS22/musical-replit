import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfterOrEqual(
  comparisonField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfterOrEqual',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `Date must me be equal or greater than ${comparisonField}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { object } = args;
          const comparisonDate = new Date(object[comparisonField]);
          return new Date(value) >= comparisonDate;
        },
      },
    });
  };
}
