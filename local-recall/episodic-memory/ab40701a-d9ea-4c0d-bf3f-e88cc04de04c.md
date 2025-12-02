---
id: ab40701a-d9ea-4c0d-bf3f-e88cc04de04c
subject: Project development requires comprehensive tests and documentation
keywords:
  - testing
  - documentation
  - development
  - requirements
  - best practices
applies_to: global
occurred_at: '2025-12-02T17:26:13.651Z'
content_hash: f1a1812b1fb419a8
---
Development requirements for this project:
- All new features must have unit tests in `tests/unit/`
- Integration tests go in `tests/integration/`
- Documentation in `docs/` folder
- Update existing docs when modifying functionality
- Tests should cover both happy paths and edge cases
- Memory files ARE version-controlled and committed to git
