import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Home from './pages/Home'
import Admin from './pages/Admin'
import BlogList from './pages/blog/BlogList'
import PostDetail from './pages/blog/PostDetail'
import CreatePost from './pages/blog/CreatePost'
import EditPost from './pages/blog/EditPost'
import CategoryPosts from './pages/blog/CategoryPosts'
import TagPosts from './pages/blog/TagPosts'
import ArchivePosts from './pages/blog/ArchivePosts'
import ManageCategories from './pages/blog/ManageCategories'
import StockAnalysis from './pages/stocks/StockAnalysis'
import Watchlist from './pages/stocks/Watchlist'
import Alerts from './pages/stocks/Alerts'
import Backtest from './pages/stocks/Backtest'
import StockFeatures from './pages/stocks/StockFeatures'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

          {/* Floating Elements */}
          <div className="absolute top-40 left-60 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-40 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-indigo-200 rounded-full opacity-15 animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 right-10 w-14 h-14 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-1500"></div>

          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<BlogList />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              <Route path="/create" element={<CreatePost />} />
              <Route path="/edit/:id" element={<EditPost />} />
              <Route path="/categories/:slug" element={<CategoryPosts />} />
              <Route path="/tags/:slug" element={<TagPosts />} />
              <Route path="/archive/:year/:month" element={<ArchivePosts />} />
              <Route path="/manage" element={<ManageCategories />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/stock-analysis" element={<StockAnalysis />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/backtest" element={<Backtest />} />
              <Route path="/stock-features" element={<StockFeatures />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
