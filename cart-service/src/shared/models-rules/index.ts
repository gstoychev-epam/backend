import { AppRequest } from '../models';

const mockedUserId = 'f6dbd6cc-3238-40cc-994b-8938c105a108';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: AppRequest): string {
  return mockedUserId || (request.user && request.user.id);
}
