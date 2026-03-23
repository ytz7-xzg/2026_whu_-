import { request } from '@/utils/request';

export type ListNotesParams = API.NoteListQuery;
export type ListNotesResult = API.PageResult<API.Note>;
export type CreateNoteParams = API.CreateNotePayload;
export type UpdateNoteParams = API.UpdateNotePayload;
export type DeleteNoteParams = API.DeleteNotePayload;

export type ListCategoriesParams = API.CategoryListQuery;
export type CreateCategoryParams = API.CreateCategoryPayload;
export type UpdateCategoryParams = API.UpdateCategoryPayload;
export type DeleteCategoryParams = API.DeleteCategoryPayload;

const normalizeKeyword = (value?: string) => value?.trim().toLowerCase() || '';

const normalizeCategory = (category: any): API.Category => ({
  id: category?.id,
  name: category?.name || '',
  createdAt: category?.createTime || category?.createdAt || '',
});

const normalizeNote = (note: any): API.Note => ({
  id: note?.id,
  title: note?.title || '',
  content: note?.content || '',
  categories: Array.isArray(note?.categoryIds)
    ? note.categoryIds
    : Array.isArray(note?.categories)
      ? note.categories
      : Array.isArray(note?.categoryList)
        ? note.categoryList.map((item: any) => item?.id).filter(Boolean)
        : [],
  createdAt: note?.createTime || note?.createdAt || '',
  updatedAt: note?.updateTime || note?.updatedAt || note?.createTime || note?.createdAt || '',
});

const filterNotes = (notes: API.Note[], params?: ListNotesParams) => {
  const keyword = normalizeKeyword(params?.keyword);
  const categoryId = params?.categoryId;
  return notes.filter((note) => {
    const matchesKeyword =
      !keyword ||
      note.title.toLowerCase().includes(keyword) ||
      note.content.toLowerCase().includes(keyword);
    const matchesCategory = !categoryId || note.categories.some((item) => String(item) === String(categoryId));
    return matchesKeyword && matchesCategory;
  });
};

export async function listNotes(params?: ListNotesParams, options?: Record<string, unknown>) {
  const remote = await request<any[]>('/api/note/list', {
    method: 'GET',
    ...(options || {}),
  });
  const list = filterNotes((remote || []).map(normalizeNote), params).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return {
    list,
    total: list.length,
  };
}

export async function getNoteDetail(id: API.ID, options?: Record<string, unknown>) {
  const list = await listNotes(undefined, options);
  return list.list.find((note) => String(note.id) === String(id));
}

export async function createNote(data: CreateNoteParams, options?: Record<string, unknown>) {
  const remote = await request<string>('/api/note/add', {
    method: 'POST',
    data: {
      title: data.title,
      content: data.content,
      categoryIds: data.categories || [],
    },
    ...(options || {}),
  });
  if (!remote) return undefined;
  return {
    id: '',
    title: data.title,
    content: data.content,
    categories: data.categories || [],
    createdAt: '',
    updatedAt: '',
  } as API.Note;
}

export async function updateNote(data: UpdateNoteParams, options?: Record<string, unknown>) {
  const remote = await request<string>('/api/note/update', {
    method: 'POST',
    data: {
      id: data.id,
      title: data.title,
      content: data.content,
      categoryIds: data.categories || [],
    },
    ...(options || {}),
  });
  if (!remote) return undefined;
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    categories: data.categories,
    createdAt: '',
    updatedAt: '',
  } as API.Note;
}

export async function deleteNote(data: DeleteNoteParams, options?: Record<string, unknown>) {
  const remote = await request<string>('/api/note/delete', {
    method: 'POST',
    params: { id: data.id },
    ...(options || {}),
  });
  return !!remote;
}

export async function listCategories(
  params?: ListCategoriesParams,
  options?: Record<string, unknown>,
) {
  const remote = await request<any[]>('/api/category/list', {
    method: 'GET',
    ...(options || {}),
  });
  const list = (remote || []).map(normalizeCategory);
  const keyword = normalizeKeyword(params?.keyword);
  if (!keyword) return list;
  return list.filter((item) => item.name.toLowerCase().includes(keyword));
}

export async function createCategory(
  data: CreateCategoryParams,
  options?: Record<string, unknown>,
) {
  const remote = await request<string>('/api/category/add', {
    method: 'POST',
    data: { name: data.name },
    ...(options || {}),
  });
  if (!remote) return undefined;
  return {
    id: '',
    name: data.name,
    createdAt: '',
  } as API.Category;
}

export async function updateCategory(
  data: UpdateCategoryParams,
  options?: Record<string, unknown>,
) {
  const remote = await request<string>('/api/category/update', {
    method: 'POST',
    data: {
      id: data.id,
      name: data.name,
    },
    ...(options || {}),
  });
  if (!remote) return undefined;
  return {
    id: data.id,
    name: data.name,
    createdAt: '',
  } as API.Category;
}

export async function deleteCategory(
  data: DeleteCategoryParams,
  options?: Record<string, unknown>,
) {
  const remote = await request<string>('/api/category/delete', {
    method: 'POST',
    params: { id: data.id },
    ...(options || {}),
  });
  return !!remote;
}

export async function listCategoryStatistics(options?: Record<string, unknown>) {
  const remote = await request<API.CategoryStats[]>('/api/category/statistics', {
    method: 'GET',
    ...(options || {}),
  });
  return remote || [];
}
