import type { QuizTopic } from "../types/quiz";

// Public topics (committed to git)
const publicTopics: QuizTopic[] = [
  {
    id: "aws-basics",
    name: "AWS Basics",
    description:
      "Fundamental AWS services including Lambda, S3, CloudWatch, and core cloud architecture concepts.",
    fileName: "aws-basics.json",
    questionCount: 4,
    icon: "☁️",
  },
];

// Private topics live in src/data/private/topics.json (gitignored).
// The glob resolves to an empty object when the file doesn't exist,
// so a fresh clone still works with only the public topics.
const privateTopicModules = import.meta.glob<QuizTopic[]>(
  "./private/topics.json",
  { eager: true, import: "default" }
);
const privateTopics = Object.values(privateTopicModules).flat();

export const quizTopics: QuizTopic[] = [...publicTopics, ...privateTopics];
