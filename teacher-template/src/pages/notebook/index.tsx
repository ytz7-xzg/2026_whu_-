import {
  createCategory,
  deleteCategory,
  deleteNote,
  listCategories,
  listCategoryStatistics,
  listNotes,
  updateCategory,
} from '@/services/api/notebook';
import { PageContainer } from '@ant-design/pro-components';
import { history, useLocation, useModel } from '@umijs/max';
import { Button, Drawer, Form, Input, Space, message, theme } from 'antd';
import type { CSSProperties, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoriesView from './components/CategoriesView';
import NotesView from './components/NotesView';
import StatsView from './components/StatsView';

type MainView = 'notes' | 'stats' | 'categories';

type CategoryFormValue = {
  name: string;
};

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const resolveMainView = (pathname: string): MainView => {
  if (pathname === '/notebook/stats') return 'stats';
  if (pathname === '/notebook/categories') return 'categories';
  return 'notes';
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
  transition: 'all 0.25s ease',
};

const NotebookPage: FC = () => {
  const location = useLocation();
  const { token } = theme.useToken();
  const { setInitialState } = useModel('@@initialState');

  const [mainView, setMainView] = useState<MainView>(() => resolveMainView(location.pathname));

  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<API.Note[]>([]);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [stats, setStats] = useState<API.CategoryStats[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<API.Category | undefined>(undefined);
  const [categoryForm] = Form.useForm<CategoryFormValue>();

  useEffect(() => {
    setMainView(resolveMainView(location.pathname));
  }, [location.pathname]);

  const categoryMap = useMemo(() => new Map(categories.map((item) => [String(item.id), item.name])), [categories]);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: String(item.id) })),
    [categories],
  );

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title || '未命名笔记',
      }));
  }, [notes]);

  useEffect(() => {
    setInitialState((state) => {
      const prev = state?.notebookRecentNotes || [];
      const changed =
        prev.length !== recentNotes.length ||
        prev.some(
          (item, index) =>
            String(item.id) !== String(recentNotes[index]?.id) || item.title !== recentNotes[index]?.title,
        );

      if (!changed) return state;
      return {
        ...state,
        notebookRecentNotes: recentNotes,
      };
    });
  }, [recentNotes, setInitialState]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [noteResult, categoryResult, statResult] = await Promise.all([
        listNotes({
          keyword: keyword || undefined,
          categoryId: categoryFilter,
        }),
        listCategories(),
        listCategoryStatistics(),
      ]);
      setNotes(noteResult.list || []);
      setCategories(categoryResult || []);
      setStats(statResult || []);
    } catch (_error) {
      message.error('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, keyword]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDeleteNote = useCallback(
    async (id: API.ID) => {
      const success = await deleteNote({ id });
      if (success) {
        message.success('笔记已删除');
        void loadData();
        return;
      }
      message.error('删除失败，请稍后重试');
    },
    [loadData],
  );

  const openCreateCategory = () => {
    setEditingCategory(undefined);
    categoryForm.setFieldsValue({ name: '' });
    setCategoryModalOpen(true);
  };

  const openEditCategory = (record: API.Category) => {
    setEditingCategory(record);
    categoryForm.setFieldsValue({ name: record.name });
    setCategoryModalOpen(true);
  };

  const submitCategory = async () => {
    const values = await categoryForm.validateFields();
    const name = values.name.trim();
    if (!name) {
      message.warning('分类名称不能为空');
      return;
    }

    if (editingCategory) {
      const result = await updateCategory({ id: editingCategory.id, name });
      if (!result) return;
      message.success('分类已更新');
    } else {
      const result = await createCategory({ name });
      if (!result) return;
      message.success('分类已创建');
    }

    setCategoryModalOpen(false);
    setEditingCategory(undefined);
    void loadData();
  };

  const handleDeleteCategory = async (id: API.ID) => {
    const success = await deleteCategory({ id });
    if (success) {
      message.success('分类已删除');
      if (String(categoryFilter) === String(id)) setCategoryFilter(undefined);
      void loadData();
      return;
    }
    message.error('分类删除失败，请稍后重试');
  };

  return (
    <PageContainer title={false}>
      {mainView === 'notes' ? (
        <NotesView
          cardStyle={cardStyle}
          tokenColorTextHeading={token.colorTextHeading}
          tokenColorError={token.colorError}
          loading={loading}
          notes={notes}
          categoryMap={categoryMap}
          categoryOptions={categoryOptions}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setKeyword={setKeyword}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          onRefresh={() => void loadData()}
          onCreateNote={() => history.push('/notebook/create')}
          onEditNote={(id) => history.push(`/notebook/edit/${id}`)}
          onDeleteNote={handleDeleteNote}
        />
      ) : null}

      {mainView === 'stats' ? (
        <StatsView
          cardStyle={cardStyle}
          tokenColorTextHeading={token.colorTextHeading}
          loading={loading}
          notes={notes}
          categories={categories}
          stats={stats}
        />
      ) : null}

      {mainView === 'categories' ? (
        <CategoriesView
          cardStyle={cardStyle}
          tokenColorTextHeading={token.colorTextHeading}
          loading={loading}
          categories={categories}
          onCreateCategory={openCreateCategory}
          onEditCategory={openEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      ) : null}

      <Drawer
        width={420}
        title={editingCategory ? '编辑分类' : '新建分类'}
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setCategoryModalOpen(false)}>取消</Button>
            <Button type="primary" onClick={() => void submitCategory()}>
              保存
            </Button>
          </Space>
        }
      >
        <Form<CategoryFormValue> layout="vertical" form={categoryForm}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input maxLength={20} placeholder="请输入分类名称" />
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default NotebookPage;
