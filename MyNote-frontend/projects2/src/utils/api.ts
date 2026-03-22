import { CATEGORY_COLOR_TOKENS, type CategoryColorToken, type CategoryRecord, type NoteRecord } from "../data/notes";
import request from "./request";

export type ApiResponse<T> = {
  code: number;
  data: T;
  message?: string;
  success: boolean;
};

export type BackendToken = {
  accessToken?: string;
  userName?: string;
  userCode?: string;
  userId?: number;
};

type BackendCategory = {
  id: number;
  name: string;
  userId?: number;
  createTime?: string;
  updateTime?: string;
};

type BackendNote = {
  id: number;
  title: string;
  content: string;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  categoryIds?: number[];
  categoryList?: BackendCategory[];
};

type CreateNoteInput = {
  title: string;
  content: string;
  tags: string[];
};

const ensureSuccess = <T>(response: ApiResponse<T>, fallback: string) => {
  if (!response.success) {
    throw new Error(response.message || fallback);
  }

  return response.data;
};

const toIdString = (value: string | number) => String(value);

const toNumericId = (value: string, label: string) => {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new Error(`${label}无效：${value}`);
  }
  return id;
};

const normalizeDateTime = (value?: string | null) => {
  if (!value) {
    return new Date().toISOString();
  }

  if (value.includes("T")) {
    return value;
  }

  return value.replace(" ", "T");
};

const hashString = (value: string) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

const resolveCategoryColor = (id: string): CategoryColorToken => {
  const numericId = Number(id);
  const seed = Number.isFinite(numericId) ? numericId : hashString(id);
  return CATEGORY_COLOR_TOKENS[seed % CATEGORY_COLOR_TOKENS.length];
};

const mapCategory = (category: BackendCategory): CategoryRecord => ({
  id: toIdString(category.id),
  name: category.name,
  color: resolveCategoryColor(toIdString(category.id)),
});

const mapNote = (note: BackendNote, deletedIdSet: Set<string>): NoteRecord => ({
  id: toIdString(note.id),
  title: note.title?.trim() || "未命名笔记",
  content: note.content || "",
  tags: (note.categoryIds || note.categoryList?.map((category) => category.id) || []).map(toIdString),
  createdAt: normalizeDateTime(note.createTime),
  updatedAt: normalizeDateTime(note.updateTime || note.createTime),
  deleted: deletedIdSet.has(toIdString(note.id)),
});

export const getDisplayName = (token?: BackendToken | null) =>
  token?.userName?.trim() || token?.userCode?.trim() || "访客";

export const getCurrentUser = async () => {
  const response = (await request.get("/api/authentication/getCurrentUser")) as ApiResponse<BackendToken>;
  return ensureSuccess(response, "获取当前登录用户失败");
};

export const login = async (payload: { username: string; password: string }) => {
  const response = (await request.post("/api/authentication/login", payload)) as ApiResponse<BackendToken>;
  return ensureSuccess(response, "登录失败");
};

export const register = async (payload: { username: string; password: string }) => {
  const response = (await request.post("/api/authentication/register", payload)) as ApiResponse<string>;
  return ensureSuccess(response, "注册失败");
};

export const logout = async () => {
  const response = (await request.get("/api/authentication/logout")) as ApiResponse<string>;
  return ensureSuccess(response, "退出登录失败");
};

export const listCategories = async () => {
  const response = (await request.get("/api/category/list")) as ApiResponse<BackendCategory[]>;
  return ensureSuccess(response, "获取分类列表失败").map(mapCategory);
};

export const createCategory = async (name: string) => {
  const response = (await request.post("/api/category/add", { name })) as ApiResponse<string>;
  return ensureSuccess(response, "创建分类失败");
};

export const updateCategory = async (id: string, name: string) => {
  const response = (await request.post("/api/category/update", {
    id: toNumericId(id, "分类 ID"),
    name,
  })) as ApiResponse<string>;
  return ensureSuccess(response, "更新分类失败");
};

export const deleteCategoryById = async (id: string) => {
  const response = (await request.post("/api/category/delete", null, {
    params: { id: toNumericId(id, "分类 ID") },
  })) as ApiResponse<string>;
  return ensureSuccess(response, "删除分类失败");
};

export const listNotes = async (deletedIds: Set<string> = new Set()) => {
  const response = (await request.get("/api/note/list")) as ApiResponse<BackendNote[]>;
  return ensureSuccess(response, "获取笔记列表失败").map((note) => mapNote(note, deletedIds));
};

export const createNote = async ({ title, content, tags }: CreateNoteInput) => {
  const response = (await request.post("/api/note/add", {
    title,
    content,
    categoryIds: tags.map((tagId) => toNumericId(tagId, "分类 ID")),
  })) as ApiResponse<string>;
  return ensureSuccess(response, "创建笔记失败");
};

export const updateNote = async (note: NoteRecord) => {
  const response = (await request.post("/api/note/update", {
    id: toNumericId(note.id, "笔记 ID"),
    title: note.title,
    content: note.content,
    categoryIds: note.tags.map((tagId) => toNumericId(tagId, "分类 ID")),
  })) as ApiResponse<string>;
  return ensureSuccess(response, "保存笔记失败");
};

export const deleteNoteById = async (id: string) => {
  const response = (await request.post("/api/note/delete", null, {
    params: { id: toNumericId(id, "笔记 ID") },
  })) as ApiResponse<string>;
  return ensureSuccess(response, "删除笔记失败");
};
