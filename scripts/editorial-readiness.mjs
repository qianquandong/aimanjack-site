// Read-only CI credential check. Never print the API response (it may contain private project configuration).
const token = process.env.CLOUDFLARE_API_TOKEN, account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!token || !account) {
  console.log(JSON.stringify({ deploymentCredentialsPresent: false, productionWriteTested: false, note: 'Add the scoped Cloudflare Pages Edit token before enabling approved publication.' }));
} else {
  if (!/^[a-f0-9]{32}$/.test(account)) throw new Error('Unexpected Cloudflare account ID');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/aimanjack`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
  const result = await response.json();
  if (!response.ok || result.success !== true || result.result?.name !== 'aimanjack' || result.result.production_branch !== 'production') throw new Error(`Cloudflare project access check failed (HTTP ${response.status}); no configuration was changed`);
  console.log(JSON.stringify({ deploymentCredentialsPresent: true, projectAccessVerified: true, project: 'aimanjack', productionBranch: 'production', productionWriteTested: false }));
}
