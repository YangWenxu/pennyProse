import { useState } from 'react'
import { Search, TrendingUp, Building2 } from 'lucide-react'

const StockSearchSuggestions = ({ onSelectStock }) => {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const popularStocks = [
    { symbol: '000001', name: '平安银行', sector: '银行业', description: '股份制商业银行' },
    { symbol: '000002', name: '万科A', sector: '房地产', description: '房地产开发企业' },
    { symbol: '000858', name: '五粮液', sector: '白酒业', description: '高端白酒制造商' },
    { symbol: '600000', name: '浦发银行', sector: '银行业', description: '全国性股份制银行' },
    { symbol: '600036', name: '招商银行', sector: '银行业', description: '零售银行领先者' },
    { symbol: '600519', name: '贵州茅台', sector: '白酒业', description: '高端白酒龙头' },
    { symbol: '300015', name: '爱尔眼科', sector: '医疗服务', description: '眼科医疗连锁' },
    { symbol: '300059', name: '东方财富', sector: '金融科技', description: '互联网金融信息' },
    { symbol: '002415', name: '海康威视', sector: '安防科技', description: '视频监控设备' },
    { symbol: '002594', name: '比亚迪', sector: '新能源汽车', description: '新能源汽车领导者' },
    { symbol: '000568', name: '泸州老窖', sector: '白酒业', description: '四大名酒之一' },
    { symbol: '300750', name: '宁德时代', sector: '新能源', description: '动力电池系统' }
  ]

  const sectorColors = {
    '银行业': 'bg-blue-100 text-blue-800',
    '房地产': 'bg-green-100 text-green-800',
    '白酒业': 'bg-red-100 text-red-800',
    '医疗服务': 'bg-purple-100 text-purple-800',
    '金融科技': 'bg-indigo-100 text-indigo-800',
    '安防科技': 'bg-gray-100 text-gray-800',
    '新能源汽车': 'bg-emerald-100 text-emerald-800',
    '新能源': 'bg-yellow-100 text-yellow-800'
  }

  const handleStockSelect = (stock) => {
    onSelectStock(stock.symbol)
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
      >
        <Search className="w-4 h-4" />
        热门股票推荐
      </button>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              热门股票
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {popularStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{stock.name}</span>
                        <span className="text-xs text-gray-500">({stock.symbol})</span>
                      </div>
                      <p className="text-xs text-gray-600">{stock.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sectorColors[stock.sector] || 'bg-gray-100 text-gray-800'}`}>
                      {stock.sector}
                    </span>
                    <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <p className="text-xs text-gray-600 text-center">
              点击任意股票开始分析，或在上方输入框手动输入股票代码
            </p>
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}

export default StockSearchSuggestions
