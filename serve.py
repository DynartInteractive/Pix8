#!/usr/bin/env python3
"""Serve Pix8 as static files on the LAN, for browsing from the retro boxes.

SimpleHTTPRequestHandler plus the three things it lacks here:

  * Cache-Control: no-store on every response. index.html cache-busts with
    ?v=ASSET_VERSION, but that string only moves on a release, so between
    `npm run build` runs an old browser would happily keep serving itself a
    stale dist/bundle.js. no-store is what makes "rebuild, hit refresh on the
    other machine" actually show the new code.
  * MIME types for .svg/.ico, which are what the whole toolbar is made of and
    are missing from a thin /etc/mime.types.
  * A deny list, because this binds every interface (tun0 included), and the
    repo next to index.html holds .git and node_modules.

Usage: ./serve.py [port]    (default 8088)
"""

import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_PORT = 8088

# Path segments never worth exposing. Matched per-segment, so this blocks
# /.git/config and /js/../.git alike once the path is normalised.
DENY = {'.git', 'node_modules', 'release'}


class Pix8Handler(SimpleHTTPRequestHandler):

    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.pix8': 'application/octet-stream',
        '.pal': 'application/octet-stream',
        '.pcx': 'image/x-pcx',
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def send_head(self):
        # translate_path() has already normalised away ".." by the time we
        # read it back, so comparing segments is enough.
        rel = os.path.relpath(self.translate_path(self.path), ROOT)
        if any(seg in DENY for seg in rel.split(os.sep)):
            self.send_error(403, 'Forbidden')
            return None
        return super().send_head()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    with ThreadingHTTPServer(('0.0.0.0', port), Pix8Handler) as httpd:
        print(f'Pix8 serving {ROOT} on http://0.0.0.0:{port}', flush=True)
        httpd.serve_forever()


if __name__ == '__main__':
    main()
