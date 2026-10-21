# Project Results review

The Results page uses the current GitHub main branch, existing team Engineering
and dry-lab records, and `D:/IGEM/result/Biosafety-Results.zip`. It inherits the
shared article layout, typography, lake hero, reading progress, responsive
contents panel, figure links and footer. Project navigation, the Wiki Map and
GitHub Pages direct links now include Results.

## Official guidance

- [Team Wiki](https://competition.igem.org/deliverables/team-wiki)
- [Best Wiki ballot](https://competition.igem.org/judging/special-prizes):
  evidence, clear navigation, documentation and attribution.
- [Project Awards ballot](https://competition.igem.org/judging/project-prizes):
  measured or modelled data must support the project’s claims.

The page covers observations, figures, interpretation, unsuccessful attempts,
limitations, an analysis summary and future work. Experimental observations,
model predictions and pending work are distinguished. No new experimental
data, statistical results or citations were generated.

## Scientific review before publication

The new report and older Engineering safety text disagree on the Pip–MazF
day-six value (about 0.05 versus about 0.165) and the extent of PDCA1
salt-gradient characterisation. Results follows the newly supplied document
and plot. Engineering has been preserved; the team should reconcile these
records before publication.

The supplied plots have error bars and significance symbols without specifying
their definitions. The page states this without inferring replicate numbers,
tests or p-values. OD680 is a growth readout, rather than a direct death assay.
Qualitative fluorescence and candidate TLC bands are not presented as
quantified salt responsiveness or definitive product identity.

The sequencing-result panels are construct/sequence alignment overviews;
captions distinguish them from raw chromatograms. All 11 source figures and
their hashes are recorded in `docs/results-sources.json`.

## Official asset hosting

This is a GitHub/local review implementation. The 11 imported lossless WebP
figures currently use local paths. Before official release, upload them using
the official iGEM asset service, replace their `deploy-assets.json` entries
with the returned `static.igem.wiki` URLs and record verified hashes/URLs in
`docs/igem-cdn-assets.json`. No official upload or official release is claimed.
The shared CC BY 4.0 and GitLab footer links remain.

Codex assisted with source comparison, English summaries, figure extraction,
integration and verification. The team must review scientific interpretation
and reconcile source differences before release.
