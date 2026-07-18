# Android Kiosk Shell

This folder contains a native shell template for Android touch panels. It is intentionally separated from generated Capacitor files so the repository stays small and clean.

## Flow

1. Build the web app:

   ```bash
   npm run build -w frontend
   ```

2. Generate the Android project:

   ```bash
   cd frontend
   npm run apk:add
   npm run apk:sync
   ```

3. Apply the native ideas from `MainActivity.kt` to the generated Android project.

## Kiosk Behavior

- Fullscreen immersive mode.
- Keep screen on.
- Optional rotation lock: 0, 90, 180, 270.
- Intended for wall-mounted 55-85 inch touch panels.
- The web app also supports CSS-level rotation through local storage.

