import { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Loader2, LineChart, Gauge, Target, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  StockChart,
  GannChart,
  FundamentalsChart,
  CompanyInfoCard,
  StockSearchSuggestions
} from '../../components/stocks'

const StockAnalysis = () => {
  const [symbol, setSymbol] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeStock = async () => {
    if (!symbol.trim()) {
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
        body: JSON.stringify({ symbol: symbol.trim() })
      })

      if (!response.ok) {
        throw new Error('分析失败')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      console.error('Stock analysis error:', err)
      setError('股票分析失败，请检查股票代码或稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case '强烈买入':
        return 'text-green-600 bg-green-100'
      case '买入':
        return 'text-green-500 bg-green-50'
      case '持有':
        return 'text-yellow-600 bg-yellow-100'
      case '卖出':
        return 'text-red-500 bg-red-50'
      case '强烈卖出':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0.00'
    return num.toFixed(2)
  }

  // 生成模拟基本面数据
  const generateMockFundamentalData = (symbol) => {
    const companyNames = {
      '000001': '平安银行',
      '000002': '万科A',
      '600036': '招商银行',
      '600519': '贵州茅台',
      '000858': '五粮液'
    }

    const industries = {
      '000001': { industry: '银行', sector: '金融业' },
      '000002': { industry: '房地产开发', sector: '房地产业' },
      '600036': { industry: '银行', sector: '金融业' },
      '600519': { industry: '白酒', sector: '食品饮料' },
      '000858': { industry: '白酒', sector: '食品饮料' }
    }

    const companyName = companyNames[symbol] || `股票-${symbol}`
    const industryInfo = industries[symbol] || { industry: '制造业', sector: '工业' }

    // 根据股票类型生成不同的财务数据
    let financialData, valuation, highlights, risks

    if (['000001', '600036'].includes(symbol)) { // 银行股
      financialData = {
        revenue: 1200.5,
        net_profit: 350.2,
        pe_ratio: 6.8,
        pb_ratio: 0.85,
        roe: 16.5,
        dividend_yield: 4.2
      }
      valuation = "低估"
      highlights = ["银行业龙头企业", "资本充足率高", "风控能力强", "分红稳定"]
      risks = ["利率风险", "信用风险", "政策调控风险"]
    } else if (['600519', '000858'].includes(symbol)) { // 白酒股
      financialData = {
        revenue: 800.3,
        net_profit: 450.1,
        pe_ratio: 18.5,
        pb_ratio: 4.2,
        roe: 25.8,
        dividend_yield: 2.1
      }
      valuation = "合理"
      highlights = ["高端白酒龙头", "品牌价值高", "定价能力强", "现金流充沛"]
      risks = ["消费降级风险", "政策风险", "竞争加剧"]
    } else { // 其他股票
      financialData = {
        revenue: 450.8,
        net_profit: 65.3,
        pe_ratio: 15.2,
        pb_ratio: 2.1,
        roe: 12.5,
        dividend_yield: 2.8
      }
      valuation = "合理"
      highlights = ["行业地位稳固", "技术实力强", "市场份额领先"]
      risks = ["市场竞争风险", "原材料价格波动", "技术更新风险"]
    }

    return {
      company_info: {
        name: companyName,
        industry: industryInfo.industry,
        sector: industryInfo.sector,
        market: symbol.startsWith('0') || symbol.startsWith('3') ? "深圳" : "上海",
        market_cap: (analysis?.current_price || 12.5) * 150.5
      },
      financial_data: financialData,
      industry_analysis: {
        industry_name: industryInfo.industry,
        market_position: ['000001', '600036', '600519'].includes(symbol) ? "行业龙头" : "行业领先"
      },
      valuation_analysis: { overall_valuation: valuation },
      growth_analysis: { growth_level: "稳定增长" },
      profitability_analysis: { roe_level: financialData.roe > 15 ? "优秀" : "良好" },
      financial_health: { health_level: "优秀" },
      investment_highlights: highlights,
      risk_factors: risks
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">股票技术分析</h1>
        <p className="text-gray-600">基于10大技术指标、换手率、艾略特波浪理论和基本面分析的智能股票投资决策支持</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="请输入股票代码（如：000001、600000）"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={analyzeStock}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading ? '分析中...' : '分析'}
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}

        {/* Stock Search Suggestions */}
        <div className="mt-4">
          <StockSearchSuggestions onSelectStock={(stockSymbol) => {
            setSymbol(stockSymbol)
            // 自动开始分析
            setTimeout(() => {
              analyzeStock()
            }, 100)
          }} />
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Stock Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{analysis.name}</h2>
                <p className="text-gray-600">{analysis.symbol}</p>
                {/* Data Source Info */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    analysis.data_source === 'real'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.data_source === 'real' ? '实时数据' : '模拟数据'}
                  </span>
                  {analysis.market_status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysis.market_status === 'open'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {analysis.market_status === 'open' ? '交易中' : '休市'}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    更新: {analysis.last_update}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ¥{formatNumber(analysis.current_price)}
                </div>
                <div className={`text-sm ${analysis.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.change_percent >= 0 ? '+' : ''}{formatNumber(analysis.change_percent)}%
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">投资建议:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}>
                  {analysis.recommendation}
                </span>
              </div>

              {/* Signals */}
              {analysis.signals && (
                <div className="space-y-2">
                  {analysis.signals.technical_signals && analysis.signals.technical_signals.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">技术信号: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.signals.technical_signals.map((signal, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.signals.fundamental_signals && analysis.signals.fundamental_signals.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">基本面信号: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.signals.fundamental_signals.map((signal, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Company Info Card */}
          {analysis.fundamentals && (
            <CompanyInfoCard
              fundamentals={analysis.fundamentals}
              currentPrice={analysis.current_price}
              changePercent={analysis.change_percent}
            />
          )}

          {/* Fundamental Analysis */}
          {analysis && analysis.analysis && analysis.analysis.fundamental && (() => {
            const fundamentalData = analysis.analysis.fundamental
            return (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  基本面分析
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Company Info */}
                  {fundamentalData.company_info && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">公司信息</h4>
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
                        <span className="text-gray-600">所属板块:</span>
                        <span className="font-medium">{fundamentalData.company_info.sector}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">上市市场:</span>
                        <span className="font-medium">{fundamentalData.company_info.market}</span>
                      </div>
                      {fundamentalData.company_info.market_cap > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">市值:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.company_info.market_cap)}亿</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Data */}
                {fundamentalData.financial_data && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">财务数据</h4>
                    <div className="space-y-2 text-sm">
                      {fundamentalData.financial_data.revenue > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">营业收入:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.revenue)}亿</span>
                        </div>
                      )}
                      {fundamentalData.financial_data.net_profit > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">净利润:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.net_profit)}亿</span>
                        </div>
                      )}
                      {fundamentalData.financial_data.pe_ratio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">市盈率:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.pe_ratio)}</span>
                        </div>
                      )}
                      {fundamentalData.financial_data.pb_ratio > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">市净率:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.pb_ratio)}</span>
                        </div>
                      )}
                      {fundamentalData.financial_data.roe > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">净资产收益率:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.roe)}%</span>
                        </div>
                      )}
                      {fundamentalData.financial_data.dividend_yield > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">股息率:</span>
                          <span className="font-medium">{formatNumber(fundamentalData.financial_data.dividend_yield)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Valuation & Analysis */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">估值分析</h4>
                  <div className="space-y-2 text-sm">
                    {fundamentalData.valuation_analysis && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">估值水平:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          fundamentalData.valuation_analysis.overall_valuation === '低估' ? 'bg-green-100 text-green-800' :
                          fundamentalData.valuation_analysis.overall_valuation === '高估' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {fundamentalData.valuation_analysis.overall_valuation}
                        </span>
                      </div>
                    )}

                    {fundamentalData.growth_analysis && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">成长性:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          fundamentalData.growth_analysis.growth_level === '高成长' ? 'bg-green-100 text-green-800' :
                          fundamentalData.growth_analysis.growth_level === '低增长' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {fundamentalData.growth_analysis.growth_level}
                        </span>
                      </div>
                    )}

                    {fundamentalData.profitability_analysis && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">盈利能力:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          fundamentalData.profitability_analysis.roe_level === '优秀' ? 'bg-green-100 text-green-800' :
                          fundamentalData.profitability_analysis.roe_level === '一般' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {fundamentalData.profitability_analysis.roe_level}
                        </span>
                      </div>
                    )}

                    {fundamentalData.financial_health && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">财务健康:</span>
                        <span className={`font-medium px-2 py-1 rounded text-xs ${
                          fundamentalData.financial_health.health_level === '优秀' ? 'bg-green-100 text-green-800' :
                          fundamentalData.financial_health.health_level === '需关注' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {fundamentalData.financial_health.health_level}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Investment Highlights & Risk Factors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Investment Highlights */}
                {fundamentalData.investment_highlights && fundamentalData.investment_highlights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      投资亮点
                    </h4>
                    <div className="space-y-2">
                      {fundamentalData.investment_highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Factors */}
                {fundamentalData.risk_factors && fundamentalData.risk_factors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      风险因素
                    </h4>
                    <div className="space-y-2">
                      {fundamentalData.risk_factors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-700">{risk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            )
          })()}

          {/* Technical Indicators */}
          {analysis.analysis && analysis.analysis.technical && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                技术分析
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* MACD */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">MACD</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">MACD:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.macd.macd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">信号线:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.macd.signal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">趋势:</span>
                      <span className={`font-medium ${analysis.analysis.technical.macd.trend === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.analysis.technical.macd.trend === 'bullish' ? '多头' : '空头'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* KDJ */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900">KDJ</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">K值:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.kdj.k)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">D值:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.kdj.d)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">信号:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.kdj.signal === 'golden_cross' ? 'text-green-600' :
                        analysis.analysis.technical.kdj.signal === 'death_cross' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.kdj.signal === 'golden_cross' ? '金叉' :
                         analysis.analysis.technical.kdj.signal === 'death_cross' ? '死叉' : '中性'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RSI */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium text-gray-900">RSI</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">RSI值:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.rsi.rsi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.rsi.overbought ? 'text-red-600' :
                        analysis.analysis.technical.rsi.oversold ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.rsi.overbought ? '超买' :
                         analysis.analysis.technical.rsi.oversold ? '超卖' : '正常'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bollinger Bands */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-600" />
                    <h4 className="font-medium text-gray-900">布林带</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">上轨:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.boll.upper)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">下轨:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.boll.lower)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">位置:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.boll.position === 'upper' ? 'text-red-600' :
                        analysis.analysis.technical.boll.position === 'lower' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.boll.position === 'upper' ? '上轨附近' :
                         analysis.analysis.technical.boll.position === 'lower' ? '下轨附近' : '中轨附近'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Williams %R */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-pink-600" />
                    <h4 className="font-medium text-gray-900">威廉指标</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">WR值:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.wr.wr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.wr.overbought ? 'text-red-600' :
                        analysis.analysis.technical.wr.oversold ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.wr.overbought ? '超买' :
                         analysis.analysis.technical.wr.oversold ? '超卖' : '正常'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moving Averages */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">均线</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">MA5:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.ma.ma5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MA20:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.ma.ma20)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">多头排列:</span>
                      <span className={`font-medium ${analysis.analysis.technical.ma.bullish_alignment ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.analysis.technical.ma.bullish_alignment ? '是' : '否'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-gray-900">量能</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">量比:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.volume.volume_ratio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">量价配合:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.volume.volume_price_signal === 'bullish' ? 'text-green-600' :
                        analysis.analysis.technical.volume.volume_price_signal === 'bearish' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.volume.volume_price_signal === 'bullish' ? '良好' :
                         analysis.analysis.technical.volume.volume_price_signal === 'bearish' ? '背离' : '中性'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gann Lines */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900">江恩线</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">1x1线:</span>
                      <span className="font-medium">¥{formatNumber(analysis.analysis.technical.gann.gann_1x1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">2x1线:</span>
                      <span className="font-medium">¥{formatNumber(analysis.analysis.technical.gann.gann_2x1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">趋势:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.gann.trend === 'bullish' ? 'text-green-600' :
                        analysis.analysis.technical.gann.trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.gann.trend === 'bullish' ? '看涨' :
                         analysis.analysis.technical.gann.trend === 'bearish' ? '看跌' : '中性'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Turnover Rate */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <h4 className="font-medium text-gray-900">换手率</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">当日换手率:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.turnover_rate.turnover_rate)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">5日均值:</span>
                      <span className="font-medium">{formatNumber(analysis.analysis.technical.turnover_rate.turnover_5d_avg)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">活跃度:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.turnover_rate.is_reasonable ? 'text-green-600' :
                        analysis.analysis.technical.turnover_rate.activity_level === '过热' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {analysis.analysis.technical.turnover_rate.activity_level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">市场情绪:</span>
                      <span className="font-medium text-gray-700">
                        {analysis.analysis.technical.turnover_rate.market_sentiment}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Elliott Wave */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-medium text-gray-900">艾略特波浪</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">当前波浪:</span>
                      <span className="font-medium text-indigo-600">
                        {analysis.analysis.technical.elliott_wave.current_wave}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">波浪趋势:</span>
                      <span className={`font-medium ${
                        analysis.analysis.technical.elliott_wave.wave_trend === 'bullish' ? 'text-green-600' :
                        analysis.analysis.technical.elliott_wave.wave_trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {analysis.analysis.technical.elliott_wave.wave_trend === 'bullish' ? '上升' :
                         analysis.analysis.technical.elliott_wave.wave_trend === 'bearish' ? '下降' : '中性'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">预测信心:</span>
                      <span className="font-medium text-gray-700">
                        {analysis.analysis.technical.elliott_wave.confidence}
                      </span>
                    </div>
                    <div className="mt-2 p-2 bg-indigo-50 rounded text-xs text-indigo-700">
                      {analysis.analysis.technical.elliott_wave.prediction}
                    </div>
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-600 mb-2">斐波那契回调位</h5>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex justify-between">
                          <span>23.6%:</span>
                          <span>¥{formatNumber(analysis.analysis.technical.elliott_wave.fibonacci_levels['23.6%'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>38.2%:</span>
                          <span>¥{formatNumber(analysis.analysis.technical.elliott_wave.fibonacci_levels['38.2%'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>50.0%:</span>
                          <span>¥{formatNumber(analysis.analysis.technical.elliott_wave.fibonacci_levels['50.0%'])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>61.8%:</span>
                          <span>¥{formatNumber(analysis.analysis.technical.elliott_wave.fibonacci_levels['61.8%'])}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Chart */}
          <StockChart symbol={analysis.symbol} />

          {/* Fundamentals Analysis */}
          {analysis.fundamentals && (
            <FundamentalsChart fundamentals={analysis.fundamentals} />
          )}

          {/* Gann Chart */}
          {analysis.analysis && analysis.analysis.technical && analysis.analysis.technical.gann && (
            <GannChart
              gannData={analysis.analysis.technical.gann}
              currentPrice={analysis.current_price}
            />
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>免责声明：</strong>本分析仅供参考，不构成投资建议。股市有风险，投资需谨慎。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockAnalysis
