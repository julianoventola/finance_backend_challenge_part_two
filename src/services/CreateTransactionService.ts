import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (total < value && type === 'outcome') {
      throw new AppError('Insufficient balance value to outcome', 400);
    }

    let transactioCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactioCategory) {
      transactioCategory = categoryRepository.create({ title: category });

      await categoryRepository.save(transactioCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactioCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
