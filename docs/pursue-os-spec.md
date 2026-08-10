# PURSUE OS — Spec (as provided by Atharva, 2026-08-09)

**Status: Coming Soon.** Not ready for production. Currently entering implementation, no stable release or installation image.

Investigation-focused Linux operating system designed for **OSINT, digital investigations, DFIR, secure research, intelligence gathering, and evidence-driven workflows.** Built by P4inz.

Repo: <https://github.com/p4inz-code/pursue-os>
License: **Apache License 2.0** (third-party components may carry separate licenses per NOTICE / TRADEMARKS.md).

## The idea

One operating system for the investigation workflow. Instead of assembling a large collection of unrelated tools, PURSUE aims to provide a coherent environment where investigators can research, collect, analyze, connect, preserve, and report information from one system.

Two flagship interfaces sit alongside the broader investigation platform:

- **Investigation Terminal** — purpose-built command-line environment for investigators.
- **Investigation Browser** — secure, configurable browsing and research workflows with integrated Tor capabilities.

## Core areas being designed to support

- OSINT and intelligence gathering
- Secure investigation browsing
- Integrated Tor workflows
- Investigation-focused terminal workflows
- Case management
- Evidence storage and provenance
- Evidence integrity and traceability
- Investigation graphs and relationships
- Timelines and investigative organization
- DFIR workflows
- GEOINT
- Infrastructure intelligence
- CTI workflows
- Media analysis
- Reporting and export
- Modular investigation tools
- Plugin-based extensibility
- Optional local AI assistance

The exact V1 implementation will be documented as development progresses.

## AI policy

**AI in PURSUE is an assistant, not an authority.**

AI may help with:
- organizing information
- summarizing investigator-selected material
- explaining technical output
- assisting with terminal workflows
- helping navigate supported investigation tasks

AI must not silently manipulate evidence or replace the investigator's judgment. The source remains the source of truth. AI functionality will be optional and configurable.

## Privacy and security

Foundational parts of PURSUE:

- privacy-first investigation workflows
- integrated Tor capabilities
- configurable network security
- evidence integrity
- secure case handling
- clear provenance
- minimal unnecessary telemetry
- user-controlled investigation environments

Strong defaults without preventing experienced investigators from configuring their environment further.

## Development status

- Planning: **Complete**
- Repository foundation: **Complete**
- Architecture foundation: **Established**
- Implementation: **Starting**
- Stable release: **Not available**

The public repository is intentionally minimal during this stage. Core implementation will be developed and validated before a public release is announced.

## Creator

**P4inz** — independent project created and maintained by P4inz.

## Portfolio-copy angle (Atharva's brand-voice framing)

Card status label: **"Coming Soon"** (never "Alpha", never "In Development" — the spec explicitly says no ISO exists).
Positioning line for the portfolio card: *"An investigation-focused Linux OS for OSINT, DFIR, and evidence-driven work. Purpose-built terminal + browser at the core. Apache 2.0."*
Featured priority: **High** (positioned alongside Mission OS as the second OS in Atharva's portfolio; PURSUE is investigation-focused, Mission OS is privacy-first — they're siblings, not competitors).
