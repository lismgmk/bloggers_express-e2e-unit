export interface IHandlerError {
  errorsMessages: ICurrentError[];
}
export interface ICurrentError {
  message: string;
  field: string;
}

export const errorResponse = (explanation: string, fieldError: string, handlerError: IHandlerError) => {
  const currentError: ICurrentError = {
    message: explanation,
    field: fieldError,
  };
  return handlerError.errorsMessages?.push(currentError);
};
