Successful Students: full version with AI coach (Netlify)

BEFORE YOU DEPLOY
1. console.anthropic.com > create a NEW API key just for this site. Never paste it in chat, email or the page.
2. Billing: buy a small amount of prepaid credit (start with $5 to $10). Turn auto-reload OFF so credit is your hard spending cap. Set a spending limit if the console offers one.

DEPLOY (use GitHub or the Netlify CLI; drag and drop may skip the server function)
Option A, GitHub: push this folder to a GitHub repo, then in Netlify: Add new site > Import from Git. Settings come from netlify.toml.
Option B, CLI: install Node.js, then in this folder run:
  npm install -g netlify-cli
  netlify login
  netlify deploy --prod

ENVIRONMENT VARIABLES (Netlify > Site configuration > Environment variables)
  ANTHROPIC_API_KEY = your key (mark as secret)
  ACCESS_CODE       = a word or phrase you choose; share it only with your students
  COACH_MODEL       = optional. Default is claude-haiku-5-5 (cheapest). Use claude-sonnet-5-5 for better answers at higher cost.
Then redeploy.

LIMITS BUILT IN
  Access code required. Wrong code is rejected.
  25 AI requests per device per day (soft limit, students can bypass it).
  20 requests per hour per IP (best effort).
  Requests capped in size and answer length.
These reduce cost but are not a hard cap. Your prepaid balance is the hard cap.
Anyone who has the access code could use the site as a general chatbot until credit runs out.
