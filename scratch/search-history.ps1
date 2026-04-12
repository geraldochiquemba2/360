$recentFiles = Get-ChildItem -Path "$env:APPDATA\Code\User\History" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge (Get-Date).AddDays(-2) }
foreach ($file in $recentFiles) {
    if (Get-Content $file.FullName -TotalCount 50 -ErrorAction SilentlyContinue | Select-String -Pattern 'export default function TopicView' -Quiet) {
        Write-Output "$($file.FullName) - $($file.LastWriteTime)"
    }
}
