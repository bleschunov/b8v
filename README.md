# b8v.dev

Personal site: a business card at `/`, a blog at `/blog` and the CV at `/cv`. Plain
static files and one LaTeX document, no backend.

## How it works

- `website/` is the whole site. A page is a directory with an `index.html` (`blog/`,
  `cv/`): CloudFront serves `/blog` from `blog/index.html` and redirects `/blog/` to
  `/blog`, so links between pages are absolute. `website/blog.html` only redirects old
  links to `/blog`.
- `blog/index.html` loads `posts.json` on page load and renders the posts; `status.js`
  shows the last deploy, the commit and how long the posts took to load.
- `cv/main.tex` is the CV. CI builds it into `/cv/dmitrii_bleshchunov_software_engineer.pdf`;
  `/cv` itself is a page with Open Graph tags that redirects to the PDF.
  `cv.b8v.dev/<path>` redirects to `b8v.dev/cv/<path>`.
- `.github/workflows/deploy.yml` validates `posts.json` and builds the PDF on every push
  and pull request. A push to `main` that touches `website/` or `cv/` also writes
  `build.json`, syncs the site to the `b8v.dev/` prefix of a shared S3 bucket and
  invalidates CloudFront.
- AWS access goes through GitHub OIDC: no access keys are stored anywhere.

Hosting is defined in Terraform in [bleschunov/infra](https://github.com/bleschunov/infra):
one private bucket for all static sites, a CloudFront distribution per domain with a
CloudFront Function that routes by host name (`b8v.dev`, `cv.b8v.dev`, ...), a wildcard
ACM certificate, and the deploy role for this repo. The workflow needs these repository
variables from `terraform output github_variables` there: `AWS_ROLE_ARN`, `S3_BUCKET`,
`S3_PREFIX`, `CLOUDFRONT_DISTRIBUTION_ID`.

```mermaid
flowchart LR
    User(("Browser")) -->|b8v.dev| CF["CloudFront (b8v.dev, *.b8v.dev)"]
    CF -->|"router function: /x -> /b8v.dev/x"| S3[("S3 static-sites bucket (private)")]
    GH["GitHub Actions (OIDC)"] -->|"s3 sync website/ -> b8v.dev/"| S3
```

## Adding a post

Add an object to the top of `website/posts.json`:

```json
{
  "post_id": "any-unique-id",
  "title": "Post title",
  "posted_at": "2026-11-19T00:00:00",
  "content": "<p class=\"body\">First paragraph.</p>\n\n<p class=\"body\">Second paragraph.</p>"
}
```

`content` is HTML. The blog shows posts in the order of the file, newest first.

## Updating the CV

Edit `cv/main.tex` and push. Building it locally:

```bash
cd cv && latexmk -pdf main.tex   # -> cv/main.pdf
latexmk -C                       # clean up
```

On macOS: `brew install --cask basictex`, then
`sudo tlmgr install latexmk helvetic enumitem`.

## Running locally

```bash
cd website && python3 -m http.server 8000
# http://localhost:8000/blog/  (python serves /blog/; CloudFront serves /blog)
```

## History

The site started as my take on the
[Cloud Resume Challenge (AWS)](https://cloudresumechallenge.dev/docs/the-challenge/aws/):
the posts lived in DynamoDB behind API Gateway and three Python Lambdas, all in Terraform
in this repo. That stack is in the git history before the switch to static files; the
four existing posts were exported into `posts.json`.

The CV used to live in [bleschunov/resume](https://github.com/bleschunov/resume) and was
served at `cv.b8v.dev`; `cv/main.tex` is that LaTeX source.
