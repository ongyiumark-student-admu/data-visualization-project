import Head from "next/head";
import Nav from "../components/Nav.js";
import clientPromise from "../lib/mongodb";
import { useState } from "react";

export default function Home({ genres }) {
  const [genreSearchInput, setGenreSearchInput] = useState("");

  const handleChange = (e) => {
    e.preventDefault();
    setGenreSearchInput(e.target.value);
  };

  if (genreSearchInput.length > 0) {
    genres = genres.filter((g) =>
      g.toLowerCase().includes(genreSearchInput.toLowerCase())
    );
  }

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Nav />
      <div className="mx-12 mb-24 w-4/5 mx-auto article">
        <h1>Instructions</h1>
        <p>
          Special thanks to Martin Bustos for scraping this{" "}
          <a href="https://www.kaggle.com/datasets/fronkongames/steam-games-dataset">
            dataset
          </a>{" "}
          using the Steam Web API.
        </p>
        <p>
          Our main focus will be on Indie games, but a dashboard for each of the
          other genres can also be generated. You may click the button below to
          navigate to the indie game dashboard.
        </p>

        <a href="/Indie">
          <div className="flex-col-center w-full bg-stone-100 rounded-2xl px-5 h-28 text-2xl font-extrabold hover:bg-stone-200">
            Indie Steam Games
          </div>
        </a>

        <h1>All Genres</h1>
        <p>
          Alternatively, you may choose one of the other genres below to
          explore.
        </p>

        <div class="relative mb-5">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              class="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            class="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search Genres..."
            onChange={handleChange}
            value={genreSearchInput}
            required
          />
        </div>

        <div className="flex-row-center flex-wrap">
          {genres.map((g) => (
            <a key={g} href={`/${g}`} className="m-2 dynamic-w-fit">
              <div className="flex-col-center text-center bg-stone-100 rounded-2xl px-5 h-28 hover:bg-stone-200 w-44">
                {g}
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
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
        genres: genres.map((g) => g._id.genres).sort(),
      },
    };
  } catch (e) {
    console.log(e);
  }
}
