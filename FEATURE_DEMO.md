# Brand Classification Feature - Demo & Testing Guide

## Quick Start

To see the brand ownership classification feature in action, simply search for any of the following brands in the search bar:

## 🔴 RED Classification - PE/VC Owned Brands

### Example 1: Zendesk
- **Search Term**: "zendesk"
- **Ultimate Parent**: Apollo Global Management
- **Classification**: Red (PE-Owned)
- **Confidence**: 85%
- **Acquisition Year**: 2022
- **Time Since Acquisition**: 2 years, 11 months ago
- **Visual Feedback**: Red flash animation plays on initial load
- **Tooltip**: Shows PE ownership risks when hovering over the warning section

**What You'll See:**
```
┌─────────────────────────────────────────┐
│ 🔴 PE/VC-Owned                          │
│    85% confidence                        │
├─────────────────────────────────────────┤
│ Parent Company: Apollo Global Management │
├─────────────────────────────────────────┤
│ Acquisition Timeline:                    │
│ Acquired in 2022                         │
│ 2 years, 11 months ago                   │
│ [████░░] Progress                        │
├─────────────────────────────────────────┤
│ ⚠️ PE/VC Owned - Quality Degradation Risk│
│                                       ? │
│ (Hover for details about PE risks)       │
└─────────────────────────────────────────┘
```

### Example 2: Qualtrics
- **Search Term**: "qualtrics"
- **Ultimate Parent**: Blackstone Inc.
- **Classification**: Red (PE-Owned)
- **Confidence**: 85%
- **Acquisition Year**: 2023
- **Time Since Acquisition**: 1 year, 11 months ago
- **Visual Feedback**: Red flash animation with 1.5s duration

---

## 🟡 YELLOW Classification - Publicly Traded Companies

### Example 3: Slack
- **Search Term**: "slack"
- **Ultimate Parent**: Salesforce Inc.
- **Classification**: Yellow (Publicly Traded)
- **Confidence**: 90%
- **Why**: "Inc." in company name + known public company
- **Visual Feedback**: No flash animation, smooth appearance
- **Badge**: "📈 Publicly Traded"

**What You'll See:**
```
┌─────────────────────────────────────────┐
│ 🟡 Publicly Traded                      │
│    90% confidence                        │
├─────────────────────────────────────────┤
│ Parent Company: Salesforce Inc.          │
├─────────────────────────────────────────┤
│ Classification Reason:                   │
│ Known publicly traded company            │
├─────────────────────────────────────────┤
│ 📈 Publicly Traded                       │
│ This company is publicly traded and      │
│ accountable to shareholders.             │
└─────────────────────────────────────────┘
```

### Example 4: YouTube
- **Search Term**: "youtube"
- **Ultimate Parent**: Alphabet Inc.
- **Classification**: Yellow (Publicly Traded)
- **Confidence**: 95%
- **Why**: Known as parent of Google, publicly traded

### Example 5: GitHub
- **Search Term**: "github"
- **Ultimate Parent**: Microsoft Corporation
- **Classification**: Yellow (Publicly Traded)
- **Confidence**: 95%
- **Why**: Microsoft is a well-known publicly traded company

---

## 🟢 GREEN Classification - Independent/Founder-Owned

### Example 6: Google/Alphabet
- **Search Term**: "google"
- **Ultimate Parent**: Alphabet Inc.
- **Classification**: Green (Independent/Founder-Owned)
- **Confidence**: 85%
- **Why**: No PE/VC ownership, independent operation
- **Visual Feedback**: Green fade animation (2s duration)
- **Badge**: "🌿 Independent"

**What You'll See:**
```
┌─────────────────────────────────────────┐
│ 🟢 Independent/Founder-Owned            │
│    85% confidence                        │
├─────────────────────────────────────────┤
│ Parent Company: Alphabet Inc.            │
├─────────────────────────────────────────┤
│ Classification Reason:                   │
│ Independent/Founder-Owned Company        │
├─────────────────────────────────────────┤
│ 🌿 Independent                           │
│ This company maintains independent       │
│ ownership and control.                   │
└─────────────────────────────────────────┘
```

### Example 7: Apple
- **Search Term**: "apple"
- **Ultimate Parent**: Apple Inc.
- **Classification**: Green (Independent/Founder-Owned)
- **Confidence**: 85%
- **Why**: Not PE/VC owned, operates independently

### Example 8: Microsoft
- **Search Term**: "microsoft"
- **Ultimate Parent**: Microsoft Corporation
- **Classification**: Green (Independent/Founder-Owned)
- **Confidence**: 85%
- **Why**: Independent public corporation, not PE/VC-owned

---

## Interactive Features Testing

### 1. Test PE Warning Tooltip
1. Search for **"zendesk"**
2. Look for the orange warning box with ⚠️ icon
3. Hover your mouse over the "PE/VC Owned - Quality Degradation Risk" section
4. A tooltip appears showing PE ownership implications

**Tooltip Content:**
```
Private Equity (PE) or Venture Capital (VC) owned brands may experience:
• Quality changes and service modifications
• Focus on profitability and operational efficiency
• Potential price increases or feature removals
• Risk of acquisition by other PE firms
• Strategic restructuring and workforce changes

Monitor for changes in service quality and pricing.
```

### 2. Test Animation Effects
1. **For PE-owned (Red)**: Search for "zendesk"
   - Observe the red flash animation
   - Background glows red, then fades back to white
   - Duration: 1.5 seconds
   - Creates visual alert effect

2. **For Independent (Green)**: Search for "apple" or "microsoft"
   - Observe the green fade animation
   - Card fades in with slight upward movement
   - Duration: 2 seconds
   - Creates calming, positive effect

### 3. Test Acquisition Timeline
1. Search for **"zendesk"** (acquired 2022)
   - Shows "Acquired in 2022"
   - Shows real-time counter: "2 years, 11 months ago"
   - Progress bar animates to show elapsed time

2. Search for **"qualtrics"** (acquired 2023)
   - Shows "Acquired in 2023"
   - Shows: "1 year, 11 months ago"
   - More recent acquisition = less time elapsed

---

## Confidence Scores Explained

### How Confidence is Calculated

| Score | Meaning | Example |
|-------|---------|---------|
| 95% | Wikidata classified as PE/VC | Detected via entity type classification |
| 90% | Keyword match in blacklist | Label contains "Blackstone", "KKR", etc. |
| 90% | Public company by indicator | Contains "Inc", "Corp", "Ltd", "PLC" |
| 95% | Known public company | Listed in known public companies database |
| 85% | Default independent classification | No PE/VC or public trading indicators |

### Why Confidence Matters
- **95%**: Very high confidence in classification
- **90%**: High confidence, matches multiple indicators
- **85%**: Moderate confidence, default classification
- Lower confidence = more uncertain classification (possible false positives)

---

## Classification Algorithm Flow

```
┌─ Search for Brand
│
├─ Get Ultimate Parent Company
│
├─ Run Classification Analysis
│  ├─ Check Wikidata entity types
│  │  └─ If "private equity" or "venture capital" → RED (95%)
│  │
│  ├─ Check keyword blacklist
│  │  └─ If matches PE/VC keywords → RED (90%)
│  │
│  ├─ Check public company indicators
│  │  ├─ Check for legal suffixes (Inc, Corp, Ltd, etc.) → YELLOW (90%)
│  │  └─ Check known public companies list → YELLOW (95%)
│  │
│  └─ Default to independent → GREEN (85%)
│
├─ Determine Animation
│  ├─ If RED → Apply red flash animation
│  ├─ If GREEN → Apply green fade animation
│  └─ If YELLOW → No animation (smooth display)
│
├─ Calculate Time Since Acquisition (if PE-owned)
│  └─ Display real-time counter
│
└─ Display Verdict Card with all details
```

---

## Edge Cases & Special Behaviors

### When Search Results Have Multiple Levels
- The classification always uses the **ultimate parent company** (top of the chain)
- Example: Slack → Salesforce → (no owner)
  - Classifies based on Salesforce, not Slack

### When Acquisition Year is Unavailable
- Zendesk: Has acquisition year (2022) → Shows timeline
- Apple: No acquisition year → Timeline section hidden
- Only PE-owned brands show acquisition timeline

### When Wikidata is Unavailable
- Falls back to local database
- Classification still works using keyword matching
- Source badge changes to "database" instead of "wikidata"

### When Company Not in Database
- Shows error message: "Brand 'xyz' not found in database"
- Still attempts Wikidata lookup (with 5-second timeout)
- Graceful fallback handling

---

## CSS & Animation Details

### Color Scheme
- **Red (#f44336)**: PE/VC-owned, high risk
- **Yellow (#ffc107)**: Publicly traded, moderate oversight
- **Green (#4caf50)**: Independent, stable ownership

### Animation Timings
- **PE Flash**: 1.5 seconds (sharp alert)
- **Independent Fade**: 2 seconds (calm, smooth)
- **Progress Bar**: 2 seconds infinite (continuous movement)
- **Tooltip Fade**: 0.3 seconds (quick popup)

### Responsive Behavior
- Mobile view: Card width adjusts to screen size
- Tooltip positioning: Adjusts for small screens
- Font sizes: Reduce on mobile for readability
- Touch support: Hover states work on touch devices

---

## Testing Checklist

- [ ] Red classification and flash animation working
- [ ] Yellow classification and smooth display working
- [ ] Green classification and fade animation working
- [ ] Confidence scores display correctly
- [ ] Acquisition timeline shows for PE-owned brands
- [ ] PE tooltip appears and disappears on hover
- [ ] Classification reasons are accurate
- [ ] Works with both Wikidata and database sources
- [ ] Responsive design on mobile devices
- [ ] Animations don't cause performance issues
- [ ] All color-coded badges display correctly
- [ ] Time calculations are accurate

---

## Troubleshooting

### Red flash animation not showing
- Ensure the browser supports CSS animations
- Check if hardware acceleration is enabled
- Verify the card has `pe-flash` class applied

### Tooltip not appearing
- Check that JavaScript is enabled
- Verify mouse hover events are firing
- Inspect browser console for errors

### Wrong classification
- Verify the parent company name matches PE/VC blacklist
- Check if company is in known public companies list
- May need to update blacklist for new PE firms

### Timeline showing incorrect years
- Ensure browser system date is correct
- Check that acquisitionYear is available in data
- Verify date calculation math (leap years, etc.)
