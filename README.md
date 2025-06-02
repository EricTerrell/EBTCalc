# EBTCalc for Windows and Linux

EBTCalc (Desktop) is a Reverse Polish Notation (RPN) calculator with custom buttons, 
programmed in Javascript, using a convenient editor. EBTCalc runs on 
Windows (Intel/AMD 64-bit) and Linux (Intel/AMD 64-bit, ARM 64-bit). EBTCalc is 
open source.

EBTCalc is built on the [`Electron`](https://github.com/electron/electron) framework.

# Copyright

EBTCalc (Desktop)

&#169; Copyright 2025, [`Eric Bergman-Terrell`](https://www.ericbt.com)

# Screenshots

![`EBTCalc Screenshot`](https://www.ericbt.com/uploaded_images/ebtcalc_github.png "EBTCalc Screenshot, Main Window")

![`EBTCalc Screenshot`](https://www.ericbt.com/uploaded_images/ebtcalc_github_2.png "EBTCalc Screenshot, Edit Window")

# Links

* [`website`](https://www.ericbt.com/ebtcalc_electron)
* [`binaries`](https://www.ericbt.com/ebtcalc_electron/download)
* [`installation`](https://www.ericbt.com/ebtcalc_electron/installation)
* [`reference`](https://www.ericbt.com/ebtcalc_electron/reference)
* [`version history`](https://www.ericbt.com/ebtcalc_electron/versionhistory)
* [`donate`](https://www.ericbt.com/ebtcalc_electron/donate)

# Android Version

A version of [`EBTCalc for Android`](https://www.ericbt.com/ebtcalc) is also available.

# Quick Start

To run EBTCalc:

```sh
git clone https://github.com/EricTerrell/EBTCalc.git
cd EBTCalc
npm install
npm start
```

# Debugging

To enable the Chrome debugging tools, set the DEBUG_MENUS environment variable to true (see displayCustomMenus in WindowUtils)

# Building

To build:

```sh
npm run build
```
This will create all versions in an EBTCalc-build folder.

# Running

When running the Linux (ARM 64-bit) version, you may need to include
the "--no-sandbox" option.

# License

[`GPL3`](https://www.gnu.org/licenses/gpl-3.0.en.html)

# Feedback

Please submit your feedback to EBTCalc@EricBT.com.