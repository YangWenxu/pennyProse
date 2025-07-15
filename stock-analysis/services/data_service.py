"""
股票数据获取服务
"""
import efinance as ef
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging
import time

logger = logging.getLogger(__name__)


class StockDataService:
    """股票数据服务类"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def get_stock_info(self, symbol: str) -> Optional[Dict[str, Any]]:
        """获取股票基本信息"""
        # 尝试多种数据源获取股票信息
        stock_data = None
        
        try:
            # 首先尝试efinance
            logger.info("Trying efinance API...")
            all_stocks = ef.stock.get_realtime_quotes()
            stock_info = all_stocks[all_stocks['股票代码'] == symbol]

            if not stock_info.empty:
                stock_data = {
                    'name': stock_info.iloc[0]['股票名称'],
                    'current_price': float(stock_info.iloc[0]['最新价']),
                    'change_percent': float(stock_info.iloc[0]['涨跌幅'])
                }
                logger.info("efinance API success")
        except Exception as e:
            logger.warning(f"efinance API failed: {e}")
        
        # 如果efinance失败，尝试备用数据源
        if stock_data is None:
            logger.info("Trying alternative data sources...")
            stock_data = self._get_stock_data_alternative(symbol)
        
        return stock_data
    
    def _get_stock_data_alternative(self, symbol: str) -> Optional[Dict[str, Any]]:
        """备用股票数据获取函数"""
        # 转换股票代码格式
        def format_symbol_for_api(symbol):
            if symbol.startswith('6'):
                return f"sh{symbol}"  # 上海股票
            elif symbol.startswith('0') or symbol.startswith('3'):
                return f"sz{symbol}"  # 深圳股票
            else:
                return symbol
        
        formatted_symbol = format_symbol_for_api(symbol)
        logger.info(f"Trying alternative APIs for {symbol} (formatted: {formatted_symbol})")
        
        try:
            # 方法1：尝试使用腾讯财经API
            tencent_url = f"http://qt.gtimg.cn/q={formatted_symbol}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'http://stockapp.finance.qq.com/',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
            }
            
            response = self.session.get(tencent_url, headers=headers, timeout=10)
            if response.status_code == 200:
                content = response.text
                logger.info(f"Tencent API response: {content[:200]}...")
                
                if 'v_' in content and '~' in content:
                    # 解析腾讯财经数据
                    try:
                        data_str = content.split('"')[1]
                        data_parts = data_str.split('~')
                        
                        if len(data_parts) >= 4 and data_parts[1] and data_parts[3]:
                            current_price = float(data_parts[3])
                            prev_close = float(data_parts[4]) if len(data_parts) > 4 and data_parts[4] else current_price
                            change_percent = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
                            
                            result = {
                                'name': data_parts[1],
                                'current_price': current_price,
                                'change_percent': change_percent
                            }
                            logger.info(f"Tencent API success: {result}")
                            return result
                    except Exception as e:
                        logger.warning(f"Failed to parse Tencent data: {e}")
        except Exception as e:
            logger.warning(f"Tencent API failed: {e}")
        
        try:
            # 方法2：尝试使用新浪财经API
            sina_url = f"http://hq.sinajs.cn/list={formatted_symbol}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'http://finance.sina.com.cn/',
                'Accept': '*/*'
            }
            
            response = self.session.get(sina_url, headers=headers, timeout=10)
            if response.status_code == 200:
                content = response.text
                logger.info(f"Sina API response: {content[:200]}...")
                
                if 'var hq_str_' in content and '=' in content:
                    # 解析新浪财经数据
                    try:
                        data_str = content.split('="')[1].split('";')[0]
                        data_parts = data_str.split(',')
                        
                        if len(data_parts) >= 4 and data_parts[0] and data_parts[3]:
                            current_price = float(data_parts[3])
                            prev_close = float(data_parts[2]) if data_parts[2] else current_price
                            change_percent = ((current_price - prev_close) / prev_close * 100) if prev_close > 0 else 0.0
                            
                            result = {
                                'name': data_parts[0],
                                'current_price': current_price,
                                'change_percent': change_percent
                            }
                            logger.info(f"Sina API success: {result}")
                            return result
                    except Exception as e:
                        logger.warning(f"Failed to parse Sina data: {e}")
        except Exception as e:
            logger.warning(f"Sina API failed: {e}")
        
        # 如果所有方法都失败，返回None
        logger.warning("All alternative APIs failed")
        return None
    
    def get_historical_data(self, symbol: str, days: int = 365) -> Optional[pd.DataFrame]:
        """获取历史数据"""
        hist_data = None
        
        try:
            logger.info("Trying efinance for historical data...")
            end_date = datetime.now().strftime('%Y%m%d')
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')

            hist_data = ef.stock.get_quote_history(symbol, beg=start_date, end=end_date)
            if not hist_data.empty:
                logger.info("efinance historical data success")
                return hist_data
            else:
                raise Exception("No historical data returned")

        except Exception as e:
            logger.warning(f"efinance historical data failed: {e}")
            # 尝试备用历史数据源
            logger.info("Trying alternative historical data sources...")
            hist_data = self._get_stock_history_alternative(symbol, days)
            
            if hist_data is not None and not hist_data.empty:
                logger.info("Alternative historical data success")
                return hist_data
        
        return None
    
    def _get_stock_history_alternative(self, symbol: str, days: int = 365) -> Optional[pd.DataFrame]:
        """备用历史数据获取函数"""
        try:
            # 使用网易财经API获取历史数据
            end_date = time.strftime('%Y%m%d')
            start_date = time.strftime('%Y%m%d', time.localtime(time.time() - days * 24 * 3600))
            
            netease_url = f"http://quotes.money.163.com/service/chddata.html?code=0{symbol}&start={start_date}&end={end_date}&fields=TCLOSE,HIGH,LOW,TOPEN,VOTURNOVER"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'http://quotes.money.163.com/'
            }
            
            response = self.session.get(netease_url, headers=headers, timeout=15)
            if response.status_code == 200:
                # 解析CSV数据
                lines = response.text.strip().split('\n')
                if len(lines) > 1:
                    data = []
                    for line in lines[1:]:  # 跳过标题行
                        parts = line.split(',')
                        if len(parts) >= 6:
                            data.append({
                                '日期': pd.to_datetime(parts[0]),
                                '收盘': float(parts[3]),
                                '最高': float(parts[4]),
                                '最低': float(parts[5]),
                                '开盘': float(parts[6]),
                                '成交量': float(parts[7]) if len(parts) > 7 else 1000000
                            })
                    
                    if data:
                        return pd.DataFrame(data)
        except Exception as e:
            logger.warning(f"Netease API failed: {e}")
        
        return None
    
    def generate_mock_data(self, symbol: str, current_price: float, days: int = 252) -> pd.DataFrame:
        """生成模拟历史数据"""
        logger.warning("Using mock historical data")
        dates = pd.date_range(end=datetime.now(), periods=days, freq='B')
        mock_data = {
            '日期': dates,
            '收盘': np.random.normal(current_price, current_price*0.02, len(dates)),
            '开盘': np.random.normal(current_price, current_price*0.02, len(dates)),
            '最高': np.random.normal(current_price*1.01, current_price*0.01, len(dates)),
            '最低': np.random.normal(current_price*0.99, current_price*0.01, len(dates)),
            '成交量': np.random.normal(1000000, 200000, len(dates))
        }
        return pd.DataFrame(mock_data)
