import { TrendingUp, TrendingDown, Target } from 'lucide-react'

const GannChart = ({ gannData, currentPrice }) => {
  if (!gannData) return null

  const { gann_1x1, gann_2x1, gann_1x2, trend, support_level, resistance_level, angle, recent_high, recent_low } = gannData

  // 计算图表参数
  const chartHeight = 200
  const chartWidth = 300
  const priceRange = recent_high - recent_low
  const padding = 20

  // 价格到Y坐标的转换
  const priceToY = (price) => {
    return padding + ((recent_high - price) / priceRange) * (chartHeight - 2 * padding)
  }

  // 江恩线颜色
  const getLineColor = (lineType) => {
    switch (lineType) {
      case '1x1': return '#3b82f6' // blue
      case '2x1': return '#10b981' // green
      case '1x2': return '#f59e0b' // yellow
      default: return '#6b7280' // gray
    }
  }

  // 趋势颜色
  const getTrendColor = (trend) => {
    switch (trend) {
      case 'strong_bullish': return 'text-green-600'
      case 'bullish': return 'text-green-500'
      case 'bearish': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend) => {
    if (trend === 'strong_bullish' || trend === 'bullish') {
      return <TrendingUp className="w-4 h-4" />
    } else if (trend === 'bearish') {
      return <TrendingDown className="w-4 h-4" />
    } else {
      return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">江恩线分析</h3>
        <div className={`flex items-center gap-2 ${getTrendColor(trend)}`}>
          {getTrendIcon(trend)}
          <span className="text-sm font-medium">
            {trend === 'strong_bullish' ? '强势上涨' :
             trend === 'bullish' ? '看涨' :
             trend === 'bearish' ? '看跌' : '中性'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 江恩线图表 */}
        <div className="relative">
          <svg width={chartWidth} height={chartHeight} className="border rounded bg-gray-50">
            {/* 价格网格线 */}
            {[recent_high, gann_2x1, gann_1x1, gann_1x2, recent_low].map((price, index) => {
              const y = priceToY(price)
              return (
                <g key={index}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                  <text
                    x={chartWidth - padding + 5}
                    y={y + 4}
                    fontSize="10"
                    fill="#6b7280"
                  >
                    {price.toFixed(2)}
                  </text>
                </g>
              )
            })}

            {/* 江恩线 */}
            {/* 2x1线 */}
            <line
              x1={padding}
              y1={priceToY(recent_low)}
              x2={chartWidth - padding}
              y2={priceToY(gann_2x1)}
              stroke={getLineColor('2x1')}
              strokeWidth="2"
            />
            
            {/* 1x1线 */}
            <line
              x1={padding}
              y1={priceToY(recent_low)}
              x2={chartWidth - padding}
              y2={priceToY(gann_1x1)}
              stroke={getLineColor('1x1')}
              strokeWidth="2"
            />
            
            {/* 1x2线 */}
            <line
              x1={padding}
              y1={priceToY(recent_low)}
              x2={chartWidth - padding}
              y2={priceToY(gann_1x2)}
              stroke={getLineColor('1x2')}
              strokeWidth="2"
            />

            {/* 当前价格线 */}
            <line
              x1={padding}
              y1={priceToY(currentPrice)}
              x2={chartWidth - padding}
              y2={priceToY(currentPrice)}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* 当前价格点 */}
            <circle
              cx={chartWidth - 50}
              cy={priceToY(currentPrice)}
              r="4"
              fill="#ef4444"
            />

            {/* 图例 */}
            <g transform="translate(10, 10)">
              <rect x="0" y="0" width="80" height="60" fill="white" stroke="#e5e7eb" strokeWidth="1" rx="4" />
              <line x1="5" y1="10" x2="20" y2="10" stroke={getLineColor('2x1')} strokeWidth="2" />
              <text x="25" y="14" fontSize="10" fill="#374151">2x1线</text>
              <line x1="5" y1="25" x2="20" y2="25" stroke={getLineColor('1x1')} strokeWidth="2" />
              <text x="25" y="29" fontSize="10" fill="#374151">1x1线</text>
              <line x1="5" y1="40" x2="20" y2="40" stroke={getLineColor('1x2')} strokeWidth="2" />
              <text x="25" y="44" fontSize="10" fill="#374151">1x2线</text>
              <line x1="5" y1="55" x2="20" y2="55" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
              <text x="25" y="59" fontSize="10" fill="#374151">现价</text>
            </g>
          </svg>
        </div>

        {/* 江恩线数据 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600 font-medium">1x1线 (45°)</div>
              <div className="text-lg font-bold text-blue-900">¥{gann_1x1}</div>
              <div className="text-xs text-blue-600">时间价格等比</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-600 font-medium">2x1线 (63.75°)</div>
              <div className="text-lg font-bold text-green-900">¥{gann_2x1}</div>
              <div className="text-xs text-green-600">价格2倍时间</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-sm text-yellow-600 font-medium">1x2线 (26.25°)</div>
              <div className="text-lg font-bold text-yellow-900">¥{gann_1x2}</div>
              <div className="text-xs text-yellow-600">时间2倍价格</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 font-medium">当前角度</div>
              <div className="text-lg font-bold text-gray-900">{angle}°</div>
              <div className="text-xs text-gray-600">江恩角度</div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">关键位置</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">支撑位:</span>
                <span className="font-medium text-green-600">¥{support_level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">阻力位:</span>
                <span className="font-medium text-red-600">¥{resistance_level}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">近期高点:</span>
                <span className="font-medium">¥{recent_high}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">近期低点:</span>
                <span className="font-medium">¥{recent_low}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">江恩理论要点</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• 1x1线是最重要的支撑/阻力线</p>
              <p>• 价格在1x1线上方为强势</p>
              <p>• 2x1线突破表示强势上涨</p>
              <p>• 角度反映价格变化的速度</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GannChart
