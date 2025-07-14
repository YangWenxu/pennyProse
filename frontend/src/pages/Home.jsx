import { Link } from 'react-router-dom'
import {
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Star,
  Zap,
  Target,
  Award
} from 'lucide-react'

const Home = () => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">欢迎来到我的数字世界</span>
            </div>

            <h3 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              创作与分析
            </h3>

            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {/* 探索博客管理的艺术，体验股票分析的科学。 */}
              {/* <br /> */}
              每一分钱都有故事，每个故事都有价值。
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Blog Management Card */}
            <Link to="/admin" className="group block">
              <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                {/* Card Content */}
                <div className="relative p-8 md:p-12">
                  {/* Icon Section */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-900 transition-colors duration-300">
                    博客管理
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    创作精彩内容，管理文章分类，打造属于你的知识花园。支持Markdown编写，让创作更加自由。
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">文章管理</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">分类标签</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-gray-700">Markdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">SEO优化</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>开始创作</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 delay-100"></div>
              </div>
            </Link>

            {/* Stock Analysis Card */}
            <Link to="/stock-features" className="group block">
              <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

                {/* Card Content */}
                <div className="relative p-8 md:p-12">
                  {/* Icon Section */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <TrendingUp className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-green-900 transition-colors duration-300">
                    股票分析
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    专业的技术指标分析，智能预警系统，策略回测功能。让数据为你的投资决策提供科学依据。
                  </p>

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">技术分析</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">自选股</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">智能预警</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">策略回测</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>开始分析</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 delay-100"></div>
              </div>
            </Link>
          </div>

          {/* Bottom Section */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">PennyProse</span>
            </div>
          </div>
        </div>
  )
}

export default Home
