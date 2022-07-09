import { ValidationError } from 'express-validator';

export const errorFormatter = ({ msg, param }: ValidationError) => {
  return {
    message: msg,
    field: param,
  };
};
