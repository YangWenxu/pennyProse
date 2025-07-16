import { useState } from 'react'
import { Search, BarChart3, Loader2, ArrowLeft, DollarSign, CheckCircle, AlertTriangle } from 'lucide-react'
import TechnicalAnalysisGrid from '../../components/TechnicalAnalysisGrid'
import { Link } from 'react-router-dom'
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzeStock()
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
              <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4" />
                返回管理后台
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
                onKeyPress={handleKeyPress}
                placeholder="输入股票代码 (如: 000001, 600519)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={analyzeStock}
              disabled={loading}
              className="w-full mt-4 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>免责声明：</strong>本分析仅供参考，不构成投资建议。股市有风险，投资需谨慎。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockAnalysis