import {
  createCategory,
  deleteCategory,
  deleteNote,
  listCategories,
  listCategoryStatistics,
  listNotes,
  updateCategory,
} from '@/services/api/notebook';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { history, useLocation, useModel } from '@umijs/max';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

type MainView = 'notes' | 'stats' | 'categories';
type CategoryFormValue = {
  name: string;
};

const { Text, Paragraph } = Typography;

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

const NotebookPage: React.FC = () => {
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

  const categoryMap = useMemo(() => {
    return new Map(categories.map((item) => [String(item.id), item.name]));
  }, [categories]);

  const categoryOptions = useMemo(
    () => categories.map((item) => ({ label: item.name, value: String(item.id) })),
    [categories],
  );

  const categorizedNoteCount = useMemo(
    () => notes.filter((item) => item.categories.length > 0).length,
    [notes],
  );

  const statisticsCards = useMemo(
    () => [
      { key: 'total-notes', title: '笔记总数', value: notes.length },
      { key: 'total-categories', title: '分类总数', value: categories.length },
      { key: 'categorized-notes', title: '有分类笔记', value: categorizedNoteCount },
      { key: 'stats-rows', title: '统计项', value: stats.length },
    ],
    [categories.length, categorizedNoteCount, notes.length, stats.length],
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

  const noteColumns: ProColumns<API.Note>[] = useMemo(
    () => [
      {
        title: '标题',
        dataIndex: 'title',
        ellipsis: true,
        width: 220,
        render: (_, record) => record.title || '未命名笔记',
      },
      {
        title: '内容',
        dataIndex: 'content',
        ellipsis: true,
        render: (_, record) => (
          <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0, maxWidth: 360 }}>
            {record.content || '暂无内容'}
          </Paragraph>
        ),
      },
      {
        title: '分类',
        dataIndex: 'categories',
        width: 220,
        render: (_, record) => {
          if (!record.categories?.length) return <Tag>未分类</Tag>;
          return (
            <>
              {record.categories.map((item) => (
                <Tag key={`${record.id}-${item}`} color="processing">
                  {categoryMap.get(String(item)) || String(item)}
                </Tag>
              ))}
            </>
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 180,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        width: 180,
      },
      {
        title: '操作',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => history.push(`/notebook/edit/${record.id}`)}
            >
              编辑
            </Button>
            <Popconfirm
              title="删除笔记"
              description="删除后不可恢复，是否继续？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              icon={<ExclamationCircleFilled style={{ color: token.colorError }} />}
              onConfirm={() => void handleDeleteNote(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [categoryMap, handleDeleteNote, token.colorError],
  );

  const categoryColumns: ColumnsType<API.Category> = [
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 220,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => openEditCategory(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除分类"
            description="删除后该分类会从笔记中移除，是否继续？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void handleDeleteCategory(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const statsColumns: ColumnsType<API.CategoryStats> = [
    {
      title: '分类',
      dataIndex: 'categoryName',
    },
    {
      title: '笔记数量',
      dataIndex: 'noteCount',
      width: 140,
    },
  ];

  return (
    <PageContainer title={false}>
      {mainView === 'notes' ? (
        <>
          <ProCard
            bordered
            style={{ borderRadius: 14, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}
          >
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                我的笔记
              </Text>
              <Text type="secondary">管理全部笔记，支持搜索、筛选、刷新与快速编辑。</Text>
            </Space>
          </ProCard>

          <ProTable<API.Note>
            rowKey={(item) => String(item.id)}
            search={false}
            options={false}
            style={{ marginTop: 16 }}
            loading={loading}
            dataSource={notes}
            columns={noteColumns}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            scroll={{ x: 1100 }}
            cardBordered
            locale={{ emptyText: '暂无笔记，请先创建笔记' }}
            toolbar={{
              title: '全部笔记',
            }}
            toolBarRender={() => [
              <Input.Search
                key="search"
                allowClear
                placeholder="搜索标题或内容"
                style={{ width: 240 }}
                value={searchInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSearchInput(nextValue);
                  if (!nextValue) setKeyword('');
                }}
                onSearch={(value) => {
                  setSearchInput(value);
                  setKeyword(value.trim());
                }}
              />,
              <Select
                key="categoryFilter"
                allowClear
                placeholder="按分类筛选"
                style={{ width: 180 }}
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value)}
                options={categoryOptions}
              />,
              <Button key="refresh" icon={<ReloadOutlined />} onClick={() => void loadData()}>
                刷新
              </Button>,
              <Button
                key="create"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => history.push('/notebook/create')}
              >
                新建笔记
              </Button>,
            ]}
          />
        </>
      ) : null}

      {mainView === 'stats' ? (
        <>
          <ProCard
            bordered
            style={{ borderRadius: 14, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}
          >
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                统计
              </Text>
              <Text type="secondary">查看笔记与分类数据概览，以及分类维度的数量分布。</Text>
            </Space>
          </ProCard>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {statisticsCards.map((item) => (
              <Col key={item.key} xs={24} sm={12} xl={6}>
                <ProCard
                  bordered
                  style={{ borderRadius: 14, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}
                >
                  <Statistic title={item.title} value={item.value} loading={loading} />
                </ProCard>
              </Col>
            ))}
          </Row>

          <ProCard
            title="分类统计"
            bordered
            style={{
              marginTop: 16,
              borderRadius: 14,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            <Table<API.CategoryStats>
              rowKey={(item) => String(item.categoryId)}
              columns={statsColumns}
              dataSource={stats}
              loading={loading}
              pagination={false}
              locale={{ emptyText: '暂无统计数据' }}
            />
          </ProCard>
        </>
      ) : null}

      {mainView === 'categories' ? (
        <>
          <ProCard
            bordered
            style={{ borderRadius: 14, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)' }}
          >
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                分类管理
              </Text>
              <Text type="secondary">统一维护笔记分类，支持新增、编辑、删除。</Text>
            </Space>
          </ProCard>

          <ProCard
            bordered
            style={{
              marginTop: 16,
              borderRadius: 14,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCategory}>
                新建分类
              </Button>
            </div>

            <Table<API.Category>
              rowKey={(item) => String(item.id)}
              columns={categoryColumns}
              dataSource={categories}
              loading={loading}
              pagination={false}
              locale={{ emptyText: '暂无分类' }}
            />
          </ProCard>
        </>
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
