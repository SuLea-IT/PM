// src/config/apiConfig.js

const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const apiConfig = {
  baseURL: baseURL,
  endpoints: {
    getClusterData: (dataType) => `${baseURL}/cluster/${dataType}`,
    getGeneData: (dataSource, geneName, file) => 
      `${baseURL}/json?data=${dataSource}&gene=${encodeURIComponent(geneName)}&file=${file}`,
    getGeneSetData: (dataSource, genes, file) => ({
      url: `${baseURL}/data/gene-set?data=${dataSource}&file=${file}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genes })
    }),
    getVisitorSummary: () => `${baseURL}/analytics/summary`,
    getSampleGenes: (dataType, searchTerm = '', dataSource = 'spatial') => {
      const params = new URLSearchParams();
      if (dataSource) params.append('data', dataSource);
      if (searchTerm) params.append('search', searchTerm);
      const queryString = params.toString();
      return `${baseURL}/data/${dataType}/genes${queryString ? `?${queryString}` : ''}`;
    },
  }
};
