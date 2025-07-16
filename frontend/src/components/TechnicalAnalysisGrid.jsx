import React from 'react'
import { Activity, BarChart3, Gauge, Target, DollarSign, TrendingUp, LineChart, BarChart2 } from 'lucide-react'

const TechnicalAnalysisGrid = ({ analysis }) => {
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0.00'
    return num.toFixed(2)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <LineChart className="w-5 h-5 text-blue-600" />
        技术分析
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 第一列：经典技术指标 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">经典技术指标</h4>
          
          {/* MACD */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h5 className="font-medium text-gray-900">MACD</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MACD:</span>
                <span className="font-medium">{formatNumber(analysis.macd.macd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">趋势:</span>
                <span className={`font-medium ${analysis.macd.trend === 'bullish' ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.macd.trend === 'bullish' ? '多头' : '空头'}
                </span>
              </div>
            </div>
          </div>

          {/* KDJ */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <h5 className="font-medium text-gray-900">KDJ</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">K值:</span>
                <span className="font-medium">{formatNumber(analysis.kdj.k)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">信号:</span>
                <span className={`font-medium ${
                  analysis.kdj.signal === 'golden_cross' ? 'text-green-600' :
                  analysis.kdj.signal === 'death_cross' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.kdj.signal === 'golden_cross' ? '金叉' :
                   analysis.kdj.signal === 'death_cross' ? '死叉' : '中性'}
                </span>
              </div>
            </div>
          </div>

          {/* RSI */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-gray-900">RSI</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">RSI值:</span>
                <span className="font-medium">{formatNumber(analysis.rsi.rsi)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">状态:</span>
                <span className={`font-medium ${
                  analysis.rsi.overbought ? 'text-red-600' :
                  analysis.rsi.oversold ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {analysis.rsi.overbought ? '超买' :
                   analysis.rsi.oversold ? '超卖' : '正常'}
                </span>
              </div>
            </div>
          </div>

          {/* 布林带 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-600" />
              <h5 className="font-medium text-gray-900">布林带</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">上轨:</span>
                <span className="font-medium">{formatNumber(analysis.boll.upper)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">位置:</span>
                <span className={`font-medium ${
                  analysis.boll.position === 'upper' ? 'text-red-600' :
                  analysis.boll.position === 'lower' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {analysis.boll.position === 'upper' ? '上轨附近' :
                   analysis.boll.position === 'lower' ? '下轨附近' : '中轨附近'}
                </span>
              </div>
            </div>
          </div>

          {/* 威廉指标 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-red-600" />
              <h5 className="font-medium text-gray-900">威廉指标</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">WR值:</span>
                <span className="font-medium">{formatNumber(analysis.wr.wr)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">状态:</span>
                <span className={`font-medium ${
                  analysis.wr.overbought ? 'text-red-600' :
                  analysis.wr.oversold ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {analysis.wr.overbought ? '超买' :
                   analysis.wr.oversold ? '超卖' : '正常'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 第二列：趋势分析 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">趋势分析</h4>
          
          {/* 均线 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h5 className="font-medium text-gray-900">均线</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MA5:</span>
                <span className="font-medium">{formatNumber(analysis.ma.ma5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">多头排列:</span>
                <span className={`font-medium ${analysis.ma.bullish_alignment ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.ma.bullish_alignment ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>

          {/* 量能分析 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-gray-900">量能分析</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">量比:</span>
                <span className="font-medium">{formatNumber(analysis.volume.volume_ratio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">量价配合:</span>
                <span className={`font-medium ${
                  analysis.volume.volume_price_signal === 'bullish' ? 'text-green-600' :
                  analysis.volume.volume_price_signal === 'bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.volume.volume_price_signal === 'bullish' ? '良好' :
                   analysis.volume.volume_price_signal === 'bearish' ? '背离' : '中性'}
                </span>
              </div>
            </div>
          </div>

          {/* 江恩线 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="w-4 h-4 text-purple-600" />
              <h5 className="font-medium text-gray-900">江恩线</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">1x1线:</span>
                <span className="font-medium">¥{formatNumber(analysis.gann.gann_1x1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">趋势:</span>
                <span className={`font-medium ${
                  analysis.gann.trend === 'bullish' ? 'text-green-600' :
                  analysis.gann.trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.gann.trend === 'bullish' ? '看涨' :
                   analysis.gann.trend === 'bearish' ? '看跌' : '中性'}
                </span>
              </div>
            </div>
          </div>

          {/* 爱德华兹趋势 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h5 className="font-medium text-gray-900">爱德华兹趋势</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">趋势方向:</span>
                <span className={`font-medium ${
                  analysis.edwards_trend.trend_direction.includes('上升') ? 'text-green-600' :
                  analysis.edwards_trend.trend_direction.includes('下降') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.edwards_trend.trend_direction}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">形态:</span>
                <span className={`font-medium ${
                  analysis.edwards_trend.pattern_signal === 'bullish' ? 'text-green-600' :
                  analysis.edwards_trend.pattern_signal === 'bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.edwards_trend.pattern}
                </span>
              </div>
            </div>
          </div>

          {/* 艾略特波浪 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h5 className="font-medium text-gray-900">艾略特波浪</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">当前波浪:</span>
                <span className="font-medium text-indigo-600">
                  {analysis.elliott_wave.current_wave}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">波浪趋势:</span>
                <span className={`font-medium ${
                  analysis.elliott_wave.wave_trend === 'bullish' ? 'text-green-600' :
                  analysis.elliott_wave.wave_trend === 'bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.elliott_wave.wave_trend === 'bullish' ? '上升' :
                   analysis.elliott_wave.wave_trend === 'bearish' ? '下降' : '中性'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 第三列：现代分析 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 border-b pb-2">现代分析</h4>
          
          {/* 换手率 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <h5 className="font-medium text-gray-900">换手率</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">当日换手率:</span>
                <span className="font-medium">{formatNumber(analysis.turnover_rate.turnover_rate)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">活跃度:</span>
                <span className={`font-medium ${
                  analysis.turnover_rate.is_reasonable ? 'text-green-600' : 
                  analysis.turnover_rate.activity_level === '过热' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {analysis.turnover_rate.activity_level}
                </span>
              </div>
            </div>
          </div>

          {/* 墨菲市场间 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4 text-teal-600" />
              <h5 className="font-medium text-gray-900">墨菲市场间</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">整体趋势:</span>
                <span className={`font-medium ${
                  analysis.murphy_intermarket.overall_trend.includes('多头') ? 'text-green-600' :
                  analysis.murphy_intermarket.overall_trend.includes('空头') ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {analysis.murphy_intermarket.overall_trend}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">动量强度:</span>
                <span className="font-medium text-gray-700">
                  {analysis.murphy_intermarket.momentum_strength}
                </span>
              </div>
            </div>
          </div>

          {/* 日本蜡烛图 */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-red-600" />
              <h5 className="font-medium text-gray-900">日本蜡烛图</h5>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">当前形态:</span>
                <span className={`font-medium ${
                  analysis.japanese_candlestick.pattern_signal === 'bullish' ? 'text-green-600' :
                  analysis.japanese_candlestick.pattern_signal === 'bearish' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {analysis.japanese_candlestick.current_pattern}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">形态强度:</span>
                <span className="font-medium text-gray-700">
                  {analysis.japanese_candlestick.pattern_strength}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnicalAnalysisGrid
