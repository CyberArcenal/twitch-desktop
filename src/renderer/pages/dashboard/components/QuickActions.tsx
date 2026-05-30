// src/renderer/pages/dashboard/components/QuickActions.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Compass, Search } from 'lucide-react';
import Button from '../../../components/UI/Button';

interface QuickActionsProps {
  onGoLive?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onGoLive }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      {onGoLive && (
        <Button variant="danger" size="sm" icon={Radio} onClick={onGoLive}>
          Go Live
        </Button>
      )}
      <Button variant="secondary" size="sm" icon={Compass} onClick={() => navigate('browse/categories')}>
        Browse Categories
      </Button>
      <Button variant="secondary" size="sm" icon={Search} onClick={() => navigate('/browse/live')}>
        Search
      </Button>
    </div>
  );
};

export default QuickActions;