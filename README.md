# This is Me – website

The This is Me website, with a content editor (Decap CMS) so Emma can add and edit Hub posts and news herself.

## How it fits together

| Folder / file | What it is |
|---|---|
| `src/` | The website pages, styles, images and fonts. |
| `content/posts/` | One file per Hub post (Learn, Read, Listen, News). Emma edits these through the editor. |
| `templates/post.html` | The design for article pages. |
| `build.js` | Turns the posts into article pages and fills the Hub and home page cards. |
| `src/admin/` | The editor Emma uses, at `/admin`. |
| `netlify.toml` | Tells Netlify to run the build and publish the `dist` folder. |

When Emma clicks **Publish** in the editor, her post is saved to GitHub, Netlify rebuilds the site, and it goes live about a minute later.

## One-off setup

### 1. Put the site on GitHub
1. Create a free account at github.com, if you don't have one.
2. Click **+ → New repository**. Name it `this-is-me`, choose **Private**, and click **Create repository**.
3. On the new repository page, click **uploading an existing file**. Drag in **everything inside** this folder (not the folder itself), and click **Commit changes**.
4. Open `src/admin/config.yml` on GitHub and click the pencil icon. Change `YOUR-GITHUB-USERNAME/this-is-me` to your username and repository name, e.g. `jamesmccracken/this-is-me`. Click **Commit changes**.

### 2. Connect Netlify to GitHub (same site, same address)
1. In Netlify, open the **cosmic-panda-3dea51** project.
2. Go to **Project configuration → Build & deploy → Continuous deployment → Link repository**.
3. Choose **GitHub**, allow access, and pick the `this-is-me` repository.
4. Netlify reads the build settings from `netlify.toml` (build command `npm run build`, publish directory `dist`). Click **Deploy**.

From now on the site updates every time something changes on GitHub. You no longer drag zips into Netlify.

### 3. Let the editor log in with GitHub
1. On GitHub, go to **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Application name: `This is Me editor`
   - Homepage URL: `https://cosmic-panda-3dea51.netlify.app` (change to `https://thisisme.uk` once the domain is live)
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Click **Register application**, then **Generate a new client secret**. Keep this page open.
3. In Netlify, go to **Project configuration → Access & security → OAuth → Authentication providers → Install provider**. Choose **GitHub** and paste in the Client ID and Client Secret.

### 4. Give Emma access
1. Emma creates a free GitHub account.
2. In the repository, go to **Settings → Collaborators → Add people** and add Emma's GitHub username. She accepts the email invitation.
3. Emma goes to `/admin` on the website and clicks **Login with GitHub**.

## Making design changes (you or Liz)
Edit files in `src/` or `templates/`, either directly on GitHub or locally, then commit. To preview locally: `npm install`, then `npm run serve`.

## Email login instead of GitHub (optional)
If Emma would rather not have a GitHub account, the free DecapBridge service (decapbridge.com) lets editors log in with an email address and password. Sign up there, connect the repository, and replace the `backend:` section of `src/admin/config.yml` with the one DecapBridge gives you.
