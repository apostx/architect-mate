# ArchitectMate

A minimalist, visual system design and solution architecture practice game. The player gets a scenario with requirements, designs a solution by choosing components, connecting them and setting the properties that matter, and the solution is evaluated by its behavior, not by its similarity to a model answer.

Solutions are modeled and validated by [SolutionValidator](https://github.com/apostx/solution-validator). The game runs entirely in the browser and is hosted on GitHub Pages: <https://apostx.github.io/architect-mate/>.

> **Status:** early development (Iteration 0, foundations). There is no playable challenge yet.

## Documentation

- [Product vision](docs/product-vision.md): what the game is and is not
- [Design decisions](docs/design.md): decided and proposed items, open questions
- [Roadmap](docs/roadmap.md): iterations and their scope
- [Challenges](docs/challenges.md): challenge direction, candidates and validation gaps

## Development

Requires Node.js 22.18 or newer (see `.nvmrc`) and npm.

```sh
npm ci          # install dependencies
npm run dev     # start the dev server
npm run check   # everything CI runs: typecheck, lint, tests, build
```

See [CLAUDE.md](CLAUDE.md) for every command, the repository rules and how the SolutionValidator dependency is installed.

### Commit messages and releases

Commits follow [Conventional Commits](https://www.conventionalcommits.org/); commitlint checks every commit in a pull request and the pull request title. [release-please](https://github.com/googleapis/release-please) opens a release pull request from the `feat` and `fix` commits on `main`; merging it tags the release and updates the changelog. Versions follow [SemVer](https://semver.org/) and stay at `0.x` until the game is declared stable.

### One-time repository setup

These settings live on GitHub, not in the repository:

1. **Pages:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. **Release pull requests:** Settings → Actions → General → Workflow permissions: enable **Allow GitHub Actions to create and approve pull requests**.
3. **Merging:** Settings → General → Pull Requests: allow **rebase merging** (and squash merging if wanted).
4. **Optional, CI on release pull requests:** pull requests opened with the default `GITHUB_TOKEN` do not trigger workflows. If the release pull request must pass required checks, add a `RELEASE_PLEASE_TOKEN` secret: a fine-grained token with read and write access to contents and pull requests on this repository.

## License

[GNU Affero General Public License v3.0](LICENSE) (`AGPL-3.0-only`), the same license as SolutionValidator, which the game bundles.
