import { Line, Pie } from '@ant-design/charts';
import { ProCard } from '@ant-design/pro-components';
import { Col, Empty, Row, Space, Statistic, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CSSProperties, FC } from 'react';
import { useMemo } from 'react';

const { Text } = Typography;

type ChartDatum = {
  type: string;
  value: number;
};

type TrendDatum = {
  date: string;
  label: string;
  count: number;
};

type StatisticCard = {
  key: string;
  title: string;
  value: number;
  subtitle: string;
};

type StatsViewProps = {
  cardStyle: CSSProperties;
  tokenColorTextHeading: string;
  loading: boolean;
  notes: API.Note[];
  categories: API.Category[];
  stats: API.CategoryStats[];
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

const StatsView: FC<StatsViewProps> = ({
  cardStyle,
  tokenColorTextHeading,
  loading,
  notes,
  categories,
  stats,
}) => {
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

  const statisticsCards = useMemo<StatisticCard[]>(
    () => [
      {
        key: 'total-notes',
        title: '笔记总数',
        value: notes.length,
        subtitle: '当前已记录的全部笔记',
      },
      {
        key: 'total-categories',
        title: '分类总数',
        value: categories.length,
        subtitle: topCategory
          ? `最多分类：${topCategory.categoryName}（${topCategory.noteCount} 篇）`
          : '暂无分类统计数据',
      },
      {
        key: 'categorized-notes',
        title: '有分类笔记',
        value: categorizedNoteCount,
        subtitle: `未分类：${uncategorizedNoteCount} 篇`,
      },
    ],
    [categories.length, categorizedNoteCount, notes.length, topCategory, uncategorizedNoteCount],
  );

  const categoryPieData = useMemo<ChartDatum[]>(() => {
    return stats
      .filter((item) => item.noteCount > 0)
      .map((item) => ({
        type: item.categoryName || '未命名分类',
        value: item.noteCount,
      }));
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

  const trendCompareMap = useMemo(() => {
    const result = new Map<string, string>();

    noteTrendData.forEach((current, index) => {
      if (index === 0) {
        result.set(current.date, '--');
        return;
      }

      const previous = noteTrendData[index - 1]?.count ?? 0;
      if (previous <= 0) {
        result.set(current.date, current.count > 0 ? '--（昨日 0 篇）' : '0%');
        return;
      }

      const ratio = ((current.count - previous) / previous) * 100;
      const sign = ratio > 0 ? '+' : '';
      result.set(current.date, `${sign}${ratio.toFixed(1)}%`);
    });

    return result;
  }, [noteTrendData]);

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
        title: (datum: ChartDatum) => `类别：${datum.type}`,
        items: [
          (datum: ChartDatum) => {
            const percent = pieTotal ? ((datum.value / pieTotal) * 100).toFixed(1) : '0.0';
            return {
              name: '该类别笔记占比',
              value: `${percent}%（${datum.value} 篇）`,
            };
          },
        ],
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
        title: (datum: TrendDatum) => datum.date,
        items: [
          (datum: TrendDatum) => ({
            name: '当日新增篇数',
            value: `${datum.count} 篇`,
          }),
          (datum: TrendDatum) => ({
            name: '相比昨日新增百分比',
            value: trendCompareMap.get(datum.date) || '--',
          }),
        ],
      },
      animation: {
        enter: {
          type: 'pathIn',
          duration: 700,
        },
      },
    }),
    [noteTrendData, trendCompareMap],
  );

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
    <>
      <ProCard bordered style={cardStyle}>
        <Space direction="vertical" size={4}>
          <Text strong style={{ fontSize: 24, color: tokenColorTextHeading }}>
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
          <ProCard title="近 14 天创建趋势" subTitle="按创建日期聚合" bordered style={{ ...cardStyle, height: 420 }}>
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
  );
};

export default StatsView;
