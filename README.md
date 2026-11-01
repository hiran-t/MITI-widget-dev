# MITI widget

Start a [MITI](https://github.com/hiran-t/MITI) widget here. A widget adds panels to MITI, for example for a robot's driver or a vision system, and is imported into an installed MITI as one `.miti-widget` file, with no change to MITI itself.

This template holds a working widget, **Gauge**: a panel that shows a number from any topic as a dial, such as `position[0]` of `/joint_states`. Change it into yours.

## Build it

You need Node.js 20 or newer.

```bash
npm install
npm run build        # dist/example.gauge-1.0.0.miti-widget
```

In MITI, open **Widgets** in the activity bar on the left, click **Import widget…** and choose the file. Then add the panel with **+ → Gauge**, select it, and set **Topic** and **Field** to a number the robot publishes.

## Work on it

With MITI running (here at its default address):

```bash
npm run dev          # same as: npx miti-widget dev --miti http://localhost:3000
```

Every change to `src/` or `manifest.json` is built and imported into that MITI; reload MITI's page to see it. Build errors are printed with their file and line. `npm run type-check` checks the code against `@miti/sdk`.

## Make it yours

1. In `manifest.json`, set `id` (lowercase words joined by dots or dashes, e.g. `acme.vision`; it never changes once people use the widget), `name`, `description`, `author` and `version`.
2. In `src/index.tsx`, make each panel's `type` start with the new id and a slash, e.g. `acme.vision/detections`. Layouts save these types, so keep them once released.
3. Rename the package in `package.json`, and replace this README.

A panel is a React component that MITI gives its settings, a connection to the robot and the robot's topics; `@miti/sdk` provides `useTopic`, `useTF`, `ImageCanvas` for camera images, and the settings fields MITI's own panels use. MITI's manual describes all of it: _Write a Widget_ and _Widget SDK_. Packages from npm can be imported and are bundled into the widget; React and `@miti/sdk` come from MITI.

## Release it

Raise `version` in `manifest.json`, commit, and push a tag with that version:

```bash
git tag v1.0.0 && git push origin v1.0.0
```

GitHub Actions builds the widget and publishes `dist/<id>-<version>.miti-widget` in a release, where people download it to import into MITI. Importing a newer version replaces the old one; panels keep their settings.

## License

[MIT](LICENSE).
