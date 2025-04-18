import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
            videoFile: {
                type: String,   //cloudnary url
                required: true
            },
            thumbnail: {
                type: String,   //cloudnary url
                required: true
            },
            title: {
                type: String,   //cloudnary url
                required: true
            },
            description: {
                type: String,   //cloudnary url
                required: true
            },
            duration: {
                type: Number,   //cloudnary url
                required: true
            },
            views: {
                type: Number,
                default: 0
            },
            inpublish: {
                type : Boolean,
                default: true
            },
            owner: {
                type: Schema.Types.ObjectId,
                ref: "users"
            }

    },
    {
        timestamps: true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const video= mongoose.model("video", videoSchema)