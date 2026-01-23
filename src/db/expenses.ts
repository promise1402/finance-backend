import mongoose from "mongoose";

const ErrorSchema = new mongoose.Schema({
    amount: {type: Number, required: true},
    note: {type: String},
    date: {type: Date, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Categories', required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true},
},{timestamps: true}); 

export const ExpenseModel = mongoose.model('Expenses', ErrorSchema);

export const getExpensesByUserId = (userId: string) => ExpenseModel.find({user: userId}); 
export const createExpense = (values: Record<string, any>) => new ExpenseModel(values).save().then((expense) => expense.toObject());
export const deleteExpenseById = (id: string) => ExpenseModel.findOneAndDelete({_id: id});
export const getExpenseById = (id: string) => ExpenseModel.findById(id);
export const updateExpenseById = (id: string, values: Record<string, any>) => ExpenseModel.findByIdAndUpdate(id, values);
