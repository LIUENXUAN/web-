param([int]$Port = 6129, [switch]$NoOpen)
$ErrorActionPreference = "Stop"
$Root = [IO.Path]::GetFullPath($PSScriptRoot)
$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".css"="text/css; charset=utf-8";
  ".json"="application/json; charset=utf-8"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
  ".webp"="image/webp"; ".svg"="image/svg+xml"; ".mp4"="video/mp4"; ".glb"="model/gltf-binary";
  ".gltf"="model/gltf+json"; ".bin"="application/octet-stream"; ".wasm"="application/wasm"; ".woff"="font/woff"; ".woff2"="font/woff2";
  ".ico"="image/x-icon"; ".txt"="text/plain; charset=utf-8"
}
function Get-FreePort([int]$StartPort) {
  for ($p = $StartPort; $p -lt ($StartPort + 80); $p++) {
    $client = $null
    try {
      $client = [Net.Sockets.TcpClient]::new()
      $iar = $client.BeginConnect('127.0.0.1', $p, $null, $null)
      if (-not $iar.AsyncWaitHandle.WaitOne(120, $false)) { return $p }
      $client.EndConnect($iar)
    } catch { return $p }
    finally { if ($client) { $client.Close() } }
  }
  throw "没有找到可用端口。"
}
function Resolve-PathSafe([string]$UrlPath) {
  $pathOnly = ($UrlPath -split '\?')[0]
  $rawPath = [Uri]::UnescapeDataString($pathOnly.TrimStart('/'))
  if ([string]::IsNullOrWhiteSpace($rawPath)) { $rawPath = 'index.html' }
  $relative = $rawPath -replace '/', [IO.Path]::DirectorySeparatorChar
  $candidate = [IO.Path]::GetFullPath((Join-Path $Root $relative))
  if (-not $candidate.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) { return (Join-Path $Root 'index.html') }
  if (Test-Path -LiteralPath $candidate -PathType Container) { $candidate = Join-Path $candidate 'index.html' }
  if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { $candidate = Join-Path $Root 'index.html' }
  return $candidate
}
$Port = Get-FreePort $Port
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Parse('127.0.0.1'), $Port)
$listener.Start()
$url = "http://127.0.0.1:$Port/"
Write-Host "Nature Haven Camp 前台已启动：$url"
Write-Host "关闭此窗口即可停止服务。"
if (-not $NoOpen) { Start-Process $url }
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()
      while ($reader.ReadLine()) {}
      if (-not $requestLine) { continue }
      $parts = $requestLine.Split(' ')
      $file = Resolve-PathSafe $parts[1]
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
      $type = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
      $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($headerBytes, 0, $headerBytes.Length)
      $stream.Write($bytes, 0, $bytes.Length)
    } catch {
      try {
        $body = [Text.Encoding]::UTF8.GetBytes('Server error')
        $header = "HTTP/1.1 500 Internal Server Error`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
      } catch {}
    } finally {
      try { $reader.Dispose() } catch {}
      try { $client.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
