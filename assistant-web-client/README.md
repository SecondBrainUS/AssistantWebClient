# Assistant Web Client

## Development API Proxy

The app sends the readable `csrf_token` cookie as `X-CSRF-Token` on mutating API requests. To test cookie and CSRF behavior locally without browser CORS noise, run the Vite dev server with an API proxy target:

```env
VITE_BASE_PATH=/assistant
VITE_API_PATH=/api/v1
VITE_API_PROXY_TARGET=http://localhost:8000
```

With that setup, the browser talks to one origin, while Vite proxies `/assistant/api/...` requests and `/assistant/socket.io` traffic to the FastAPI server.
