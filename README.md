# Atharva Patil — Portfolio

Personal portfolio site for Atharva Patil — solo founder of Northbyte
Studios, developer, and 3D/VFX artist based in Navi Mumbai, India.

**Live:** atharvapatil.tech (hosting in progress)

## What this is

A single self-contained HTML file — no build step, no framework, no
third-party runtime dependencies except one combined Google Fonts
request. Runs identically whether it's opened directly as a file,
dropped into a sandboxed iframe preview, or served from any static host
with zero server configuration.

Routing is in-memory JS (not hash or History API) by design, for the
same zero-config-anywhere reason.

## A few things worth knowing about it

- **Live transparency widget** — real-time external request count,
  known-tracker count, cookie count, load time, CLS, an accessibility
  spot-check, an estimated carbon-per-load figure, and a self-integrity
  SHA-256 hash of the live DOM. Not marketing copy — it's computed
  in-browser via the real Performance/Web Crypto APIs on every load.
- **Accessibility-first** — keyboard-navigable throughout,
  `:focus-visible` site-wide, a screen-reader simulation toggle on the
  Accessibility page, and an honest self-assessment against WCAG 2.1 AA
  (including what *isn't* done yet).
- **Print-perfect** — every page has a proper print stylesheet and a
  visible "Print this page" button, not just the resume.
- **Content accuracy is a running discipline** — product statuses on
  this site are checked against real release notes/READMEs each time
  they change, not left stale.

## Structure

```
index.html      the entire site
robots.txt      crawler policy (deploy at /robots.txt)
security.txt    RFC 9116 disclosure contact (deploy at /.well-known/security.txt)
llms.txt        structured AI-readable summary (deploy at /llms.txt)
```

## License

All rights reserved. This is a personal portfolio, not an open-source
project — the code is shared here for transparency (see the live
transparency widget above), not for reuse. Get in touch if you want to
discuss any of it.

## Contact

- Email: atharva.patil.cg@gmail.com
- Discord: p4inz
