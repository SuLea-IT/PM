<template>
  <div class="about-page">
    <section
      class="hero-section"
      :style="{ '--hero-bg-image': `url(${heroBanner})` }"
    >
      <div class="hero-backdrop"></div>
      <div class="hero-glow hero-glow-left"></div>
      <div class="hero-glow hero-glow-right"></div>
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Tomato callus</span>
          <h1>Tomato callus</h1>
          <p class="hero-description">
            A multimodal spatiotemporal atlas that tracks tomato de novo
            regeneration from wounding to shoot organogenesis with
            super-resolution spatial transcriptomics.
          </p>

          <div class="hero-actions">
            <button class="action-btn action-btn-primary" @click="navigateTo('/analyse/Platform')">
              Explore Atlas
            </button>
            <button class="action-btn action-btn-secondary" @click="navigateTo('/analyse/UploadData')">
              Upload Data
            </button>
          </div>


          <div class="stats-grid">
            <article v-for="item in stats" :key="item.label" class="stat-card">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block overview-section">
      <div class="container section-grid section-grid-wide">
        <div class="section-copy">
          <span class="section-kicker">Abstract</span>
          <h2>From wound response to an ovoid-structured stem-cell niche</h2>
          <p>
            Plant de novo regeneration depends on callus formation and
            re-establishment of stem-cell niches rather than pre-existing stem-cell
            reservoirs. Using enhanced tissue fixation and multimodal spatial
            transcriptomics, the atlas resolves regeneration across about 1.16
            million cells.
          </p>
          <p>
            The study identifies a previously unrecognized regenerative niche made
            of a signaling layer, a plastic compartment and a quiescent core,
            revealing structural organization as a key principle in plant
            regeneration biology.
          </p>
          <div class="highlight-panel">
            <div>
              <span class="highlight-label">Key advance</span>
              <p>
                Super-resolution spatial multi-omics links histology, expression
                dynamics and niche architecture in one unified portal.
              </p>
            </div>
          </div>
        </div>

        <div class="image-frame image-frame-light">
          <img :src="overviewFigure" alt="Overview of plant regeneration atlas" />
        </div>
      </div>
    </section>

    <section class="section-block storyline-section">
      <div class="container">
        <div class="section-heading centered">
          <span class="section-kicker">Atlas storyline</span>
          <h2>Four regenerative phases resolved across time and scale</h2>
          <p>
            The reference figure captures temporal transitions from pluripotency
            initiation to shoot regeneration, while preserving spatial cell-state
            organization across the full regeneration window.
          </p>
        </div>

        <div class="image-frame story-frame">
          <img :src="storyFigure" alt="Transverse section regeneration phases" />
        </div>

        <div class="phase-grid">
          <article v-for="phase in phases" :key="phase.title" class="phase-card">
            <span class="phase-time">{{ phase.time }}</span>
            <h3>{{ phase.title }}</h3>
            <p>{{ phase.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block mechanism-section">
      <div class="container mechanism-shell">
        <div class="mechanism-header">
          <span class="section-kicker">Mechanistic model</span>
          <h2>EPFL8b-mediated signaling organizes the regenerative niche</h2>
        </div>

        <div class="section-copy mechanism-copy">
          <p>
            The model highlights how the signaling layer, plastic compartment and
            quiescent core cooperate to support proper shoot regeneration, and how
            disorganization of this architecture impairs regenerative output.
          </p>
          <div class="mechanism-note">
            <strong>Model insight</strong>
            <span>
              Organized SCN architecture supports proper regeneration, while
              disrupted spatial order leads to impaired developmental output.
            </span>
          </div>
        </div>

        <div class="mechanism-media">
          <div class="image-frame image-frame-light mechanism-frame">
            <img :src="mechanismFigure" alt="Ovoid structured SCN model" />
          </div>
          <div class="mechanism-caption">
            <span>Wild type vs mutant</span>
            <p>
              The illustration contrasts an organized ovoid SCN with a
              disorganized mutant niche state.
            </p>
          </div>
        </div>

        <div class="mini-cards mechanism-cards">
          <article class="mini-card" v-for="layer in nicheLayers" :key="layer.title">
            <strong>{{ layer.title }}</strong>
            <p>{{ layer.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block modules-section">
      <div class="container">
        <div class="section-heading centered">
          <span class="section-kicker">Portal modules</span>
          <h2>Direct entrances for atlas browsing and custom workflows</h2>
        </div>

        <div class="module-grid module-grid-single">
          <article class="module-card module-card-single">
            <div class="module-image-wrap">
              <img :src="clusterFigure" alt="Integrated cellular atlas map" />
            </div>
            <div class="module-body">
              <span class="module-tag">Built-in atlas</span>
              <h3>Integrated atlas overview</h3>
              <p>
                Browse the multimodal reference atlas and inspect cell classes,
                spatial layers and cross-method views from a single entry point.
              </p>
              <button class="action-btn action-btn-ghost action-btn-inline" @click="navigateTo('/analyse/Platform')">
                Start Analysis
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block publication-section">
      <div class="container">
        <article class="citation-card publication-card">
          <span class="section-kicker">Citation</span>
          <div class="citation-list">
            <p
              v-for="citation in citations"
              :key="citation"
              class="publication-citation"
              v-html="citation"
            ></p>
          </div>
          <a
            class="publication-link"
            :href="citationUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read full article
          </a>
        </article>
      </div>
    </section>


    <section class="section-block references-section">
      <div class="container">
        <div class="references-card">
          <div class="references-copy">
            <h3>References</h3>
            <p>
              We curated {{ referenceCount }} literature records in the current
              manuscript resource, covering plant regeneration, spatial
              transcriptomics and related signaling mechanisms that support this
              atlas.
            </p>
          </div>
          <button
            class="references-btn"
            @click="navigateTo('/references')"
          >
            View full reference list
          </button>
        </div>
      </div>
    </section>

    <section class="contact-section">
      <div class="container contact-shell">
        <div class="contact-badge">T</div>
        <h3>Tomato callus</h3>
        <p class="contact-subtitle">
          A spatiotemporal single-cell atlas for tomato regeneration and plant
          spatial transcriptomics.
        </p>

        <div class="contact-meta">
          <div class="contact-item">
            <span>Website</span>
            <a :href="datasetUrl" target="_blank" rel="noopener noreferrer">
              {{ datasetUrl }}
            </a>
          </div>
          <div class="contact-item">
            <span>Contact</span>
            <a :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
          </div>
        </div>

        <div class="contact-footer">
          Copyright © 2026 All rights reserved | Best viewed with modern
          Chromium-based browsers
        </div>
      </div>
    </section>

    <el-backtop :right="28" :bottom="28">
      <div class="backtop-btn">↑</div>
    </el-backtop>
  </div>
</template>

<script>
import heroBanner from "../assets/about/fig1-banner.webp";
import overviewFigure from "../assets/about/fig1-overview.webp";
import storyFigure from "../assets/about/fig1-story.webp";
import mechanismFigure from "../assets/about/fig7-model.webp";
import clusterFigure from "../assets/about/default-cluster.webp";

export default {
  name: "About",
  data() {
    return {
      datasetUrl: "http://www.single-cell-spatial.com",
      contactEmail: "bosheng.li@pku-iaas.edu.cn",
      referenceCount: 101,
      heroBanner,
      overviewFigure,
      storyFigure,
      mechanismFigure,
      clusterFigure,
      citationUrl: "https://www.biorxiv.org/content/10.64898/2026.02.20.705279v1.full",
      citations: [
        "Song, X., Zhang, S., Yue, Z., Liu, Y., Chen, S., Niu, Y., Shi, Y., Yang, H., Xu, J., Miao, Y., Xu, M., Zhou, Y., Xu, L., Liu, N., Lv, M., Li, J., Wang, T., Sun, B., Qiu, C., Xu, R., Zhang, R., Wang, J., Jiang, K., Fang, L., Zhang, H., Hou, S., Li, G., Chen, H., Deng, X.W., and Li, B. (2026). Super-resolution multimodal spatial transcriptomics reveals that <em>de novo</em> plant regeneration is structured by an ovoid stem-cell niche. Mol. Plant, Volume, Pages. DOI.",
        "Song, X., Zhang, S., Yue, Z., Liu, Y., Chen, S., Niu, Y., Shi, Y., Yang, H., Xu, L., Liu, N., Miao, Y., Lv, M., Li, J., Wang, T., Xu, M., Sun, B., Qiu, C., Xu, R., Wang, J., Zhang, H., Hou, S., Li, G., Chen, H., Deng, X.W., and Li, B. (2026). Super-resolution single-cell spatial atlas of plant <em>de novo</em> regeneration. bioRxiv. https://doi.org/10.64898/2026.02.20.705279 (preprint).",
      ],
      heroTags: ["1.16M cells", "101 spatial maps", "50 Xenium genes"],
      stats: [
        { value: "1.16M", label: "Profiled cells" },
        { value: "101", label: "Spatial maps" },
        { value: "50", label: "Targeted Xenium genes" },
        { value: "0–16 DPE", label: "Regeneration window" },
      ],
      phases: [
        {
          time: "0–2 DPE",
          title: "Wound response & pluripotency initiation",
          description:
            "Early injury cues trigger broad cellular plasticity and prime the explant for regeneration.",
        },
        {
          time: "2–8 DPE",
          title: "Stem-cell establishment",
          description:
            "Spatial programs consolidate into a stem-cell niche precursor with increasingly ordered identity.",
        },
        {
          time: "8–12 DPE",
          title: "SCN formation",
          description:
            "The niche gains recognizable architecture and separates signaling, plastic and inner domains.",
        },
        {
          time: "12–16 DPE",
          title: "Shoot regeneration",
          description:
            "Organized niche structure supports coordinated outgrowth and successful shoot formation.",
        },
      ],
      nicheLayers: [
        {
          title: "Signaling layer",
          description: "EPFL8b/CUC2-associated outer layer coordinating positional communication.",
        },
        {
          title: "Plastic compartment",
          description: "PLT3a/STM-enriched cells preserving regenerative competence.",
        },
        {
          title: "Quiescent core",
          description: "WUS/CLV3/RAD17-associated core linked to organized stem-cell behavior.",
        },
      ],
    };
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.about-page {
  min-height: calc(100vh - 60px);
  background: #f7f8fb;
  color: #14261b;
}

.about-page,
.about-page * {
  box-sizing: border-box;
}

.container {
  width: min(1240px, calc(100% - 32px));
  margin: 0 auto;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 88px 0 64px;
  background-image:
    linear-gradient(110deg, rgba(6, 22, 11, 0.9) 0%, rgba(6, 20, 11, 0.8) 34%, rgba(5, 16, 28, 0.76) 100%),
    var(--hero-bg-image);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  color: #f6fff4;
}

.hero-backdrop,
.hero-glow {
  position: absolute;
  pointer-events: none;
}

.hero-backdrop {
  inset: 0;
  background:
    radial-gradient(circle at 14% 18%, rgba(145, 220, 111, 0.24), transparent 24%),
    radial-gradient(circle at 85% 14%, rgba(85, 164, 255, 0.2), transparent 22%),
    linear-gradient(115deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.4));
}

.hero-glow {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.45;
}

.hero-glow-left {
  background: rgba(122, 219, 81, 0.34);
  left: -80px;
  top: -100px;
}

.hero-glow-right {
  background: rgba(121, 121, 255, 0.24);
  right: -70px;
  top: 30px;
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 760px);
  gap: 36px;
  align-items: center;
  min-height: 520px;
}

.eyebrow,
.section-kicker,
.note-label,
.module-tag,
.highlight-label,
.phase-time,
.citation-meta span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.eyebrow,
.section-kicker,
.note-label,
.highlight-label,
.phase-time,
.module-tag {
  color: #8fd38a;
}

.hero-copy h1 {
  margin: 16px 0 18px;
  font-size: clamp(2.5rem, 4vw, 4.4rem);
  line-height: 1.06;
}

.hero-description {
  max-width: 620px;
  margin: 0;
  color: rgba(246, 255, 244, 0.82);
  font-size: 1.08rem;
  line-height: 1.8;
}


.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 32px;
}



.action-btn {
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  border-color: transparent;
}

.action-btn-primary {
  background: linear-gradient(135deg, #8bd85c, #57b643);
  color: #0d2009;
  box-shadow: 0 18px 30px rgba(87, 182, 67, 0.26);
}

.action-btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #efffed;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.action-btn-ghost {
  background: #eef8ea;
  color: #2f6d2d;
  border: 1px solid rgba(95, 184, 77, 0.24);
  box-shadow: 0 12px 24px rgba(95, 184, 77, 0.12);
}

.action-btn-ghost:hover {
  background: #e2f4db;
}

.action-btn-inline {
  width: fit-content;
  margin-top: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 34px;
}

.stat-card,
.phase-card,
.mini-card,
.module-card,
.citation-card,
.highlight-panel {
  backdrop-filter: blur(12px);
}

.stat-card {
  padding: 18px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.07);
}

.stat-card strong {
  display: block;
  font-size: 1.45rem;
  color: #fff;
}

.stat-card span {
  display: block;
  margin-top: 8px;
  color: rgba(245, 255, 244, 0.7);
  line-height: 1.45;
}

.image-frame img,
.module-image-wrap img {
  display: block;
  width: 100%;
  height: auto;
}

.section-block {
  padding: 84px 0;
}

.overview-section {
  background: linear-gradient(180deg, #f8fbf7 0%, #ffffff 100%);
}

.section-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.92fr);
  gap: 36px;
  align-items: center;
}

.section-grid-wide {
  grid-template-columns: minmax(320px, 1.05fr) minmax(0, 1fr);
}

.section-copy,
.module-body,
.citation-card {
  text-align: left;
}

.section-copy h2,
.section-heading h2 {
  margin: 16px 0 18px;
  color: #132416;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.16;
}

.section-copy p {
  margin: 0 0 16px;
}

.section-copy p,
.section-heading p,
.phase-card p,
.mini-card p,
.module-body p,
.citation-card p,
.highlight-panel p {
  color: #526257;
  font-size: 1rem;
  line-height: 1.85;
}

.highlight-panel {
  margin-top: 26px;
  padding: 20px 22px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(143, 211, 138, 0.18), rgba(118, 170, 255, 0.08));
  border: 1px solid rgba(112, 177, 108, 0.18);
}

.highlight-panel p {
  margin: 10px 0 0;
}

.image-frame {
  overflow: hidden;
  border-radius: 30px;
  box-shadow: 0 24px 56px rgba(18, 35, 22, 0.12);
}

.image-frame-light {
  background: #fff;
  border: 1px solid rgba(18, 35, 22, 0.08);
}

.storyline-section {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(238, 244, 239, 0.86));
}

.mechanism-section {
  background:
    radial-gradient(circle at 12% 18%, rgba(144, 214, 132, 0.12), transparent 28%),
    radial-gradient(circle at 88% 28%, rgba(128, 168, 255, 0.1), transparent 24%),
    linear-gradient(180deg, #f8faf7 0%, #f4f7fb 100%);
}

.mechanism-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
  gap: 40px;
  align-items: center;
}

.mechanism-header {
  grid-column: 1 / -1;
  width: 100%;
  max-width: 760px;
}

.mechanism-header h2 {
  margin: 16px 0 0;
  color: #132416;
  font-size: clamp(2.25rem, 3.6vw, 4rem);
  line-height: 1.12;
}

.mechanism-note {
  display: grid;
  gap: 6px;
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(95, 184, 77, 0.12);
  box-shadow: 0 12px 32px rgba(30, 53, 34, 0.06);
}

.mechanism-note strong,
.mechanism-caption span {
  color: #2f6d2d;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.mechanism-note span,
.mechanism-caption p {
  color: #55655a;
  line-height: 1.8;
}

.section-heading {
  max-width: 860px;
  margin-bottom: 34px;
}

.section-heading p {
  max-width: 760px;
  margin: 0 auto;
}

.centered {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.story-frame {
  margin-bottom: 26px;
}

.phase-grid,
.mini-cards,
.module-grid {
  display: grid;
  gap: 20px;
}

.phase-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.phase-card,
.mini-card,
.module-card,
.citation-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(18, 35, 22, 0.08);
  box-shadow: 0 16px 40px rgba(25, 44, 29, 0.08);
}

.phase-card {
  padding: 24px;
  text-align: left;
}

.phase-card h3,
.module-body h3,
.mini-card strong {
  color: #15261a;
}

.phase-card h3,
.module-body h3 {
  margin: 16px 0 12px;
  font-size: 1.16rem;
}

.mini-cards {
  margin-top: 26px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mechanism-cards {
  grid-column: 1 / -1;
  width: 100%;
  margin-top: 4px;
  gap: 16px;
}

.mini-card {
  padding: 18px 18px 16px;
  text-align: left;
}

.mini-card strong {
  display: block;
  margin-bottom: 10px;
  font-size: 1rem;
}

.mini-card p {
  margin: 0;
  font-size: 0.96rem;
  line-height: 1.72;
}

.mechanism-media {
  display: grid;
  gap: 14px;
  align-content: center;
}

.mechanism-frame {
  padding: 18px;
  border-radius: 28px;
  box-shadow: 0 24px 56px rgba(30, 53, 34, 0.1);
}

.mechanism-frame img {
  border-radius: 18px;
}

.mechanism-caption {
  padding: 0 8px;
}

.mechanism-caption p {
  margin: 8px 0 0;
}

.modules-section {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(235, 243, 237, 0.78));
}

.module-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.module-grid-single {
  grid-template-columns: minmax(0, 920px);
  justify-content: center;
}

.module-card {
  overflow: hidden;
}

.module-card-single {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: stretch;
}

.module-image-wrap {
  aspect-ratio: 16 / 10;
  background: #091109;
}

.module-image-wrap img {
  height: 100%;
  object-fit: cover;
}

.module-card-single .module-image-wrap {
  aspect-ratio: auto;
  min-height: 320px;
}

.module-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.module-tag {
  color: #5fb84d;
}

.citation-card {
  padding: 30px 34px;
}

.citation-card p {
  margin: 16px 0 24px;
}

.publication-section {
  background: linear-gradient(180deg, rgba(235, 243, 237, 0.78), #f7f8fb);
  padding-bottom: 42px;
}

.publication-card {
  max-width: 980px;
  margin: 0 auto;
}

.citation-list {
  display: grid;
  gap: 18px;
  margin-top: 18px;
}

.publication-citation {
  max-width: 820px;
  margin: 0;
}

.publication-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin-top: 24px;
  padding: 14px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, #8bd85c, #57b643);
  color: #0d2009;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 16px 28px rgba(87, 182, 67, 0.2);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.publication-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(87, 182, 67, 0.26);
}

.citation-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  padding-top: 20px;
  border-top: 1px solid rgba(19, 36, 22, 0.08);
}

.citation-meta span {
  color: #6bb65d;
}

.citation-meta a,
.citation-meta strong {
  display: block;
  margin-top: 8px;
  color: #15261a;
  text-decoration: none;
  line-height: 1.7;
}

.references-section {
  padding-top: 12px;
}

.references-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 22px;
  padding: 34px 38px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(19, 36, 22, 0.08);
  box-shadow: 0 16px 42px rgba(25, 44, 29, 0.08);
}

.references-copy h3 {
  margin: 0 0 14px;
  color: #8b1200;
  font-size: 1.9rem;
}

.references-copy p {
  margin: 0;
  color: #4f5e54;
  font-size: 1.04rem;
  line-height: 1.85;
}

.references-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220px;
  padding: 16px 28px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9e22, #ff8500);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 16px 28px rgba(255, 133, 0, 0.22);
}

.references-btn:hover {
  transform: translateY(-2px);
}

.backtop-btn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #8bd85c, #4ca63c);
  color: #0e2109;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  box-shadow: 0 16px 28px rgba(76, 166, 60, 0.24);
}

.contact-section {
  margin-top: 36px;
  padding: 56px 0 28px;
  background:
    radial-gradient(circle at 20% 10%, rgba(146, 216, 138, 0.14), transparent 28%),
    linear-gradient(180deg, #081a0e 0%, #0d2415 100%);
  color: #f2fff2;
}

.contact-shell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.contact-badge {
  width: 66px;
  height: 66px;
  border-radius: 999px;
  background: #eff9ef;
  color: #204d27;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
}

.contact-shell h3 {
  margin: 18px 0 10px;
  font-size: 2rem;
  color: #fff;
}

.contact-subtitle {
  margin: 0;
  max-width: 760px;
  color: rgba(242, 255, 242, 0.84);
  font-size: 1.2rem;
  line-height: 1.8;
}

.contact-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 18px;
  margin-top: 28px;
  width: min(860px, 100%);
}

.contact-item {
  padding: 20px 22px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.contact-item span {
  display: block;
  margin-bottom: 10px;
  color: rgba(191, 238, 187, 0.82);
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.contact-item a,
.contact-item strong {
  color: #fff;
  line-height: 1.8;
  word-break: break-word;
}

.contact-footer {
  margin-top: 34px;
  color: rgba(220, 241, 220, 0.76);
  font-size: 0.98rem;
}

@media (max-width: 1120px) {
  .hero-grid,
  .section-grid,
  .section-grid-wide {
    grid-template-columns: 1fr;
  }

  .mechanism-shell {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .references-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .mechanism-header {
    max-width: 100%;
  }

  .stats-grid,
  .phase-grid,
  .mini-cards,
  .module-grid,
  .citation-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 70px 0 48px;
  }

  .section-block {
    padding: 64px 0;
  }

  .container {
    width: min(1240px, calc(100% - 24px));
  }

  .stats-grid,
  .phase-grid,
  .mini-cards,
  .module-grid,
  .citation-meta,
  .contact-meta {
    grid-template-columns: 1fr;
  }

  .module-card-single {
    grid-template-columns: 1fr;
  }

  .module-card-single .module-image-wrap {
    min-height: 220px;
  }

  .hero-copy h1 {
    font-size: clamp(2.2rem, 10vw, 3.1rem);
  }

  .section-copy h2,
  .section-heading h2 {
    font-size: clamp(1.75rem, 8vw, 2.45rem);
  }

  .mechanism-header h2 {
    font-size: clamp(1.95rem, 8.4vw, 3rem);
  }

  .phase-card,
  .mini-card,
  .module-body,
  .citation-card,
  .highlight-panel,
  .references-card,
  .contact-item {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
