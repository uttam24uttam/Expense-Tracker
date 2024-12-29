import mongoose from 'mongoose';

const FriendBalanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        balances: [   //array , contains all the friends and balance owedd to those friends
            {
                friendId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                balanceAmount: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const FriendBalance = mongoose.model('FriendBalance', FriendBalanceSchema);

export default FriendBalance;
