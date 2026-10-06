# Contributing

## Set up

Follow the [local setup guide](./README.md#quick-start) to configure PostgreSQL and Firebase, install the frontend and backend dependencies, and start both applications. Work in the relevant app directory; there is no root-level npm workspace.

## Development and checks

- Keep changes focused and follow the existing TypeScript, React, and Express patterns. The backend TypeScript configuration enables strict checking; the frontend uses the Next.js App Router and the `@/*` import alias.
- The frontend exposes `npm run lint` and `npm run build` from `frontend/`. The backend currently exposes `npm run dev` and `npm start`, but has no lint, test, or build script. Run the checks applicable to the code you changed and describe any checks you could not run in the pull request.
- The Next.js configuration currently ignores ESLint and TypeScript errors during builds. A successful frontend build therefore does not replace running lint or type checks.
- Never commit `.env` files, Firebase service-account credentials, API tokens, or other secrets. Keep frontend configuration limited to Firebase's public web-app settings.

## Pull requests

1. Fork the repository and create a focused branch, for example `feature/add-rant-filter`.
2. Make and locally verify the change; include or update documentation when behavior or setup changes.
3. Open a pull request describing the user-visible change, implementation impact, and checks performed. Link related issues and include screenshots for UI changes when helpful.
4. Respond to review feedback and keep the pull request scoped to one coherent change.
