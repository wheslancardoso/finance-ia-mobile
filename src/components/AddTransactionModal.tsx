import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { 
  BottomSheetView, 
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import { Plus, X, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Hash, Tag, Calendar, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, startOfMonth, isSameMonth, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import { useTransactions } from '../hooks/useTransactions';
import { supabase } from '../lib/supabase';
import * as Haptics from 'expo-haptics';

interface AddTransactionModalProps {
  onClose: () => void;
  onSave?: (data: any) => void;
  transaction?: any; // If provided, we are editing
}

export default function AddTransactionModal({ onClose, onSave, transaction }: AddTransactionModalProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const valueInputRef = useRef<any>(null);
  const snapPoints = useMemo(() => ['50%', '95%'], []);
  const { 
    createTransaction, 
    createTransfer, 
    createInstallmentSeries, 
    updateTransaction,
    loading: saving 
  } = useTransactions();

  const [type, setType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>(transaction?.transaction_type || 'EXPENSE');
  const [value, setValue] = useState(transaction ? (Math.abs(transaction.amount_cents) / 100).toString() : '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date ? new Date(transaction.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [accountId, setAccountId] = useState<string>(transaction?.account_id || '');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(transaction?.category_id || '');
  const [installments, setInstallments] = useState('1');
  const [startingInstallment, setStartingInstallment] = useState('1');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Força a subida do bottom sheet após a medição do layout nativo
  useEffect(() => {
    const timer = setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(1);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Foco atrasado em 300ms para evitar travamentos/sobreposição do teclado
  useEffect(() => {
    const timer = setTimeout(() => {
      valueInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const { data: accs } = await supabase.from('accounts').select('*').order('name');
      if (accs) {
        setAccounts(accs);
        if (accs.length > 0) setAccountId(accs[0].id);
        if (accs.length > 1) setTargetAccountId(accs[1].id);
      }

      const { data: cats } = await supabase.from('categories').select('*').order('name');
      if (cats) {
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      }
    }
    fetchData();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0} opacity={0.5} />
    ),
    []
  );

  const isLegacyDebt = useMemo(() => {
    return isBefore(startOfMonth(date), startOfMonth(new Date()));
  }, [date]);

  const handleSave = async () => {
    const amountCents = Math.round(parseFloat(value.replace(',', '.')) * 100);
    const numInstallments = parseInt(installments) || 1;
    const startNum = parseInt(startingInstallment) || 1;

    try {
      if (transaction?.id) {
        await updateTransaction(transaction.id, {
          description,
          amount_cents: amountCents,
          transaction_type: type,
          account_id: accountId,
          category_id: categoryId || null,
          date: date.toISOString(),
        });
      } else if (type === 'TRANSFER') {
        await createTransfer({
          description,
          amount_cents: amountCents,
          from_account_id: accountId,
          to_account_id: targetAccountId,
          date: date.toISOString(),
        });
      } else if (type === 'EXPENSE' && numInstallments > 1) {
        await createInstallmentSeries({
          description,
          amount_total_cents: amountCents,
          installments: numInstallments,
          starting_installment: startNum,
          account_id: accountId,
          category_id: categoryId || undefined,
          date: date.toISOString(),
        });
      } else {
        await createTransaction({
          description,
          amount_cents: amountCents,
          transaction_type: type,
          account_id: accountId,
          category_id: categoryId || undefined,
          date: date.toISOString(),
        });
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave?.({});
      bottomSheetRef.current?.close();
    } catch (err) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error(err);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#0a0a0a' }}
      handleIndicatorStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <View className="flex-row justify-between items-center mb-10">
          <View>
            <Text className="text-white text-2xl font-black uppercase tracking-tight">
              {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </Text>
            <Text className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Centro de Comando Vesper</Text>
          </View>
          <Pressable 
            onPress={() => bottomSheetRef.current?.close()}
            className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/5"
          >
            <X color="rgba(255,255,255,0.4)" size={20} />
          </Pressable>
        </View>

        {/* Type Toggle */}
        <View className="flex-row p-1 bg-white/5 rounded-2xl mb-8">
          <Pressable 
            onPress={() => {
              setType('EXPENSE');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${type === 'EXPENSE' ? 'bg-rose-500/20 border border-rose-500/50' : ''}`}
          >
            <ArrowDownLeft size={16} color={type === 'EXPENSE' ? '#f43f5e' : 'rgba(255,255,255,0.4)'} />
            <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${type === 'EXPENSE' ? 'text-rose-400' : 'text-white/40'}`}>Saída</Text>
          </Pressable>
          <Pressable 
            onPress={() => {
              setType('INCOME');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${type === 'INCOME' ? 'bg-emerald-500/20 border border-emerald-500/50' : ''}`}
          >
            <ArrowUpRight size={16} color={type === 'INCOME' ? '#34d399' : 'rgba(255,255,255,0.4)'} />
            <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${type === 'INCOME' ? 'text-emerald-400' : 'text-white/40'}`}>Entrada</Text>
          </Pressable>
          <Pressable 
            onPress={() => {
              setType('TRANSFER');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${type === 'TRANSFER' ? 'bg-violet-500/20 border border-violet-500/50' : ''}`}
          >
            <ArrowRightLeft size={16} color={type === 'TRANSFER' ? '#8b5cf6' : 'rgba(255,255,255,0.4)'} />
            <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${type === 'TRANSFER' ? 'text-violet-400' : 'text-white/40'}`}>Troca</Text>
          </Pressable>
        </View>

        {/* Value Input */}
        <View className="mb-10 items-center">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-white/10 text-2xl font-bold">R$</Text>
            <BottomSheetTextInput
              ref={valueInputRef}
              className={`text-6xl font-black tracking-tighter tabular-nums ${type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}
              placeholder="0,00"
              placeholderTextColor="rgba(255,255,255,0.02)"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={setValue}
            />
          </View>
        </View>

        {/* Description Input */}
        <View className="mb-8">
          <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-2 px-1">O que foi isso?</Text>
          <BottomSheetTextInput
            className="bg-white/5 border border-white/10 rounded-[24px] px-5 py-5 text-white text-base font-bold"
            placeholder="Ex: Almoço, Salário, Pix..."
            placeholderTextColor="rgba(255,255,255,0.15)"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Date Selector */}
        <View className="mb-8">
          <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-2 px-1">Quando aconteceu?</Text>
          <Pressable 
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center bg-white/5 border border-white/10 rounded-[24px] px-5 py-5"
          >
            <Calendar size={18} color="rgba(255,255,255,0.4)" className="mr-3" />
            <Text className="text-white text-base font-bold flex-1">
              {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        {/* Legacy Debt Notice */}
        {isLegacyDebt && (
          <View className="mb-8 bg-amber-500/10 border border-amber-500/20 p-5 rounded-[24px] flex-row items-center gap-4">
            <Info size={20} color="#f59e0b" />
            <View className="flex-1">
              <Text className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1">Dívida Legada Detectada</Text>
              <Text className="text-amber-500/60 text-[10px] font-bold">Este valor não afetará seu teto de sobrevivência atual.</Text>
            </View>
          </View>
        )}

        {/* Account Selectors */}
        <View className="mb-10">
          <View className="mb-6">
            <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-2 px-1">
              {type === 'TRANSFER' ? 'De Onde? (Origem)' : 'Conta'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {accounts.map((acc) => (
                <Pressable 
                  key={acc.id}
                  onPress={() => {
                    setAccountId(acc.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    width: '48%',
                    height: 56,
                    backgroundColor: accountId === acc.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: accountId === acc.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{
                    color: accountId === acc.id ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }} numberOfLines={1}>
                    {acc.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {type === 'TRANSFER' && (
            <View className="mb-6">
              <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-2 px-1">Para Onde? (Destino)</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {accounts.filter(a => a.id !== accountId).map((acc) => (
                  <Pressable 
                    key={acc.id}
                    onPress={() => {
                      setTargetAccountId(acc.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={{
                      width: '48%',
                      height: 56,
                      backgroundColor: targetAccountId === acc.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: targetAccountId === acc.id ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{
                      color: targetAccountId === acc.id ? '#fff' : 'rgba(255,255,255,0.4)',
                      fontSize: 10,
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                    }} numberOfLines={1}>
                      {acc.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Category Selection (Only if not transfer) */}
        {type !== 'TRANSFER' && (
          <View className="mb-8">
            <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-3 px-1">Categoria</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setCategoryId(cat.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    width: '31%',
                    height: 72,
                    backgroundColor: categoryId === cat.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: categoryId === cat.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                  }}
                >
                  <Text style={{
                    color: categoryId === cat.id ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                    fontSize: 10,
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    textAlign: 'center',
                  }} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Installments Selection (Only if expense) */}
        {type === 'EXPENSE' && (
          <View className="mb-10">
            <Text className="text-white/20 text-[10px] font-black uppercase tracking-[2px] mb-2 px-1">Parcelamento</Text>
            <View className="flex-row gap-4">
              <View className="flex-[2] flex-row items-center bg-white/5 border border-white/10 rounded-[24px] px-5 py-4">
                <Hash size={18} color="rgba(255,255,255,0.2)" className="mr-3" />
                <BottomSheetTextInput
                  className="flex-1 text-white text-base font-bold"
                  placeholder="Total"
                  placeholderTextColor="rgba(255,255,255,0.1)"
                  keyboardType="numeric"
                  value={installments}
                  onChangeText={setInstallments}
                />
                <Text className="text-white/40 text-[10px] font-black uppercase">Vezes</Text>
              </View>

              {parseInt(installments) > 1 && (
                <View className="flex-1 flex-row items-center bg-white/5 border border-white/10 rounded-[24px] px-5 py-4">
                  <BottomSheetTextInput
                    className="flex-1 text-white text-base font-bold text-center"
                    placeholder="1"
                    placeholderTextColor="rgba(255,255,255,0.1)"
                    keyboardType="numeric"
                    value={startingInstallment}
                    onChangeText={setStartingInstallment}
                  />
                  <Text className="text-white/40 text-[10px] font-black uppercase">ª</Text>
                </View>
              )}
            </View>
            {parseInt(installments) > 1 && (
              <Text className="text-white/20 text-[8px] font-bold uppercase tracking-widest mt-2 px-1 text-center">
                Iniciando na parcela {startingInstallment} de {installments}
              </Text>
            )}
          </View>
        )}

        <Pressable 
          onPress={handleSave}
          disabled={saving}
          className={`w-full py-6 rounded-[32px] items-center shadow-2xl ${
            type === 'INCOME' ? 'bg-emerald-500 shadow-emerald-500/20' : 
            type === 'TRANSFER' ? 'bg-violet-600 shadow-violet-600/20' : 
            'bg-white shadow-white/5'
          }`}
        >
          <Text className={`font-black uppercase tracking-[0.3em] text-[11px] ${
            type === 'EXPENSE' ? 'text-black' : 'text-white'
          }`}>
            {saving ? 'Processando...' : (transaction ? 'Atualizar Lançamento' : 'Ativar Registro')}
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40
  },
});
