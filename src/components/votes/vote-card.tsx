/**
 * Vote Card Component
 *
 * Displays a single vote/poll card with options and submission functionality.
 * This component is lazy-loaded for better performance.
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Vote as VoteIcon,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Vote } from '@/types/database.types';

interface VoteCardProps {
  vote: Vote;
  hasVoted: boolean;
  selectedOption?: string;
  isSubmitting: boolean;
  showSuccess: boolean;
  onOptionSelect: (option: string) => void;
  onSubmit: () => void;
  onViewDetails: () => void;
}

export function VoteCard({
  vote,
  hasVoted,
  selectedOption,
  isSubmitting,
  showSuccess,
  onOptionSelect,
  onSubmit,
  onViewDetails,
}: VoteCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOptionsArray = (options: any): string[] => {
    if (Array.isArray(options)) {
      return options;
    }
    return [];
  };

  const isVoteClosed = (vote: Vote): boolean => {
    return vote.closes_at ? new Date(vote.closes_at) < new Date() : false;
  };

  const isClosed = isVoteClosed(vote);
  const options = getOptionsArray(vote.options);

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <VoteIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{vote.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{vote.description}</p>
        </div>
        {hasVoted && (
          <Badge variant="secondary" className="ml-4">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Voted
          </Badge>
        )}
        {isClosed && (
          <Badge variant="outline" className="ml-4">
            <Clock className="mr-1 h-3 w-3" />
            Closed
          </Badge>
        )}
      </div>

      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(vote.created_at)}</span>
        </div>
        {vote.closes_at && (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Closes: {formatDate(vote.closes_at)}</span>
          </div>
        )}
      </div>

      {showSuccess && (
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Your vote has been submitted successfully!
          </AlertDescription>
        </Alert>
      )}

      {!hasVoted && !isClosed ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Select an option:</p>
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionSelect(option)}
              className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                selectedOption === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-full border-2 ${
                    selectedOption === option
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  }`}
                >
                  {selectedOption === option && (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <span className="font-medium">{option}</span>
              </div>
            </button>
          ))}
          <Button onClick={onSubmit} disabled={!selectedOption || isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                Submit Vote
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <Button onClick={onViewDetails} variant="outline" className="w-full">
          View Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </Card>
  );
}
