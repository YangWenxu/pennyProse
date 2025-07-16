import {
  TrendingUp, BarChart3, Target, Gauge, LineChart, Activity,
  Building2, DollarSign, Award, Users, Star, Bell,
  CheckCircle, ArrowRight, Zap, BarChart2, TrendingDown
} from 'lucide-react'
import { Link } from 'react-router-dom'

const StockFeatures = () => {
  const stockNavigation = [
    {
      name: '股票分析',
      href: '/stock-analysis',
      icon: BarChart3,
      description: '技术指标分析',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: '自选股',
      href: '/watchlist',
      icon: Star,
      description: '管理关注股票',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: '股票预警',
      href: '/alerts',
      icon: Bell,
      description: '价格预警设置',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
      name: '策略回测',
      href: '/backtest',
      icon: Target,
      description: '交易策略测试',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ]

  const technicalIndicators = [
    // 经典技术指标 (5个)
    {
      name: 'MACD',
      icon: Activity,
      description: '指数移动平均收敛发散 - 趋势跟踪和动量分析',
      color: 'text-blue-600',
      category: '经典指标'
    },
    {
      name: 'KDJ',
      icon: BarChart3,
      description: '随机指标 - 超买超卖判断',
      color: 'text-purple-600',
      category: '经典指标'
    },
    {
      name: 'RSI',
      icon: Gauge,
      description: '相对强弱指标 - 价格强弱度量',
      color: 'text-indigo-600',
      category: '经典指标'
    },
    {
      name: '布林带',
      icon: Target,
      description: '价格通道指标 - 波动性和支撑阻力分析',
      color: 'text-cyan-600',
      category: '经典指标'
    },
    {
      name: '威廉%R',
      icon: TrendingDown,
      description: '威廉指标 - 超买超卖确认',
      color: 'text-pink-600',
      category: '经典指标'
    },
    // 趋势分析方法 (5个)
    {
      name: '移动平均',
      icon: TrendingUp,
      description: '均线系统 - 趋势方向判断和多头排列',
      color: 'text-green-600',
      category: '趋势分析'
    },
    {
      name: '量能分析',
      icon: BarChart3,
      description: '成交量分析 - 量价配合确认',
      color: 'text-orange-600',
      category: '趋势分析'
    },
    {
      name: '江恩线',
      icon: LineChart,
      description: '江恩角度线 - 时间价格关系分析',
      color: 'text-purple-600',
      category: '趋势分析'
    },
    {
      name: '爱德华兹趋势',
      icon: TrendingUp,
      description: '趋势线分析 - 支撑阻力位和经典形态识别',
      color: 'text-blue-600',
      category: '趋势分析'
    },
    {
      name: '艾略特波浪',
      icon: Activity,
      description: '波浪理论 - 波浪结构和周期分析',
      color: 'text-indigo-600',
      category: '趋势分析'
    },
    // 现代分析理论 (3个)
    {
      name: '换手率分析',
      icon: DollarSign,
      description: '市场活跃度 - 资金流向和交易热度',
      color: 'text-orange-600',
      category: '现代分析'
    },
    {
      name: '墨菲市场间',
      icon: BarChart2,
      description: '多时间框架 - 短中长期趋势一致性分析',
      color: 'text-teal-600',
      category: '现代分析'
    },
    {
      name: '日本蜡烛图',
      icon: BarChart3,
      description: 'K线形态 - 反转信号和持续形态识别',
      color: 'text-red-600',
      category: '现代分析'
    }
  ]

  const fundamentalMetrics = [
    { name: 'PE/PB比率', icon: BarChart3, description: '估值指标分析' },
    { name: 'ROE', icon: TrendingUp, description: '净资产收益率' },
    { name: '成长性', icon: Zap, description: '营收和利润增长' },
    { name: '行业分析', icon: Building2, description: '行业地位和排名' },
    { name: '机构持股', icon: Users, description: '机构投资者持股比例' },
    { name: '财务健康', icon: Award, description: '综合财务状况评估' }
  ]

  const features = [
    {
      title: '技术分析',
      icon: BarChart3,
      description: '13大专业技术分析方法',
      items: [
        '经典指标：MACD、KDJ、RSI、布林带、威廉%R',
        '趋势分析：均线、量能、江恩线、爱德华兹趋势、艾略特波浪',
        '现代分析：换手率、墨菲市场间、日本蜡烛图'
      ],
      link: '/stock-analysis'
    },
    {
      title: '基本面分析',
      icon: Building2,
      description: '全面的财务指标分析',
      items: ['PE/PB估值', 'ROE盈利能力', '成长性分析', '行业地位', '机构持股', '财务评级'],
      link: '/stock-analysis'
    },
    {
      title: 'K线图表',
      icon: LineChart,
      description: '专业的股价走势图',
      items: ['30天K线', '价格网格', '涨跌统计', '高低点标记'],
      link: '/stock-analysis'
    },
    {
      title: '江恩线分析',
      icon: Target,
      description: '江恩理论技术分析',
      items: ['1x1线', '2x1线', '1x2线', '支撑阻力', '角度分析', '趋势判断'],
      link: '/stock-analysis'
    },
    {
      title: '自选股管理',
      icon: Star,
      description: '个人股票关注列表',
      items: ['添加自选股', '快速分析', '批量管理', '一键跳转'],
      link: '/watchlist'
    },
    {
      title: '智能预警',
      icon: Bell,
      description: '实时价格和指标预警',
      items: ['价格预警', '技术指标预警', '实时监控', '预警管理'],
      link: '/alerts'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          专业股票分析系统
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          集成13大技术分析方法、基本面分析、三大经典理论于一体的华尔街级股票分析平台
        </p>
        <div className="bg-blue-50 rounded-lg p-4 max-w-4xl mx-auto">
          <p className="text-blue-800 font-medium">
            🚀 新增三大经典技术分析理论：爱德华兹趋势分析、墨菲市场间分析、日本蜡烛图分析
          </p>
        </div>
      </div>

      {/* Stock Navigation */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">股票功能导航</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stockNavigation.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                to={item.href}
                className={`${item.color} text-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
              >
                <div className="flex flex-col items-center">
                  <Icon className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <Link
            key={index}
            to={feature.link}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-center gap-3 mb-4">
              <feature.icon className="w-8 h-8 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {feature.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center text-primary-600 text-sm font-medium">
              <span>立即使用</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Technical Indicators */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">13大技术分析方法详解</h2>

        {/* 经典技术指标 */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            经典技术指标 (5个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalIndicators.filter(indicator => indicator.category === '经典指标').map((indicator, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
                  <h4 className="font-semibold text-gray-900">{indicator.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 趋势分析方法 */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            趋势分析方法 (5个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalIndicators.filter(indicator => indicator.category === '趋势分析').map((indicator, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-white rounded-lg p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
                  <h4 className="font-semibold text-gray-900">{indicator.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 现代分析理论 */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            现代分析理论 (3个)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalIndicators.filter(indicator => indicator.category === '现代分析').map((indicator, index) => (
              <div key={index} className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
                  <h4 className="font-semibold text-gray-900">{indicator.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{indicator.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classical Analysis Theories */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">三大经典技术分析理论</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Edwards Trend Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-bold text-gray-900">爱德华兹趋势分析</h3>
                <p className="text-sm text-blue-600">Robert D. Edwards</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>趋势线分析：计算趋势斜率和相关性</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>支撑阻力位：自动识别关键价位</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>经典形态：头肩顶底、双顶底识别</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>趋势强度：强/中等/弱趋势评估</span>
              </li>
            </ul>
          </div>

          {/* Murphy Intermarket Analysis */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="w-8 h-8 text-teal-600" />
              <div>
                <h3 className="font-bold text-gray-900">墨菲市场间分析</h3>
                <p className="text-sm text-teal-600">John J. Murphy</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>多时间框架：短期、中期、长期分析</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>趋势一致性：多头/空头排列判断</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>动量分析：多周期动量强度评级</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>相对强度：个股与大盘比较</span>
              </li>
            </ul>
          </div>

          {/* Japanese Candlestick Analysis */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-bold text-gray-900">日本蜡烛图分析</h3>
                <p className="text-sm text-red-600">Japanese Candlestick</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>单根K线：十字星、锤子线、射击之星</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>组合形态：早晨之星、黄昏之星</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>反转信号：吞没形态、刺透形态</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>概率分析：反转和持续概率评估</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fundamental Analysis */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">基本面分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fundamentalMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <metric.icon className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{metric.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Advantages */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">系统优势</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">专业分析</h3>
            <p className="text-sm text-gray-600">13大技术分析方法 + 三大经典理论 + 完整基本面分析</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">实时数据</h3>
            <p className="text-sm text-gray-600">实时股价和市场状态监控</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">智能建议</h3>
            <p className="text-sm text-gray-600">基于多维度分析的投资建议</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">个性化</h3>
            <p className="text-sm text-gray-600">自选股管理和个性化预警</p>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">1</div>
            <h3 className="font-semibold text-gray-900 mb-2">输入股票代码</h3>
            <p className="text-sm text-gray-600">输入您想分析的股票代码，如000001、600519等</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">2</div>
            <h3 className="font-semibold text-gray-900 mb-2">查看分析结果</h3>
            <p className="text-sm text-gray-600">获得完整的技术分析和基本面分析报告</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">3</div>
            <h3 className="font-semibold text-gray-900 mb-2">制定投资策略</h3>
            <p className="text-sm text-gray-600">基于分析结果制定您的投资决策</p>
          </div>
        </div>
        <div className="mt-8">
          <Link
            to="/stock-analysis"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
          >
            <BarChart3 className="w-5 h-5" />
            立即开始分析
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default StockFeatures
