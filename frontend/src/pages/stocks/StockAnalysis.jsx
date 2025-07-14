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
        <p className="text-gray-600">基于MACD、KDJ、均线等技术指标的智能股票分析</p>
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
            <div className="flex items-center gap-4">
              <span className="text-gray-600">投资建议:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}>
                {analysis.recommendation}
              </span>
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

          {/* Technical Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* MACD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">MACD</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">MACD:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.macd.macd)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">信号线:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.macd.signal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">趋势:</span>
                  <span className={`font-medium ${analysis.analysis.macd.trend === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.analysis.macd.trend === 'bullish' ? '多头' : '空头'}
                  </span>
                </div>
              </div>
            </div>

            {/* KDJ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">KDJ</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">K值:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.kdj.k)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">D值:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.kdj.d)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">信号:</span>
                  <span className={`font-medium ${
                    analysis.analysis.kdj.signal === 'golden_cross' ? 'text-green-600' :
                    analysis.analysis.kdj.signal === 'death_cross' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.kdj.signal === 'golden_cross' ? '金叉' :
                     analysis.analysis.kdj.signal === 'death_cross' ? '死叉' : '中性'}
                  </span>
                </div>
              </div>
            </div>

            {/* RSI */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">RSI</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">RSI值:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.rsi.rsi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">状态:</span>
                  <span className={`font-medium ${
                    analysis.analysis.rsi.overbought ? 'text-red-600' :
                    analysis.analysis.rsi.oversold ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.rsi.overbought ? '超买' :
                     analysis.analysis.rsi.oversold ? '超卖' : '正常'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bollinger Bands */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-cyan-600" />
                <h3 className="font-semibold text-gray-900">布林带</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">上轨:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.boll.upper)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">下轨:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.boll.lower)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">位置:</span>
                  <span className={`font-medium ${
                    analysis.analysis.boll.position === 'above_upper' ? 'text-red-600' :
                    analysis.analysis.boll.position === 'below_lower' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.boll.position === 'above_upper' ? '上轨上方' :
                     analysis.analysis.boll.position === 'below_lower' ? '下轨下方' :
                     analysis.analysis.boll.position === 'upper_half' ? '中上部' : '中下部'}
                  </span>
                </div>
              </div>
            </div>

            {/* Williams %R */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-gray-900">威廉指标</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">WR值:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.wr.wr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">状态:</span>
                  <span className={`font-medium ${
                    analysis.analysis.wr.overbought ? 'text-red-600' :
                    analysis.analysis.wr.oversold ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.wr.overbought ? '超买' :
                     analysis.analysis.wr.oversold ? '超卖' : '正常'}
                  </span>
                </div>
              </div>
            </div>

            {/* Moving Averages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">均线</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">MA5:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.ma.ma5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">MA20:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.ma.ma20)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">多头排列:</span>
                  <span className={`font-medium ${analysis.analysis.ma.bullish_alignment ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.analysis.ma.bullish_alignment ? '是' : '否'}
                  </span>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">量能</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">量比:</span>
                  <span className="font-medium">{formatNumber(analysis.analysis.volume.volume_ratio)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">量价配合:</span>
                  <span className={`font-medium ${
                    analysis.analysis.volume.volume_price_signal === 'bullish' ? 'text-green-600' :
                    analysis.analysis.volume.volume_price_signal === 'bearish' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.volume.volume_price_signal === 'bullish' ? '良好' :
                     analysis.analysis.volume.volume_price_signal === 'bearish' ? '背离' : '中性'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gann Lines */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">江恩线</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">1x1线:</span>
                  <span className="font-medium">¥{formatNumber(analysis.analysis.gann.gann_1x1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">2x1线:</span>
                  <span className="font-medium">¥{formatNumber(analysis.analysis.gann.gann_2x1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">趋势:</span>
                  <span className={`font-medium ${
                    analysis.analysis.gann.trend === 'strong_bullish' ? 'text-green-600' :
                    analysis.analysis.gann.trend === 'bullish' ? 'text-green-500' :
                    analysis.analysis.gann.trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {analysis.analysis.gann.trend === 'strong_bullish' ? '强势上涨' :
                     analysis.analysis.gann.trend === 'bullish' ? '看涨' :
                     analysis.analysis.gann.trend === 'bearish' ? '看跌' : '中性'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">角度:</span>
                  <span className="font-medium">{analysis.analysis.gann.angle}°</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Chart */}
          <StockChart symbol={analysis.symbol} />

          {/* Fundamentals Analysis */}
          {analysis.fundamentals && (
            <FundamentalsChart fundamentals={analysis.fundamentals} />
          )}

          {/* Gann Chart */}
          {analysis.analysis.gann && (
            <GannChart
              gannData={analysis.analysis.gann}
              currentPrice={analysis.current_price}
            />
          )}

          {/* Signals */}
          {analysis.signals.signals && analysis.signals.signals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">技术信号</h3>
              <div className="space-y-2">
                {analysis.signals.signals.map((signal, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700">{signal}</span>
                  </div>
                ))}
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
  )
}

export default StockAnalysis
