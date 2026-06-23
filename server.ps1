$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Prefixes.Add("http://[::1]:$port/")
try {
    $listener.Start()
} catch {
    Write-Host "Failed to start listener on port $port. Check if port is already in use."
    Write-Host $_
    exit 1
}

Write-Host "Veritas AI Static Server running on http://localhost:$port/"
Write-Host "Press Ctrl+C to stop the server."

$currentDir = Get-Location

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        # Replace forward slashes with backward slashes for Windows path joining
        $relativePath = $urlPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $currentDir $relativePath
        
        if (Test-Path $filePath -PathType Leaf) {
            try {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                
                # Set appropriate content type
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mimeType = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".gif"  { "image/gif" }
                    ".svg"  { "image/svg+xml" }
                    ".ico"  { "image/x-icon" }
                    default { "application/octet-stream" }
                }
                $response.ContentType = $mimeType
                
                # CORS headers and cache disable
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
                
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } catch {
                $response.StatusCode = 500
                $errorMessage = "500 Internal Server Error: $_"
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
                $response.ContentLength64 = $bytes.Length
                $response.ContentType = "text/plain; charset=utf-8"
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
        } else {
            $response.StatusCode = 404
            $errorMessage = "404 Not Found: $urlPath"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
            $response.ContentLength64 = $bytes.Length
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Error occurred: $_"
} finally {
    $listener.Stop()
    Write-Host "Server stopped."
}
