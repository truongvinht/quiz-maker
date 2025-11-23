import type { Question } from '../types/quiz';

export const sampleQuestions: Question[] = [
  {
    id: '1',
    text: 'A company wants to build a scalable web application using AWS services. Which combination of services would be MOST appropriate for hosting the application frontend and backend?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'Amazon S3 for frontend hosting and AWS Lambda with API Gateway for backend',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Amazon EC2 for both frontend and backend',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Amazon CloudFront for frontend and Amazon RDS for backend',
      },
      {
        id: 'd',
        label: 'D',
        text: 'AWS Elastic Beanstalk for frontend and Amazon DynamoDB for backend',
      },
    ],
    correctAnswers: ['a'],
    explanation:
      'Amazon S3 is ideal for hosting static website content (frontend), and AWS Lambda with API Gateway provides a serverless, scalable backend solution. This combination offers automatic scaling, high availability, and cost-effectiveness. EC2 requires manual management, CloudFront is a CDN (not a hosting solution), and Elastic Beanstalk is more suitable for full applications rather than just frontend hosting.',
    isMultipleChoice: false,
  },
  {
    id: '2',
    text: 'Which of the following are benefits of using AWS Lambda? (Select TWO)',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'No servers to manage',
      },
      {
        id: 'b',
        label: 'B',
        text: 'Automatic scaling',
      },
      {
        id: 'c',
        label: 'C',
        text: 'Free to use with no limitations',
      },
      {
        id: 'd',
        label: 'D',
        text: 'Supports all programming languages',
      },
      {
        id: 'e',
        label: 'E',
        text: 'Guaranteed sub-millisecond response times',
      },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'AWS Lambda is a serverless compute service that eliminates server management (A) and automatically scales based on incoming requests (B). However, it is not free without limitations (follows pay-per-use pricing), does not support all programming languages (only specific runtimes), and cannot guarantee sub-millisecond response times due to cold start latency.',
    isMultipleChoice: true,
  },
  {
    id: '3',
    text: 'What is the primary purpose of Amazon CloudWatch?',
    options: [
      {
        id: 'a',
        label: 'A',
        text: 'To store and retrieve large amounts of data',
      },
      {
        id: 'b',
        label: 'B',
        text: 'To monitor and observe AWS resources and applications',
      },
      {
        id: 'c',
        label: 'C',
        text: 'To manage user identities and access permissions',
      },
      {
        id: 'd',
        label: 'D',
        text: 'To deploy and manage containerized applications',
      },
    ],
    correctAnswers: ['b'],
    explanation:
      'Amazon CloudWatch is a monitoring and observability service that collects metrics, logs, and events from AWS resources and applications. It helps you monitor performance, set alarms, and gain insights into resource utilization. Option A describes S3/storage services, option C describes IAM, and option D describes services like ECS or EKS.',
    isMultipleChoice: false,
  },
];
