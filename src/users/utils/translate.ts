import { DEFAULT_LANGUAGE } from './constants';

export const translate = (object, lang) =>
  object.map((x: { toObject: () => unknown }) => {
    const object = x.toObject() as unknown as {
      title: { [key: string]: string };
      instrument: { [key: string]: string };
    };
    return {
      ...object,
      title:
        object.title[lang] == null
          ? object.title[DEFAULT_LANGUAGE]
          : object.title[lang],
      instrument: object.instrument
        ? object.instrument[lang] == null
          ? object.instrument[DEFAULT_LANGUAGE]
          : object.instrument[lang]
        : null,
    };
  });
