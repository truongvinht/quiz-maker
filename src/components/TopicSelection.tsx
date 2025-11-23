import type { QuizTopic } from '../types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopicSelectionProps {
  topics: QuizTopic[];
  onTopicSelect: (topic: QuizTopic) => void;
}

export default function TopicSelection({ topics, onTopicSelect }: TopicSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">
          Quiz Maker
        </h1>
        <p className="text-lg text-muted-foreground">
          Select a quiz topic to get started
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <Card
            key={topic.id}
            className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
            onClick={() => onTopicSelect(topic)}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                {topic.icon && (
                  <span className="text-4xl" role="img" aria-label="Topic icon">
                    {topic.icon}
                  </span>
                )}
                <Badge variant="secondary" className="ml-auto">
                  {topic.questionCount} questions
                </Badge>
              </div>
              <CardTitle className="text-xl">{topic.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {topic.description}
              </p>
              <Button className="w-full" variant="default">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
