/**
 * PE/VC Firm Blacklist - Keywords for fallback detection
 */
const PE_VC_BLACKLIST = [
  'private equity',
  'venture capital',
  'venture fund',
  'investment fund',
  'investment company',
  'apollo global',
  'blackstone',
  'carlyle group',
  'kkr',
  'kohlberg kravis roberts',
  'bain capital',
  'psa capital',
  'berkshire hathaway',
  'sequoia capital',
  'andresssen horowitz',
  'a16z',
  'accel',
  'benchmark',
  'index ventures',
  'khosla ventures',
  'kleiner perkins',
  'lightspeed venture',
  'menlo ventures',
  'new enterprise associates',
  'nea',
  'norwest venture',
  'sapphire venture',
  'shasta ventures',
  'techstars',
  'y combinator',
  'y combinator research'
];

/**
 * Publicly traded company indicators
 */
const PUBLICLY_TRADED_INDICATORS = [
  'inc',
  'corp',
  'corporation',
  'ltd',
  'limited',
  'plc',
  'ag',
  'se',
  'nv',
  'bv',
  'public company',
  'public',
  'listed',
  'publicly traded',
  'nasdaq',
  'nyse',
  'stock exchange'
];

/**
 * Classify ultimate parent company ownership status
 * Returns: { status: 'green'|'yellow'|'red', parentName: string, confidence: number, reason: string }
 */
export function classifyOwnershipStatus(ultimateParent) {
  if (!ultimateParent) {
    return {
      status: 'unknown',
      parentName: 'Unknown',
      confidence: 0,
      reason: 'No ultimate parent found'
    };
  }

  const label = ultimateParent.label || '';
  const lowerLabel = label.toLowerCase();

  // Check for PE/VC ownership (RED)
  const peVcResult = detectPEOwnership(label, ultimateParent);
  if (peVcResult.isPEOwned) {
    return {
      status: 'red',
      parentName: label,
      confidence: peVcResult.confidence,
      reason: peVcResult.reason,
      isPEOwned: true
    };
  }

  // Check for publicly traded status (YELLOW)
  const publiclyTradedResult = detectPubliclyTraded(label);
  if (publiclyTradedResult.isPublic) {
    return {
      status: 'yellow',
      parentName: label,
      confidence: publiclyTradedResult.confidence,
      reason: publiclyTradedResult.reason,
      isPubliclyTraded: true
    };
  }

  // Default to independent/founder-owned (GREEN)
  return {
    status: 'green',
    parentName: label,
    confidence: 0.85,
    reason: 'Independent/Founder-Owned Company',
    isIndependent: true
  };
}

/**
 * Detect PE/VC ownership using Wikidata classification and keyword matching
 */
function detectPEOwnership(parentLabel, parentData) {
  const lowerLabel = parentLabel.toLowerCase();

  // Check Wikidata entity types if available
  if (parentData.instanceOf) {
    const types = Array.isArray(parentData.instanceOf)
      ? parentData.instanceOf.map(t => t.toLowerCase())
      : [parentData.instanceOf.toLowerCase()];

    if (
      types.some(t => t.includes('private equity')) ||
      types.some(t => t.includes('venture capital')) ||
      types.some(t => t.includes('investment fund'))
    ) {
      return {
        isPEOwned: true,
        confidence: 0.95,
        reason: 'Classified as private equity or venture capital firm in Wikidata'
      };
    }
  }

  // Fallback: keyword matching against blacklist
  for (const keyword of PE_VC_BLACKLIST) {
    if (lowerLabel.includes(keyword)) {
      return {
        isPEOwned: true,
        confidence: 0.9,
        reason: `Matched PE/VC keyword: "${keyword}"`
      };
    }
  }

  return {
    isPEOwned: false,
    confidence: 0
  };
}

/**
 * Detect publicly traded companies
 */
function detectPubliclyTraded(parentLabel) {
  const lowerLabel = parentLabel.toLowerCase();

  // Check for public company indicators
  for (const indicator of PUBLICLY_TRADED_INDICATORS) {
    if (lowerLabel.includes(indicator)) {
      return {
        isPublic: true,
        confidence: 0.9,
        reason: `Publicly traded company (${indicator})`
      };
    }
  }

  // Known public companies (major tech companies)
  const knownPublicCompanies = [
    'alphabet',
    'google',
    'microsoft',
    'apple',
    'amazon',
    'meta',
    'facebook',
    'tesla',
    'nvidia',
    'intel',
    'amd',
    'qualcomm',
    'broadcom',
    'cisco',
    'vmware',
    'adobe',
    'salesforce',
    'ibm',
    'oracle',
    'hp',
    'dell',
    'lenovo',
    'asus',
    'samsung',
    'lg',
    'sony',
    'canon',
    'panasonic',
    'sharp',
    'toshiba',
    'fujitsu',
    'nec',
    'hitachi',
    'siemens',
    'philips',
    'nokia',
    'ericsson',
    'nokia',
    'zte',
    'huawei',
    'alibaba',
    'tencent',
    'baidu',
    'didi',
    'airbnb',
    'uber',
    'lyft',
    'spotify',
    'netflix',
    'disney',
    'comcast',
    'verizon',
    'at&t',
    'vodafone',
    'deutsche telekom',
    'telefonica',
    'swisscom',
    'bt group',
    'ntt',
    'softbank',
    'docomo',
    'kddi',
    'rakuten',
    'line',
    'naver',
    'kakao',
    'sq',
    'paypal',
    'stripe',
    'block',
    'visa',
    'mastercard',
    'american express',
    'bank of america',
    'jpmorgan',
    'wells fargo',
    'goldman sachs',
    'morgan stanley',
    'citigroup',
    'bnp paribas',
    'deutsche bank',
    'barclays',
    'hsbc',
    'ubs',
    'credit suisse'
  ];

  if (knownPublicCompanies.some(company => lowerLabel.includes(company))) {
    return {
      isPublic: true,
      confidence: 0.95,
      reason: 'Known publicly traded company'
    };
  }

  return {
    isPublic: false,
    confidence: 0
  };
}

/**
 * Calculate years and months since acquisition
 */
export function calculateTimeSinceAcquisition(acquisitionYear) {
  if (!acquisitionYear) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const acquisitionDate = new Date(acquisitionYear, 0, 1);
  const currentDate = new Date();

  const yearsDiff = currentYear - acquisitionYear;

  if (yearsDiff < 0) {
    return null; // Future date
  }

  if (yearsDiff === 0) {
    const monthsDiff = currentMonth;
    return {
      years: 0,
      months: monthsDiff,
      display: monthsDiff === 1 ? '1 month' : `${monthsDiff} months`,
      fullDisplay: `${monthsDiff} months ago`
    };
  }

  // Calculate months more precisely
  const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDate = new Date(acquisitionYear, 0, 1);
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));

  const months = diffMonths % 12;

  return {
    years: yearsDiff,
    months: months,
    display: yearsDiff === 1
      ? months === 0
        ? '1 year'
        : `1 year, ${months} month${months !== 1 ? 's' : ''}`
      : months === 0
      ? `${yearsDiff} years`
      : `${yearsDiff} years, ${months} month${months !== 1 ? 's' : ''}`,
    fullDisplay: yearsDiff === 1
      ? months === 0
        ? '1 year ago'
        : `1 year, ${months} month${months !== 1 ? 's' : ''} ago`
      : months === 0
      ? `${yearsDiff} years ago`
      : `${yearsDiff} years, ${months} month${months !== 1 ? 's' : ''} ago`
  };
}

/**
 * Get tooltip text explaining PE ownership implications
 */
export function getPEOwnershipTooltip() {
  return `
Private Equity (PE) or Venture Capital (VC) owned brands may experience:
• Quality changes and service modifications
• Focus on profitability and operational efficiency
• Potential price increases or feature removals
• Risk of acquisition by other PE firms
• Strategic restructuring and workforce changes

Monitor for changes in service quality and pricing.
  `.trim();
}

/**
 * Get classification color
 */
export function getStatusColor(status) {
  const colors = {
    'green': '#4caf50',
    'yellow': '#ffc107',
    'red': '#f44336',
    'unknown': '#999'
  };
  return colors[status] || colors.unknown;
}

/**
 * Get classification label
 */
export function getStatusLabel(status) {
  const labels = {
    'green': 'Independent/Founder-Owned',
    'yellow': 'Publicly Traded',
    'red': 'PE/VC-Owned',
    'unknown': 'Unknown'
  };
  return labels[status] || labels.unknown;
}
