import { useState, useEffect } from 'react'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (symbol) {
      fetchChartData()
    }
  }, [symbol])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`http://localhost:8001/history/${symbol}?days=30`)
      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }
      
      const data = await response.json()
      setChartData(data)
    } catch (err) {
      console.error('Chart data error:', err)
      setError('Failed to load chart data')
    } finally {
      setLoading(false)
    }
  }

  const renderCandlestick = (item, index, maxPrice, minPrice, chartHeight) => {
    const { open, high, low, close } = item
    const priceRange = maxPrice - minPrice
    
    // 计算位置
    const highY = ((maxPrice - high) / priceRange) * chartHeight
    const lowY = ((maxPrice - low) / priceRange) * chartHeight
    const openY = ((maxPrice - open) / priceRange) * chartHeight
    const closeY = ((maxPrice - close) / priceRange) * chartHeight
    
    const isRising = close > open
    const bodyTop = Math.min(openY, closeY)
    const bodyHeight = Math.abs(closeY - openY)
    
    const candleWidth = 8
    const x = index * 12 + 4
    
    return (
      <g key={index}>
        {/* 影线 */}
        <line
          x1={x + candleWidth / 2}
          y1={highY}
          x2={x + candleWidth / 2}
          y2={lowY}
          stroke={isRising ? '#10b981' : '#ef4444'}
          strokeWidth="1"
        />
        {/* 实体 */}
        <rect
          x={x}
          y={bodyTop}
          width={candleWidth}
          height={Math.max(bodyHeight, 1)}
          fill={isRising ? '#10b981' : '#ef4444'}
          stroke={isRising ? '#10b981' : '#ef4444'}
        />
      </g>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading chart...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!chartData || !chartData.history || chartData.history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No chart data available</p>
        </div>
      </div>
    )
  }

  const history = chartData.history.slice(-30) // 显示最近30天
  const prices = history.map(item => [item.high, item.low, item.open, item.close]).flat()
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const chartHeight = 200
  const chartWidth = history.length * 12

  // 计算涨跌统计
  const risingDays = history.filter(item => item.close > item.open).length
  const fallingDays = history.length - risingDays

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">K线图 ({symbol})</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600">{risingDays}天上涨</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-red-600">{fallingDays}天下跌</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <svg width={Math.max(chartWidth, 400)} height={chartHeight + 40} className="border rounded">
          {/* 价格网格线 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = ratio * chartHeight
            const price = maxPrice - (maxPrice - minPrice) * ratio
            return (
              <g key={index}>
                <line
                  x1={0}
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={chartWidth + 5}
                  y={y + 4}
                  fontSize="10"
                  fill="#6b7280"
                >
                  {price.toFixed(2)}
                </text>
              </g>
            )
          })}
          
          {/* K线 */}
          {history.map((item, index) => 
            renderCandlestick(item, index, maxPrice, minPrice, chartHeight)
          )}
          
          {/* 日期标签 */}
          {history.map((item, index) => {
            if (index % 5 === 0) { // 每5天显示一个日期
              return (
                <text
                  key={`date-${index}`}
                  x={index * 12 + 8}
                  y={chartHeight + 15}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {new Date(item.date).getMonth() + 1}/{new Date(item.date).getDate()}
                </text>
              )
            }
            return null
          })}
        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-600">最高价: </span>
          <span className="font-medium text-red-600">{maxPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">最低价: </span>
          <span className="font-medium text-green-600">{minPrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">开盘价: </span>
          <span className="font-medium">{history[0]?.open.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">收盘价: </span>
          <span className="font-medium">{history[history.length - 1]?.close.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default StockChart
