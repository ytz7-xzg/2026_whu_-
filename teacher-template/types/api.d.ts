declare namespace API {
  type ID = string | number;

  interface BaseResponse<T> {
    data?: T;
    success?: boolean;
    message?: string;
  }

  interface PageResult<T> {
    list: T[];
    total: number;
  }

  interface Token {
    token?: string;
    userCode?: string;
    userName?: string;
    privSet?: string[];
  }

  interface LoginPayload {
    userId: string;
    password: string;
  }

  interface RegisterPayload {
    username: string;
    password: string;
  }

  interface RegisterResult {
    success: boolean;
    message?: string;
  }

  interface DepartmentQueryDTO {
    current?: number;
    pageSize?: number;
    keyword?: string;
    orderBy?: string;
    [key: string]: unknown;
  }

  interface DepartmentVO {
    id?: number;
    departmentName?: string;
    contact?: string;
    contactPhone?: string;
    description?: string;
    createdByDesc?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  interface DepartmentDTO extends DepartmentVO {}

  interface AdminModDTO {
    id?: string;
    privList?: string[];
  }

  interface ModulePrivilegeVO {
    id?: string;
    description?: string;
  }

  interface ModuleVO {
    id?: string;
    description?: string;
    privilegeList?: ModulePrivilegeVO[];
  }

  interface AdminVO {
    id?: number;
    userCode?: string;
    name?: string;
    sex?: boolean;
    enabled?: boolean;
    phone?: string;
    email?: string;
    department?: string;
    createdByDesc?: string;
    createdAt?: string;
    updatedAt?: string;
    modList?: AdminModDTO[];
  }

  interface LoginLogVO {
    id?: number;
    userCode?: string;
    name?: string;
    ipAddress?: string;
    os?: string;
    browser?: string;
    createdAt?: string;
  }

  interface OnlineUserVO {
    userCode?: string;
    userName?: string;
    sex?: boolean;
    enabled?: boolean;
    browser?: string;
    os?: string;
    department?: string;
    lastAction?: string;
  }

  interface Note {
    id: ID;
    title: string;
    content: string;
    categories: ID[];
    createdAt: string;
    updatedAt: string;
  }

  interface Category {
    id: ID;
    name: string;
    createdAt: string;
  }

  interface CategoryStats {
    categoryId: ID;
    categoryName: string;
    noteCount: number;
  }

  interface NoteListQuery {
    current?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: ID;
  }

  interface CreateNotePayload {
    title: string;
    content: string;
    categories: ID[];
  }

  interface UpdateNotePayload extends CreateNotePayload {
    id: ID;
  }

  interface DeleteNotePayload {
    id: ID;
  }

  interface CategoryListQuery {
    keyword?: string;
  }

  interface CreateCategoryPayload {
    name: string;
  }

  interface UpdateCategoryPayload {
    id: ID;
    name: string;
  }

  interface DeleteCategoryPayload {
    id: ID;
  }
}
