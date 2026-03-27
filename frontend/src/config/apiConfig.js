// src/config/apiConfig.js

const baseURL = 'http://54.245.89.178:3001/api';

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
    getSampleGenes: (dataType, searchTerm = '', dataSource = 'spatial') => {
      const url = new URL(`${baseURL}/data/${dataType}/genes`);
      if (dataSource) {
        url.searchParams.append('data', dataSource);
      }
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
      }
      return url.toString();
    },
  }
};
