import Head from "next/head";
import Nav from "../components/Nav.js";
import clientPromise from "../lib/mongodb";
import { useState } from "react";

import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });
import { getGradientColor, linspace } from "../lib/utilities.js";

export default function Home({ genres, heatmapData, heatmapOptions }) {
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

      
      <div className="flex-col-center my-12 w-full">
          <div className="flex-col-center w-4/5">
            <h1 className="text-4xl font-extrabold text-royalblue">
              Steam Game Genres
            </h1>
            <p className="text-base">Yearly Count from 2009 to 2022</p>
            <p className="instructions">You may hover to inspect the value</p>
            <ApexCharts
              className="flex-row-center w-full"
              options={heatmapOptions}
              series={heatmapData}
              type="heatmap"
              height={600}
            />

          </div>
        </div>

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

        <div className="relative mb-5">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
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
            className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
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

    let l_year = 2009;
    let r_year = 2022;
    let colors = ["#0504aa", "#006600"];
    let foreColor = "#0e1629";

    const gameGenres = await db
      .collection("games")
      .aggregate([
        {
          $project: {
            _id: 0,
            converted_date: 1,
            genres: 1,
            year: { $year: "$converted_date" },
          },
        },
        {
          $match: {
            $and: [{ year: { $gte: l_year } }, { year: { $lte: r_year } }],
          },
        },
        { $unwind: "$genres" },
        {
          $group: {
            _id: { year: { $year: "$converted_date" }, genre: "$genres" },
            games_count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // convert to apexchart format
    let game_genres = {};
    for (let game of gameGenres) {
      const { genre, year } = game._id;
      if (!(genre in game_genres)) game_genres[genre] = {};
      game_genres[genre][year] = game.games_count;
    }
    for (let genre in game_genres) {
      for (let i = l_year; i <= r_year; i++) {
        if (!(i in game_genres[genre])) game_genres[genre][i] = 0;
      }
    }

    // order lexicographically
    const ordered_genres = Object.keys(game_genres)
      .sort()
      .reverse()
      .reduce((obj, key) => {
        obj[key] = game_genres[key];
        return obj;
      }, {});

    // finish converting to apexchart format
    let heatmap_series = [];
    let max_val = 0;
    for (let genre in ordered_genres) {
      const tmp = {};
      tmp["name"] = genre;
      tmp["data"] = [];
      for (let year in game_genres[genre]) {
        tmp["data"].push({ x: year, y: game_genres[genre][year] });
        max_val = Math.max(max_val, game_genres[genre][year]);
      }
      heatmap_series.push(tmp);
    }

    // options for heatmap
    let n_ranges = 20;
    let color_percent = linspace(0.1, 1, n_ranges);
    let to_from = linspace(1, max_val, n_ranges);
    let ranges = [];
    for (let i = 0; i < n_ranges - 1; i++) {
      let tmp = {
        from: to_from[i],
        to: to_from[i + 1],
        color: getGradientColor(
          "#FFFFFF",
          colors[0],
          Math.sqrt(color_percent[i + 1])
        ),
      };
      ranges.push(tmp);
    }
    ranges.push({ from: 0, to: 0, color: "#FFFFFF" });

    let heatmapOptions = {
      chart: { type: "heatmap", foreColor: foreColor },
      dataLabels: { enabled: false },
      colors: [colors[0]],
      plotOptions: {
        heatmap: {
          shadeIntensity: 1,
          enableShades: false,
          useFillColorAsStroke: false,
          colorScale: { ranges: ranges },
        },
      },
      legend: { show: false },
    };

    return {
      props: {
        genres: [...new Set(gameGenres.map((g) => g._id.genre).sort())],
        heatmapData: heatmap_series,
        heatmapOptions: heatmapOptions
      },
    };
  } catch (e) {
    console.log(e);
  }
}