import mongoose, { Model } from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true},
    budget: {type: Number, default: null, min: 0},
    color: { type: String, default: '#6366f1' }
},{timestamps: true});

export const CategoryModel = mongoose.model('Categories', CategorySchema);

export const getCategoriesByUserId = (userId: string) => CategoryModel.find({user: userId});
export const createCategory = (values: Record<string, any>) => new CategoryModel(values).save().then((category) => category.toObject());
export const deleteCategoryById = (id: string) => CategoryModel.findOneAndDelete({_id: id});
export const getCategoryById = (id: string) => CategoryModel.findById(id);
export const updateCategoryById = (id: string, values: Record<string, any>) => CategoryModel.findByIdAndUpdate(id, values, { new: true });
export const getAllCategories = () => CategoryModel.find();
export const getCategoryByNameAndUser = (name: string, userId: string) => CategoryModel.findOne({
    name,
    user: userId
}).collation({ locale: 'en', strength: 2 }); // Case insensitive match
