# Zephyr Quick Setup
This branch is for quick setup of a zephyr front end folder.

## Windows
```bash
curl -ks https://cdn.jsdelivr.net/gh/axel669/setup@zephyr/setup.js | node.exe - "target folder"
```

## Less Dumb Systems
> Windows is dumb about how it resolved the node command with piped input.
```
curl -ks https://cdn.jsdelivr.net/gh/axel669/setup@zephyr/setup.js | node - "target folder"
```
