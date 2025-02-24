# EasyRequester

![GitHub License](https://img.shields.io/github/license/caganseyrek/EasyRequester)
![GitHub repo size](https://img.shields.io/github/repo-size/caganseyrek/EasyRequester)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/caganseyrek/EasyRequester)

EasyRequester is a modular HTTP client wrapper designed to be easy to use. It provides a simple, structured approach for making HTTP requests with the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with type safety, and without any dependencies.

## Key Features

- Built-in methods for handling race conditions
- Built-in debugger for detailed outputs
- Built-in TypeScript support for type safety

## Installation

EasyRequester is not available as an NPM package (at least currently).

You either can clone the repository and use it:

```bash
git clone https://github.com/caganseyrek/EasyRequester.git
cd path/to/EasyRequester
```

Or include the compiled source file from the `dist/` folder in the repository:

```plaintext
dist/
├── easy-requester.js
└── easy-requester.min.js
src/
└── ...
eslint.config.mjs
package.json
tsconfig.json
...
```

## Documentation

For detailed documentation, please see the [project wiki](https://github.com/caganseyrek/EasyRequester/wiki).

## Roadmap

- Interceptors
- Timeout Handling
- Request Throttling
- Request Deduplication
- Custom Middleware Support
- Retry Mechanism
- CLI Support for Sending Requests
- Automatic Token Refresh
- Plugin system (?)

## License

This project is open-source and licensed under [MIT License](https://github.com/caganseyrek/EasyRequester/blob/main/LICENSE).
