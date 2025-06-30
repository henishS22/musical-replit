import { validate } from 'class-validator';

import 'reflect-metadata';
const remembers = Symbol('required');

export function Param(Class: any) {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const params = Reflect.getOwnMetadata(remembers, target, propertyKey) || [];
    params.push({ parameterIndex, Class });
    Reflect.defineMetadata(remembers, params, target, propertyKey);
  };
}

export function ValidateAll(
  target: any,
  propertyName: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  descriptor: TypedPropertyDescriptor<Function>,
) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const params = Reflect.getOwnMetadata(remembers, target, propertyName);
    if (params) {
      for (const param of params) {
        const value = args[param.parameterIndex];
        const ConstantClass = param.Class;

        const object = new ConstantClass();
        for (const entry of Object.entries(value)) {
          object[entry[0]] = entry[1];
        }

        const erros = await validate(object);
        if (erros.length > 0) {
          return;
        }
      }
    }

    return method.apply(this, args);
  };
}
