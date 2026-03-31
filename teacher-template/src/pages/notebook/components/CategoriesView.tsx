import { PlusOutlined } from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CSSProperties, FC } from 'react';

const { Text } = Typography;

type CategoriesViewProps = {
  cardStyle: CSSProperties;
  tokenColorTextHeading: string;
  loading: boolean;
  categories: API.Category[];
  onCreateCategory: () => void;
  onEditCategory: (record: API.Category) => void;
  onDeleteCategory: (id: API.ID) => Promise<void>;
};

const CategoriesView: FC<CategoriesViewProps> = ({
  cardStyle,
  tokenColorTextHeading,
  loading,
  categories,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
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
          <Button type="link" onClick={() => onEditCategory(record)}>
            编辑
          </Button>
          <Popconfirm
            title="删除分类"
            description="删除后该分类会从笔记中移除，是否继续？"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void onDeleteCategory(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <ProCard bordered style={cardStyle}>
        <Space direction="vertical" size={4}>
          <Text strong style={{ fontSize: 24, color: tokenColorTextHeading }}>
            分类管理
          </Text>
          <Text type="secondary">给笔记分个类，让内容整理起来更轻松。</Text>
        </Space>
      </ProCard>

      <ProCard bordered style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={onCreateCategory}>
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
  );
};

export default CategoriesView;
