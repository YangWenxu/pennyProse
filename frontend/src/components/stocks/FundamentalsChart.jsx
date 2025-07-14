import { Building2, TrendingUp, DollarSign, Award, Users, BarChart3 } from 'lucide-react'

const FundamentalsChart = ({ fundamentals }) => {
  if (!fundamentals) return null

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-100'
    if (score >= 2) return 'text-blue-600 bg-blue-100'
    if (score >= 0) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreText = (score) => {
    if (score >= 4) return '优秀'
    if (score >= 2) return '良好'
    if (score >= 0) return '一般'
    return '较差'
  }

  const getValuationColor = (valuation) => {
    switch (valuation) {
      case 'undervalued': return 'text-green-600 bg-green-100'
      case 'overvalued': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getGrowthColor = (growth_stage) => {
    switch (growth_stage) {
      case 'high_growth': return 'text-green-600 bg-green-100'
      case 'stable_growth': return 'text-blue-600 bg-blue-100'
      case 'slow_growth': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-red-600 bg-red-100'
    }
  }

  // ROE评级
  const getRoeRating = (roe) => {
    if (roe >= 20) return { rating: 'A+', color: 'text-green-600' }
    if (roe >= 15) return { rating: 'A', color: 'text-green-500' }
    if (roe >= 10) return { rating: 'B', color: 'text-blue-600' }
    if (roe >= 5) return { rating: 'C', color: 'text-yellow-600' }
    return { rating: 'D', color: 'text-red-600' }
  }

  // PE评级
  const getPeRating = (pe_ratio, sector) => {
    // 不同行业的PE标准不同
    let benchmark = 20 // 默认基准
    if (sector.includes('银行')) benchmark = 8
    if (sector.includes('白酒')) benchmark = 30
    if (sector.includes('科技')) benchmark = 40
    
    if (pe_ratio < benchmark * 0.6) return { rating: 'A+', color: 'text-green-600', desc: '严重低估' }
    if (pe_ratio < benchmark * 0.8) return { rating: 'A', color: 'text-green-500', desc: '低估' }
    if (pe_ratio < benchmark * 1.2) return { rating: 'B', color: 'text-blue-600', desc: '合理' }
    if (pe_ratio < benchmark * 1.5) return { rating: 'C', color: 'text-yellow-600', desc: '偏高' }
    return { rating: 'D', color: 'text-red-600', desc: '高估' }
  }

  const roeRating = getRoeRating(fundamentals.roe)
  const peRating = getPeRating(fundamentals.pe_ratio, fundamentals.sector)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">基本面分析</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(fundamentals.fundamentals_score)}`}>
          基本面评分: {getScoreText(fundamentals.fundamentals_score)}
        </div>
      </div>

      {/* 公司详细信息 */}
      {fundamentals.company_name && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-xl font-bold text-gray-900">{fundamentals.company_name}</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {fundamentals.listing_date}上市
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{fundamentals.full_name}</p>
              <p className="text-gray-700 mb-3">{fundamentals.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">主营业务: </span>
                  <span className="text-gray-700">{fundamentals.main_business}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900">竞争优势: </span>
                  <span className="text-gray-700">{fundamentals.competitive_advantage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 公司概况 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-blue-900">{fundamentals.sector}</div>
          <div className="text-sm text-blue-600">所属行业</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-green-900">{fundamentals.market_cap}亿</div>
          <div className="text-sm text-green-600">总市值</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-purple-900">第{fundamentals.industry_rank}名</div>
          <div className="text-sm text-purple-600">行业排名</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-orange-900">{fundamentals.institutional_holding}%</div>
          <div className="text-sm text-orange-600">机构持股</div>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* 估值分析 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            估值分析
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">PE比率</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{fundamentals.pe_ratio}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${peRating.color} bg-opacity-20`}>
                  {peRating.rating}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">PB比率</span>
              <span className="font-medium">{fundamentals.pb_ratio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">估值状态</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getValuationColor(fundamentals.valuation)}`}>
                {fundamentals.valuation === 'undervalued' ? '低估' :
                 fundamentals.valuation === 'overvalued' ? '高估' : '合理'}
              </span>
            </div>
          </div>
        </div>

        {/* 盈利能力 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            盈利能力
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ROE</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{fundamentals.roe}%</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${roeRating.color} bg-opacity-20`}>
                  {roeRating.rating}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">每股收益</span>
              <span className="font-medium">¥{fundamentals.eps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">股息率</span>
              <span className="font-medium">{fundamentals.dividend_yield}%</span>
            </div>
          </div>
        </div>

        {/* 成长性 */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            成长性
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">营收增长</span>
              <span className={`font-medium ${
                fundamentals.revenue_growth > 10 ? 'text-green-600' :
                fundamentals.revenue_growth > 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {fundamentals.revenue_growth > 0 ? '+' : ''}{fundamentals.revenue_growth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">利润增长</span>
              <span className={`font-medium ${
                fundamentals.profit_growth > 10 ? 'text-green-600' :
                fundamentals.profit_growth > 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {fundamentals.profit_growth > 0 ? '+' : ''}{fundamentals.profit_growth.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">成长阶段</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(fundamentals.growth_stage)}`}>
                {fundamentals.growth_stage === 'high_growth' ? '高成长' :
                 fundamentals.growth_stage === 'stable_growth' ? '稳定增长' :
                 fundamentals.growth_stage === 'slow_growth' ? '缓慢增长' : '业绩下滑'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 详细财务数据 */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-gray-900 mb-4">详细财务数据</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">每股净资产</div>
            <div className="font-medium text-lg">¥{fundamentals.bvps}</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">总股本</div>
            <div className="font-medium text-lg">{fundamentals.shares_outstanding}亿股</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">基本面评分</div>
            <div className="font-medium text-lg">{fundamentals.fundamentals_score}分</div>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-gray-600">机构评级</div>
            <div className="font-medium text-lg">
              {fundamentals.institutional_holding > 60 ? '强烈关注' :
               fundamentals.institutional_holding > 40 ? '适度关注' : '一般关注'}
            </div>
          </div>
        </div>
      </div>

      {/* 投资要点 */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">投资要点</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-green-700 mb-2">优势</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {fundamentals.roe > 15 && <li>• ROE超过15%，盈利能力强</li>}
              {fundamentals.valuation === 'undervalued' && <li>• 估值偏低，具有安全边际</li>}
              {fundamentals.profit_growth > 10 && <li>• 利润增长超过10%，成长性好</li>}
              {fundamentals.industry_rank <= 5 && <li>• 行业排名前5，龙头地位</li>}
              {fundamentals.institutional_holding > 50 && <li>• 机构持股比例高，受到认可</li>}
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-red-700 mb-2">风险</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {fundamentals.valuation === 'overvalued' && <li>• 估值偏高，存在回调风险</li>}
              {fundamentals.profit_growth < 0 && <li>• 利润负增长，业绩下滑</li>}
              {fundamentals.roe < 10 && <li>• ROE较低，盈利能力一般</li>}
              {fundamentals.pe_ratio > 50 && <li>• PE过高，泡沫风险较大</li>}
              {fundamentals.industry_rank > 15 && <li>• 行业排名靠后，竞争力不足</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FundamentalsChart
