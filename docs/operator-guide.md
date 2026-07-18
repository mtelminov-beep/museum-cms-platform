# Operator Guide

## Typical Setup

1. Create museum content in the CMS.
2. Assign each screen a profile.
3. Create playlists for zones or halls.
4. Open `/display/<screen-id>` on each device.
5. Enable kiosk mode on public touch panels.

## Rotation

The frontend stores rotation in local storage:

- `0`
- `90`
- `180`
- `270`

The Android shell can also lock orientation natively.

## Deployment Notes

For production, configure:

- persistent storage for `backend/data/runtime-state.json`
- media object storage or a mounted media folder
- HTTPS for tablets and Android WebView
- process manager for backend service

