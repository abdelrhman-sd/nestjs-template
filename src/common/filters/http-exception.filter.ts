import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ValidationError } from "class-validator";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as Record<string, any>;
    const isValidationError = exception instanceof UnprocessableEntityException;

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({
        success: false,
        status,
        error: {
          message: isValidationError
            ? exceptionResponse.message          // "validation failed"
            : exceptionResponse.error ?? exceptionResponse.message,

          ...(isValidationError && {
            details: exceptionResponse.errors
          }),
        },
      });
  }
  static groupValidationErrors(errors: ValidationError[]): UnprocessableEntityException {
    const grouped = HttpExceptionFilter.flattenErrors(errors);
    return new UnprocessableEntityException({
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      message: "validation failed",
      errors: grouped,
    });
  }

  private static flattenErrors(
    errors: ValidationError[],
    parentPath = ""
  ): Record<string, string[]> {
    return errors.reduce<Record<string, string[]>>((acc, error) => {
      const path = parentPath ? `${parentPath}.${error.property}` : error.property;

      if (error.constraints) {
        acc[path] = Object.values(error.constraints);
      }

      if (error.children?.length) {
        Object.assign(acc, HttpExceptionFilter.flattenErrors(error.children, path));
      }

      return acc;
    }, {});
  }
}
