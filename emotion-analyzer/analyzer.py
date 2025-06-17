import os
import json
import asyncio
from datetime import datetime
import redis
from pymongo import MongoClient
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from loguru import logger
import numpy as np
from typing import List, Dict, Tuple

# Configure logger
logger.add("emotion_analyzer.log", rotation="500 MB", level="INFO")

class EmotionAnalyzer:
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
        
        # Initialize emotion analysis model
        model_name = os.getenv('MODEL_NAME', 'uer/chinese_roberta_L-12_H-768')
        self.device = 0 if torch.cuda.is_available() else -1
        
        logger.info(f"Loading model: {model_name}")
        self.emotion_pipeline = pipeline(
            "sentiment-analysis",
            model=model_name,
            device=self.device
        )
        
        # Define emotion categories
        self.emotion_map = {
            'POSITIVE': 'joy',
            'NEGATIVE': 'sadness',
            'positive': 'joy',
            'negative': 'sadness',
            'neutral': 'neutral'
        }
        
        # Subscribe to Redis channel
        self.pubsub = self.redis_client.pubsub()
        self.pubsub.subscribe('new_tweets')
        
        logger.info("Emotion Analyzer initialized")
    
    def analyze_emotion(self, text: str) -> Dict:
        """Analyze emotion from text"""
        try:
            # Basic cleaning
            text = text.strip()
            if not text:
                return {
                    'emotion': 'neutral',
                    'score': 0.5,
                    'raw_scores': {}
                }
            
            # Run sentiment analysis
            results = self.emotion_pipeline(text[:512])  # Limit text length
            
            if results:
                result = results[0]
                emotion = self.emotion_map.get(result['label'], 'neutral')
                score = result['score']
                
                # Calculate emotion propagation score
                propagation_score = self.calculate_propagation_score(emotion, score)
                
                return {
                    'emotion': emotion,
                    'score': score,
                    'propagation_score': propagation_score,
                    'raw_scores': {result['label']: result['score']}
                }
            
        except Exception as e:
            logger.error(f"Error analyzing emotion: {e}")
        
        return {
            'emotion': 'neutral',
            'score': 0.5,
            'propagation_score': 0,
            'raw_scores': {}
        }
    
    def calculate_propagation_score(self, emotion: str, score: float) -> float:
        """Calculate emotion propagation score based on emotion type and intensity"""
        # Emotions have different propagation rates
        emotion_weights = {
            'joy': 0.8,
            'anger': 1.2,
            'fear': 1.1,
            'sadness': 0.9,
            'surprise': 1.0,
            'neutral': 0.5
        }
        
        weight = emotion_weights.get(emotion, 0.7)
        
        # Stronger emotions propagate more
        intensity_factor = score ** 2
        
        return weight * intensity_factor * 10
    
    def process_tweet_batch(self, tweets: List[Dict]) -> List[Dict]:
        """Process a batch of tweets for emotion analysis"""
        results = []
        
        for tweet in tweets:
            try:
                # Analyze emotion
                emotion_result = self.analyze_emotion(tweet['content'])
                
                # Calculate emotion propagation metrics
                metrics = tweet.get('metrics', {})
                engagement_rate = (
                    metrics.get('likes', 0) + 
                    metrics.get('retweets', 0) * 2 + 
                    metrics.get('replies', 0) * 1.5
                ) / max(tweet.get('authorFollowers', 1), 1)
                
                # Update emotion propagation score based on engagement
                emotion_result['propagation_score'] *= (1 + engagement_rate)
                
                # Update tweet with emotion data
                update_data = {
                    'emotion': emotion_result,
                    'analyzedAt': datetime.utcnow(),
                    'engagementRate': engagement_rate
                }
                
                # Update in MongoDB
                self.tweets_collection.update_one(
                    {'tweetId': tweet['tweetId']},
                    {'$set': update_data}
                )
                
                results.append({
                    'tweetId': tweet['tweetId'],
                    'emotion': emotion_result['emotion'],
                    'score': emotion_result['score'],
                    'propagation_score': emotion_result['propagation_score']
                })
                
            except Exception as e:
                logger.error(f"Error processing tweet {tweet.get('tweetId')}: {e}")
        
        return results
    
    async def process_new_tweets(self):
        """Process new tweets from Redis subscription"""
        logger.info("Starting to process new tweets")
        
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    username = data.get('username')
                    
                    logger.info(f"Processing new tweets for @{username}")
                    
                    # Get unanalyzed tweets
                    tweets = list(self.tweets_collection.find({
                        'authorUsername': username,
                        'emotion': {'$exists': False}
                    }).limit(50))
                    
                    if tweets:
                        results = self.process_tweet_batch(tweets)
                        
                        # Calculate aggregate emotion metrics
                        if results:
                            avg_score = np.mean([r['score'] for r in results])
                            avg_propagation = np.mean([r['propagation_score'] for r in results])
                            
                            # Update KOL emotion score in Redis
                            kol_data = {
                                'username': username,
                                'emotionScore': avg_score,
                                'propagationScore': avg_propagation,
                                'lastAnalyzed': datetime.utcnow().isoformat()
                            }
                            
                            self.redis_client.hset(
                                f'kol:{username}',
                                mapping=kol_data
                            )
                            
                            # Publish emotion update event
                            self.redis_client.publish(
                                'emotion_updates',
                                json.dumps({
                                    'type': 'kol_emotion_update',
                                    'data': kol_data
                                })
                            )
                            
                            logger.info(f"Analyzed {len(results)} tweets for @{username}")
                    
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
    
    def analyze_emotion_trends(self):
        """Analyze emotion trends and detect anomalies"""
        try:
            # Get recent tweets
            pipeline = [
                {
                    '$match': {
                        'analyzedAt': {
                            '$gte': datetime.utcnow() - timedelta(hours=1)
                        }
                    }
                },
                {
                    '$group': {
                        '_id': '$emotion.emotion',
                        'count': {'$sum': 1},
                        'avgScore': {'$avg': '$emotion.score'},
                        'avgPropagation': {'$avg': '$emotion.propagation_score'}
                    }
                }
            ]
            
            trends = list(self.tweets_collection.aggregate(pipeline))
            
            # Check for anomalies
            for trend in trends:
                emotion = trend['_id']
                count = trend['count']
                avg_propagation = trend['avgPropagation']
                
                # Simple anomaly detection
                if avg_propagation > 8.5:  # High propagation threshold
                    alert = {
                        'type': 'emotion_spike',
                        'emotion': emotion,
                        'severity': 'high',
                        'propagation_score': avg_propagation,
                        'tweet_count': count,
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
                    # Publish alert
                    self.redis_client.publish(
                        'alerts',
                        json.dumps(alert)
                    )
                    
                    logger.warning(f"Emotion spike detected: {emotion} with propagation score {avg_propagation}")
            
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
    
    async def run(self):
        """Main run loop"""
        logger.info("Emotion Analyzer started")
        
        # Start trend analysis in background
        async def trend_analyzer():
            while True:
                self.analyze_emotion_trends()
                await asyncio.sleep(60)  # Run every minute
        
        # Run both tasks concurrently
        await asyncio.gather(
            self.process_new_tweets(),
            trend_analyzer()
        )

def main():
    analyzer = EmotionAnalyzer()
    
    try:
        asyncio.run(analyzer.run())
    except KeyboardInterrupt:
        logger.info("Emotion Analyzer stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")

if __name__ == "__main__":
    from datetime import timedelta
    main()