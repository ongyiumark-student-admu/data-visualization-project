import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
   try {
       const client = await clientPromise;
       const db = client.db("steam_games");

       const games = await db
           .collection("games")
           .find({})
           .limit(10)
           .toArray();

       res.json(games);
   } catch (e) {
       console.error(e);
   }
};