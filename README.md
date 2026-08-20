# ChatBot

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.5.

## Data Flow Diagram

```mermaid
flowchart LR
    U[User] -->|opens app /chatbot| A[Angular Frontend\napp.routes.ts]
    A --> B[ChatbotComponent\nchatbot.component.ts]

    B -->|GET /api/models| R[Remote Chat Backend\nhttps://chat-bot-backend-three.vercel.app]
    B -->|POST message, provider, model| R
    R -->|JSON model list| B
    R -->|JSON bot reply| B
    B -->|renders chat messages| U

    subgraph LocalRepo[This Repository]
        A
        B
    end

    R -->|calls configured LLM provider| L[LLM provider via backend\nenvironment config]
    L -->|response| R
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
