import type { NewLead } from '@/lib/types';

// Deterministic pseudo-random generator so the same search yields stable,
// realistic-looking leads without any external data provider.
function makeRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) + 1;
}

const FIRST = [
  'Summit', 'Apex', 'Premier', 'Elite', 'Guardian', 'Coastal', 'Heritage',
  'Liberty', 'Cornerstone', 'Pioneer', 'Reliable', 'Blue Sky', 'Evergreen',
  'Ironclad', 'Legacy', 'Northstar', 'Titan', 'Vanguard', 'Meridian', 'Anchor',
  'Golden Gate', 'Silverline', 'Redwood', 'Crown', 'Frontier',
];
const SECOND = [
  'Brothers', 'Partners', 'Group', 'Solutions', 'Services', 'Co', 'Pros',
  '& Sons', 'Experts', 'Specialists', 'Contractors', 'Associates', 'Works',
  'Collective', 'Enterprises',
];

const PROBLEM_POOL = [
  'No website found',
  'Website not mobile friendly',
  'Slow loading pages (>5s)',
  'No SSL / not secure',
  'Outdated design (pre-2015)',
  'No online booking',
  'No Google Business profile',
  'Few or no reviews',
  'No social media presence',
  'Missing contact form',
  'Low search visibility',
  'Broken links detected',
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
}

function nicheToKeyword(niche: string): string {
  const words = niche.toLowerCase().replace(/companies|company|businesses|business|services|service/g, '').trim();
  return words.split(/\s+/)[0] || 'local';
}

export function generateLeads(searchId: string, niche: string, location: string, count: number): NewLead[] {
  const rng = makeRng(hashString(`${niche}|${location}`));
  const keyword = nicheToKeyword(niche);
  const usedNames = new Set<string>();
  const leads: NewLead[] = [];

  for (let i = 0; i < count; i++) {
    let name = '';
    let guard = 0;
    do {
      const first = FIRST[Math.floor(rng() * FIRST.length)];
      const second = SECOND[Math.floor(rng() * SECOND.length)];
      const cap = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      name = `${first} ${cap} ${second}`;
      guard++;
    } while (usedNames.has(name) && guard < 12);
    usedNames.add(name);

    const hasWebsite = rng() > 0.28;
    const slug = slugify(name);
    const tld = rng() > 0.5 ? 'com' : rng() > 0.5 ? 'net' : 'biz';
    const website = hasWebsite ? `https://www.${slug}.${tld}` : '';

    const areaCode = 200 + Math.floor(rng() * 799);
    const phone = `(${areaCode}) ${100 + Math.floor(rng() * 899)}-${1000 + Math.floor(rng() * 8999)}`;

    const emailDomain = hasWebsite ? `${slug}.${tld}` : rng() > 0.5 ? 'gmail.com' : 'yahoo.com';
    const email = `info@${emailDomain}`;

    const rating = Math.round((2.6 + rng() * 2.4) * 10) / 10;
    const reviewCount = Math.floor(rng() * 240) + (rng() > 0.7 ? 200 : 0);

    // Website quality: 0 if no site, otherwise a spread skewed toward mediocre.
    const quality = hasWebsite ? Math.floor(20 + rng() * 75) : 0;

    const hasSocial = rng() > 0.4;
    const estimatedTraffic = hasWebsite ? Math.floor(rng() * 4200) + 40 : 0;

    const problems: string[] = [];
    if (!hasWebsite) {
      problems.push('No website found', 'Low search visibility');
    } else {
      if (quality < 55) problems.push('Outdated design (pre-2015)');
      if (quality < 45) problems.push('Website not mobile friendly');
      if (rng() > 0.55) problems.push('Slow loading pages (>5s)');
      if (rng() > 0.7) problems.push('No SSL / not secure');
    }
    if (!hasSocial) problems.push('No social media presence');
    if (reviewCount < 25) problems.push('Few or no reviews');
    // Sprinkle one extra realistic issue.
    if (rng() > 0.6) {
      const extra = PROBLEM_POOL[Math.floor(rng() * PROBLEM_POOL.length)];
      if (!problems.includes(extra)) problems.push(extra);
    }

    leads.push({
      search_id: searchId,
      business_name: name,
      website,
      phone,
      email,
      google_rating: rating,
      review_count: reviewCount,
      website_quality_score: quality,
      has_social: hasSocial,
      estimated_traffic: estimatedTraffic,
      problems,
    });
  }

  // Sort so the weakest websites (best sales opportunities) surface first.
  leads.sort((a, b) => a.website_quality_score - b.website_quality_score);
  return leads;
}
