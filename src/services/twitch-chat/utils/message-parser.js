// Parse badges from raw IRC message string
function parseBadgesFromRaw(raw) {
  const badgesArray = [];
  if (raw && typeof raw === 'string') {
    const badgesMatch = raw.match(/badges=([^;]+)/);
    if (badgesMatch && badgesMatch[1]) {
      const badgesStr = badgesMatch[1];
      const parts = badgesStr.split(',');
      for (const part of parts) {
        const [name, version] = part.split('/');
        if (name && version) {
          badgesArray.push({ name, version });
        }
      }
    }
  }
  return badgesArray;
}

module.exports = { parseBadgesFromRaw };