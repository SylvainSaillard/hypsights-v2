import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { Plus } from 'lucide-react';

interface HeroSectionProps {
  isQuotaReached: boolean;
}

export function HeroSection({ isQuotaReached }: HeroSectionProps) {
  const { toast } = useToast();

  const handleAddProjectClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isQuotaReached) {
      e.preventDefault();
      toast({
        title: 'Quota Reached',
        description: 'Please upgrade your plan to create more projects.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Link to="/create-brief" onClick={handleAddProjectClick}>
      <Button
        className="bg-hypsights-green text-black hover:bg-hypsights-green/90"
        disabled={isQuotaReached}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </Link>
  );
}
