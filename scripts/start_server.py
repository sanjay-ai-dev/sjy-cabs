#!/usr/bin/env python3
import http.server
import socketserver
import os
import mimetypes

PORT = 3005
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class DirectFileHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        clean_path = self.path.split('?')[0].split('#')[0]
        if clean_path == '/':
            clean_path = '/dashboards/user/index.html'
            
        rel_path = clean_path.lstrip('/')
        file_path = os.path.abspath(os.path.join(BASE_DIR, rel_path))
        
        if os.path.isdir(file_path):
            file_path = os.path.join(file_path, 'index.html')
            
        if os.path.isfile(file_path):
            self.send_response(200)
            mime_type, _ = mimetypes.guess_type(file_path)
            self.send_header('Content-Type', mime_type or 'text/html; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            self.send_error(404, f"File Not Found: {clean_path}")

print(f"🚀 SJY Mobility Direct Server running at http://localhost:{PORT}")
with socketserver.TCPServer(("", PORT), DirectFileHandler) as httpd:
    httpd.allow_reuse_address = True
    httpd.serve_forever()
