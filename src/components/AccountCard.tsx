import { View, Text, Pressable } from 'react-native';
import { Wallet, CreditCard, Landmark, PiggyBank, CircleDollarSign } from 'lucide-react-native';
import { MotiView } from 'moti';
import { formatCurrency } from '../utils/format';
import { Account } from '../hooks/useAccounts';

interface AccountCardProps {
  account: Account;
  index: number;
  onPress?: (account: Account) => void;
}

export default function AccountCard({ account, index, onPress }: AccountCardProps) {
  const getIcon = () => {
    switch (account.type) {
      case 'CREDIT_CARD': return CreditCard;
      case 'SAVINGS': return PiggyBank;
      case 'INVESTMENT': return Landmark;
      case 'CASH': return CircleDollarSign;
      default: return Wallet;
    }
  };

  const Icon = getIcon();
  const isCreditCard = account.type === 'CREDIT_CARD';
  const balanceColor = account.balance_cents < 0 ? 'text-rose-400' : 'text-emerald-400';

  return (
    <Pressable onPress={() => onPress?.(account)}>
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: index * 50 }}
        className="bg-white/[0.03] border border-white/10 rounded-[32px] p-6 mb-4 overflow-hidden shadow-2xl"
      >
      {/* Dynamic Background Glow */}
      <View 
        className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.08]"
        style={{ backgroundColor: account.color || '#8b5cf6', filter: 'blur(40px)' }}
      />

      <View className="flex-row justify-between items-start mb-6">
        <View className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
          <Icon size={20} color={account.color || '#fff'} />
        </View>
        <View className="items-end">
          <Text className="text-white/20 text-[9px] font-black uppercase tracking-[2px] mb-1">
            {account.type.replace('_', ' ')}
          </Text>
          {account.institution && (
            <Text className="text-white/40 text-xs font-bold">
              {account.institution}
            </Text>
          )}
        </View>
      </View>

      <View>
        <Text className="text-white/60 text-sm font-bold mb-1">
          {account.name}
        </Text>
        <Text className={`text-3xl font-black tracking-tighter ${balanceColor}`}>
          {formatCurrency(account.balance_cents)}
        </Text>
      </View>

      {isCreditCard && account.limit_cents && (
        <View className="mt-6 pt-5 border-t border-white/5">
          <View className="flex-row justify-between items-end mb-3">
            <View>
              <Text className="text-white/20 text-[8px] font-black uppercase tracking-widest mb-1">Limite Disponível</Text>
              <Text className="text-white/80 text-xs font-black">
                {formatCurrency(account.limit_cents - Math.abs(account.balance_cents))}
              </Text>
            </View>
            <Text className="text-white/20 text-[10px] font-bold">
              {Math.round((1 - Math.abs(account.balance_cents) / account.limit_cents) * 100)}%
            </Text>
          </View>
          <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <MotiView 
              from={{ width: '0%' }}
              animate={{ width: `${Math.max(0, Math.min(100, (1 - Math.abs(account.balance_cents) / account.limit_cents) * 100))}%` }}
              transition={{ type: 'timing', duration: 1000, delay: 500 }}
              className="h-full bg-violet-600 shadow-sm shadow-violet-600/50" 
            />
          </View>
        </View>
      )}
      </MotiView>
    </Pressable>
  );
}
