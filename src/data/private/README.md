# Private quiz data

Everything in this folder is gitignored (except this README and `topics.example.json`),
so you can keep your own question banks locally without committing them.

## Setup

1. Copy `topics.example.json` to `topics.json` and describe your topics.
2. Put one question file per topic next to it, named as in `fileName`
   (same format as `src/data/aws-basics.json`).
3. Run `npm run dev` — private topics appear after the public ones.

If `topics.json` is missing, the app shows only the public topics.

> Note: `npm run build` bundles private topics into `dist/`. Don't deploy a
> build publicly if the questions must stay private.
