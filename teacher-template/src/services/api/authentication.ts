import { request } from '@/utils/request';

const AUTH_STORAGE_KEY = 'redlib_backend_auth_v1';

const canUseStorage = () => typeof window !== 'undefined' && !!window.localStorage;

const readToken = (): API.Token | undefined => {
  if (!canUseStorage()) return undefined;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as API.Token;
  } catch (_error) {
    return undefined;
  }
};

const saveToken = (token?: API.Token) => {
  if (!canUseStorage()) return;
  if (!token) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(token));
};

const normalizePrivileges = (privSet?: unknown) => {
  if (Array.isArray(privSet)) return privSet;
  if (privSet instanceof Set) return Array.from(privSet);
  if (privSet && typeof privSet === 'object') return Array.from(privSet as Iterable<string>);
  return [] as string[];
};

const normalizeToken = (token?: any, fallback?: Partial<API.Token>): API.Token | undefined => {
  if (!token && !fallback) return undefined;
  return {
    token: token?.accessToken || token?.token || fallback?.token,
    userCode: token?.userCode || fallback?.userCode,
    userName: token?.userName || fallback?.userName || token?.userCode || fallback?.userCode,
    privSet: normalizePrivileges(token?.privSet ?? fallback?.privSet),
  };
};

const readErrorMessage = (error: any) =>
  error?.info?.message || error?.message || error?.response?.data?.message;

export async function registerUser(
  data: API.RegisterPayload,
  options?: Record<string, unknown>,
): Promise<API.RegisterResult> {
  try {
    const resp = await request<string>('/api/authentication/register', {
      method: 'POST',
      data: {
        username: data.username,
        password: data.password,
      },
      // Let register page handle the message itself.
      throwError: true,
      skipErrorHandler: true,
      ...(options || {}),
    });

    return {
      success: true,
      message: resp || '注册成功',
    };
  } catch (error: any) {
    return {
      success: false,
      message: readErrorMessage(error) || '注册失败，请稍后重试',
    };
  }
}

export async function register(data: API.RegisterPayload, options?: Record<string, unknown>) {
  return registerUser(data, options);
}

export async function login(data: API.LoginPayload, options?: Record<string, unknown>) {
  const remote = await request<any>('/api/authentication/login', {
    method: 'POST',
    data: {
      username: data.userId,
      password: data.password,
    },
    ...(options || {}),
  });
  const normalized = normalizeToken(remote, {
    userCode: data.userId,
    userName: data.userId,
  });
  if (!normalized?.token) return undefined;
  saveToken(normalized);
  return normalized;
}

export async function getCurrentUser(options?: Record<string, unknown>) {
  const stored = readToken();
  const remote = await request<any>('/api/authentication/getCurrentUser', {
    method: 'GET',
    ...(options || {}),
  });

  // 如果后端没有返回有效登录态（例如服务重启后内存 token 已丢失），
  // 不能继续使用本地缓存的旧 token 兜底，否则页面会误以为仍然登录中。
  if (!remote) {
    saveToken(undefined);
    return undefined;
  }

  const normalized = normalizeToken(remote, stored);
  if (!normalized?.token) {
    saveToken(undefined);
    return undefined;
  }
  saveToken(normalized);
  return normalized;
}

export async function logout(options?: Record<string, unknown>) {
  const remote = await request<string>('/api/authentication/logout', {
    method: 'GET',
    ...(options || {}),
  });
  saveToken(undefined);
  return !!remote;
}
