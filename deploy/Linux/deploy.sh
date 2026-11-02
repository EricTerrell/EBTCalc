#  EBTCalc
#  (C) Copyright 2026, Eric Bergman-Terrell
#
#  This file is part of EBTCalc.
#
#  EBTCalc is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  EBTCalc is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with EBTCalc.  If not, see <http://www.gnu.org/licenses/>.

echo "Building Linux Installs"
echo ""

cd ../..

pwd

sw_dev_folder="/home/eric/Documents/software development"
build_folder="$sw_dev_folder/EBTCalc-build"

rm -rf "$build_folder"
mkdir "$build_folder"

ls -l "$build_folder"

npm run build-linux

cd "$build_folder"

chmod +x EBTCalc-linux-x64/EBTCalc
chmod +x EBTCalc-linux-arm64/EBTCalc

tar -czvf EBTCalc-linux-x64.tar.gz EBTCalc-linux-x64
tar -czvf EBTCalc-linux-arm64.tar.gz EBTCalc-linux-arm64

echo ""
echo "Finished Building Linux Installs"