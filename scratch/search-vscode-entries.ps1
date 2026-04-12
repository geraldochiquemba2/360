$historyDirs = @("$env:APPDATA\Code\User\History", "$env:APPDATA\Cursor\User\History")

foreach ($dir in $historyDirs) {
    if (Test-Path $dir) {
        $entriesFiles = Get-ChildItem -Path $dir -Filter "entries.json" -Recurse -File -ErrorAction SilentlyContinue 
        foreach ($entryFile in $entriesFiles) {
            $content = Get-Content $entryFile.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match "topic-view.tsx") {
                Write-Output "Found matching entries in: $($entryFile.FullName)"
                $folder = Split-Path $entryFile.FullName
                Get-ChildItem -Path $folder -File | Where-Object { $_.Name -ne "entries.json" } | Sort-Object LastWriteTime -Descending | Select-Object FullName, LastWriteTime | ConvertTo-Json
            }
        }
    }
}
