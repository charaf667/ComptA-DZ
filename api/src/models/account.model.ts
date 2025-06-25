import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  code: string;
  label: string;
  classe: number;
  type: 'debit' | 'credit';
  category: 'detail' | 'collectif';
  parentCode?: string;
  isActive: boolean;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    code: { 
      type: String, 
      required: true,
      trim: true,
      uppercase: true,
      minlength: 1,
      maxlength: 10
    },
    label: { 
      type: String, 
      required: true,
      trim: true
    },
    classe: { 
      type: Number, 
      required: true,
      min: 1,
      max: 7
    },
    type: { 
      type: String, 
      enum: ['debit', 'credit'],
      required: true 
    },
    category: { 
      type: String, 
      enum: ['detail', 'collectif'],
      default: 'detail' 
    },
    parentCode: { 
      type: String,
      ref: 'Account',
      index: true
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    companyId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Company',
      required: true,
      index: true
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour les recherches fréquentes
accountSchema.index({ code: 1, companyId: 1 }, { unique: true });
accountSchema.index({ classe: 1, companyId: 1 });

// Virtual pour les comptes enfants
accountSchema.virtual('children', {
  ref: 'Account',
  localField: 'code',
  foreignField: 'parentCode',
  justOne: false
});

export const Account = mongoose.model<IAccount>('Account', accountSchema);
