import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, AlertTriangle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Alerts = () => {
  const [alerts, setAlerts] = useState([])
  const [triggeredAlerts, setTriggeredAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingAlert, setAddingAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    condition: 'price_above',
    value: '',
    message: ''
  })

  useEffect(() => {
    fetchAlerts()
    checkAlerts()
    // 每分钟检查一次预警
    const interval = setInterval(checkAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8001/alerts')
      const data = await response.json()
      setAlerts(data.alerts)
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8001/alerts/check')
      const data = await response.json()
      setTriggeredAlerts(data.triggered_alerts)
    } catch (err) {
      console.error('Error checking alerts:', err)
    }
  }

  const createAlert = async () => {
    if (!newAlert.symbol.trim() || !newAlert.value || !newAlert.message.trim()) {
      alert('请填写完整的预警信息')
      return
    }

    try {
      const response = await fetch('http://localhost:8001/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAlert,
          value: parseFloat(newAlert.value)
        })
      })

      if (response.ok) {
        setNewAlert({ symbol: '', condition: 'price_above', value: '', message: '' })
        setAddingAlert(false)
        fetchAlerts()
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to create alert')
      }
    } catch (err) {
      console.error('Error creating alert:', err)
      alert('Failed to create alert')
    }
  }

  const deleteAlert = async (alertId) => {
    if (!confirm('确定要删除这个预警吗？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8001/alerts/${alertId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchAlerts()
      } else {
        alert('Failed to delete alert')
      }
    } catch (err) {
      console.error('Error deleting alert:', err)
      alert('Failed to delete alert')
    }
  }

  const getConditionText = (condition) => {
    switch (condition) {
      case 'price_above': return '价格高于'
      case 'price_below': return '价格低于'
      case 'rsi_overbought': return 'RSI超买'
      case 'rsi_oversold': return 'RSI超卖'
      default: return condition
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600">Loading alerts...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">预警管理</h1>
          <p className="text-gray-600 mt-2">设置股票价格和技术指标预警</p>
        </div>
        <button
          onClick={() => setAddingAlert(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建预警
        </button>
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            触发的预警
          </h2>
          <div className="space-y-4">
            {triggeredAlerts.map((alert, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-red-900">{alert.symbol}</h3>
                    <p className="text-red-700">{alert.message}</p>
                    <p className="text-sm text-red-600 mt-1">
                      当前价格: ¥{alert.current_price} | 触发时间: {alert.trigger_time}
                    </p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Alert Modal */}
      {addingAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">创建预警</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  股票代码
                </label>
                <input
                  type="text"
                  placeholder="如：000001"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预警条件
                </label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value }))}
                  className="input-field"
                >
                  <option value="price_above">价格高于</option>
                  <option value="price_below">价格低于</option>
                  <option value="rsi_overbought">RSI超买</option>
                  <option value="rsi_oversold">RSI超卖</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预警值
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="如：12.50"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, value: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预警消息
                </label>
                <input
                  type="text"
                  placeholder="如：股价突破重要阻力位"
                  value={newAlert.message}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={createAlert}
                  className="btn-primary flex-1"
                >
                  创建
                </button>
                <button
                  onClick={() => {
                    setAddingAlert(false)
                    setNewAlert({ symbol: '', condition: 'price_above', value: '', message: '' })
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

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预警</h3>
          <p className="text-gray-500 mb-4">创建您的第一个股票预警</p>
          <button
            onClick={() => setAddingAlert(true)}
            className="btn-primary"
          >
            创建预警
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">预警列表</h2>
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.symbol}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      alert.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.active ? '活跃' : '暂停'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.message}</p>
                  <div className="text-sm text-gray-600">
                    <span>条件: {getConditionText(alert.condition)} {alert.value}</span>
                    <span className="ml-4">创建时间: {alert.created_date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.active ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-gray-400" />
                  )}
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">预警说明</h4>
            <p className="text-blue-700 text-sm mt-1">
              系统每分钟检查一次预警条件。当条件满足时，预警将在此页面显示。
              建议设置合理的预警条件，避免过于频繁的触发。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alerts
