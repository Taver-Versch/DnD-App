# D&D Helper App

This is another App I made as a solution for myself. This is a full character sheet app with all the sections I would use myself. Used [D&D 5e SRD API](https://www.dnd5eapi.co) to pull some data for 5e. There is a local JSON file export/import to keep data even if broswer data is deleted. Completely self hosted, no account, no backend server, etc.

## Quick start

**Windows:** double-click `start.bat`.
**Mac/Linux:** double-click `start.sh` (or run `./start.sh` in a terminal).

The first run installs dependencies (requires [Node.js](https://nodejs.org) 18+), then builds and serves the app. It'll print two multiple URLS, use whichever suits your needs best.

Stop the server anytime with `Ctrl+C` in the terminal window.

### Manual equivalent

```
npm install
npm run start
```

### Development mode 

```
npm install
npm run dev
```

## Data & content notes
Class, Race, Skill, Equipment, Spell data is from free SRD API. Covers a bunch of basic information, does not cover everything, a lot of information will need to be input manually.

## Save & load
Characters are autosaved to your browser's local storage as you edit them. You can additionally EXPORT JSON or Import from file to both create and load JSON files.