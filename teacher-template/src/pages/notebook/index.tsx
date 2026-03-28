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
import { Line, Pie } from '@ant-design/charts';
import { PageContainer, ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { history, useLocation, useModel } from '@umijs/max';
import {
  Button,
  Col,
  Drawer,
  Empty,
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

type ChartDatum = {
  type: string;
  value: number;
};

type TrendDatum = {
  date: string;
  label: string;
  count: number;
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

const parseDateValue = (value?: string) => {
  if (!value) return undefined;

  const firstTry = new Date(value);
  if (!Number.isNaN(firstTry.getTime())) return firstTry;

  const secondTry = new Date(String(value).replace(/-/g, '/'));
  if (!Number.isNaN(secondTry.getTime())) return secondTry;

  return undefined;
};

const formatDay = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDayLabel = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
};

const cardStyle = {
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
  transition: 'all 0.25s ease',
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

  const uncategorizedNoteCount = useMemo(
    () => notes.filter((item) => item.categories.length === 0).length,
    [notes],
  );

  const topCategory = useMemo(() => {
    if (!stats.length) return undefined;
    return [...stats].sort((a, b) => b.noteCount - a.noteCount)[0];
  }, [stats]);

  const statisticsCards = useMemo(
    () => [
      {
        key: 'total-notes',
        title: '笔记总数',
        value: notes.length,
        subtitle: '全部笔记数量',
      },
      {
        key: 'total-categories',
        title: '分类总数',
        value: categories.length,
        subtitle: topCategory
          ? `最多分类：${topCategory.categoryName}（${topCategory.noteCount}）`
          : '暂无分类数据',
      },
      {
        key: 'categorized-notes',
        title: '有分类笔记',
        value: categorizedNoteCount,
        subtitle: `未分类 ${uncategorizedNoteCount} 篇`,
      },
    ],
    [categories.length, categorizedNoteCount, notes.length, topCategory, uncategorizedNoteCount],
  );

  const categoryPieData = useMemo<ChartDatum[]>(() => {
    return stats
      .filter((item) => item.noteCount > 0)
      .map((item) => ({ type: item.categoryName || '未命名分类', value: item.noteCount }));
  }, [stats]);

  const pieTotal = useMemo(
    () => categoryPieData.reduce((total, item) => total + item.value, 0),
    [categoryPieData],
  );

  const noteTrendData = useMemo<TrendDatum[]>(() => {
    const days = 14;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trendMap = new Map<string, TrendDatum>();

    for (let i = days - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const full = formatDay(date);
      trendMap.set(full, {
        date: full,
        label: formatDayLabel(date),
        count: 0,
      });
    }

    notes.forEach((note) => {
      const parsed = parseDateValue(note.createdAt);
      if (!parsed) return;
      parsed.setHours(0, 0, 0, 0);
      const key = formatDay(parsed);
      const existed = trendMap.get(key);
      if (!existed) return;
      trendMap.set(key, {
        ...existed,
        count: existed.count + 1,
      });
    });

    return Array.from(trendMap.values());
  }, [notes]);

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        title: item.title || '未命名笔记',
      }));
  }, [notes]);

  const pieConfig = useMemo(
    () => ({
      data: categoryPieData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.9,
      innerRadius: 0.64,
      legend: { position: 'bottom' as const },
      label: {
        text: (datum: ChartDatum) => `${datum.value}`,
        style: {
          fontSize: 12,
          fontWeight: 600,
        },
      },
      tooltip: {
        formatter: (datum: ChartDatum) => {
          const percent = pieTotal ? ((datum.value / pieTotal) * 100).toFixed(1) : '0.0';
          return {
            name: `类别：${datum.type}`,
            value: `笔记占比：${percent}%`,
          };
        },
      },
      interaction: {
        elementHighlight: true,
      },
      animation: {
        enter: {
          type: 'scaleInY',
          duration: 650,
        },
      },
    }),
    [categoryPieData, pieTotal],
  );

  const lineConfig = useMemo(
    () => ({
      data: noteTrendData,
      xField: 'label',
      yField: 'count',
      smooth: true,
      point: {
        shapeField: 'circle',
        sizeField: 3,
      },
      area: {
        style: {
          fillOpacity: 0.14,
        },
      },
      axis: {
        x: {
          labelAutoHide: true,
          labelAutoRotate: false,
        },
        y: {
          gridLineDash: [3, 3],
          gridStrokeOpacity: 0.2,
        },
      },
      tooltip: {
        formatter: (datum: TrendDatum) => ({
          name: datum.date,
          value: `${datum.count} 篇`,
        }),
      },
      animation: {
        enter: {
          type: 'pathIn',
          duration: 700,
        },
      },
    }),
    [noteTrendData],
  );

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
          <ProCard bordered style={cardStyle}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                我的笔记
              </Text>
              <Text type="secondary">在这里记录、查找和整理你的每一条笔记。</Text>
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
          <ProCard bordered style={cardStyle}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                统计
              </Text>
              <Text type="secondary">用更直观的方式看看你的笔记分布、分类占比和近期变化。</Text>
            </Space>
          </ProCard>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {statisticsCards.map((item) => (
              <Col key={item.key} xs={24} md={8}>
                <ProCard bordered style={cardStyle}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">{item.title}</Text>
                    <Statistic value={item.value} valueStyle={{ fontWeight: 700, fontSize: 30 }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.subtitle}
                    </Text>
                  </Space>
                </ProCard>
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={12}>
              <ProCard title="分类占比" subTitle="各分类笔记占比" bordered style={{ ...cardStyle, height: 420 }}>
                {categoryPieData.length ? (
                  <Pie {...pieConfig} style={{ height: 320 }} />
                ) : (
                  <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="暂无分类占比数据" />
                  </div>
                )}
              </ProCard>
            </Col>

            <Col xs={24} lg={12}>
              <ProCard
                title="近 14 天创建趋势"
                subTitle="按创建日期聚合"
                bordered
                style={{ ...cardStyle, height: 420 }}
              >
                {notes.length ? (
                  <Line {...lineConfig} style={{ height: 320 }} />
                ) : (
                  <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Empty description="暂无趋势数据" />
                  </div>
                )}
              </ProCard>
            </Col>
          </Row>

          <ProCard
            title="分类统计明细"
            subTitle="辅助查看具体分类计数"
            bordered
            style={{ ...cardStyle, marginTop: 16 }}
          >
            <Table<API.CategoryStats>
              rowKey={(item) => String(item.categoryId)}
              columns={statsColumns}
              dataSource={stats}
              loading={loading}
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无统计数据' }}
            />
          </ProCard>
        </>
      ) : null}

      {mainView === 'categories' ? (
        <>
          <ProCard bordered style={cardStyle}>
            <Space direction="vertical" size={4}>
              <Text strong style={{ fontSize: 24, color: token.colorTextHeading }}>
                分类管理
              </Text>
              <Text type="secondary">给笔记分个类，让内容整理起来更轻松。</Text>
            </Space>
          </ProCard>

          <ProCard bordered style={{ ...cardStyle, marginTop: 16 }}>
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
