import { Response } from 'express';

export const API_PREFIX = 'api/v1';

export function setLocation(response: Response, resourcePath: string): void {
  response.setHeader('Location', `/${API_PREFIX}/${resourcePath}`);
}
