TCO2GO
=====================

Hybrid mobile app for TopCoder Open using Ionic.

## iOS Build Errors

I encountered the following error when running `ionic build ios` 

    Details: Unable to get message category info for tool '/usr/bin/llvm-gcc-4.2'.
    Reason: i686-apple-darwin11-llvm-gcc-4.2: no input files
    
So I added the following to my profile per [this issue](https://github.com/HipByte/motion-cocoapods/issues/12):

    export CC=/usr/bin/clang