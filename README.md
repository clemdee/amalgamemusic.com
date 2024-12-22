# amalgamemusic

Source code of [amalgamemusic.fr](https://amalgamemusic.com)

## Installation

```sh
git clone https://github.com/clemdee/amalgamemusic.git
cd amalgamemusic
pnpm install

# switch to dev branch
git switch dev
```

### Start dev server

```sh
pnpm dev

# Start and expose host to LAN for mobile testing
# pnpm dev --host
```

> [!IMPORTANT]
> Changes on `main` branch will automatically be deployed to production, so this branch is protected.
> Use the `dev` branch to work on a feature until it is ready to be deployed.

## Build for Production

```sh
pnpm build

# Test the build
# pnpm preview
```
