<#
  EBTCalc
  (C) Copyright 2026, Eric Bergman-Terrell

  This file is part of EBTCalc.

  EBTCalc is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  EBTCalc is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with EBTCalc.  If not, see <http://www.gnu.org/licenses/>.
#>

Push-Location

c:

cd "C:\Users\erict\Documents\software development\electron-programmable-rpn-calculator"

Write-Output ""
Write-Output "Creating Windows Setup Zip File"

$zip_input_file = ".\setup\Output\EBTCalc Setup.exe"
$zip_output_file = "C:\Users\erict\Documents\software development\EBTCalc-build\EBTCalc-win32-x64.zip"

if (Test-Path "$zip_output_file")
{
    Remove-Item -Path "$zip_file"
}

if (!(Test-Path "$zip_input_file"))
{
    throw "No setup .exe file found. You need to run Inno Setup Compiler"
}

7z a -tzip "$zip_output_file" "$zip_input_file"
Remove-Item -Path "$zip_input_file"

cd "C:\Users\erict\Documents\software development\EBTCalc-build"

Write-Output ""
Write-Output "Creating Linux Setup Zip Files"

7z a -tzip "EBTCalc-linux-arm64.zip" "EBTCalc-linux-arm64"
7z a -tzip "EBTCalc-linux-x64.zip" "EBTCalc-linux-x64"

Write-Output ""
Write-Output "Cleaning Up"

Remove-Item -Path "EBTCalc-linux-arm64" -Recurse -Force
Remove-Item -Path "EBTCalc-linux-x64"   -Recurse -Force
Remove-Item -Path "EBTCalc-win32-x64"   -Recurse -Force

Write-Output ""
Write-Output "Finished"

Pop-Location
