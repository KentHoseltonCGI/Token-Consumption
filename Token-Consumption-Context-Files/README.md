# Project Context Bootstrap: Tool-Agnostic GenAI IDE Methodology

## Overview

This project provides a reusable, tool-agnostic methodology for bootstrapping software projects that leverage generative AI (GenAI) IDE tooling and agents. Our goal is to empower developers and teams to establish a solid foundation for integrating GenAI-driven workflows, regardless of their preferred tools or platforms.

### Problem Space

The rapid evolution of GenAI IDE tooling—such as Copilot Agent Mode, Cline, Cursor, Windsurf, and others—has created new opportunities and challenges for software development. While these tools offer powerful features, their approaches to project context, prompt management, and integration can vary widely. This project aims to:

- Define a methodology that is agnostic to specific tools or vendors
- Enable consistent, reusable, and extensible project context management
- Facilitate rapid adoption and iteration as new GenAI capabilities emerge

## Key Principles

- **Tool Agnosticism:** Designed to work with any GenAI IDE tooling or agent, not tied to a specific vendor or platform.
- **Reusability & Extensibility:** Prompts, scripts, and context structures are modular and easy to adapt.
- **Rapid Iteration:** The methodology is versioned and designed to evolve as industry standards and tooling advance.
- **Integration-Friendly:** Includes scripts and prompts to ease adoption in common GenAI IDEs and agents.

## Methodology Structure

All methodology-related folders reside under a root-level `.genai` directory. This ensures a clear separation of GenAI project context and assets from your application code, and makes it easy to adopt or extend this methodology in any project. For example, your project structure will look like `{root}/.genai/context`, `{root}/.genai/prompts`, etc.

- **.genai/context/**: Stores and maintains project context in a structured, markdown-based format.
- **.genai/prompts/**: Houses reusable prompts for bootstrapping and evolving projects.
- **.genai/examples/**: Contains real-world examples and use cases to illustrate best practices and new capabilities.
- **.genai/scripts/**: (Planned) Scripts to help integrate this methodology with popular GenAI IDE tooling.

## Getting Started

1. Clone this repository.
2. Review the `.genai/context` and `.genai/prompts` folders to understand the base structure.
3. Use or adapt the provided prompts and context files in `.genai` to bootstrap your own project.
4. Contribute new prompts, scripts, or examples as you discover new patterns or needs.

## Contributing

We welcome contributions from the community! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues, feature requests, and pull requests.

## Roadmap

- [ ] Define initial context and prompt templates
- [ ] Develop integration scripts for common GenAI IDEs/agents
- [ ] Expand examples and best practices
- [ ] Establish versioning and changelog process

## License

This project is open source and available under the MIT License.

---

*When we refer to "GenAI IDE tooling" or "agents," we mean tools such as Copilot Agent Mode, Cline, Cursor, Windsurf, and similar solutions. Our methodology is designed to be compatible with any such tool, now and in the future.*
