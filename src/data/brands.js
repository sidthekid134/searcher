// Sample brand ownership data with various ownership structures
export const brandsData = [
  {
    id: 1,
    name: "Pepsi",
    primaryOwner: "PepsiCo Inc.",
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-12-01",
    hierarchy: [
      {
        level: 1,
        name: "Pepsi",
        type: "brand"
      },
      {
        level: 2,
        name: "PepsiCo Inc.",
        type: "parent_company"
      }
    ]
  },
  {
    id: 2,
    name: "Tropicana",
    primaryOwner: "PepsiCo Inc.",
    peOwner: null,
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-11-15",
    hierarchy: [
      {
        level: 1,
        name: "Tropicana",
        type: "brand"
      },
      {
        level: 2,
        name: "PepsiCo Inc.",
        type: "parent_company"
      }
    ]
  },
  {
    id: 3,
    name: "Skittles",
    primaryOwner: "Mars Incorporated",
    peOwner: null,
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-11-20",
    hierarchy: [
      {
        level: 1,
        name: "Skittles",
        type: "brand"
      },
      {
        level: 2,
        name: "Mars Incorporated",
        type: "parent_company"
      }
    ]
  },
  {
    id: 4,
    name: "Whole Foods Market",
    primaryOwner: "Amazon.com Inc.",
    peOwner: null,
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-10-30",
    hierarchy: [
      {
        level: 1,
        name: "Whole Foods Market",
        type: "brand"
      },
      {
        level: 2,
        name: "Amazon.com Inc.",
        type: "parent_company"
      },
      {
        level: 3,
        name: "Bezos Expeditions (holding company)",
        type: "parent_company"
      }
    ]
  },
  {
    id: 5,
    name: "Dunkin'",
    primaryOwner: "Dunkin' Brands Group",
    peOwner: "Spotlight Brands (Private Equity)",
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-12-10",
    hierarchy: [
      {
        level: 1,
        name: "Dunkin'",
        type: "brand"
      },
      {
        level: 2,
        name: "Dunkin' Brands Group",
        type: "parent_company"
      },
      {
        level: 3,
        name: "Spotlight Brands",
        type: "pe_firm"
      }
    ]
  },
  {
    id: 6,
    name: "TikTok",
    primaryOwner: "ByteDance Ltd.",
    peOwner: null,
    isDisputed: true,
    isIncomplete: false,
    lastUpdated: "2025-11-05",
    hierarchy: [
      {
        level: 1,
        name: "TikTok",
        type: "brand"
      },
      {
        level: 2,
        name: "ByteDance Ltd.",
        type: "parent_company"
      }
    ]
  },
  {
    id: 7,
    name: "Snapchat",
    primaryOwner: "Snap Inc.",
    peOwner: null,
    isDisputed: false,
    isIncomplete: true,
    lastUpdated: "2025-09-20",
    hierarchy: [
      {
        level: 1,
        name: "Snapchat",
        type: "brand"
      },
      {
        level: 2,
        name: "Snap Inc.",
        type: "parent_company"
      }
    ]
  },
  {
    id: 8,
    name: "Burger King",
    primaryOwner: "Restaurant Brands International",
    peOwner: "3G Capital",
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-12-05",
    hierarchy: [
      {
        level: 1,
        name: "Burger King",
        type: "brand"
      },
      {
        level: 2,
        name: "Restaurant Brands International",
        type: "parent_company"
      },
      {
        level: 3,
        name: "3G Capital",
        type: "pe_firm"
      },
      {
        level: 4,
        name: "3G Capital Partners",
        type: "parent_company"
      }
    ]
  },
  {
    id: 9,
    name: "Domino's Pizza",
    primaryOwner: "Domino's Pizza Inc.",
    peOwner: null,
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-11-28",
    hierarchy: [
      {
        level: 1,
        name: "Domino's Pizza",
        type: "brand"
      },
      {
        level: 2,
        name: "Domino's Pizza Inc.",
        type: "parent_company"
      }
    ]
  },
  {
    id: 10,
    name: "Airbnb",
    primaryOwner: "Airbnb Inc.",
    peOwner: null,
    isDisputed: false,
    isIncomplete: false,
    lastUpdated: "2025-12-12",
    hierarchy: [
      {
        level: 1,
        name: "Airbnb",
        type: "brand"
      },
      {
        level: 2,
        name: "Airbnb Inc.",
        type: "parent_company"
      }
    ]
  }
];

export default brandsData;
