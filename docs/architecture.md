# Architecture

The platform follows the SHIHM-style separation of concerns without reusing SHIHM content.

## Layers

- CMS API stores structured museum state.
- Web control panel edits exhibitions, playlists, navigation, device profiles, and media references.
- Display runtime renders the same state for touch panels, TVs, projectors, and tablets.
- Android kiosk shell wraps the web runtime for locked panels.

## Content Model

Content belongs to a museum installation, not to the codebase. The repository ships only neutral seed data.

Core entities:

- museum
- navigation
- exhibitions
- screens
- playlists
- media
- schedules

## Device Strategy

Each physical screen uses a device profile:

- size and aspect ratio
- rotation
- interaction density
- kiosk lock
- target route

