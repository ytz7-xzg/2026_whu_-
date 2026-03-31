import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ProCard, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Input, Popconfirm, Select, Space, Tag, Typography } from 'antd';
import type { CSSProperties, FC } from 'react';
import { useMemo } from 'react';

const { Text, Paragraph } = Typography;

type NotesViewProps = {
  cardStyle: CSSProperties;
  tokenColorTextHeading: string;
  tokenColorError: string;
  loading: boolean;
  notes: API.Note[];
  categoryMap: Map<string, string>;
  categoryOptions: { label: string; value: string }[];
  searchInput: string;
  setSearchInput: (value: string) => void;
  setKeyword: (value: string) => void;
  categoryFilter?: string;
  setCategoryFilter: (value: string | undefined) => void;
  onRefresh: () => void;
  onCreateNote: () => void;
  onEditNote: (id: API.ID) => void;
  onDeleteNote: (id: API.ID) => Promise<void>;
};

const NotesView: FC<NotesViewProps> = ({
  cardStyle,
  tokenColorTextHeading,
  tokenColorError,
  loading,
  notes,
  categoryMap,
  categoryOptions,
  searchInput,
  setSearchInput,
  setKeyword,
  categoryFilter,
  setCategoryFilter,
  onRefresh,
  onCreateNote,
  onEditNote,
  onDeleteNote,
}) => {
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
            <Button type="link" icon={<EditOutlined />} onClick={() => onEditNote(record.id)}>
              编辑
            </Button>
            <Popconfirm
              title="删除笔记"
              description="删除后不可恢复，是否继续？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              icon={<ExclamationCircleFilled style={{ color: tokenColorError }} />}
              onConfirm={() => void onDeleteNote(record.id)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [categoryMap, onDeleteNote, onEditNote, tokenColorError],
  );

  return (
    <>
      <ProCard bordered style={cardStyle}>
        <Space direction="vertical" size={4}>
          <Text strong style={{ fontSize: 24, color: tokenColorTextHeading }}>
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
          <Button key="refresh" icon={<ReloadOutlined />} onClick={onRefresh}>
            刷新
          </Button>,
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={onCreateNote}>
            新建笔记
          </Button>,
        ]}
      />
    </>
  );
};

export default NotesView;
