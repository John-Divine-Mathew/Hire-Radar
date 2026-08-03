function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^a-z0-9\s,\-.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSearchTokens(value = '') {
  if (!value) return [];
  return String(value)
    .toLowerCase()
    .split(/[,;|]+|\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function buildSearchTerms(search = '', filterValues = {}) {
  const terms = [];

  if (search && typeof search === 'string') {
    terms.push(...splitSearchTokens(search));
  }

  const addValue = (value) => {
    if (Array.isArray(value)) {
      value.forEach(addValue);
      return;
    }
    if (typeof value !== 'string') {
      value = String(value || '');
    }
    if (!value.trim()) return;

    const commaSeparated = value.split(',');
    if (commaSeparated.length > 1) {
      commaSeparated.forEach((item) => {
        const trimmed = item.trim();
        if (trimmed.length > 1) {
          terms.push(trimmed.toLowerCase());
        }
      });
      return;
    }

    terms.push(...splitSearchTokens(value));
  };

  addValue(filterValues.JobTitle);
  addValue(filterValues.role);
  addValue(filterValues.Role);
  addValue(filterValues.Keywords);
  addValue(filterValues.Skills);
  addValue(filterValues.LocationSearch);
  addValue(filterValues.Location);
  addValue(filterValues.SidebarLocation);
  addValue(filterValues.SidebarSkills);
  addValue(filterValues.SidebarJobStatus);
  addValue(filterValues.Gender);
  addValue(filterValues.SidebarOpenToWork);

  return [...new Set(terms)];
}

function parseExperienceRange(filterValues = {}) {
  const values = [];
  if (filterValues.MinExp || filterValues.MaxExp) {
    const min = Number(filterValues.MinExp) || 0;
    const max = Number(filterValues.MaxExp) || 100;
    values.push({ min, max });
  }

  const rawExp = filterValues.SidebarExperience || filterValues.experience || '';
  if (typeof rawExp === 'string' && rawExp.trim()) {
    const cleaned = rawExp.toLowerCase().replace('years', '').trim();
    if (cleaned.includes('-')) {
      const [min, max] = cleaned.split('-').map((part) => Number(part.trim())).filter((n) => !Number.isNaN(n));
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        values.push({ min, max });
      }
    } else if (cleaned.includes('+')) {
      const min = Number(cleaned.replace('+', '').trim());
      if (!Number.isNaN(min)) {
        values.push({ min, max: 100 });
      }
    } else {
      const exact = Number(cleaned.trim());
      if (!Number.isNaN(exact)) {
        values.push({ min: exact, max: exact });
      }
    }
  }

  return values;
}

function matchExperience(candidate, filterValues = {}) {
  const ranges = parseExperienceRange(filterValues);
  if (ranges.length === 0) return null;

  const exp = Number(candidate.cndexperience || candidate.experience || 0);
  if (Number.isNaN(exp)) return false;

  return ranges.some(({ min, max }) => exp >= min && exp <= max);
}

export function calculateMatchScore(candidate = {}, options = {}) {
  const searchText = options.search || '';
  const filterValues = options.filterValues || {};
  const searchTerms = buildSearchTerms(searchText, filterValues);
  const hasExperienceFilter = parseExperienceRange(filterValues).length > 0;
  const totalCriteria = searchTerms.length + (hasExperienceFilter ? 1 : 0);

  if (totalCriteria === 0) {
    return null;
  }

  const candidateText = normalizeText([
    candidate.cndname,
    candidate.cndrole,
    candidate.cndskills,
    candidate.cndlocation,
    candidate.cndemail,
    candidate.cndgender,
    candidate.teststatus,
    candidate.interviewstatus,
    candidate.cndtotalexperience,
    candidate.cndstatus,
    candidate.cndopenwork
  ].filter(Boolean).join(' '));

  let matches = 0;
  searchTerms.forEach((term) => {
    if (candidateText.includes(term)) {
      matches += 1;
    }
  });

  if (hasExperienceFilter && matchExperience(candidate, filterValues)) {
    matches += 1;
  }

  const score = totalCriteria > 0 ? Math.round((matches / totalCriteria) * 100) : 0;
  return `${Math.min(100, Math.max(0, score))}%`;
}

export function formatMatchScore(candidate, options = {}) {
  const computed = calculateMatchScore(candidate, options);
  if (computed !== null) return computed;

  if (options.hideWhenNoCriteria) {
    return null;
  }

  const stored = candidate.matchScore;
  if (stored !== null && stored !== undefined && stored !== '') {
    const value = String(stored).trim();
    return value.endsWith('%') ? value : `${value}%`;
  }

  return '80%';
}
