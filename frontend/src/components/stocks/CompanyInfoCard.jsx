import { Building2, Calendar, Award, Target, TrendingUp, Info } from 'lucide-react'

const CompanyInfoCard = ({ fundamentals, currentPrice, changePercent }) => {
  if (!fundamentals || !fundamentals.company_name) return null

  const getChangeColor = (change) => {
    if (change > 0) return 'text-red-600'
    if (change < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getValuationColor = (valuation) => {
    switch (valuation) {
      case 'undervalued': return 'bg-green-100 text-green-800'
      case 'overvalued': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getGrowthColor = (growth_stage) => {
    switch (growth_stage) {
      case 'high_growth': return 'bg-green-100 text-green-800'
      case 'stable_growth': return 'bg-blue-100 text-blue-800'
      case 'slow_growth': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getGrowthText = (growth_stage) => {
    switch (growth_stage) {
      case 'high_growth': return '高成长'
      case 'stable_growth': return '稳定增长'
      case 'slow_growth': return '缓慢增长'
      default: return '业绩下滑'
    }
  }

  const getValuationText = (valuation) => {
    switch (valuation) {
      case 'undervalued': return '低估'
      case 'overvalued': return '高估'
      default: return '合理'
    }
  }

  // 计算上市年限
  const listingYear = new Date(fundamentals.listing_date).getFullYear()
  const currentYear = new Date().getFullYear()
  const yearsListed = currentYear - listingYear

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200 p-6 mb-6">
      {/* 公司标题信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{fundamentals.company_name}</h3>
            <p className="text-sm text-gray-600 mb-2">{fundamentals.full_name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {fundamentals.listing_date}上市 ({yearsListed}年)
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getValuationColor(fundamentals.valuation)}`}>
                估值{getValuationText(fundamentals.valuation)}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getGrowthColor(fundamentals.growth_stage)}`}>
                {getGrowthText(fundamentals.growth_stage)}
              </span>
            </div>
          </div>
        </div>
        
        {/* 当前股价 */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">¥{currentPrice}</div>
          <div className={`text-sm font-medium ${getChangeColor(changePercent)}`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 公司描述 */}
      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700 text-sm leading-relaxed">{fundamentals.description}</p>
        </div>
      </div>

      {/* 核心信息网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 主营业务 */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold text-gray-900">主营业务</h4>
          </div>
          <p className="text-sm text-gray-700">{fundamentals.main_business}</p>
        </div>

        {/* 竞争优势 */}
        <div className="bg-white bg-opacity-60 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-gray-900">竞争优势</h4>
          </div>
          <p className="text-sm text-gray-700">{fundamentals.competitive_advantage}</p>
        </div>
      </div>

      {/* 关键指标快览 */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{fundamentals.sector}</div>
            <div className="text-xs text-gray-600">所属行业</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{fundamentals.market_cap}亿</div>
            <div className="text-xs text-gray-600">总市值</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">第{fundamentals.industry_rank}名</div>
            <div className="text-xs text-gray-600">行业排名</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">{fundamentals.roe}%</div>
            <div className="text-xs text-gray-600">ROE</div>
          </div>
        </div>
      </div>

      {/* 投资亮点 */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          投资亮点
        </h4>
        <div className="flex flex-wrap gap-2">
          {fundamentals.roe > 15 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              ROE超15%
            </span>
          )}
          {fundamentals.valuation === 'undervalued' && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              估值偏低
            </span>
          )}
          {fundamentals.profit_growth > 10 && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              利润高增长
            </span>
          )}
          {fundamentals.industry_rank <= 5 && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              行业龙头
            </span>
          )}
          {fundamentals.institutional_holding > 50 && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
              机构重仓
            </span>
          )}
          {yearsListed > 20 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
              老牌上市公司
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyInfoCard
