import http.server
import socketserver
import json
import mimetypes

PORT = 8000

# Register missing MIME types for modern web assets
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('model/gltf-binary', '.glb')
mimetypes.add_type('model/gltf+json', '.gltf')
mimetypes.add_type('application/wasm', '.wasm')
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('application/manifest+json', '.webmanifest')
mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('font/woff', '.woff')

class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == "/diagnostics":
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b""
            
            print(f"\n=== CLIENT DIAGNOSTIC REPORT RECEIVED ===")
            try:
                report = json.loads(body.decode('utf-8'))
                for k, v in report.items():
                    print(f"  {k}: {v}")
            except Exception as e:
                print(f"  Failed to parse report: {e}")
                print(f"  Raw Body: {body}")
            print("=========================================\n")
            
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"received"}')
        else:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b""
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

Handler = DevHTTPRequestHandler

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

ThreadingTCPServer.allow_reuse_address = True

print(f"Starting Dev Server at http://localhost:{PORT}")
print(f"Serving files from current directory")
with ThreadingTCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
