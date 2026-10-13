import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.describe(exception);
    response.status(status).json({ message });
  }

  private describe(exception: unknown): { status: number; message: string } {
    if (exception instanceof HttpException) {
      return { status: exception.getStatus(), message: this.extractMessage(exception) };
    }
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === UNIQUE_CONSTRAINT_VIOLATION
    ) {
      return { status: HttpStatus.CONFLICT, message: 'Registro já cadastrado.' };
    }
    this.logger.error(exception);
    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Erro interno do servidor.' };
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) {
      return message.join(' ');
    }
    return typeof message === 'string' && message.length > 0 ? message : exception.message;
  }
}
