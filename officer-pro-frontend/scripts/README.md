# Start the frontend locally

Run this from PowerShell at the frontend repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1
```

The script validates `compose.yaml`, builds the frontend image, starts the container, waits for it to become ready, and prints its status. Open <http://localhost:3000>.
