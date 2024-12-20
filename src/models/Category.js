const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    slug: {
        type: String,
        unique: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
});

categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-');
    }
    next();
});

categorySchema.pre('save', async function(next) {
    if (this.parentCategory && this._id.equals(this.parentCategory)) {
        return next(new Error('Category cannot be its own parent.'));
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;