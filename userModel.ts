import  { Schema, InferSchemaType, HydratedDocument, model } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  authId: { type: String },
  status: {
    type: String,
    enum: ['provisioning', 'updating', 'deleting', 'succeed', 'failed'],
    default: 'provisioning',
  },
  failureReason: { type: String },
}, { timestamps: true });

//Define schema-based type
export type IUser = InferSchemaType<typeof UserSchema>;

//Define the hydrated document type (used when reading from DB)
export type IUserDocument = HydratedDocument<IUser>;
export type status='provisioning'|'updating'|'deleting'|'succeed'|'failed'

//Mongoose model type
export const UserModel = model<IUser>('User', UserSchema);
