import { request as umiRequest } from '@umijs/max';

export async function request<T>(
  url: string,
  options: any = { method: 'GET' },
): Promise<T | undefined> {
  const nextOptions = {
    credentials: 'include',
    ...options,
  };
  if (!options['throwError']) {
    try {
      const resp: any = await umiRequest(url, nextOptions);
      return Object.prototype.hasOwnProperty.call(resp || {}, 'data') ? resp.data : resp;
    } catch (ex) {
      return undefined;
    }
  }
  const resp: any = await umiRequest(url, nextOptions);
  return Object.prototype.hasOwnProperty.call(resp || {}, 'data') ? resp.data : resp;
}

export function convertPageData(result: any) {
  return {
    data: result?.list || [],
    total: result?.total || 0,
    success: true,
  };
}
export function orderBy(sort: any) {
  if (!sort) return;
  const keys = Object.keys(sort);
  if (keys.length !== 1) return;
  return keys[0] + ' ' + sort[keys[0]];
}

export async function waitTime(time: number = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
}
