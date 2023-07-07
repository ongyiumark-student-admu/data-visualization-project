import Head from "next/head"
import Nav from "../components/Nav.js"
import clientPromise from "../lib/mongodb"

export default function Home( {genres} ) {
  return (
    <>
      <Head><title>Home</title></Head>
      <Nav />
      <div className="mx-12 my-24 w-4/5 mx-auto article">
        <h1>Instructions</h1>
        <p>Special thanks to Martin Bustos for scraping this <a href="https://www.kaggle.com/datasets/fronkongames/steam-games-dataset">dataset</a> using the Steam Web API.</p>
        <p>Our main focus will be on Indie games, but a dashboard for each of the other genres can also be generated. You may click the button below to navigate to the dashboard.</p>

        <a href="/Indie"><div className="flex-col-center w-full bg-stone-100 rounded-2xl px-5 h-28 text-2xl font-extrabold hover:bg-stone-200">Indie Steam Games</div></a>

        <h1>All Genres</h1>
        <p>Alternatively, you may choose one of the other genres below to explore.</p>

        <div className="flex-row-center flex-wrap">
          {
            genres.map((g) => (
              <a key={g} href={`/${g}`} className="m-4 dynamic-w-xs">
                <div className="flex-col-center text-center bg-stone-100 rounded-2xl px-5 h-28 hover:bg-stone-200">
                  {g}
                </div>
              </a>
            ))
          }
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("steam_games");

    const genres = await db
      .collection("games")
      .aggregate([
        { $project: { genres: 1 } },
        { $unwind: "$genres" },
        { $group: { _id: { genres: "$genres" }, n: { $sum: 1 } } },
      ])
      .toArray();
    
    return {
      props: {
        genres: genres.map((g) => g._id.genres).sort()
      }
    }
  } catch(e) {
    console.log(e)
  }
}