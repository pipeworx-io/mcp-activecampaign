# mcp-activecampaign

ActiveCampaign MCP Pack — email marketing + CRM (API v3).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Activecampaign data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
