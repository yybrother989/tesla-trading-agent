# Sentiment Analysis Tab - Backend Integration Requirements

## ⚠️ CRITICAL: Current Data Status

**ALL DATA CURRENTLY DISPLAYED IS STATIC PLACEHOLDER/MOCK DATA**

The Sentiment Analysis tab is currently showing hardcoded mock data that does NOT update. The following sections contain static placeholder data that must be replaced with dynamic API calls:

- Overall Market Sentiment Score (currently: hardcoded 67)
- News Sentiment Card (4 mock articles)
- Analyst Reports Card (4 mock reports)
- Reddit Discussion Card (4 mock Reddit posts)
- Twitter Sentiment Card (4 mock tweets)
- Top Influencer Tracker (6 mock influencer posts)
- Sentiment Timeline Chart (empty placeholder)

**All mock data arrays are defined in:**
- `src/components/tabs/SentimentTab/SentimentTab.tsx` (lines 17-179)
- `src/services/sentimentService.ts` (placeholder methods)

---

## Current Frontend Implementation

### ✅ What's Built (Ready for Backend Connection)

1. **Complete UI Layout**
   - Overall sentiment score display with visual indicators
   - Four expandable sentiment source cards (News, Analyst, Reddit, Twitter)
   - Top Influencer Tracker section
   - Sentiment Timeline chart area (ready for data)
   - Service status banner

2. **Component Features**
   - Color-coded sentiment indicators (green/red/yellow)
   - Trend arrows (↑↓→)
   - Expandable/collapsible cards
   - Loading states (ready to use)
   - Error handling (ready to use)

3. **Data Structure Interfaces**
   - TypeScript interfaces defined for all data types
   - Service layer ready for API integration
   - Error handling infrastructure in place

---

## 🔴 Required Backend Implementation

**CRITICAL: All data must be fetched dynamically from backend APIs. NO static/mock data should remain in production.**

### Required API Endpoints

#### **1. Aggregate Sentiment Endpoint** (HIGH PRIORITY)

**Endpoint:** `GET /api/sentiment/aggregate?symbol=TSLA`

**Current Status:** ❌ Not implemented (showing hardcoded score: 67)

**Expected Response:**
```json
{
  "overallScore": 67,
  "overallLabel": "positive",
  "sources": {
    "news": {
      "score": 72,
      "magnitude": 0.8,
      "label": "positive",
      "change": 5.2,
      "trend": "up"
    },
    "social": {
      "score": 65,
      "magnitude": 0.6,
      "label": "positive",
      "change": 0.3,
      "trend": "neutral"
    },
    "analyst": {
      "score": 45,
      "magnitude": 0.5,
      "label": "negative",
      "change": -2.8,
      "trend": "down"
    }
  },
  "trend": "improving",
  "confidence": 0.75,
  "lastUpdated": "2025-01-XX"
}
```

**Refresh Frequency:** Every 30-60 seconds

---

#### **2. News Sentiment Endpoint** (HIGH PRIORITY)

**Endpoint:** `GET /api/sentiment/news?symbol=TSLA&limit=10`

**Current Status:** ❌ Not implemented (showing 4 hardcoded mock articles)

**Expected Response:**
```json
{
  "articles": [
    {
      "id": "unique-id",
      "headline": "Tesla Q4 Deliveries Exceed Expectations, Stock Rises 5%",
      "source": "Reuters",
      "publishedAt": "2025-01-XX",
      "sentiment": {
        "score": 0.8,
        "magnitude": 0.9,
        "label": "positive"
      },
      "impact": "high",
      "url": "https://..."
    }
  ],
  "aggregateScore": 72,
  "trend": "up",
  "change": 5.2
}
```

**Note:** Currently displaying mock articles that never change. This MUST be replaced with real-time news sentiment data.

---

#### **3. Social Media Sentiment Endpoint** (HIGH PRIORITY)

**Endpoint:** `GET /api/sentiment/social?symbol=TSLA&platform=twitter|reddit&limit=20`

**Current Status:** ❌ Not implemented (showing hardcoded Twitter/Reddit posts)

**Expected Response for Twitter:**
```json
{
  "posts": [
    {
      "id": "tweet-id",
      "platform": "twitter",
      "text": "Tweet content here...",
      "author": "@username",
      "publishedAt": "2025-01-XX",
      "time": "2h",
      "engagement": {
        "likes": 1247,
        "retweets": 389,
        "comments": 156
      },
      "sentiment": {
        "score": 0.9,
        "magnitude": 0.8,
        "label": "positive"
      }
    }
  ],
  "aggregateScore": 65,
  "trend": "neutral",
  "change": 0.3
}
```

**Expected Response for Reddit:**
```json
{
  "posts": [
    {
      "id": "reddit-post-id",
      "platform": "reddit",
      "title": "Post title here...",
      "subreddit": "r/teslainvestorsclub",
      "author": "u/username",
      "publishedAt": "2025-01-XX",
      "time": "3h",
      "engagement": {
        "likes": 1247,
        "comments": 389,
        "shares": 0
      },
      "sentiment": {
        "score": 0.78,
        "magnitude": 0.85,
        "label": "positive"
      }
    }
  ],
  "aggregateScore": 78,
  "trend": "up",
  "change": 8.4
}
```

**Note:** Currently displaying static mock data. Must fetch real-time social media posts dynamically.

---

#### **4. Analyst Sentiment Endpoint** (MEDIUM PRIORITY)

**Endpoint:** `GET /api/sentiment/analysts?symbol=TSLA&limit=10`

**Current Status:** ❌ Not implemented (showing 4 hardcoded analyst reports)

**Expected Response:**
```json
{
  "reports": [
    {
      "id": "report-id",
      "title": "Tesla Maintains Strong Buy Rating - Price Target $350",
      "analyst": "Adam Jonas",
      "firm": "Morgan Stanley",
      "rating": "strong_buy",
      "priceTarget": 350,
      "publishedAt": "2025-01-XX",
      "time": "1h",
      "summary": "Analysis summary text...",
      "sentiment": {
        "score": 0.7,
        "magnitude": 0.8,
        "label": "positive"
      }
    }
  ],
  "aggregateScore": 45,
  "trend": "down",
  "change": -2.8
}
```

**Note:** Static mock data must be replaced with live analyst reports.

---

#### **5. Influencers Endpoint** (MEDIUM PRIORITY)

**Endpoint:** `GET /api/sentiment/influencers?symbol=TSLA&limit=10`

**Current Status:** ❌ Not implemented (showing 6 hardcoded influencer posts)

**Expected Response:**
```json
{
  "influencers": [
    {
      "id": "influencer-post-id",
      "name": "Adam Jonas",
      "title": "Morgan Stanley",
      "role": "Lead Auto Analyst",
      "avatar": "https://...",
      "content": "Post content here...",
      "impact": "high",
      "sentiment": "positive",
      "priceImpact": 12.45,
      "publishedAt": "2025-01-XX",
      "time": "2h ago",
      "followers": "2.1M",
      "credibility": 0.98
    }
  ]
}
```

**Note:** Currently showing static mock influencer data. Must be dynamically updated.

---

#### **6. Sentiment Trend Endpoint** (MEDIUM PRIORITY)

**Endpoint:** `GET /api/sentiment/trend?symbol=TSLA&days=7`

**Current Status:** ❌ Not implemented (empty chart placeholder)

**Expected Response:**
```json
{
  "timeline": [
    {
      "date": "2025-01-XX",
      "score": 0.65,
      "volume": 1250
    },
    {
      "date": "2025-01-YY",
      "score": 0.68,
      "volume": 1320
    }
  ]
}
```

**Note:** Chart area is empty. This endpoint must provide historical sentiment data for visualization.

---

## 🔄 Dynamic Data Requirements

### Real-Time Update Frequency

1. **Aggregate Sentiment Score**
   - Update: Every 30-60 seconds
   - Cache: 1 minute
   - Auto-refresh: Yes

2. **Source Cards (News, Social, Analyst)**
   - Update: On user expand/collapse (lazy loading)
   - Cache: 5 minutes per source
   - Auto-refresh: No (user-triggered)

3. **Influencer Tracker**
   - Update: Every 2-5 minutes
   - Cache: 3 minutes
   - Auto-refresh: Yes

4. **Sentiment Timeline**
   - Update: On tab load
   - Cache: 15 minutes
   - Auto-refresh: No

### Data Freshness Indicators

The frontend must display:
- Timestamp of last data update
- Real-time indicator when data is fresh vs. stale
- Warning banner if data is >10 minutes old

---

## 🔌 Integration Implementation Steps

### Step 1: Replace Mock Data in Frontend

**File:** `src/components/tabs/SentimentTab/SentimentTab.tsx`

**Current Mock Data Locations:**
- Line 17: `mockSentimentData` array
- Line 25: `mockTweets` array
- Line 64: `mockRedditPosts` array
- Line 107: `mockNewsArticles` array
- Line 142: `mockAnalystReports` array
- Line 330: Hardcoded overall score (67)

**Action Required:**
1. Remove all mock data arrays
2. Replace with `useState` hooks initialized to empty arrays
3. Add `useEffect` hooks to fetch data from API endpoints on component mount
4. Implement loading states during API calls
5. Add error handling for failed API requests

### Step 2: Update Sentiment Service

**File:** `src/services/sentimentService.ts`

**Current Status:** All methods are placeholders returning mock data

**Action Required:**
1. Implement `getAggregateSentiment()` - calls `/api/sentiment/aggregate`
2. Implement `analyzeNewsSentiment()` - calls `/api/sentiment/news`
3. Implement `analyzeSocialMediaSentiment()` - calls `/api/sentiment/social`
4. Implement `analyzeAnalystSentiment()` - calls `/api/sentiment/analysts`
5. Implement `getSentimentTrend()` - calls `/api/sentiment/trend`
6. Add proper error handling and retry logic
7. Add caching mechanism to prevent excessive API calls

### Step 3: Create API Routes (Backend)

**Required Files to Create:**
- `src/app/api/sentiment/aggregate/route.ts`
- `src/app/api/sentiment/news/route.ts`
- `src/app/api/sentiment/social/route.ts`
- `src/app/api/sentiment/analysts/route.ts`
- `src/app/api/sentiment/influencers/route.ts`
- `src/app/api/sentiment/trend/route.ts`

**Each route must:**
- Accept query parameters (`symbol`, `limit`, `platform`, `days`)
- Connect to external sentiment analysis APIs
- Process and normalize response data
- Return data in expected format
- Handle errors gracefully

---

## 📊 Data Format Specifications

### Sentiment Score Conversion

**Backend may return scores in two formats:**

1. **0-100 scale** (preferred)
   - Frontend displays as-is
   - Example: score: 72 → displays "72"

2. **-1 to +1 scale**
   - Frontend converts: `(score + 1) * 50`
   - Example: score: 0.8 → displays "90"

**Backend must specify which format in API documentation.**

### Timestamp Format

**All timestamps must be:**
- ISO 8601 format: `"2025-01-XX"`
- Relative time: `"2h"`, `"5h"`, `"1d"` (calculated on frontend)
- Or both: Include both `publishedAt` (ISO) and `time` (relative string)

### Sentiment Labels

**Allowed values:** `"positive"`, `"negative"`, `"neutral"`

**Case sensitive:** Must match exactly for frontend color coding to work.

---

## ⚡ Performance Considerations

### Caching Strategy

- **Aggregate sentiment:** Cache for 1 minute (high frequency updates)
- **Source data:** Cache for 5 minutes (updated less frequently)
- **Trend data:** Cache for 15 minutes (historical data changes slowly)

### Rate Limiting

- Frontend will implement request throttling
- Backend should handle reasonable rate limits (suggest: 100 requests/minute per user)
- Implement exponential backoff for retries

### Error Handling

- If API fails, frontend shows error message
- Retry failed requests up to 3 times with exponential backoff
- Display "Service Unavailable" banner if backend is down
- Gracefully degrade (show cached data if available)

---

## ✅ Testing Checklist

Once backend endpoints are implemented, verify:

- [ ] Aggregate sentiment score updates dynamically (not hardcoded)
- [ ] News sentiment card fetches real articles (not mock data)
- [ ] Twitter sentiment fetches real tweets (not mock posts)
- [ ] Reddit sentiment fetches real Reddit posts (not mock data)
- [ ] Analyst reports fetch real analyst data (not mock reports)
- [ ] Influencer tracker shows real influencer posts (not mock data)
- [ ] Sentiment timeline chart displays real trend data (not empty)
- [ ] All data timestamps update correctly
- [ ] Loading states appear during API calls
- [ ] Error states handle API failures gracefully
- [ ] Data refreshes automatically at specified intervals
- [ ] No mock/placeholder data visible in production

---

## 🚨 Critical Reminders

1. **ALL MOCK DATA MUST BE REMOVED** - The UI currently shows static placeholder data that never changes. This must be completely replaced with dynamic API calls.

2. **Real-Time Updates Required** - Data should update automatically, not require manual page refresh.

3. **Error Handling is Critical** - If APIs fail, users must see clear error messages, not broken UI or stale mock data.

4. **Data Freshness Indicators** - Users must know when data was last updated and if it's stale.

5. **No Hardcoded Values** - Every number, text, and date must come from backend APIs, not hardcoded in frontend code.

---

## Summary

The Sentiment Analysis tab has a complete, production-ready UI that is currently displaying static mock data. To make it fully functional, the backend team needs to implement 6 API endpoints that provide real-time sentiment data. Once these endpoints are available, the frontend can be quickly updated to fetch and display live data, replacing all placeholder content.

**Current Status:** UI Complete ✅ | Backend Integration: Not Started ❌ | Data: 100% Mock/Placeholder ❌



