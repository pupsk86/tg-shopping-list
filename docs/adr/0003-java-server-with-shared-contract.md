# Java server, with a contract instead of shared code

The V2 server is written in Java with Spring Boot and built as a GraalVM native image, while the mini app is TypeScript. Because the two cannot share code, the rules both sides enforce are written twice and kept in step by a shared contract in `contract/`: `validation-cases.json`, which both test suites run, and `openapi.yaml`, from which the web app's API client is generated.

## Considered Options

- **TypeScript server sharing a domain package with the web app**: one copy of the rules, but the server is to run on the JVM.
- **Quarkus or Micronaut**: also build native images; Spring Boot was chosen.

## Consequences

- The repo has a `web/` folder (pnpm) and, from V2, a `server/` folder (Gradle), rather than a JavaScript workspace.
