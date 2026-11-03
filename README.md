# Deploy

Static site. No build step, no backend.

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel: Add New Project, import the repo, Framework Preset = Other. Leave build command and output directory empty.
3. Deploy. Pages: `/` (landing) and `/pricing`.

Forms post to Web3Forms using the public access key already in the HTML.
Submissions are emailed to the address registered with that key.
