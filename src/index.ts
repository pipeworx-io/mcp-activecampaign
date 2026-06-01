interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * ActiveCampaign MCP Pack — email marketing + CRM (API v3).
 *
 * BYO SaaS connector: every tool requires TWO credentials.
 *   - _apiKey: the account's API key (ActiveCampaign UI: Settings → Developer).
 *              Sent as the `Api-Token` header.
 *   - account: the user's ActiveCampaign account URL or subdomain, e.g.
 *              "https://youraccount.api-us1.com" or just "youraccount".
 *              Normalized to https://{account}.api-us1.com if no scheme given.
 *
 * Stateless — no auth/rate-limit logic here (the gateway handles that).
 * Tools: list_contacts, get_contact, list_deals, list_campaigns,
 *        list_lists, list_automations.
 */


const UA = 'pipeworx-mcp-activecampaign/1.0 (+https://pipeworx.io)';

/** Build the API v3 base URL from a raw account URL or bare subdomain. */
function baseUrl(account: string): string {
  let a = account.trim();
  if (!/^https?:\/\//i.test(a)) a = `https://${a}.api-us1.com`;
  a = a.replace(/\/+$/, ''); // strip trailing slash(es)
  return `${a}/api/3`;
}

async function acGet(
  apiKey: string,
  account: string,
  path: string,
  params?: URLSearchParams,
): Promise<unknown> {
  const qs = params?.toString();
  const url = `${baseUrl(account)}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, {
    headers: {
      'Api-Token': apiKey,
      Accept: 'application/json',
      'User-Agent': UA,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ActiveCampaign: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

/** Shared credential properties — present (and required) on every tool. */
const CREDS = {
  _apiKey: {
    type: 'string',
    description: 'ActiveCampaign API key (UI: Settings → Developer).',
  },
  account: {
    type: 'string',
    description:
      'Your ActiveCampaign account URL or subdomain, e.g. "https://youraccount.api-us1.com" or just "youraccount".',
  },
} as const;

const tools: McpToolExport['tools'] = [
  {
    name: 'list_contacts',
    description:
      'List/search contacts (subscribers) in an ActiveCampaign account. Filter by exact email or a free-text search across name/email. Returns contacts with IDs, emails, names, and meta.total.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        email: { type: 'string', description: 'Filter to an exact email address.' },
        search: { type: 'string', description: 'Free-text search across name and email.' },
        limit: { type: 'number', description: 'Max results (default 20, max 100).' },
      },
      required: ['_apiKey', 'account'],
    },
  },
  {
    name: 'get_contact',
    description:
      'Get a single contact by ID. Returns email, name, phone, custom field values, and engagement details.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        id: { type: 'string', description: 'ActiveCampaign contact ID.' },
      },
      required: ['_apiKey', 'account', 'id'],
    },
  },
  {
    name: 'list_deals',
    description:
      'List CRM deals (sales pipeline opportunities). Returns deal IDs, titles, values, stages, and owners with meta.total.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        limit: { type: 'number', description: 'Max results (default 20, max 100).' },
      },
      required: ['_apiKey', 'account'],
    },
  },
  {
    name: 'list_campaigns',
    description:
      'List email campaigns with send/open/click metrics. Returns campaign IDs, names, status, send dates, and aggregate stats.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        limit: { type: 'number', description: 'Max results (default 20, max 100).' },
      },
      required: ['_apiKey', 'account'],
    },
  },
  {
    name: 'list_lists',
    description:
      'List contact lists. Returns list IDs, names, subscriber counts, and creation dates.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        limit: { type: 'number', description: 'Max results (default 20, max 100).' },
      },
      required: ['_apiKey', 'account'],
    },
  },
  {
    name: 'list_automations',
    description:
      'List marketing automations (workflows). Returns automation IDs, names, status, and enrolled-contact counts.',
    inputSchema: {
      type: 'object',
      properties: {
        ...CREDS,
        limit: { type: 'number', description: 'Max results (default 20, max 100).' },
      },
      required: ['_apiKey', 'account'],
    },
  },
];

function clampLimit(args: Record<string, unknown>, params: URLSearchParams): void {
  if (args.limit != null) params.set('limit', String(Math.min(100, Math.max(1, Number(args.limit)))));
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = args._apiKey as string | undefined;
  const account = args.account as string | undefined;
  delete args._context;
  delete args._apiKey;
  delete args.account;

  if (!apiKey) throw new Error('_apiKey is required: your ActiveCampaign API key (Settings → Developer).');
  if (!account) throw new Error('account is required: your ActiveCampaign account URL or subdomain (e.g. "youraccount" or "https://youraccount.api-us1.com").');

  switch (name) {
    case 'list_contacts': {
      const params = new URLSearchParams();
      if (args.email) params.set('email', args.email as string);
      if (args.search) params.set('search', args.search as string);
      clampLimit(args, params);
      return acGet(apiKey, account, '/contacts', params);
    }
    case 'get_contact':
      return acGet(apiKey, account, `/contacts/${encodeURIComponent(args.id as string)}`);
    case 'list_deals': {
      const params = new URLSearchParams();
      clampLimit(args, params);
      return acGet(apiKey, account, '/deals', params);
    }
    case 'list_campaigns': {
      const params = new URLSearchParams();
      clampLimit(args, params);
      return acGet(apiKey, account, '/campaigns', params);
    }
    case 'list_lists': {
      const params = new URLSearchParams();
      clampLimit(args, params);
      return acGet(apiKey, account, '/lists', params);
    }
    case 'list_automations': {
      const params = new URLSearchParams();
      clampLimit(args, params);
      return acGet(apiKey, account, '/automations', params);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
