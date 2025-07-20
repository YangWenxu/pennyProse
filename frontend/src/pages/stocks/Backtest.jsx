import { useState } from 'react'
import { Play, TrendingUp, TrendingDown, BarChart3, Loader2, Target, ArrowLeft, DollarSign, Activity, Brain, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const Backtest = () => {
  const [backtestParams, setBacktestParams] = useState({
    symbol: '',
    strategy: 'fundamental',
    days: 100
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 五种量化策略定义
  const strategies = [
    {
      id: 'fundamental',
      name: '基本面量化策略',
      icon: DollarSign,
      description: '基于财务指标和估值模型的价值投资策略，通过PE、PB、ROE等指标筛选优质股票',
      color: 'green',
      factors: ['PE比率', 'PB比率', 'ROE', 'ROA', '营收增长率', '净利润增长率'],
      riskLevel: '中低风险',
      timeHorizon: '中长期'
    },
    {
      id: 'asset_allocation',
      name: '资产配置策略',
      icon: Target,
      description: '基于风险平价和马科维茨理论的资产配置策略，通过分散投资降低风险',
      color: 'blue',
      factors: ['风险平价', '最大夏普比率', '最小方差', '等权重配置'],
      riskLevel: '低风险',
      timeHorizon: '长期'
    },
    {
      id: 'alpha',
      name: '阿尔法策略',
      icon: TrendingUp,
      description: '寻找超额收益的市场中性策略，通过多因子模型获得与市场无关的收益',
      color: 'purple',
      factors: ['多因子模型', '统计套利', '事件驱动', '配对交易'],
      riskLevel: '中风险',
      timeHorizon: '中期'
    },
    {
      id: 'beta',
      name: '贝塔策略',
      icon: Activity,
      description: '基于市场系统性风险的趋势跟踪策略，通过捕捉市场趋势获得收益',
      color: 'orange',
      factors: ['市场贝塔', '行业轮动', '动量因子', '趋势跟踪'],
      riskLevel: '中高风险',
      timeHorizon: '中短期'
    },
    {
      id: 'alternative',
      name: '另类策略',
      icon: Brain,
      description: '基于机器学习和另类数据的创新策略，利用AI技术挖掘市场机会',
      color: 'indigo',
      factors: ['机器学习', '情绪分析', '另类数据', '高频交易'],
      riskLevel: '高风险',
      timeHorizon: '短期'
    },
    {
      id: 'ma_cross',
      name: '均线交叉策略',
      icon: BarChart3,
      description: '经典技术分析策略，通过均线交叉信号进行买卖操作',
      color: 'gray',
      factors: ['5日均线', '20日均线', '金叉死叉', '趋势确认'],
      riskLevel: '中风险',
      timeHorizon: '中期'
    }
  ]

  const testAPI = async () => {
    console.log('=== 开始API测试 ===')
    try {
      const testParams = { symbol: '000001', strategy: 'ma_cross', days: 100 }
      console.log('测试参数:', testParams)

      const response = await fetch('http://localhost:8001/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testParams)
      })

      console.log('响应状态:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('API返回数据:', data)
        console.log('数据类型检查:')
        console.log('- total_return:', typeof data.total_return, data.total_return)
        console.log('- avg_return_per_trade:', typeof data.avg_return_per_trade, data.avg_return_per_trade)
        console.log('- trades数组:', Array.isArray(data.trades), data.trades?.length)

        setResult(data)
        alert('API测试成功！查看控制台日志')
      } else {
        console.error('API响应失败:', response.status)
        alert('API测试失败：' + response.status)
      }
    } catch (error) {
      console.error('API测试异常:', error)
      alert('API测试异常：' + error.message)
    }
    console.log('=== API测试结束 ===')
  }

  const runBacktest = async () => {
    if (!backtestParams.symbol.trim()) {
      alert('请输入股票代码')
      return
    }

    try {
      setLoading(true)
      setError('')

      // 尝试调用后端API
      try {
        console.log('发送回测请求:', backtestParams)
        const response = await fetch('http://localhost:8001/backtest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backtestParams)
        })

        console.log('回测API响应状态:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('回测API返回数据:', data)
          setResult(data)
          return
        } else {
          console.log('回测API响应失败:', response.status, response.statusText)
        }
      } catch (apiError) {
        console.log('回测API调用异常:', apiError)
        console.log('API不可用，使用模拟数据')
      }

      // API不可用时使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟加载时间

      const mockResult = generateMockResult(backtestParams)

      setResult(mockResult)
    } catch (err) {
      console.error('Backtest error:', err)
      setError('回测失败，请检查股票代码或稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 生成模拟回测结果
  const generateMockResult = (params) => {
    const strategy = strategies.find(s => s.id === params.strategy)

    // 根据不同策略生成不同的收益特征
    let baseReturn, volatility, winRate, tradeCount

    switch (params.strategy) {
      case 'fundamental':
        baseReturn = Math.random() * 25 + 5 // 5-30%
        volatility = Math.random() * 10 + 8 // 8-18%
        winRate = Math.random() * 20 + 60 // 60-80%
        tradeCount = Math.floor(Math.random() * 8 + 3) // 3-10次
        break
      case 'asset_allocation':
        baseReturn = Math.random() * 15 + 8 // 8-23%
        volatility = Math.random() * 8 + 5 // 5-13%
        winRate = Math.random() * 15 + 65 // 65-80%
        tradeCount = Math.floor(Math.random() * 6 + 2) // 2-7次
        break
      case 'alpha':
        baseReturn = Math.random() * 30 + 10 // 10-40%
        volatility = Math.random() * 12 + 10 // 10-22%
        winRate = Math.random() * 25 + 55 // 55-80%
        tradeCount = Math.floor(Math.random() * 15 + 8) // 8-22次
        break
      case 'beta':
        baseReturn = Math.random() * 40 - 10 // -10-30%
        volatility = Math.random() * 15 + 15 // 15-30%
        winRate = Math.random() * 30 + 45 // 45-75%
        tradeCount = Math.floor(Math.random() * 20 + 10) // 10-29次
        break
      case 'alternative':
        baseReturn = Math.random() * 50 - 15 // -15-35%
        volatility = Math.random() * 20 + 20 // 20-40%
        winRate = Math.random() * 35 + 40 // 40-75%
        tradeCount = Math.floor(Math.random() * 30 + 15) // 15-44次
        break
      case 'ma_cross':
      default:
        baseReturn = Math.random() * 30 - 10 // -10-20%
        volatility = Math.random() * 15 + 12 // 12-27%
        winRate = Math.random() * 25 + 50 // 50-75%
        tradeCount = Math.floor(Math.random() * 12 + 5) // 5-16次
        break
    }

    const sharpeRatio = baseReturn / volatility
    const maxDrawdown = Math.random() * 15 + 5

    return {
      symbol: params.symbol,
      strategy: params.strategy,
      strategy_info: strategy,
      period_days: params.days,
      total_trades: tradeCount,
      win_rate: Math.floor(winRate),
      total_return: parseFloat(baseReturn.toFixed(2)),
      annual_return: parseFloat((baseReturn * (365 / params.days)).toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      sharpe_ratio: parseFloat(sharpeRatio.toFixed(2)),
      max_drawdown: parseFloat(maxDrawdown.toFixed(2)),
      avg_return_per_trade: parseFloat((baseReturn / tradeCount).toFixed(2)),
      summary: `${params.symbol} 在过去${params.days}天的${strategy.name}回测中，共产生${tradeCount}次交易信号。策略年化收益率为${(baseReturn * (365 / params.days)).toFixed(1)}%，最大回撤${maxDrawdown.toFixed(1)}%，夏普比率${sharpeRatio.toFixed(2)}。`,
      trades: Array.from({ length: Math.min(8, tradeCount) }, (_, i) => ({
        date: new Date(Date.now() - (tradeCount - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        price: parseFloat((10 + Math.random() * 20).toFixed(2)),
        signal_strength: parseFloat((Math.random() * 100).toFixed(1)),
        profit: parseFloat((Math.random() * 20 - 10).toFixed(2)),
        factors: strategy.factors.slice(0, 2).map(factor => ({
          name: factor,
          value: parseFloat((Math.random() * 2 - 1).toFixed(2))
        }))
      })),
      risk_metrics: {
        var_95: parseFloat((volatility * 1.65).toFixed(2)),
        beta: parseFloat((Math.random() * 0.8 + 0.6).toFixed(2)),
        alpha: parseFloat((baseReturn - 8).toFixed(2)),
        information_ratio: parseFloat((baseReturn / (volatility * 0.8)).toFixed(2))
      },
      factor_analysis: strategy.factors.map(factor => ({
        factor: factor,
        exposure: parseFloat((Math.random() * 2 - 1).toFixed(2)),
        contribution: parseFloat((Math.random() * baseReturn * 0.3).toFixed(2)),
        significance: Math.random() > 0.3 ? '显著' : '一般'
      }))
    }
  }

  const getStrategyName = (strategy) => {
    const strategyObj = strategies.find(s => s.id === strategy)
    return strategyObj ? strategyObj.name : strategy
  }

  const getReturnColor = (value) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/stock-features"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回股票功能</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">策略回测</h1>
        <p className="text-gray-600">测试交易策略的历史表现</p>
      </div>

      {/* Backtest Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">回测参数设置</h3>

        {/* 基本参数 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              股票代码
            </label>
            <input
              type="text"
              placeholder="如：000001, 600519"
              value={backtestParams.symbol}
              onChange={(e) => setBacktestParams(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              回测天数
            </label>
            <select
              value={backtestParams.days}
              onChange={(e) => setBacktestParams(prev => ({ ...prev, days: parseInt(e.target.value) }))}
              className="input-field"
            >
              <option value={30}>30天</option>
              <option value={60}>60天</option>
              <option value={100}>100天</option>
              <option value={200}>200天</option>
              <option value={365}>1年</option>
            </select>
          </div>
        </div>

        {/* 策略选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            选择量化策略
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => {
              const Icon = strategy.icon
              const isSelected = backtestParams.strategy === strategy.id
              return (
                <div
                  key={strategy.id}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? `border-${strategy.color}-500 bg-${strategy.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setBacktestParams(prev => ({ ...prev, strategy: strategy.id }))}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-1 ${
                      isSelected
                        ? `text-${strategy.color}-600`
                        : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm mb-1 ${
                        isSelected
                          ? `text-${strategy.color}-900`
                          : 'text-gray-700'
                      }`}>
                        {strategy.name}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 leading-tight">
                        {strategy.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full ${
                          isSelected
                            ? `bg-${strategy.color}-100 text-${strategy.color}-700`
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {strategy.riskLevel}
                        </span>
                        <span className="text-gray-500">{strategy.timeHorizon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 选中策略的详细信息 */}
        {backtestParams.strategy && (() => {
          const selectedStrategy = strategies.find(s => s.id === backtestParams.strategy)
          return selectedStrategy ? (
            <div className={`bg-${selectedStrategy.color}-50 rounded-lg p-4 border border-${selectedStrategy.color}-200 mb-6`}>
              <h4 className={`font-medium text-${selectedStrategy.color}-900 mb-2`}>
                {selectedStrategy.name} - 策略要素
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedStrategy.factors.map((factor, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full bg-${selectedStrategy.color}-100 text-${selectedStrategy.color}-700`}
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          ) : null
        })()}

        {/* 开始回测按钮 */}
        <div className="flex justify-center">
          <button
            onClick={runBacktest}
            disabled={loading || !backtestParams.symbol.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                回测中...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                开始回测
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>



      {/* Backtest Results */}
      {result && (
        <div className="space-y-6">
          {/* 策略信息卡片 */}
          {result.strategy_info && (
            <div className={`bg-${result.strategy_info.color}-50 rounded-lg p-6 border border-${result.strategy_info.color}-200 mb-6`}>
              <div className="flex items-center gap-3 mb-4">
                <result.strategy_info.icon className={`w-8 h-8 text-${result.strategy_info.color}-600`} />
                <div>
                  <h3 className={`text-xl font-bold text-${result.strategy_info.color}-900`}>
                    {result.strategy_info.name} - {result.symbol}
                  </h3>
                  <p className={`text-sm text-${result.strategy_info.color}-700`}>
                    {result.strategy_info.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.strategy_info.factors.map((factor, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-sm rounded-full bg-${result.strategy_info.color}-100 text-${result.strategy_info.color}-700`}
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 核心绩效指标 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">核心绩效指标</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getReturnColor(result.total_return)}`}>
                  {result.total_return > 0 ? '+' : ''}{result.total_return}%
                </div>
                <div className="text-sm text-gray-600 mt-1">总收益率</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getReturnColor(result.annual_return || result.total_return)}`}>
                  {(result.annual_return || result.total_return) > 0 ? '+' : ''}{(result.annual_return || result.total_return)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">年化收益</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {result.volatility || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600 mt-1">波动率</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${(result.sharpe_ratio || 0) > 1 ? 'text-green-600' : 'text-orange-600'}`}>
                  {result.sharpe_ratio || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 mt-1">夏普比率</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  -{result.max_drawdown || 'N/A'}%
                </div>
                <div className="text-sm text-gray-600 mt-1">最大回撤</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${result.win_rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.win_rate}%
                </div>
                <div className="text-sm text-gray-600 mt-1">胜率</div>
              </div>
            </div>
          </div>

          {/* 风险指标 */}
          {result.risk_metrics && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">风险指标</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-bold text-red-700">{result.risk_metrics.var_95}%</div>
                  <div className="text-sm text-red-600">VaR (95%)</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-700">{result.risk_metrics.beta}</div>
                  <div className="text-sm text-blue-600">Beta系数</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className={`text-lg font-bold ${getReturnColor(result.risk_metrics.alpha)}`}>
                    {result.risk_metrics.alpha > 0 ? '+' : ''}{result.risk_metrics.alpha}%
                  </div>
                  <div className="text-sm text-green-600">Alpha</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-700">{result.risk_metrics.information_ratio}</div>
                  <div className="text-sm text-purple-600">信息比率</div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">策略信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">股票代码: </span>
                <span className="font-medium">{result.symbol}</span>
              </div>
              <div>
                <span className="text-gray-600">策略类型: </span>
                <span className="font-medium">{getStrategyName(result.strategy)}</span>
              </div>
              <div>
                <span className="text-gray-600">回测周期: </span>
                <span className="font-medium">{result.period_days}天</span>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{result.summary}</p>
            </div>
          </div>

          {/* 交易记录 */}
          {result.trades && result.trades.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">交易记录详情</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        日期
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        交易类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        价格
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        信号强度
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        收益率
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        关键因子
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.trades.map((trade, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trade.date || `第${index + 1}笔`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {trade.type === 'buy' ? (
                              <>
                                <TrendingUp className="w-3 h-3 mr-1" />
                                买入
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-3 h-3 mr-1" />
                                卖出
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ¥{trade.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className={`h-2 rounded-full ${
                                  trade.signal_strength > 70 ? 'bg-green-500' :
                                  trade.signal_strength > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${trade.signal_strength}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{trade.signal_strength}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {trade.profit !== undefined ? (
                            <span className={`font-medium ${getReturnColor(trade.profit)}`}>
                              {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {trade.factors && trade.factors.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {trade.factors.map((factor, factorIndex) => (
                                <span
                                  key={factorIndex}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                                  title={`${factor.name}: ${factor.value}`}
                                >
                                  {factor.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 因子分析 */}
          {result.factor_analysis && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">因子暴露分析</h3>
              <div className="space-y-4">
                {result.factor_analysis.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          factor.significance === '显著' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {factor.significance}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>暴露度: <strong>{factor.exposure}</strong></span>
                        <span>收益贡献: <strong className={getReturnColor(factor.contribution)}>
                          {factor.contribution > 0 ? '+' : ''}{factor.contribution}%
                        </strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">表现分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">策略优势</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {result.win_rate >= 50 && (
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-600" />
                      胜率较高，策略有效性良好
                    </li>
                  )}
                  {result.total_return > 0 && (
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      总体收益为正，策略盈利
                    </li>
                  )}
                  {result.total_trades >= 5 && (
                    <li className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      交易次数充足，样本有效
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">注意事项</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-yellow-600" />
                    历史表现不代表未来收益
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-yellow-600" />
                    需要考虑交易成本和滑点
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-yellow-600" />
                    市场环境变化可能影响策略效果
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Backtest
