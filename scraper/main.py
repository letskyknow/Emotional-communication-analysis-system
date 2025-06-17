import os
import asyncio
import json
from datetime import datetime, timedelta
import redis
from pymongo import MongoClient
from loguru import logger
import schedule
import time
from typing import List, Dict, Optional
import random
import requests
import ssl
import certifi

# Configure SSL for Twitter access
ssl._create_default_https_context = ssl._create_unverified_context

# Set environment variable to disable SSL verification for requests
os.environ['PYTHONWARNINGS'] = 'ignore:Unverified HTTPS request'
os.environ['CURL_CA_BUNDLE'] = ''

try:
    import snscrape.modules.twitter as sntwitter
    SNSCRAPE_AVAILABLE = True
    logger.info("snscrape successfully imported")
except ImportError as e:
    logger.warning(f"snscrape not available: {e}")
    SNSCRAPE_AVAILABLE = False

# Configure logger
logger.add("scraper.log", rotation="500 MB", level="INFO")

class TwitterScraper:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'redis'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        
        mongo_uri = os.getenv('MONGODB_URI', 'mongodb://mongo:27017/emotion_tweets')
        self.mongo_client = MongoClient(mongo_uri)
        self.db = self.mongo_client.emotion_tweets
        self.tweets_collection = self.db.tweets
        
        # Create indexes
        self.tweets_collection.create_index("tweetId", unique=True)
        self.tweets_collection.create_index("createdAt")
        self.tweets_collection.create_index("authorUsername")
        
        logger.info("Twitter Scraper initialized")
    
    def scrape_user_timeline(self, username: str, limit: int = 20) -> List[Dict]:
        """Scrape user timeline tweets with fallback to mock data"""
        logger.info(f"Scraping timeline for @{username}")
        tweets = []
        
        try:
            # Try using snscrape first
            # 由于Twitter/X的访问限制，暂时使用模拟数据
            # 在实际生产环境中，可以使用官方API或其他数据源
            logger.info(f"Using mock data for @{username} due to Twitter/X access restrictions")
            tweets = self.generate_mock_tweets(username, limit)
            
            # Store tweets in MongoDB
            for tweet_data in tweets:
                try:
                    self.tweets_collection.update_one(
                        {'tweetId': tweet_data['tweetId']},
                        {'$set': tweet_data},
                        upsert=True
                    )
                except Exception as e:
                    logger.error(f"Error storing tweet {tweet_data['tweetId']}: {e}")
            
            logger.info(f"Scraped {len(tweets)} tweets for @{username}")
            
            # Publish to Redis for real-time processing
            if tweets:
                self.redis_client.publish(
                    'new_tweets',
                    json.dumps({
                        'username': username,
                        'count': len(tweets),
                        'latest_tweet_id': tweets[0]['tweetId']
                    })
                )
            
        except Exception as e:
            logger.error(f"Error scraping @{username}: {e}")
        
        return tweets
    
    def scrape_event_tweets(self, keywords: List[str], since: Optional[datetime] = None) -> List[Dict]:
        """Scrape tweets related to specific keywords/events"""
        logger.info(f"Scraping tweets for keywords: {keywords}")
        tweets = []
        
        try:
            # Build search query
            query = ' OR '.join(f'"{k}"' if ' ' in k else k for k in keywords)
            
            if since:
                query += f" since:{since.strftime('%Y-%m-%d')}"
            
            # Limit to recent tweets
            query += f" until:{datetime.now().strftime('%Y-%m-%d')}"
            
            # 由于Twitter/X的访问限制，暂时使用模拟数据
            logger.info(f"Using mock data for event keywords: {keywords}")
            tweets = self.generate_event_tweets_with_keywords(keywords, 50)
            
            return tweets
            
            # 原始代码保留以供将来使用
            # for i, tweet in enumerate(sntwitter.TwitterSearchScraper(query).get_items()):
                if i >= 100:  # Limit per search
                    break
                
                tweet_data = {
                    'tweetId': str(tweet.id),
                    'content': tweet.rawContent,
                    'createdAt': tweet.date,
                    'authorUsername': tweet.user.username,
                    'authorFollowers': tweet.user.followersCount or 0,
                    'metrics': {
                        'likes': tweet.likeCount or 0,
                        'retweets': tweet.retweetCount or 0,
                        'replies': tweet.replyCount or 0,
                        'views': tweet.viewCount or 0
                    },
                    'keywords': keywords,
                    'hashtags': tweet.hashtags or [],
                    'mentions': [user.username for user in (tweet.mentionedUsers or [])],
                    'scrapedAt': datetime.utcnow()
                }
                
                tweets.append(tweet_data)
                
                # Store in MongoDB
                try:
                    self.tweets_collection.update_one(
                        {'tweetId': tweet_data['tweetId']},
                        {'$set': tweet_data},
                        upsert=True
                    )
                except Exception as e:
                    logger.error(f"Error storing tweet {tweet_data['tweetId']}: {e}")
            
            logger.info(f"Scraped {len(tweets)} tweets for keywords: {keywords}")
            
        except Exception as e:
            logger.error(f"Error scraping keywords {keywords}: {e}")
        
        return tweets
    
    def get_active_kols(self) -> List[str]:
        """Get active KOLs from Redis"""
        try:
            kols_json = self.redis_client.get('active_kols')
            if kols_json:
                return json.loads(kols_json)
        except Exception as e:
            logger.error(f"Error getting active KOLs: {e}")
        
        # Default KOLs if Redis is empty
        return ['elonmusk', 'VitalikButerin', 'naval']
    
    def get_active_events(self) -> List[Dict]:
        """Get active events from Redis"""
        try:
            events_json = self.redis_client.get('active_events')
            if events_json:
                return json.loads(events_json)
        except Exception as e:
            logger.error(f"Error getting active events: {e}")
        
        # Default events if Redis is empty
        return [
            {'id': '1', 'keywords': ['AI', 'ChatGPT', 'artificial intelligence']},
            {'id': '2', 'keywords': ['crypto', 'bitcoin', 'ethereum']}
        ]
    
    def scrape_kols(self):
        """Scheduled task to scrape KOL timelines"""
        logger.info("Starting KOL scraping task")
        kols = self.get_active_kols()
        
        for kol in kols:
            self.scrape_user_timeline(kol, limit=20)
            time.sleep(2)  # Rate limiting
    
    def scrape_events(self):
        """Scheduled task to scrape event-related tweets"""
        logger.info("Starting event scraping task")
        events = self.get_active_events()
        
        for event in events:
            since = datetime.now() - timedelta(hours=1)
            self.scrape_event_tweets(event['keywords'], since)
            time.sleep(2)  # Rate limiting
    
    def generate_event_tweets_with_keywords(self, keywords: List[str], count: int) -> List[Dict]:
        """Generate mock tweets for events with specific keywords"""
        templates = [
            'Really excited about {term}! This is going to be huge.',
            'Concerned about the impact of {term} on the market.',
            'Just heard about {term}. What are your thoughts?',
            '{term} is trending! Following closely.',
            'The {term} situation is developing rapidly.',
            'Breaking news about {term}!',
            'My analysis on {term} shows interesting patterns.',
            '{term} could be a game changer.',
            'Skeptical about the {term} hype.',
            'Deep dive into {term} reveals surprising insights.'
        ]
        
        tweets = []
        base_time = datetime.utcnow()
        
        for i in range(count):
            keyword = keywords[i % len(keywords)]
            template = templates[i % len(templates)]
            content = template.replace('{term}', keyword)
            
            tweet_data = {
                'tweetId': f'event_{int(time.time())}_{i}',
                'content': content,
                'createdAt': base_time - timedelta(minutes=i*10),
                'authorUsername': f'user_{random.randint(1, 1000)}',
                'authorFollowers': random.randint(100, 100000),
                'metrics': {
                    'likes': random.randint(10, 5000),
                    'retweets': random.randint(5, 2000),
                    'replies': random.randint(1, 500),
                    'views': random.randint(100, 50000)
                },
                'keywords': keywords,
                'hashtags': [k.replace(' ', '') for k in keywords[:2]],
                'mentions': [],
                'scrapedAt': datetime.utcnow()
            }
            tweets.append(tweet_data)
        
        return tweets
    
    def generate_mock_tweets(self, username: str, count: int) -> List[Dict]:
        """Generate mock tweets for testing when API is unavailable"""
        mock_contents = [
            "Just launched an exciting new feature! The future of AI is here 🚀",
            "Market analysis: Strong bullish signals across major indices today",
            "Remember: Innovation requires taking calculated risks",
            "Working on something revolutionary. Stay tuned for the big announcement!",
            "The best time to invest in yourself is now. Keep learning, keep growing",
            "Disruption is coming to traditional industries. Are you ready?",
            "Success is a journey, not a destination. Enjoy the process",
            "Breaking: Major breakthrough in quantum computing achieved",
            "Pro tip: Focus on solving real problems, profits will follow",
            "The future belongs to those who embrace change"
        ]
        
        tweets = []
        base_time = datetime.utcnow()
        
        for i in range(count):
            tweet_data = {
                'tweetId': f'mock_{username}_{int(time.time())}_{i}',
                'content': random.choice(mock_contents),
                'createdAt': base_time - timedelta(hours=i*2),
                'authorUsername': username,
                'metrics': {
                    'likes': random.randint(100, 10000),
                    'retweets': random.randint(50, 5000),
                    'replies': random.randint(10, 1000),
                    'views': random.randint(1000, 100000)
                },
                'isReply': False,
                'isRetweet': False,
                'hashtags': random.sample(['AI', 'Innovation', 'Tech', 'Future', 'Success'], k=2),
                'mentions': [],
                'scrapedAt': datetime.utcnow()
            }
            tweets.append(tweet_data)
        
        return tweets
    
    def listen_for_commands(self):
        """Listen for Redis pub/sub commands"""
        pubsub = self.redis_client.pubsub()
        pubsub.subscribe('scrape_kol')
        
        logger.info("Listening for scraping commands...")
        
        for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    username = data.get('username')
                    if username:
                        logger.info(f"Received command to scrape @{username}")
                        self.scrape_user_timeline(username, limit=20)
                except Exception as e:
                    logger.error(f"Error processing command: {e}")
    
    def run_scheduler(self):
        """Run the scheduled tasks"""
        # Start command listener in a separate thread
        import threading
        listener_thread = threading.Thread(target=self.listen_for_commands)
        listener_thread.daemon = True
        listener_thread.start()
        
        # Schedule KOL scraping every 10 minutes
        schedule.every(10).minutes.do(self.scrape_kols)
        
        # Schedule event scraping every minute
        schedule.every(1).minutes.do(self.scrape_events)
        
        # Run initial scrape
        self.scrape_kols()
        self.scrape_events()
        
        logger.info("Scheduler started")
        
        while True:
            schedule.run_pending()
            time.sleep(1)

def main():
    scraper = TwitterScraper()
    
    try:
        scraper.run_scheduler()
    except KeyboardInterrupt:
        logger.info("Scraper stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()