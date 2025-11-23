import type { QuizTopic } from '../types/quiz';

export const quizTopics: QuizTopic[] = [
  {
    id: 'aws-basics',
    name: 'AWS Basics',
    description: 'Fundamental AWS services including Lambda, S3, CloudWatch, and core cloud architecture concepts.',
    fileName: 'aws-basics.json',
    questionCount: 3,
    icon: '☁️'
  },
  {
    id: 'aws-ai-ml',
    name: 'AWS AI/ML Certification',
    description: 'AWS Artificial Intelligence and Machine Learning certification practice questions covering Amazon Bedrock, SageMaker, OpenSearch, and more.',
    fileName: 'aws-ai-ml.json',
    questionCount: 30,
    icon: '🤖'
  }
];
