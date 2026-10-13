import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { MAX_ID, POSITIVE_INTEGER_TEXT } from './field-schemas';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);
    if (!POSITIVE_INTEGER_TEXT.test(value) || id > MAX_ID) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    return id;
  }
}
