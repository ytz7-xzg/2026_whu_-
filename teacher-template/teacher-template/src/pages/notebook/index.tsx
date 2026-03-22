import {
  createCategory,
  deleteCategory,
  deleteNote,
  listCategories,
  listCategoryStatistics,
  listNotes,
  updateCategory,
} from '@/services/api/notebook';
import { DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  Drawer,
  Form,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CategoryFormValue = {
  name: string;
};

const { Text } = Typography;

const NotebookPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<API.Note[]>([]);
  const [categories, setCategories] = useState<API.Category[]>([]);
  const [stats, setStats] = useState<API.CategoryStats[]>([]);

  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<API.Category | undefined>(undefined);
  const [categoryForm] = Form.useForm<CategoryFormValue>();

  const categoryMap = useMemo(() => {
    return new Map(categories.map((item) => [String(item.id), item.name]));
  }, [categories]);

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
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDeleteNote = async (id: API.ID) => {
    const success = await deleteNote({ id });
    if (success) {
      message.success('笔记已删除');
      void loadData();
      return;
    }
    message.error('删除失败');
  };

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
    if (!name) return;

    if (editingCategory) {
      await updateCategory({ id: editingCategory.id, name });
      message.success('分类已更新');
    } else {
      await createCategory({ name });
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
    message.error('分类删除失败');
  };

  const noteColumns: ProColumns<API.Note>[] = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 220,
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (_, record) => (
        <Text ellipsis style={{ maxWidth: 360 }}>
          {record.content}
        </Text>
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
              <Tag key={`${record.id}-${item}`} color="blue">
                {categoryMap.get(String(item)) || String(item)}
              </Tag>
            ))}
          </>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => history.push(`/notebook/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除该笔记？" onConfirm={() => void handleDeleteNote(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const categoryColumns: ColumnsType<API.Category> = [
    {
      title: '分类名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEditCategory(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除分类后会从笔记中移除该标签，确认继续？"
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
      width: 120,
    },
  ];

  return (
    <PageContainer title="在线笔记本" subTitle="笔记列表、分类管理、分类统计">
      <ProCard gutter={[16, 16]} wrap>
        <ProCard colSpan={{ xs: 24, md: 8 }}>
          <Statistic title="笔记总数" value={notes.length} />
        </ProCard>
        <ProCard colSpan={{ xs: 24, md: 8 }}>
          <Statistic title="分类总数" value={categories.length} />
        </ProCard>
        <ProCard colSpan={{ xs: 24, md: 8 }}>
          <Statistic
            title="有分类笔记"
            value={notes.filter((item) => item.categories.length > 0).length}
          />
        </ProCard>
      </ProCard>

      <ProCard style={{ marginTop: 16 }} title="分类统计">
        <Table<API.CategoryStats>
          rowKey={(item) => String(item.categoryId)}
          columns={statsColumns}
          dataSource={stats}
          pagination={false}
          size="small"
        />
      </ProCard>

      <ProTable<API.Note>
        rowKey={(item) => String(item.id)}
        search={false}
        style={{ marginTop: 16 }}
        loading={loading}
        dataSource={notes}
        columns={noteColumns}
        pagination={{ pageSize: 8 }}
        toolBarRender={() => [
          <Input.Search
            key="search"
            allowClear
            placeholder="搜索标题或内容"
            style={{ width: 240 }}
            onSearch={(value) => setKeyword(value)}
          />,
          <Select
            key="categoryFilter"
            allowClear
            placeholder="按分类筛选"
            style={{ width: 180 }}
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            options={categories.map((item) => ({ label: item.name, value: String(item.id) }))}
          />,
          <Button
            key="manageCategory"
            icon={<TagsOutlined />}
            onClick={() => setCategoryDrawerOpen(true)}
          >
            分类管理
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

      <Drawer
        width={600}
        title="分类管理"
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCategory}>
            新建分类
          </Button>
        }
      >
        <Table<API.Category>
          rowKey={(item) => String(item.id)}
          columns={categoryColumns}
          dataSource={categories}
          pagination={false}
        />
      </Drawer>

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
