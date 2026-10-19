# Checkpoints and rollback

Every version worth going back to has a git tag. Each tag is a full snapshot of the repo, and GitHub has a page and a zip download for every one (the repo's **Tags** list).

| Tag | What it is |
|---|---|
| `v3.1.0` | The manifesto, Broadsheet edition (`/v3/`) |
| `v4.0.0-dev` | The talk edition index, before the Anatomy figures |
| `v5.0.0` | V5: the first 30-minute talk deck and ten Anatomy figures |
| `v5.1.0` | V5.1G and V5.1C on October 2026 numbers |
| `v5.1.1G` | V5.1.1G: US-built models only |
| `v5.2.0-rc` | V5.2G and V5.2C first cut: 25 minutes, RFP from the writer's side, plain English |
| `v5.2.0` | V5.2 as presented: ask for capacity, not more tokens; RFP written with AI from timeline and budget; QR to the capacity ask |
| `manifesto-compare-1` | `/manifesto/`: V3.1 and V5.2 on one page, plus "Owning the box makes people better at AI" |

## Look at an old version without changing anything

    git checkout v5.1.1G      # look around, open the HTML files
    git checkout main         # come back

## Put an old version back on GitHub

This adds a new commit that restores the old files, so nothing in the history is lost and you can undo the undo.

    git checkout main
    git restore --source=v5.1.1G -- .
    git commit -am "Roll back to v5.1.1G"
    git push

To bring back just one folder or file, name it instead of `.`, for example `git restore --source=v5.1.1G -- v5.1`.

## Roll the live site back (ai-manifesto-talk.vercel.app)

The fastest way is Vercel's own rollback, which switches production to an earlier deployment in a few seconds without rebuilding anything:

    npx vercel ls ai-manifesto-talk            # list deployments, newest first
    npx vercel rollback <deployment-url>       # make that one live again

Known deployments:

| Deployment | Contents |
|---|---|
| `ai-manifesto-talk-qkrvmotk7-bradleynbaker-8532.vercel.app` | `manifesto-compare-1` (current) |
| `ai-manifesto-talk-1w2w9mb65-bradleynbaker-8532.vercel.app` | `v5.2.0`, before the compare page |

Or roll back from the files: check out the tag, then run `npx vercel --prod --yes` in the repo folder.

## Making a new checkpoint

    git tag -a v5.3.0 -m "What changed"
    git push origin v5.3.0
