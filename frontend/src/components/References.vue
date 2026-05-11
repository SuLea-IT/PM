<template>
  <div class="references-page">
    <section class="references-hero">
      <div class="container">
        <button class="back-btn" @click="navigateTo('/home')">← Back to Home</button>
        <span class="refs-kicker">Literature resource</span>
        <h1>Full reference list</h1>
        <p>
          Curated references from the manuscript resource covering plant de novo
          regeneration, stem-cell niche organization and spatial transcriptomics.
        </p>
        <div class="refs-stats">
          <div class="refs-stat">
            <strong>{{ references.length }}</strong>
            <span>References</span>
          </div>
          <div class="refs-stat">
            <strong>Plant regeneration</strong>
            <span>Core topic</span>
          </div>
          <div class="refs-stat">
            <strong>Spatial transcriptomics</strong>
            <span>Technology focus</span>
          </div>
        </div>
      </div>
    </section>

    <section class="references-content">
      <div class="container">
        <div class="references-toolbar">
          <div class="toolbar-copy">
            <span class="refs-kicker">Reference directory</span>
            <h2>Detailed literature list</h2>
            <p>
              Browse the manuscript bibliography below. You can search by author,
              year, journal or topic keyword.
            </p>
          </div>
          <div class="toolbar-actions">
            <div class="results-chip">
              <strong>{{ filteredReferences.length }}</strong>
              <span>/ {{ references.length }} shown</span>
            </div>
            <input
              v-model.trim="search"
              class="search-input"
              type="text"
              placeholder="Search author, year, journal or keyword"
            />
          </div>
        </div>

        <div class="references-card">
          <div class="references-card-head">
            <div>
              <span class="refs-kicker">Bibliography</span>
              <h3>Curated manuscript references</h3>
            </div>
            <div class="scroll-hint">Scrollable panel</div>
          </div>

          <div class="references-scroll">
            <ol v-if="filteredReferences.length" class="reference-list">
              <li v-for="(item, index) in filteredReferences" :key="`${index}-${item.slice(0, 24)}`">
                <span class="reference-index">{{ index + 1 }}</span>
                <span class="reference-text">{{ item }}</span>
              </li>
            </ol>
            <div v-else class="empty-state">
              No references matched your search.
            </div>
          </div>
        </div>
      </div>
    </section>

    <el-backtop :right="28" :bottom="28">
      <div class="backtop-btn">↑</div>
    </el-backtop>
  </div>
</template>

<script>
import referencesMarkdown from "../assets/about/references.md?raw";

export default {
  name: "References",
  data() {
    return {
      search: "",
      referencesMarkdown,
    };
  },
  computed: {
    references() {
      const lines = this.referencesMarkdown
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      const startIndex = lines.findIndex((line) => line === "REFERENCES");
      if (startIndex === -1) return [];

      return lines.slice(startIndex + 1).filter((line) => /\(\d{4}\)/.test(line));
    },
    filteredReferences() {
      if (!this.search) return this.references;
      const keyword = this.search.toLowerCase();
      return this.references.filter((item) => item.toLowerCase().includes(keyword));
    },
  },
  methods: {
    navigateTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.references-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, #f4f8f3 0%, #f7f8fb 100%);
  color: #15261a;
}

.references-page,
.references-page * {
  box-sizing: border-box;
}

.container {
  width: min(1200px, calc(100% - 32px));
  margin: 0 auto;
}

.references-hero {
  padding: 72px 0 44px;
  background:
    radial-gradient(circle at left top, rgba(131, 204, 121, 0.16), transparent 28%),
    linear-gradient(135deg, #0a2110 0%, #0d2c18 48%, #143122 100%);
  color: #f2fff2;
}

.back-btn {
  margin-bottom: 24px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #f2fff2;
}

.refs-kicker {
  display: inline-block;
  color: #92d88a;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.references-hero h1,
.references-toolbar h2 {
  margin: 16px 0;
  line-height: 1.12;
}

.references-hero h1 {
  font-size: clamp(2.3rem, 4vw, 4rem);
}

.references-hero p {
  max-width: 860px;
  margin: 0;
  color: rgba(242, 255, 242, 0.82);
  line-height: 1.85;
  font-size: 1.05rem;
}

.refs-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.refs-stat {
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.refs-stat strong {
  display: block;
  color: #fff;
  font-size: 1.2rem;
}

.refs-stat span {
  display: block;
  margin-top: 8px;
  color: rgba(242, 255, 242, 0.72);
}

.references-content {
  padding: 54px 0 72px;
}

.references-toolbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 26px;
}

.toolbar-copy p {
  margin: 0;
  color: #607065;
  line-height: 1.8;
}

.toolbar-actions {
  display: grid;
  gap: 12px;
  justify-items: end;
}

.results-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  background: #eef7eb;
  border: 1px solid rgba(95, 184, 77, 0.18);
  color: #315a33;
}

.results-chip strong {
  font-size: 1rem;
}

.search-input {
  width: min(420px, 100%);
  padding: 14px 16px;
  border: 1px solid rgba(21, 38, 26, 0.12);
  border-radius: 14px;
  background: #fff;
  outline: none;
  box-shadow: 0 10px 24px rgba(23, 41, 26, 0.06);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: rgba(95, 184, 77, 0.42);
  box-shadow: 0 14px 28px rgba(95, 184, 77, 0.14);
}

.references-card {
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(21, 38, 26, 0.08);
  box-shadow: 0 18px 44px rgba(26, 45, 29, 0.08);
}

.references-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 6px 18px;
  border-bottom: 1px solid rgba(21, 38, 26, 0.08);
}

.references-card-head h3 {
  margin: 10px 0 0;
  color: #18291d;
  font-size: 1.35rem;
}

.scroll-hint {
  padding: 9px 14px;
  border-radius: 999px;
  background: #f4f7f3;
  color: #6b7a70;
  font-size: 0.86rem;
  white-space: nowrap;
}

.references-scroll {
  max-height: 68vh;
  overflow-y: auto;
  margin-top: 18px;
  padding-right: 8px;
}

.references-scroll::-webkit-scrollbar {
  width: 10px;
}

.references-scroll::-webkit-scrollbar-track {
  background: #edf2ec;
  border-radius: 999px;
}

.references-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #a6d99f, #6dbb62);
  border-radius: 999px;
  border: 2px solid #edf2ec;
}

.reference-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.reference-list li {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px 12px;
  border-radius: 18px;
  color: #435348;
  line-height: 1.85;
  transition: background 0.2s ease, transform 0.2s ease;
}

.reference-list li + li {
  margin-top: 12px;
}

.reference-list li:hover {
  background: #f7fbf5;
  transform: translateX(2px);
}

.reference-index {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #eef7eb;
  color: #377036;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
}

.reference-text {
  display: block;
}

.empty-state {
  color: #5b6b61;
  padding: 28px 8px 16px;
  text-align: center;
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

@media (max-width: 768px) {
  .references-hero {
    padding: 56px 0 36px;
  }

  .refs-stats,
  .references-toolbar {
    grid-template-columns: 1fr;
    display: grid;
  }

  .toolbar-actions {
    justify-items: stretch;
  }

  .references-card-head,
  .reference-list li {
    grid-template-columns: 1fr;
  }

  .references-card-head {
    align-items: flex-start;
  }

  .reference-index {
    margin-bottom: 4px;
  }

  .references-scroll {
    max-height: 62vh;
  }

  .references-card {
    padding: 22px 20px;
  }
}
</style>
