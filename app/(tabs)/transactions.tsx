import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Filter, Download } from 'lucide-react-native';
import TransactionList from '../../src/components/TransactionList';
import AddTransactionModal from '../../src/components/AddTransactionModal';

export default function TransactionsPage() {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  return (
    <SafeAreaView className="flex-1 bg-[#050505]">
      {/* Premium Header */}
      <View className="px-6 py-8 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center mr-4"
          >
            <ChevronLeft color="#fff" size={20} />
          </Pressable>
          <View>
            <Text className="text-violet-500 text-[10px] font-black uppercase tracking-[3px] mb-1">Linha do Tempo</Text>
            <Text className="text-white text-2xl font-black tracking-tighter">Extrato</Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <Pressable 
            className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl items-center justify-center"
          >
            <Download color="rgba(255,255,255,0.6)" size={18} />
          </Pressable>
          <Pressable 
            onPress={() => setShowAddModal(true)}
            className="w-12 h-12 bg-violet-600 rounded-2xl items-center justify-center shadow-lg shadow-violet-600/30"
          >
            <Plus color="#fff" size={24} />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 px-6 pb-10">
        <TransactionList 
          onEdit={(tx) => setEditingTransaction(tx)}
        />
      </View>

      {(showAddModal || editingTransaction) && (
        <AddTransactionModal 
          transaction={editingTransaction}
          onClose={() => {
            setShowAddModal(false);
            setEditingTransaction(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingTransaction(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
