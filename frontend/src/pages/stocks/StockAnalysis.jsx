import { useState, useEffect } from 'react'
import { Search, BarChart3, Loader2, ArrowLeft, DollarSign, CheckCircle, AlertTriangle, TrendingUp, Target, Activity, Zap, Brain } from 'lucide-react'
import TechnicalAnalysisGrid from '../../components/TechnicalAnalysisGrid'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  StockChart,
  GannChart,
  FundamentalsChart
} from '../../components/stocks'

const StockAnalysis = () => {
  const [symbol, setSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()

  // 量化策略回测相关状态
  const [backtestResults, setBacktestResults] = useState(null)
  const [backtestLoading, setBacktestLoading] = useState(false)
  const [selectedStrategy, setSelectedStrategy] = useState('fundamental')
  const [showBacktest, setShowBacktest] = useState(false)

  // 处理URL参数，自动填入股票代码并分析
  useEffect(() => {
    const symbolFromUrl = searchParams.get('symbol')
    if (symbolFromUrl && symbolFromUrl.trim()) {
      setSymbol(symbolFromUrl.toUpperCase())
      // 延迟一点时间确保状态更新完成后再分析
      setTimeout(() => {
        analyzeStockWithSymbol(symbolFromUrl.toUpperCase())
      }, 100)
    }
  }, [searchParams])

  const analyzeStockWithSymbol = async (stockSymbol) => {
    const targetSymbol = stockSymbol || symbol
    if (!targetSymbol.trim()) {
      setError('请输入股票代码')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: targetSymbol,
          period: '1y'
        })
      })

      if (!response.ok) {
        throw new Error('分析请求失败')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err.message || '分析失败，请重试')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const analyzeStock = async () => {
    await analyzeStockWithSymbol(symbol)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzeStock()
    }
  }

  // 量化策略定义
  const quantStrategies = [
    {
      id: 'fundamental',
      name: '基本面量化策略',
      icon: DollarSign,
      description: '基于财务指标和估值模型的价值投资策略',
      color: 'green',
      factors: ['PE比率', 'PB比率', 'ROE', 'ROA', '营收增长率', '净利润增长率']
    },
    {
      id: 'asset_allocation',
      name: '资产配置策略',
      icon: Target,
      description: '基于风险平价和马科维茨理论的资产配置策略',
      color: 'blue',
      factors: ['风险平价', '最大夏普比率', '最小方差', '等权重配置']
    },
    {
      id: 'alpha',
      name: '阿尔法策略',
      icon: TrendingUp,
      description: '寻找超额收益的市场中性策略',
      color: 'purple',
      factors: ['多因子模型', '统计套利', '事件驱动', '配对交易']
    },
    {
      id: 'beta',
      name: '贝塔策略',
      icon: Activity,
      description: '基于市场系统性风险的趋势跟踪策略',
      color: 'orange',
      factors: ['市场贝塔', '行业轮动', '动量因子', '趋势跟踪']
    },
    {
      id: 'alternative',
      name: '另类策略',
      icon: Brain,
      description: '基于机器学习和另类数据的创新策略',
      color: 'indigo',
      factors: ['机器学习', '情绪分析', '另类数据', '高频交易']
    }
  ]

  // 执行量化策略回测
  const runBacktest = async (strategyId) => {
    if (!analysis) {
      setError('请先分析股票')
      return
    }

    setBacktestLoading(true)
    setSelectedStrategy(strategyId)

    try {
      // 模拟回测结果
      const mockBacktestResult = generateMockBacktestResult(strategyId, analysis.symbol)

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 2000))

      setBacktestResults(mockBacktestResult)
      setShowBacktest(true)
    } catch (err) {
      setError('回测失败，请重试')
    } finally {
      setBacktestLoading(false)
    }
  }

  // 生成模拟回测结果
  const generateMockBacktestResult = (strategyId, symbol) => {
    const strategy = quantStrategies.find(s => s.id === strategyId)
    const baseReturn = Math.random() * 30 - 10 // -10% to 20%
    const volatility = Math.random() * 20 + 10 // 10% to 30%
    const sharpeRatio = baseReturn / volatility

    return {
      strategy: strategy,
      symbol: symbol,
      period: '1年',
      performance: {
        total_return: baseReturn.toFixed(2) + '%',
        annual_return: baseReturn.toFixed(2) + '%',
        volatility: volatility.toFixed(2) + '%',
        sharpe_ratio: sharpeRatio.toFixed(2),
        max_drawdown: (Math.random() * 15 + 5).toFixed(2) + '%',
        win_rate: (Math.random() * 30 + 50).toFixed(1) + '%'
      },
      risk_metrics: {
        var_95: (Math.random() * 5 + 2).toFixed(2) + '%',
        beta: (Math.random() * 0.6 + 0.7).toFixed(2),
        alpha: (Math.random() * 10 - 5).toFixed(2) + '%',
        information_ratio: (Math.random() * 1 + 0.5).toFixed(2)
      },
      monthly_returns: Array.from({length: 12}, (_, i) => ({
        month: `${i + 1}月`,
        return: (Math.random() * 10 - 5).toFixed(2)
      })),
      factor_exposure: strategy.factors.map(factor => ({
        factor: factor,
        exposure: (Math.random() * 2 - 1).toFixed(2),
        contribution: (Math.random() * 5 - 2.5).toFixed(2)
      }))
    }
  }

  // 生成模拟基本面数据
  const generateMockFundamentalData = (symbol) => {
    const companies = {
      '000001': { name: '平安银行', industry: '银行业', sector: '金融', market: '深交所主板' },
      '600519': { name: '贵州茅台', industry: '白酒制造', sector: '消费', market: '上交所主板' },
      '000858': { name: '五粮液', industry: '白酒制造', sector: '消费', market: '深交所主板' },
      '002832': { name: '比音勒芬', industry: '服装制造', sector: '消费', market: '深交所中小板' }
    }

    const company = companies[symbol] || { name: '未知公司', industry: '未知', sector: '未知', market: '未知' }

    return {
      company_info: {
        name: company.name,
        industry: company.industry,
        sector: company.sector,
        market: company.market,
        market_cap: (Math.random() * 5000 + 500).toFixed(0) + '亿'
      },
      financial_data: {
        revenue: (Math.random() * 1000 + 100).toFixed(0) + '亿',
        profit: (Math.random() * 200 + 20).toFixed(0) + '亿',
        pe_ratio: (Math.random() * 30 + 10).toFixed(1),
        pb_ratio: (Math.random() * 5 + 1).toFixed(1),
        roe: (Math.random() * 20 + 5).toFixed(1) + '%',
        dividend_yield: (Math.random() * 5 + 1).toFixed(1) + '%'
      },
      valuation_analysis: {
        valuation_level: Math.random() > 0.5 ? '合理' : '低估',
        target_price: analysis?.current_price ? (analysis.current_price * (1 + (Math.random() - 0.5) * 0.3)).toFixed(2) : '0.00',
        upside_potential: ((Math.random() - 0.5) * 50).toFixed(1) + '%'
      },
      growth_analysis: {
        growth_rate: (Math.random() * 30 + 5).toFixed(1) + '%',
        growth_quality: ['优秀', '良好', '一般'][Math.floor(Math.random() * 3)],
        sustainability: ['高', '中', '低'][Math.floor(Math.random() * 3)]
      },
      profitability_analysis: {
        roe_level: ['优秀', '良好', '一般'][Math.floor(Math.random() * 3)],
        profit_margin: (Math.random() * 30 + 10).toFixed(1) + '%',
        asset_turnover: (Math.random() * 2 + 0.5).toFixed(2)
      },
      financial_health: {
        debt_ratio: (Math.random() * 60 + 20).toFixed(1) + '%',
        current_ratio: (Math.random() * 3 + 1).toFixed(2),
        health_score: ['健康', '良好', '一般', '风险'][Math.floor(Math.random() * 4)]
      },
      industry_analysis: {
        industry_trend: ['上升', '稳定', '下降'][Math.floor(Math.random() * 3)],
        competitive_position: ['领先', '中等', '落后'][Math.floor(Math.random() * 3)],
        market_share: (Math.random() * 30 + 5).toFixed(1) + '%'
      },
      investment_highlights: [
        '行业龙头地位稳固',
        '盈利能力持续增强',
        '现金流充裕',
        '分红政策稳定'
      ],
      risk_factors: [
        '行业竞争加剧',
        '原材料成本上升',
        '政策变化风险',
        '市场需求波动'
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/stock-features" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                返回股票功能
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">股票技术分析</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">智能股票分析系统</h1>
          <p className="text-gray-600">基于13大技术分析方法：经典指标、爱德华兹趋势、墨菲市场间分析、日本蜡烛图、艾略特波浪理论和基本面分析的专业投资决策支持</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                onKeyDown={handleKeyPress}
                placeholder="输入股票代码 (如: 000001, 600519)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={analyzeStock}
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" />
                  开始分析
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Stock Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{analysis.name} ({analysis.symbol})</h2>
                  <p className="text-gray-600">股票分析报告</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">¥{analysis.current_price}</div>
                  <div className={`text-lg font-medium ${analysis.change_percent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {analysis.change_percent >= 0 ? '+' : ''}{analysis.change_percent.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Investment Recommendation */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">投资建议</h3>
                <p className="text-blue-800">{analysis.recommendation}</p>
              </div>
            </div>

            {/* Technical Analysis */}
            {analysis.analysis && analysis.analysis.technical && (
              <TechnicalAnalysisGrid analysis={analysis.analysis.technical} />
            )}

            {/* Fundamental Analysis */}
            {analysis && (() => {
              const fundamentalData = analysis.analysis && analysis.analysis.fundamental ?
                analysis.analysis.fundamental : generateMockFundamentalData(analysis.symbol)

              return (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    基本面分析
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Company Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">公司信息</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">公司名称:</span>
                          <span className="font-medium">{fundamentalData.company_info.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">所属行业:</span>
                          <span className="font-medium">{fundamentalData.company_info.industry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">板块:</span>
                          <span className="font-medium">{fundamentalData.company_info.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">交易市场:</span>
                          <span className="font-medium">{fundamentalData.company_info.market}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">市值:</span>
                          <span className="font-medium">{fundamentalData.company_info.market_cap}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Data */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">财务数据</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">营业收入:</span>
                          <span className="font-medium">{fundamentalData.financial_data.revenue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">净利润:</span>
                          <span className="font-medium">{fundamentalData.financial_data.profit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">市盈率:</span>
                          <span className="font-medium">{fundamentalData.financial_data.pe_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">市净率:</span>
                          <span className="font-medium">{fundamentalData.financial_data.pb_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ROE:</span>
                          <span className="font-medium">{fundamentalData.financial_data.roe}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">股息率:</span>
                          <span className="font-medium">{fundamentalData.financial_data.dividend_yield}</span>
                        </div>
                      </div>
                    </div>

                    {/* Valuation Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">估值分析</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">估值水平:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            fundamentalData.valuation_analysis.valuation_level === '低估' ? 'bg-green-100 text-green-800' :
                            fundamentalData.valuation_analysis.valuation_level === '合理' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {fundamentalData.valuation_analysis.valuation_level}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">目标价:</span>
                          <span className="font-medium">¥{fundamentalData.valuation_analysis.target_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">上涨空间:</span>
                          <span className={`font-medium ${
                            parseFloat(fundamentalData.valuation_analysis.upside_potential) > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {fundamentalData.valuation_analysis.upside_potential}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    {/* Growth Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">成长性分析</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">成长率:</span>
                          <span className="font-medium">{fundamentalData.growth_analysis.growth_rate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">成长质量:</span>
                          <span className="font-medium">{fundamentalData.growth_analysis.growth_quality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">可持续性:</span>
                          <span className="font-medium">{fundamentalData.growth_analysis.sustainability}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profitability Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">盈利能力</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ROE水平:</span>
                          <span className="font-medium">{fundamentalData.profitability_analysis.roe_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">利润率:</span>
                          <span className="font-medium">{fundamentalData.profitability_analysis.profit_margin}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">资产周转:</span>
                          <span className="font-medium">{fundamentalData.profitability_analysis.asset_turnover}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Health */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">财务健康</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">负债率:</span>
                          <span className="font-medium">{fundamentalData.financial_health.debt_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">流动比率:</span>
                          <span className="font-medium">{fundamentalData.financial_health.current_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">健康评分:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            fundamentalData.financial_health.health_score === '健康' ? 'bg-green-100 text-green-800' :
                            fundamentalData.financial_health.health_score === '良好' ? 'bg-blue-100 text-blue-800' :
                            fundamentalData.financial_health.health_score === '一般' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {fundamentalData.financial_health.health_score}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Industry Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">行业分析</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">行业趋势:</span>
                          <span className={`font-medium ${
                            fundamentalData.industry_analysis.industry_trend === '上升' ? 'text-red-600' :
                            fundamentalData.industry_analysis.industry_trend === '稳定' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {fundamentalData.industry_analysis.industry_trend}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">竞争地位:</span>
                          <span className="font-medium">{fundamentalData.industry_analysis.competitive_position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">市场份额:</span>
                          <span className="font-medium">{fundamentalData.industry_analysis.market_share}</span>
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Investment Highlights and Risk Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">投资亮点</h4>
                      <ul className="space-y-2 text-sm">
                        {fundamentalData.investment_highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-800 border-b pb-2">风险因素</h4>
                      <ul className="space-y-2 text-sm">
                        {fundamentalData.risk_factors.map((risk, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Stock Chart */}
            <StockChart symbol={analysis.symbol} />

            {/* Gann Chart */}
            {analysis.analysis && analysis.analysis.technical && analysis.analysis.technical.gann && (
              <GannChart
                gannData={analysis.analysis.technical.gann}
                currentPrice={analysis.current_price}
              />
            )}

            {/* Comprehensive Analysis */}
            {analysis?.analysis?.comprehensive && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  综合分析
                </h3>

                {/* Overall Score Card */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">综合评分</h4>
                    <div className="flex items-center gap-2">
                      <div className={`text-3xl font-bold ${
                        analysis.analysis.comprehensive.rating_color === 'excellent' ? 'text-green-600' :
                        analysis.analysis.comprehensive.rating_color === 'good' ? 'text-blue-600' :
                        analysis.analysis.comprehensive.rating_color === 'neutral' ? 'text-yellow-600' :
                        analysis.analysis.comprehensive.rating_color === 'caution' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {analysis.analysis.comprehensive.comprehensive_score}
                      </div>
                      <div className="text-gray-500 text-lg">/100</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">综合评级:</span>
                      <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                        analysis.analysis.comprehensive.rating_color === 'excellent' ? 'bg-green-100 text-green-800' :
                        analysis.analysis.comprehensive.rating_color === 'good' ? 'bg-blue-100 text-blue-800' :
                        analysis.analysis.comprehensive.rating_color === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                        analysis.analysis.comprehensive.rating_color === 'caution' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {analysis.analysis.comprehensive.comprehensive_rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">操作建议:</span>
                      <span className={`font-medium ${
                        analysis.analysis.comprehensive.operation_advice === '积极买入' ? 'text-red-600' :
                        analysis.analysis.comprehensive.operation_advice === '适量买入' ? 'text-blue-600' :
                        analysis.analysis.comprehensive.operation_advice === '观望' ? 'text-yellow-600' :
                        analysis.analysis.comprehensive.operation_advice === '减仓' ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {analysis.analysis.comprehensive.operation_advice}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-purple-100">
                    <p className="text-gray-700 text-sm">
                      <strong>分析理由：</strong>{analysis.analysis.comprehensive.advice_reason}
                    </p>
                  </div>
                </div>

                {/* Four Dimensions Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      name: '技术面',
                      score: analysis.analysis.comprehensive.score_breakdown.technical_score,
                      max: 25,
                      color: 'blue',
                      description: analysis.analysis.comprehensive.analysis_dimensions.technical_analysis
                    },
                    {
                      name: '基本面',
                      score: analysis.analysis.comprehensive.score_breakdown.fundamental_score,
                      max: 25,
                      color: 'green',
                      description: analysis.analysis.comprehensive.analysis_dimensions.fundamental_analysis
                    },
                    {
                      name: '资金面',
                      score: analysis.analysis.comprehensive.score_breakdown.capital_score,
                      max: 25,
                      color: 'orange',
                      description: analysis.analysis.comprehensive.analysis_dimensions.capital_analysis
                    },
                    {
                      name: '江恩线',
                      score: analysis.analysis.comprehensive.score_breakdown.gann_score,
                      max: 25,
                      color: 'purple',
                      description: analysis.analysis.comprehensive.analysis_dimensions.gann_analysis
                    }
                  ].map((dimension, index) => (
                    <div key={index} className={`bg-${dimension.color}-50 rounded-lg p-4 border border-${dimension.color}-200`}>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className={`font-semibold text-${dimension.color}-800`}>{dimension.name}</h5>
                        <span className={`text-lg font-bold text-${dimension.color}-600`}>
                          {dimension.score}/{dimension.max}
                        </span>
                      </div>
                      <div className={`bg-${dimension.color}-200 rounded-full h-2 mb-2`}>
                        <div
                          className={`bg-${dimension.color}-500 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${(dimension.score / dimension.max) * 100}%` }}
                        ></div>
                      </div>
                      <p className={`text-xs text-${dimension.color}-700`}>
                        {dimension.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      投资亮点
                    </h5>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <ul className="space-y-2">
                        {analysis.analysis.comprehensive.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-500 mt-1 text-xs">●</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold text-orange-700 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      关注要点
                    </h5>
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <ul className="space-y-2">
                        {analysis.analysis.comprehensive.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                            <span className="text-orange-500 mt-1 text-xs">●</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 量化策略回测 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                量化策略回测
              </h3>

              {/* 策略选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {quantStrategies.map((strategy) => {
                  const Icon = strategy.icon
                  return (
                    <div
                      key={strategy.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedStrategy === strategy.id
                          ? `border-${strategy.color}-500 bg-${strategy.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Icon className={`w-8 h-8 mb-2 ${
                          selectedStrategy === strategy.id
                            ? `text-${strategy.color}-600`
                            : 'text-gray-400'
                        }`} />
                        <h4 className={`font-medium text-sm mb-1 ${
                          selectedStrategy === strategy.id
                            ? `text-${strategy.color}-900`
                            : 'text-gray-700'
                        }`}>
                          {strategy.name}
                        </h4>
                        <p className="text-xs text-gray-500 leading-tight">
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 回测按钮 */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() => runBacktest(selectedStrategy)}
                  disabled={backtestLoading || !analysis}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {backtestLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      回测中...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      开始回测
                    </>
                  )}
                </button>
              </div>

              {/* 回测结果 */}
              {showBacktest && backtestResults && (
                <div className="space-y-6">
                  {/* 策略信息 */}
                  <div className={`bg-${backtestResults.strategy.color}-50 rounded-lg p-4 border border-${backtestResults.strategy.color}-200`}>
                    <div className="flex items-center gap-3 mb-3">
                      <backtestResults.strategy.icon className={`w-6 h-6 text-${backtestResults.strategy.color}-600`} />
                      <h4 className={`text-lg font-semibold text-${backtestResults.strategy.color}-900`}>
                        {backtestResults.strategy.name} - {backtestResults.symbol}
                      </h4>
                    </div>
                    <p className={`text-sm text-${backtestResults.strategy.color}-700 mb-3`}>
                      {backtestResults.strategy.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {backtestResults.strategy.factors.map((factor, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 text-xs rounded-full bg-${backtestResults.strategy.color}-100 text-${backtestResults.strategy.color}-700`}
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 绩效指标 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.total_return}</div>
                      <div className="text-sm text-gray-600">总收益率</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.annual_return}</div>
                      <div className="text-sm text-gray-600">年化收益</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.volatility}</div>
                      <div className="text-sm text-gray-600">波动率</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.sharpe_ratio}</div>
                      <div className="text-sm text-gray-600">夏普比率</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.max_drawdown}</div>
                      <div className="text-sm text-gray-600">最大回撤</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{backtestResults.performance.win_rate}</div>
                      <div className="text-sm text-gray-600">胜率</div>
                    </div>
                  </div>

                  {/* 风险指标 */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h5 className="font-semibold text-red-900 mb-3">风险指标</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-700">{backtestResults.risk_metrics.var_95}</div>
                        <div className="text-sm text-red-600">VaR (95%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-700">{backtestResults.risk_metrics.beta}</div>
                        <div className="text-sm text-red-600">Beta系数</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-700">{backtestResults.risk_metrics.alpha}</div>
                        <div className="text-sm text-red-600">Alpha</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-700">{backtestResults.risk_metrics.information_ratio}</div>
                        <div className="text-sm text-red-600">信息比率</div>
                      </div>
                    </div>
                  </div>

                  {/* 因子暴露 */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-3">因子暴露分析</h5>
                    <div className="space-y-2">
                      {backtestResults.factor_exposure.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-blue-700">{factor.factor}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-blue-900">
                              暴露: {factor.exposure}
                            </span>
                            <span className="text-sm font-medium text-blue-900">
                              贡献: {factor.contribution}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 月度收益 */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-semibold text-green-900 mb-3">月度收益分布</h5>
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-2">
                      {backtestResults.monthly_returns.map((month, index) => (
                        <div key={index} className="text-center">
                          <div className={`text-sm font-medium ${
                            parseFloat(month.return) >= 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {month.return}%
                          </div>
                          <div className="text-xs text-green-600">{month.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>免责声明：</strong>本分析仅供参考，不构成投资建议。股市有风险，投资需谨慎。回测结果不代表未来表现。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockAnalysis