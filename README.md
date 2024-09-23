# XXX_NAME_XXX

Source code of [XXX_NAME_XXX.fr](XXX_URL_XXX)

## Installation

```sh
git clone https://github.com/clemdee/XXX_REPOSITORY_XXX.git
cd XXX_REPOSITORY_XXX
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
