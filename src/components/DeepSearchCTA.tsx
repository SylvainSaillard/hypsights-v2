import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

export function DeepSearchCTA() {
  return (
    <Card className="bg-[#1A1F2C] text-white">
      <CardContent className="text-center p-6">
        <h3 className="text-lg font-semibold">Didn't find what you were looking for?</h3>
        <p className="text-sm text-gray-400 mt-1 mb-4">Launch a deep search to access enriched results.</p>
        <Button variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:text-white">
          Start Deep Search
          <span className="ml-2 w-4 h-4 rounded-full bg-hypsights-green animate-pulse-radar"></span>
        </Button>
      </CardContent>
    </Card>
  );
}

// Add this to your index.css or a global stylesheet
/*
@keyframes pulse-radar {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(22, 163, 74, 0);
  }
  100% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(22, 163, 74, 0);
  }
}

.animate-pulse-radar {
  animation: pulse-radar 2s infinite;
}
*/
