Add-Type -AssemblyName System.Drawing
$path = "c:\Users\geral\Desktop\360\360\artifacts\carreira-360\public\assets\logo.png"
$img = [System.Drawing.Image]::FromFile($path)
$img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone)
$path2 = "c:\Users\geral\Desktop\360\360\artifacts\carreira-360\public\assets\logo2.png"
$img.Save($path2, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Move-Item -Force $path2 $path
