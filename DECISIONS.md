# Decisions

## Bundler: Vite

Chosen over a standalone esbuild script for library IIFE builds, watch mode, and a simple path to later ONNX asset handling.

## GitHub owner: andremafei

Used in production `@namespace`, `@updateURL`, and `@downloadURL` to match the repository path.

## Local loader uses GM.xmlHttpRequest + eval

Injecting a `<script src="http://127.0.0.1:4173/...">` would run in the page world without GM APIs. Fetching the bundle with `GM.xmlHttpRequest` and evaluating it keeps LOCAL DEV inside the userscript sandbox.

## Separate storage / IndexedDB / panel IDs

Local and production builds use different prefixes and DOM IDs so both scripts do not collide if both are accidentally enabled.

## Stage 1 UI is a Shadow DOM floating panel

Isolates styles from OLX CSS. No framework (React/Vue) per project constraints.
