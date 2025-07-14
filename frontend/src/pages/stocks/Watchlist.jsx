import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Star, Trash2, Plus, TrendingUp, TrendingDown, Loader2, Bell } from 'lucide-react'

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingStock, setAddingStock] = useState(false)
  const [newStock, setNewStock] = useState({ symbol: '', name: '' })

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8001/watchlist')
      const data = await response.json()
      setWatchlist(data.watchlist)
    } catch (err) {
      console.error('Error fetching watchlist:', err)
    } finally {
      setLoading(false)
    }
  }

  const addToWatchlist = async () => {
    if (!newStock.symbol.trim() || !newStock.name.trim()) {
      alert('请输入股票代码和名称')
      return
    }

    try {
      const response = await fetch(`http://localhost:8001/watchlist?symbol=${newStock.symbol}&name=${newStock.name}`, {
        method: 'POST'
      })

      if (response.ok) {
        setNewStock({ symbol: '', name: '' })
        setAddingStock(false)
        fetchWatchlist()
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to add stock')
      }
    } catch (err) {
      console.error('Error adding stock:', err)
      alert('Failed to add stock')
    }
  }

  const removeFromWatchlist = async (symbol) => {
    if (!confirm('确定要从自选股中移除这只股票吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8001/watchlist/${symbol}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchWatchlist()
      } else {
        alert('Failed to remove stock')
      }
    } catch (err) {
      console.error('Error removing stock:', err)
      alert('Failed to remove stock')
    }
  }

  const analyzeStock = (symbol) => {
    window.open(`/stock-analysis?symbol=${symbol}`, '_blank')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading watchlist...</span>
        </div>
      </div>
    )
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">自选股</h1>
          <p className="text-gray-600 mt-2">管理您关注的股票</p>
        </div>
        <button
          onClick={() => setAddingStock(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加股票
        </button>
      </div>

      {/* Add Stock Modal */}
      {addingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">添加股票到自选股</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  股票代码
                </label>
                <input
                  type="text"
                  placeholder="如：000001"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock(prev => ({ ...prev, symbol: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  股票名称
                </label>
                <input
                  type="text"
                  placeholder="如：平安银行"
                  value={newStock.name}
                  onChange={(e) => setNewStock(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={addToWatchlist}
                  className="btn-primary flex-1"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setAddingStock(false)
                    setNewStock({ symbol: '', name: '' })
                  }}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无自选股</h3>
          <p className="text-gray-500 mb-4">添加您关注的股票到自选股列表</p>
          <button
            onClick={() => setAddingStock(true)}
            className="btn-primary"
          >
            添加第一只股票
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((stock) => (
            <div key={stock.symbol} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{stock.name}</h3>
                  <p className="text-gray-600">{stock.symbol}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => analyzeStock(stock.symbol)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    title="分析"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFromWatchlist(stock.symbol)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">添加日期:</span>
                  <span className="font-medium">{stock.added_date}</span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => analyzeStock(stock.symbol)}
                  className="btn-primary text-sm flex-1"
                >
                  技术分析
                </button>
                <button
                  onClick={() => window.open(`/alerts?symbol=${stock.symbol}`, '_blank')}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <Bell className="w-3 h-3" />
                  预警
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {watchlist.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.open('/stock-analysis', '_blank')}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <TrendingUp className="w-4 h-4" />
              股票分析
            </button>
            <button
              onClick={() => window.open('/alerts', '_blank')}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <Bell className="w-4 h-4" />
              预警管理
            </button>
            <button
              onClick={() => window.open('/backtest', '_blank')}
              className="btn-secondary flex items-center gap-2 justify-center"
            >
              <TrendingDown className="w-4 h-4" />
              策略回测
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Watchlist
