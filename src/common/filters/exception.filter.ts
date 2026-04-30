import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        errorCode = (res as any).code || (res as any).error || 'ERROR';
        message = (res as any).message || message;
        
        // Handle class-validator errors
        if (Array.isArray((res as any).message)) {
          errorCode = 'VALIDATION_ERROR';
          message = (res as any).message[0];
        }
      } else {
        message = res as string;
      }
    } else {
        console.error(exception);
    }

    response.status(status).json({
      success: false,
      error: {
        code: errorCode.toString().toUpperCase().replace(/ /g, '_'),
        message: message,
      },
    });
  }
}
