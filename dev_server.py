import http.server
import socketserver
import json

PORT = 8000

class DiagnosticHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"\n--- GET REQUEST: {self.path} ---")
        print(f"Host: {self.headers.get('Host')}")
        print(f"Referer: {self.headers.get('Referer')}")
        print(f"User-Agent: {self.headers.get('User-Agent')}")
        print(f"Sec-Fetch-Mode: {self.headers.get('Sec-Fetch-Mode')}")
        print(f"Sec-Fetch-Site: {self.headers.get('Sec-Fetch-Site')}")
        print(f"Sec-Fetch-Dest: {self.headers.get('Sec-Fetch-Dest')}")
        print("---------------------------------")
        super().do_GET()

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
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status":"received"}')
        else:
            print(f"\n--- POST REQUEST: {self.path} ---")
            print(f"Host: {self.headers.get('Host')}")
            print(f"Referer: {self.headers.get('Referer')}")
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else b""
            print(f"Body: {body.decode('utf-8', errors='replace')}")
            print("----------------------------------")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

Handler = DiagnosticHTTPRequestHandler
class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

ThreadingTCPServer.allow_reuse_address = True

print(f"Starting Diagnostic Dev Server at http://localhost:{PORT}")
with ThreadingTCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
