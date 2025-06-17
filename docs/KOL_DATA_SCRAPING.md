# KOL Data Scraping Implementation

## Overview

The KOL (Key Opinion Leader) data scraping functionality has been implemented with the following features:

1. **Automatic Data Collection**: When a new KOL is added, the system automatically triggers data collection
2. **Scheduled Updates**: KOL data is updated every 10 minutes through scheduled tasks
3. **Fallback to Mock Data**: When Twitter API is unavailable, the system generates realistic mock data
4. **Real-time Processing**: Collected tweets are analyzed for emotions in real-time
5. **Score Calculation**: KOL emotion and influence scores are calculated based on analyzed data

## Architecture

### Components

1. **Backend Services**
   - `KolService`: Manages KOL entities and triggers data collection
   - `CollectionService`: Orchestrates data collection and emotion analysis
   - `EmotionService`: Performs emotion analysis on collected content

2. **Scraper Service**
   - `TwitterScraper`: Attempts to scrape real Twitter data, falls back to mock data
   - Listens for Redis pub/sub commands for on-demand scraping
   - Runs scheduled tasks for periodic updates

3. **Data Flow**
   ```
   KOL Added → CollectionService → Redis Pub/Sub → Scraper
                     ↓                               ↓
              Emotion Analyzer ← MongoDB ← Tweet Data
                     ↓
              Update KOL Scores
   ```

## API Endpoints

### Create KOL
```bash
POST /kol
{
  "username": "elonmusk",
  "twitterId": "44196397",
  "followersCount": 150000000,
  "category": "Tech",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Batch Import KOLs
```bash
POST /kol/batch-import
[
  {
    "username": "VitalikButerin",
    "followersCount": 5000000,
    "category": "Crypto"
  },
  {
    "username": "naval",
    "followersCount": 2000000,
    "category": "Business"
  }
]
```

## Configuration

### Environment Variables
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/emotion_tweets

# Emotion Analyzer Service
EMOTION_ANALYZER_URL=http://emotion-analyzer:5000
```

## Mock Data Generation

When Twitter API is unavailable, the system generates mock tweets with:
- Realistic content variations
- Random metrics (likes, retweets, replies)
- Time-distributed creation dates
- Relevant hashtags

## Scheduled Tasks

1. **KOL Data Collection**: Every 10 minutes
2. **Event Monitoring**: Every minute
3. **Real-time Command Processing**: Continuous via Redis pub/sub

## Testing

Run the integration test:
```bash
node test/kol-scraper.test.js
```

This test verifies:
- KOL creation triggers data collection
- Mock data generation works correctly
- Emotion analysis is performed
- Scores are calculated and updated
- Batch import functionality

## Future Enhancements

1. **Real Twitter API Integration**: Implement proper Twitter API v2 integration
2. **Advanced Sentiment Analysis**: Use more sophisticated NLP models
3. **Historical Data Import**: Allow importing historical tweet data
4. **Custom Scraping Rules**: Configure different scraping strategies per KOL
5. **Rate Limit Management**: Implement intelligent rate limit handling
6. **Data Validation**: Add more robust data validation and error handling

## Troubleshooting

### Common Issues

1. **No Data Collected**
   - Check Redis connection
   - Verify scraper service is running
   - Check logs for API errors

2. **Emotion Scores Not Updating**
   - Ensure emotion analyzer service is running
   - Check MongoDB connection
   - Verify CollectionService is properly initialized

3. **Mock Data Not Generated**
   - Check scraper service logs
   - Verify fallback logic is triggered
   - Ensure MongoDB is accessible

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis pub/sub
redis-cli monitor

# Check MongoDB collections
mongosh emotion_tweets --eval "db.tweets.find().limit(5)"

# View scraper logs
docker logs emotion-scraper
```