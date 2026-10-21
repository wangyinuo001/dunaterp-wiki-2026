#!/usr/bin/env python3
"""Render the protein chain from the archived CPP2146–DNA prediction."""

from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D  # noqa: F401


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (
    ROOT.parent
    / "archive/retired_2026-09-19/transcriptomics-cpp/sequences/DsCPP1/"
    / "DsTF2146-Adjacent2Motif_like.pdb"
)
OUTPUT = ROOT / "public/figures/dry-lab/cpp2146-structure.svg"


def first_model_ca_trace(pdb_path: Path):
    points = []
    confidence = []
    model_number = 0
    in_first_model = False
    for line in pdb_path.read_text().splitlines():
        if line.startswith("MODEL"):
            model_number += 1
            in_first_model = model_number == 1
            continue
        if line.startswith("ENDMDL") and in_first_model:
            break
        if not in_first_model or not line.startswith("ATOM  "):
            continue
        if line[12:16].strip() != "CA" or line[21] != "A":
            continue
        points.append((int(line[22:26]), tuple(float(line[i:i + 8]) for i in (30, 38, 46))))
        confidence.append(float(line[60:66]))
    if len(points) != 457:
        raise ValueError(f"Expected 457 C-alpha atoms in model 1, found {len(points)}")
    return points, confidence


def residue_color(residue: int, confidence: float) -> tuple[str, float, float]:
    if 32 <= residue <= 72:
        return "#57c8de", 3.0, 1.0
    if 117 <= residue <= 158:
        return "#b9e845", 3.0, 1.0
    if confidence < 70:
        return "#aeb9b1", 1.25, 0.62
    return "#285747", 1.8, 0.88


def main():
    full_points, full_confidence = first_model_ca_trace(SOURCE)
    selected = [(point, score) for point, score in zip(full_points, full_confidence) if 32 <= point[0] <= 158]
    points, confidence = zip(*selected)
    residues = [item[0] for item in points]
    xyz = [item[1] for item in points]

    fig = plt.figure(figsize=(10.8, 6.7), facecolor="#fffef9")
    fig.text(0.07, 0.94, "CPP2146 · CXC-RICH N-TERMINAL STRUCTURE", color="#173f35",
             fontsize=15, fontweight="bold", family="DejaVu Sans")
    fig.text(0.07, 0.895, "Predicted AlphaFold 3 chain A · residues 32–158 · flanking regions omitted",
             color="#5e746a", fontsize=10.5, family="DejaVu Sans")

    ax = fig.add_axes([0.04, 0.17, 0.92, 0.68], projection="3d")
    ax.set_facecolor("#fffef9")
    for i in range(len(xyz) - 1):
        color, width, alpha = residue_color(residues[i], confidence[i])
        ax.plot(
            [xyz[i][0], xyz[i + 1][0]],
            [xyz[i][1], xyz[i + 1][1]],
            [xyz[i][2], xyz[i + 1][2]],
            color=color,
            linewidth=width,
            alpha=alpha,
            solid_capstyle="round",
        )

    ax.scatter(*xyz[0], color="#e2a82d", s=28, depthshade=False, zorder=5)
    ax.scatter(*xyz[-1], color="#e47755", s=28, depthshade=False, zorder=5)
    ax.view_init(elev=23, azim=-58)
    spans = [max(max(row[j] for row in xyz) - min(row[j] for row in xyz), 1) for j in range(3)]
    ax.set_box_aspect(spans)
    ax.set_axis_off()

    legend = [
        ("#57c8de", "CXC1 · 32–72"),
        ("#b9e845", "CXC2 · 117–158"),
        ("#285747", "Connecting residues"),
    ]
    x = 0.11
    for color, label in legend:
        fig.add_artist(plt.Line2D([x, x + 0.025], [0.09, 0.09], transform=fig.transFigure,
                                  color=color, linewidth=4, solid_capstyle="round"))
        fig.text(x + 0.033, 0.082, label, color="#4d655b", fontsize=9, family="DejaVu Sans")
        x += 0.22 if "N-terminal" not in label else 0.28

    fig.savefig(OUTPUT, format="svg", facecolor="#fffef9", bbox_inches="tight", metadata={
        "Title": "CPP2146 predicted CXC-region structure",
        "Description": "Residues 32–158 from the first AlphaFold 3 chain A model. CXC1 and CXC2 are highlighted; flanking regions are omitted.",
    })
    plt.close(fig)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
