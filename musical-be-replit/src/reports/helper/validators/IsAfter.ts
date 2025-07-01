import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsAfter(
  comparisonField: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAfter',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `Date must me be greater than ${comparisonField}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const { object } = args;
          const comparisonDate = new Date(object[comparisonField]);
          return new Date(value) > comparisonDate;
        },
      },
    });
  };
}
