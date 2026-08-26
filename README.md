# mcp-activecampaign

ActiveCampaign MCP Pack — email marketing + CRM (API v3).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_contacts` | List/search contacts (subscribers) in an ActiveCampaign account. Filter by exact email or a free-text search across name/email. Returns contacts with IDs, emails, names, and meta.total. |
| `get_contact` | Get a single contact by ID. Returns email, name, phone, custom field values, and engagement details. |
| `list_deals` | List CRM deals (sales pipeline opportunities). Returns deal IDs, titles, values, stages, and owners with meta.total. |
| `list_campaigns` | List email campaigns with send/open/click metrics. Returns campaign IDs, names, status, send dates, and aggregate stats. |
| `list_lists` | List contact lists. Returns list IDs, names, subscriber counts, and creation dates. |
| `list_automations` | List marketing automations (workflows). Returns automation IDs, names, status, and enrolled-contact counts. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "activecampaign": {
      "url": "https://gateway.pipeworx.io/activecampaign/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/activecampaign/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Activecampaign data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
