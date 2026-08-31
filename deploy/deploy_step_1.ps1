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

$windows_setup_path = ".\setup\Output\EBTCalc Setup.exe"

if (Test-Path "$windows_setup_path")
{
    Remove-Item -Path "$windows_setup_path" -Force
}

Get-ChildItem -Path "C:\Users\erict\Documents\software development\EBTCalc-build" -Directory | Remove-Item -Recurse -Force
Remove-Item -Path "C:\Users\erict\Documents\software development\EBTCalc-build\*.zip" -Force

npm run build

Write-Host "Now run Inno Setup Compiler (load electron-programmable-calculator/setup.iss). Build/Compile."

Pop-Location
