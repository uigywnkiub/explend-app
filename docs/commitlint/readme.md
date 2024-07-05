# Commit Message Guidelines

We follow the commit message conventions as defined by `commitlint-config-conventional`, based on the Angular convention. Below are the common commit types and their descriptions:

## Commit Types

1. **build**

   - **Description**: Changes that affect the build system or external dependencies.
   - **Examples**:
     - `build: update webpack to version 5`
     - `build: add eslint configuration`

2. **chore**

   - **Description**: Routine tasks and maintenance activities that do not modify source code or tests.
   - **Examples**:
     - `chore: update npm scripts`
     - `chore: add .editorconfig`

3. **ci**

   - **Description**: Changes to the continuous integration configuration files and scripts.
   - **Examples**:
     - `ci: add code coverage report`
     - `ci: update GitHub Actions workflow`

4. **docs**

   - **Description**: Documentation-only changes.
   - **Examples**:
     - `docs: add API documentation`
     - `docs: update README with new instructions`

5. **feat**

   - **Description**: A new feature or significant addition to the codebase.
   - **Examples**:
     - `feat: add user authentication`
     - `feat: implement new payment gateway`

6. **fix**

   - **Description**: A bug fix.
   - **Examples**:
     - `fix: correct validation error message`
     - `fix: resolve issue with user login`

7. **perf**

   - **Description**: Changes that improve performance.
   - **Examples**:
     - `perf: improve data fetching efficiency`
     - `perf: optimize image loading`

8. **refactor**

   - **Description**: Code changes that neither fix a bug nor add a feature but improve the code's structure and readability.
   - **Examples**:
     - `refactor: simplify user service logic`
     - `refactor: rename variables for clarity`

9. **revert**

   - **Description**: Reverting a previous commit.
   - **Examples**:
     - `revert: revert commit abc123`

10. **style**

    - **Description**: Changes that do not affect the meaning of the code (e.g., formatting, adding missing semicolons).
    - **Examples**:
      - `style: format code according to ESLint rules`
      - `style: correct indentation`

11. **test**
    - **Description**: Adding or updating tests.
    - **Examples**:
      - `test: add tests for user service`
      - `test: fix broken tests`

## Read More

<https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional>
