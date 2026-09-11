import { config } from "dotenv";
config({ path: ".env.local" });
config();
import { connectDB } from "../src/lib/db";
import { Profile } from "../src/models/Profile";

async function main() {
  await connectDB();
  await Profile.findOneAndUpdate(
    { key: "singleton" },
    {
      $set: {
        name: "Jatin Yadav",
        "socials.instagram": "https://instagram.com/jatin.engineer",
      },
    },
    { upsert: true, new: true }
  );
  console.log("Profile updated.");
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
