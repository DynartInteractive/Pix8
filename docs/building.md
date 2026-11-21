# Building from Source

## Web version

```bash
npm install
npm run build    # webpack production build
npm start        # serve at http://localhost:3000
```

For development with auto-rebuild, one line (webpack watch backgrounded + server in the foreground):

```bash
npm run dev & npm start
```

`serve` binds to all network interfaces, so it prints a LAN URL (e.g. `http://192.168.0.x:3000`) alongside `localhost` -- handy for testing on another machine on the network. To stop, `Ctrl+C` the server, then `kill %1` (or `fg` then `Ctrl+C`) to end the backgrounded webpack watcher.

Or run the two halves in separate terminals if you prefer isolated output:

```bash
npm run dev      # webpack watch mode (in one terminal)
npm start        # serve at http://localhost:3000 (in another terminal)
```

## Electron desktop app

```bash
npm run electron              # Run as desktop app
DEVTOOLS=1 npm run electron   # Run with DevTools (F12 to toggle)
npm run dist:linux            # Build Linux AppImage/deb
npm run dist:win              # Build Windows installer (unsigned)
npm run dist:mac              # Build macOS dmg
```

Without signing, the Windows installer shows an "Unknown publisher" warning. Signing is described in [installer-signing.md](installer-signing.md) (the short recipe) and [azure-signing.md](azure-signing.md) (the service behind it).

## Android app (Capacitor)

The same web build runs as a native Android app via [Capacitor](https://capacitorjs.com), fully offline. Requires Node 22+, a JDK 17+, and the Android SDK (Android Studio is the easiest way to get both).

```bash
npm run cap:sync      # build, assemble www/, copy into android/
npm run android       # ...and open the project in Android Studio
npm run android:apk   # ...and build android/app/build/outputs/apk/debug/app-debug.apk
```

The Gradle wrapper needs `JAVA_HOME`; Android Studio's bundled JDK works, e.g. `export JAVA_HOME=~/Apps/android-studio/jbr` (put it in your shell profile). The SDK path goes in `android/local.properties` as `sdk.dir=/home/you/Android/Sdk`; Android Studio writes that file when it opens the project.

Install the debug APK on the tablet with `adb install -r app-debug.apk`, or copy the file over and open it. Save and Open use the system file dialogs, starting in `Documents/Pix8/`. For a release build, sign it in Android Studio (Build > Generate Signed App Bundle / APK).

## Command line

`npm link` puts `pix8` on the PATH. What it does is described under the command line entry in [features.md](features.md#import-and-export).
