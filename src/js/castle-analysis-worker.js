'use strict';
importScripts('castle-game-data.js', 'castle-analysis.js');
self.onmessage = ({ data }) => {
  try {
    const { id, placements, terrain, fire, paths } = data;
    self.postMessage({ id,
      heat: fire ? castleAnalysis.fireExposure(placements) : null,
      routes: paths ? castleAnalysis.routes(placements, 100, terrain) : [] });
  } catch (error) { self.postMessage({ id: data.id, error: error.message }); }
};
