# Vercel Serverless Function 示例
# 文件路径: api/stock-info.py

from http.server import BaseHTTPRequestHandler
import json
import yfinance as yf

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 解析查询参数
        from urllib.parse import urlparse, parse_qs
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        symbol = query_params.get('symbol', [''])[0]
        
        if not symbol:
            self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Symbol required'}).encode())
            return
        
        try:
            # 获取股票信息
            stock = yf.Ticker(symbol)
            info = stock.info
            
            result = {
                'symbol': symbol,
                'name': info.get('longName', ''),
                'price': info.get('currentPrice', 0),
                'change': info.get('regularMarketChange', 0),
                'changePercent': info.get('regularMarketChangePercent', 0)
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
