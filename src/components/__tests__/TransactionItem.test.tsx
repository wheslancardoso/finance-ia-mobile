import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TransactionItem from '../TransactionItem';

describe('TransactionItem', () => {
  const mockTransaction = {
    id: 'tx-1',
    description: 'Teste de Transação',
    amount_cents: 5000, // R$ 50,00
    transaction_type: 'EXPENSE',
    date: '2026-05-13T00:00:00Z',
    is_paid: false,
    categories: { name: 'Alimentação' },
    accounts: { name: 'Nubank' }
  };

  const mockOnTogglePaid = jest.fn();

  it('deve renderizar a descrição e o valor corretamente', () => {
    const { getByText } = render(
      <TransactionItem transaction={mockTransaction} onTogglePaid={mockOnTogglePaid} />
    );
    
    expect(getByText('Teste de Transação')).toBeTruthy();
    expect(getByText(/R\$.*50,00/)).toBeTruthy();
  });

  it('deve chamar onTogglePaid quando o círculo de check for pressionado', () => {
    const { getByTestId } = render(
      <TransactionItem transaction={mockTransaction} onTogglePaid={mockOnTogglePaid} />
    );
    
    const button = getByTestId('toggle-paid-button');
    fireEvent.press(button);
    
    expect(mockOnTogglePaid).toHaveBeenCalledTimes(1);
  });
});
