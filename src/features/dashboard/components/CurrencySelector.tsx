import { ChevronDown } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from '@components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updatePreferences } from '@/features/portfolio/portfolioSlice';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'] as const;

export function CurrencySelector() {
  const dispatch = useAppDispatch();
  const currency = useAppSelector(state => state.portfolio.preferences.currency);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" rightIcon={<ChevronDown className="h-4 w-4" />}>
          {currency}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent minWidth={140}>
        {CURRENCIES.map(code => (
          <DropdownMenuItem
            key={code}
            onClick={() => dispatch(updatePreferences({ currency: code }))}
          >
            <Text as="span" size="sm" className="font-semibold">
              {code}
            </Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
